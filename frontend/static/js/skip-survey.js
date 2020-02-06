'use strict';

const button = document.getElementById('SkipSurvey');
const surveyForm = document.getElementById('SurveyForm');
const background = document.getElementsByClassName('background')[0];

if (!!button) {
  button.addEventListener('click', hide);
}

function hide() {
  surveyForm.classList.add('visually-hidden');
  background.classList.add('visually-hidden');
}
