// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

let startGame = document.getElementById('start_game');
chrome.storage.sync.get('color', function(data) {
  startGame.style.backgroundColor = data.color;
  startGame.setAttribute('value', data.color);
});

startGame.onclick = function(element) {
  let color = element.target.value;
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.executeScript(
      tabs[0].id,
      {code: 'start_snake_game("' + color + '");'});
  });
  window.close();
};

