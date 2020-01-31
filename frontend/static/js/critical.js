"use strict";

const url = process.env.PIECEWISE_BACKEND_URL || "$PIECEWISE_BACKEND_URL"

document.getElementById("Consent").action = url;
document.getElementById("SurveyForm").action = url;

module.exports = url;
