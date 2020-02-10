'use strict';

const skipButton = document.getElementById('SkipSurvey');
const surveyForm = document.getElementById('SurveyForm');
const background = document.getElementsByClassName('background')[0];
const viewResultsButton = document.getElementById('ViewResults');

if (!!skipButton) {
  skipButton.addEventListener('click', hide);
  viewResultsButton.addEventListener('click', hide);
}

function hide() {
  surveyForm.classList.add('visually-hidden');
  background.classList.add('visually-hidden');
}
