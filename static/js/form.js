import { NDTjs } from './ndt.js';

const survey = document.getElementById('SurveyForm');
const map = document.getElementById('Map');

if (!!survey && !!map) {
  survey.classList.add('transparent-background');

  survey.addEventListener('submit', logSubmit);

  async function logSubmit(event) {
    event.preventDefault();
    console.log(`Form Submitted! Time stamp: ${event.timeStamp}`);

    let loader = document.getElementById('Loader');
    console.log('loading map...');

    loader.classList.remove('visually-hidden');

    setTimeout(function(){
      console.log('map loaded');
      loader.classList.add('visually-hidden');
    }, 3000);



    // try {
    //   const data = await postData('FIXME', { Fixme: 'Fixme' });
    //   console.log(JSON.stringify(data)); // JSON-string from `response.json()` call
    // } catch (error) {
    //   console.error(error);
    // }
    //
    // async function postData(url = '', data = {}) {
    //   // Default options are marked with *
    //   const response = await fetch(url, {
    //     method: 'POST',
    //     mode: 'cors', // no-cors, *cors, same-origin
    //     credentials: 'same-origin',
    //     headers: {
    //       'Content-Type': 'application/json'
    //     },
    //     redirect: 'follow', // manual, *follow, error
    //     referrer: 'no-referrer', // no-referrer, *client
    //     body: JSON.stringify(data) // body data type must match "Content-Type" header
    //   });
    //   return await response.json(); // parses JSON response into native JavaScript objects
    // }

    survey.classList.remove('transparent-background');
    survey.classList.add('visually-hidden');

    NDTjs('uvicorn', 8080, '/ndt_protocol', 'ws', 1000.0, );

  }
}
