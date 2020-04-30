"use strict";

const url = process.env.PIECEWISE_BACKEND_URL || "$PIECEWISE_BACKEND_URL"

const consentForm =  document.getElementById("ConsentForm");
 const surveyForm = document.getElementById("SurveyForm");

if (!!consentForm && !!surveyForm ) {
  consentForm.action = url;
  surveyForm.action = url;  
}

module.exports = url;
