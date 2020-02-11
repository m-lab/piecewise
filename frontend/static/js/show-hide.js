'use strict';

// const skipButton = document.getElementById('SkipSurvey');
const welcome = document.getElementById('Welcome');
const surveyForm = document.getElementById('SurveyForm');
const background = document.getElementsByClassName('background')[0];
const viewResultsButton = document.getElementById('ViewResults');

if (!!viewResultsButton) {
  // skipButton.addEventListener('click', hide);
  viewResultsButton.addEventListener('click', hide);
}

function hide() {
  welcome.classList.add('visually-hidden');
  background.classList.add('visually-hidden');
}

let closeButtons = document.getElementsByClassName('close');
closeButtons = [...closeButtons];

if (!!closeButtons) {
  closeButtons.forEach(el => {
    el.addEventListener('click', toggle);
  });

  function toggle() {
    closeButtons.forEach(el => {
      el.style = 'cursor: pointer;';
      if (el.nextSibling.nextSibling.classList.contains('visually-hidden')) {
        el.innerHTML = 'X';
        el.nextSibling.nextSibling.classList.remove('visually-hidden');
        el.parentElement.classList.remove('minimize');
      } else {
        el.innerHTML = '...';
        el.nextSibling.nextSibling.classList.add('visually-hidden');
        el.parentElement.classList.add('minimize');
      }
    })
  }
}
