// thanks to https://github.com/epidemian/snake/blob/master/snake.js
'use strict';

let world
let view

let UP = {
    x: 0,
    y: -1
}
let DOWN = {
    x: 0,
    y: 1
}
let LEFT = {
    x: -1,
    y: 0
}
let RIGHT = {
    x: 1,
    y: 0
}

let FOOD_CELL

let greycolor="#ebedf0"
let snakecolor
let currentdirection
let snakebody
let gamePaused = false
let gameEnded = true
let score = 0

// change direction one time per step
let cantChangeDirection = false

function resetworld(color) {
    world = [
        [],
        [],
        [],
        [],
        [],
        [],
        []
    ]
    view = [
        [],
        [],
        [],
        [],
        [],
        [],
        []
    ]
    currentdirection = RIGHT
    gamePaused = false
    gameEnded = false
    snakecolor = color
    snakebody = []
    score = 0
    cantChangeDirection = false
    showState('[playing]');
}

function bornSnake() {
    snakebody = [
    	{x:2,y:0},
    	{x:1,y:0},
    	{x:0,y:0}
    ]
    updateGrid(0,0,1)
    updateGrid(1,0,1)
    updateGrid(2,0,1)
}

function start_snake_game(color) {
    if (!gameEnded) {
        showState("game still runing") 
        return
    }
    resetworld(color) 
    let calendar = jQuery(".js-calendar-graph-svg g g") 
    for (let x = 0; x < calendar.length - 1; x++) {
        let col = jQuery(calendar[x]) 
        let rects = col.children("rect") 
        for (let y = 0; y < rects.length; y++) {
            let rect = jQuery(rects[y]) 
            world[y].push(0) 
            view[y].push(rect)
        }
    }
    jQuery(calendar[calendar.length - 1]).hide()

    //console.log("world=", world)
    //console.log("view=", view)
    for (let y = 0; y < view.length; y++) {
        for (let x = 0; x < view[y].length; x++) {
            view[y][x].attr("fill", greycolor)
        }
    }


    bornSnake()
    dropFood()
    setupEventHandlers()
    githubPageClear()
    runloop()

}

function githubPageClear() {
	jQuery("div .contribution-activity-listing").hide()
	jQuery("div .js-pinned-items-reorder-container").hide()
	jQuery("input .header-search-input").attr("disabled",true)
	jQuery("#year-link-2019").text("score:0")
}

function addscore() {
	jQuery("#year-link-2019").text("score:" + (++score))
}

function showState(state) {
    jQuery("title").html(state);
}

function changeDirection(newDirection) {
	//console.log("changeDirection",newDirection)
	if (cantChangeDirection) {
		return
	}
    let opposite = currentdirection.x + newDirection.x === 0 && currentdirection.y + newDirection.y === 0;
    if (!opposite) {
        currentdirection = newDirection
        cantChangeDirection = true
    }
}

function setupEventHandlers() {
    let directionsByKey = {
        // Arrows
        37: LEFT,
        38: UP,
        39: RIGHT,
        40: DOWN,
        // WASD
        87: UP,
        65: LEFT,
        83: DOWN,
        68: RIGHT
    };

    jQuery("body").keydown(function (event) {
    	//console.log("onkeydown",event)
        let key = event.keyCode;
        if (key in directionsByKey) {
            changeDirection(directionsByKey[key]);
        }
    });

    window.onblur = function pauseGame() {
        gamePaused = true;
        showState('[paused]');
    };

    window.onfocus = function unpauseGame() {
        gamePaused = false;
        showState('[resume]');
    };

}

function tickTime() {
    let start = 105;
    let end = 55;
    return start + snakebody.length * (end - start) / world[0].length;
}

function endGame() {
	showState("[dead]")
    gameEnded = true;
}

function dropFood() {
	//console.log("dropFood")
    let col = world[0].length
    let row = world.length
    while (true) {
        let y = Math.floor(Math.random() * row) 
        let x = Math.floor(Math.random() * col) 
        let isOk = true
        for (let i = 0; i < snakebody.length; i++) {
            if (snakebody[i].x === x && snakebody[i].y === y) {
                isOk = false
                break
            }
        }
        if (isOk) {
            FOOD_CELL = {
                x: x,
                y: y
            }
            console.log("FOOD_CELL", FOOD_CELL)
            updateGrid(x,y,1)
            break
        }
    }

}

function updateGrid(x,y,val){
	//console.log("updateGrid", x,y,val)
	world[y][x] = val
	if (val==0) {
		view[y][x].attr("fill", greycolor)
	} else {
		view[y][x].attr("fill", snakecolor)
	}
}

function updateWorld() {
	//console.log("updateWorld", currentdirection)
    let head = snakebody[0];
    let tail = snakebody[snakebody.length - 1];
    let newX = head.x + currentdirection.x;
    let newY = head.y + currentdirection.y;

    let outOfBounds = newX < 0 || newX >= world[0].length || newY < 0 || newY >= world.length;
    if (outOfBounds) {
    	console.log("outOfBounds dead")
        endGame();
        return;
    }

    let eatsFood = newX === FOOD_CELL.x && newY === FOOD_CELL.y
    if (!eatsFood) {
        snakebody.pop();
        updateGrid(tail.x,tail.y,0)

	    let collidesWithSelf = world[newY][newX] === 1;
	    if (collidesWithSelf) {
	    	console.log("collidesWithSelf dead")
	        endGame();
	        return;
	    }
	    snakebody.unshift({
	        x: newX,
	        y: newY
	    });
	    updateGrid(newX,newY,1)
    } else {
	    snakebody.unshift({
	        x: newX,
	        y: newY
	    });
	    addscore()
	    dropFood();
    }

    cantChangeDirection = false
}

function runloop() {
    let lastFrameTime = new Date;
    window.requestAnimationFrame(function frameHandler() {
    	//console.log("frameHandler")
        let now = new Date;
        if (!gamePaused && now - lastFrameTime >= tickTime()) {
            updateWorld();
            lastFrameTime = now;
        }
        if (!gameEnded) {
            window.requestAnimationFrame(frameHandler);
        }

    });
}