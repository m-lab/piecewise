/* jshint esversion: 6, asi: true */
/* globals ndt7core */
import ndt7core from './ndt7-core.js';

'use strict';

function withElementDo(elementId, callable) {
  const elem = document.getElementById(elementId)
  if (elem) {
    callable(elem)
  }
}

function updateView(elementId, appInfo) {
  withElementDo(elementId, function (elem) {
    const elapsed = appInfo.ElapsedTime / 1e06     /* second */
    let speed = appInfo.NumBytes / elapsed         /* B/s    */
    speed *= 8                                     /* bit/s  */
    speed /= 1e06                                  /* Mbit/s */
    elem.innerHTML = speed.toFixed(3) + ' Mbit/s'
  })
}

function runSomething(testName, callback) {
  ndt7core.run(location.href, testName, function(ev, val) {
    console.log(ev, val)
    if (ev === 'complete') {
      if (callback !== undefined) {
        callback()
      }
      return
    }
    if (ev === 'measurement' && val.AppInfo !== undefined &&
        val.Origin === 'client') {
      updateView(testName, val.AppInfo)
    }
  })
}

function runDownload(callback) {
  runSomething('download', callback)
}

function runUpload(callback) {
  runSomething('upload', callback)
}


const survey = document.getElementById('SurveyForm');
const map = document.getElementById('Map');
const results = document.getElementById('results');

if (!!survey && !!map) {
  survey.classList.add('transparent-background');

  survey.addEventListener('submit', logSubmit);

  async function logSubmit(event) {
    event.preventDefault();
    console.log(`Form Submitted! Time stamp: ${event.timeStamp}`);

    await runDownload(function() { runUpload(); })

    let loader = document.getElementById('Loader');
    console.log('loading map...');

    loader.classList.remove('visually-hidden');

    setTimeout(function(){
      console.log('map loaded');
      loader.classList.add('visually-hidden');
    }, 3000);

    survey.classList.remove('transparent-background');
    survey.classList.add('visually-hidden');
    results.classList.remove('visually-hidden');


  }
}
