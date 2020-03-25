import NDTmeter from './ndt-d3.js';
import NDTjs from './ndt-browser-client.js';

const consentForm = document.getElementById('ConsentForm');
const surveyForm = document.getElementById('SurveyForm');
const background = document.getElementsByClassName('background')[0];
const step2 = document.getElementById('Step2');
const welcome = document.getElementById('Welcome');

// Timeout for getting geolocation from browser
const GEO_TIMEOUT = 5000;

if (!!consentForm) {
  consentForm.addEventListener('submit', checkLocationConsent);
}

if (!!surveyForm) {
  surveyForm.addEventListener('submit', submitExtraData)
}

let obj = localStorage.getItem('formData');

// console.log('retrievedObject: ', JSON.parse(obj));


function submitExtraData(event) {
  event.preventDefault();

  let formData = $('#SurveyForm').serialize();

  // if (localStorage.getItem('formData')) {
  //   formData = Object.assign(formData, localStorage.getItem('formData'))
  // } else {
  //   localStorage.setItem('formData', JSON.stringify(formData));
  // }

  $.ajax({
    method: 'POST',
    url: $('#SurveyForm').attr('action'),
    data: formData,
    statusCode: {
      200: function(data) {
        // localStorage.setItem('formData', JSON.stringify(data));
        console.log('Data submitted successfully: ', data);
      }
    },
    error: function(jqXHR, status, msg) {
      console.log('Something went wrong: ' + status + ' ' + msg);
    }
  });
}

let ndtServer,
	ndtServerIp,
	ndtPort = "3010",
	ndtProtocol = 'wss',
	ndtPath = "/ndt_protocol",
	ndtUpdateInterval = 1000,
	c2sRate,
	s2cRate,
	MinRTT;

getNdtServer()

const NDT_meter = new NDTmeter('#SubmitConsent');

function checkLocationConsent () {
  event.preventDefault();
  window.scrollTo(0, 0);
  welcome.parentElement.classList.add('visually-hidden');
  step2.classList.remove('visually-hidden');
  surveyForm.classList.remove('visually-hidden');

  const useLocation = document.getElementById('yes').checked;

  if (!!useLocation) {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(success, error, { timeout: GEO_TIMEOUT });
    }
  } else { runTests(); }
}

function runTests(event) {
  const NDT_client = new NDTjs(ndtServer, ndtPort, ndtProtocol, ndtPath, NDT_meter, ndtUpdateInterval);

  NDT_client.startTest();
};

function success(position) {
  const NDT_client = new NDTjs(ndtServer, ndtPort, ndtProtocol, ndtPath, NDT_meter, ndtUpdateInterval);

	document.getElementById('latitude-mlab').value = position.coords.latitude;
	document.getElementById('longitude-mlab').value = position.coords.longitude;
  document.getElementById('latitude').value = position.coords.latitude;
	document.getElementById('longitude').value = position.coords.longitude;

	var xhr = new XMLHttpRequest(),
	currentLocationURL = "https://nominatim.openstreetmap.org/reverse?format=json&lat=" + position.coords.latitude + "&lon=" + position.coords.longitude + "&zoom=18&addressdetails=1";

	var currentLoc;
	xhr.open('GET', currentLocationURL, true);
	xhr.send();
	xhr.onreadystatechange = function () {
		if (xhr.readyState === 4) {
			if (xhr.status === 200) {
				currentLoc = JSON.parse(xhr.responseText);
				console.log("Location received");
        NDT_client.startTest();
				// currentLocText.text(currentLoc.address.road + currentLoc.address.neighbourhood + currentLoc.address.suburb + currentLoc.address.city + currentLoc.address.state);
				document.getElementsByClassName('loader-item')[1].append("Searching from: " + currentLoc.address.road + ", " + currentLoc.address.city + ", " + currentLoc.address.state);
			} else {
				console.log('Location lookup failed');
			}
		}
	};
}

function error(error) {
	document.getElementById('ErrorMessage').innerHTML = 'ERROR(' + error.code + '): ' + error.message;
}

function getNdtServer() {
	var xhr = new XMLHttpRequest(),
		mlabNsUrl = 'https://mlab-ns.appspot.com/ndt_ssl?format=json';

	xhr.open('GET', mlabNsUrl, true);
	xhr.send();
	xhr.onreadystatechange = function () {
		if (xhr.readyState === 4) {
			if (xhr.status === 200) {
				ndtServer = JSON.parse(xhr.responseText).fqdn;
				ndtServerIp = JSON.parse(xhr.responseText).ip;
				console.log('Using M-Lab Server ' + ndtServer);
			} else {
				console.log('M-Lab NS lookup failed.');
        window.alert('M-Lab NS lookup failed. Please refresh the page.')
			}
		}
	};
};
