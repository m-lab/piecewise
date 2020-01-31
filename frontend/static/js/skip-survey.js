'use strict';

const button = document.getElementById('SkipSurvey');
const surveyForm = document.getElementById('SurveyForm');

if (!!button) {
  button.addEventListener('click', hide);
}

function hide() {
  surveyForm.classList.add('visually-hidden');
}
