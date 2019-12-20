import { NDTjs } from './ndt.js';

const survey = document.getElementById('SurveyForm');
const map = document.getElementById('Map');

if (!!survey && !!map) {
  survey.classList.add('transparent-background');

  survey.addEventListener('submit', logSubmit);

  function logSubmit(event) {
    event.preventDefault();
    NDTjs('uvicorn', 8080, '/ndt_protocol', 'ws', 1000.0, );
    console.log(`Form Submitted! Time stamp: ${event.timeStamp}`);
  }
}
