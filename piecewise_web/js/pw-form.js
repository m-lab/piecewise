// checks for geolocation and adds coords to form elements upon consent

if ("geolocation" in navigator) {
  navigator.geolocation.getCurrentPosition(success, error);
}

function success(position) {

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

        // currentLocText.text(currentLoc.address.road + currentLoc.address.neighbourhood + currentLoc.address.suburb + currentLoc.address.city + currentLoc.address.state);
        $('#mobile-container').append('<div id="mobile-approx-loc"></div>')
        $('#approx-loc, #mobile-approx-loc').append("<p>Searching from:</p><p>" + currentLoc.address.road + ", " + currentLoc.address.city + ", " + currentLoc.address.state + "</p>");
      } else {
        console.log('Location lookup failed');
      }
    }
  };
}

function error(error) {
  document.getElementById('msg').innerHTML = 'ERROR(' + error.code + '): ' + error.message;
}

function submitExtraData() {
  if (validateExtraDataForm()) {
    var formData = $('#collector').serialize();
    $.ajax({
      method: 'GET',
      url: $('#collector').attr('action'),
      data: formData,
      statusCode: {
        201: function() {
          console.log('Data submitted successfully.');
        }
      },
      error: function(jqXHR, status, msg) {
        console.log('Something went wrong: ' + status + ' ' + msg);
      }
    });
  }
}

function validateExtraDataForm() {
  if ( $('#isp_user option:selected').val() == 'default' ) {
    return false;
  } else if ( $('#isp_user option:selected').val() == 'other' ) {
    $('#isp_user_text').toggle(true);
  } else {
    $('#isp_user_text').toggle(false);
  }
  if ( $('#connection_type option:selected').val() == 'default' ) {
    return false;
  }
  if ( $('#cost_of_service option:selected').val() == 'default' ) {
    return false;
  }
  if ( ! $('#data_acknowledgement').is(':checked') ) {
    return false;
  }
  return true;
}

function showOtherIspBox(val) {
  var element=document.getElementById('isp_user');
  if(val=='other') {
    $('#isp_user_text').show();
  }
  else {
    $('#isp_user_text').hide();
  }
}
