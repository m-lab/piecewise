"use strict";

const url = process.env.PIECEWISE_BACKEND_URL || "$PIECEWISE_BACKEND_URL"

document.getElementById("ConsentForm").action = url;
document.getElementById("SurveyForm").action = url;

module.exports = url;
