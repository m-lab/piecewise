import url from './critical.js';
import scroll from "@threespot/freeze-scroll";

const mapboxgl = require('mapbox-gl/dist/mapbox-gl.js');

mapboxgl.accessToken = 'pk.eyJ1IjoicmdhaW5lcyIsImEiOiJjamZuenFmZXIwa2JuMndwZXd1eGQwcTNuIn0.TbNK-TNQxiGUlWFdzEEavw';

const bounds = [
  [-167, 16], // Southwest coordinates
  [-46, 72] // Northeast coordinates
];

const mapContainer = document.getElementById('Map');
const main = document.getElementsByClassName('main')[0];
const consentForm = document.getElementById('ConsentForm');
const surveyForm = document.getElementById('SurveyForm');
const results = document.getElementById('results');
const step2 = document.getElementById('Step2');
const background = document.getElementsByClassName('background')[0];

// only create map if the survey and map container exist on the page
// if so, build the Mapbox map
if (!!consentForm && !!mapContainer) {

  let geojson;

  // fetch data from api
  const getjson = function(url, callback) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.responseType = 'json';
      xhr.onload = function() {
        var status = xhr.status;
        if (status === 200) {
          callback(null, xhr.response);
        } else {
          callback(status, xhr.response);
        }
      };
      xhr.send();
  };

  getjson(url, (error, data) => {
    if (error !== null) {
      alert('Something went wrong: ' + error);
    } else {
      geojson = data;

      const allPoints = geojson.map(point => ({
          'type': 'Feature',
          'geometry': {
              'type': 'Point',
              'coordinates': [
                [point.longitude, point.latitude]
              ],
          },
          properties: {
            isp_user: point.survey_service_type,
            other_isp: point.survey_service_type_other,
            cost_of_service: point.survey_current_cost,
            advertised_download: point.survey_subscribe_download,
            advertised_upload: point.survey_subscribe_upload,
            actual_download: point.actual_download,
            actual_upload: point.actual_upload,
            min_rtt: point.min_rtt,
          }
      }));

      geojson = {
        "type": "FeatureCollection",
        "features": allPoints
      }
    }
  })

  const map = new mapboxgl.Map({
    container: 'Map',
    center: [-79.2407191, 35.2712601],
    maxBounds: bounds,
    style: 'mapbox://styles/rgaines/ck3umm5lo10451cnyh5sixye6',
    zoom: 6,
  });

  map.on('load', function() {

    if (!!geojson) {
      map.addSource('points', {
        'type': 'geojson',
        'data': geojson
      })

      map.addLayer({
        'id': 'points',
        'type': 'circle',
        'source': 'points',
        'paint': {
          'circle-radius': 10,
          'circle-color': '#ff442b',
          'circle-opacity': 0.6
        }
      });

      geojson.features.forEach(function(marker) {

        // create a HTML element for each feature
        var el = document.createElement('div');
        el.className = 'marker';

        // make a marker for each feature and add to the map
        new mapboxgl.Marker(el)
          .setLngLat(marker.geometry.coordinates.flat())
          .setPopup(new mapboxgl.Popup({ offset: 25 }) // add popups
            .setHTML('<h3>ISP User: ' + (marker.properties.isp_user ? marker.properties.isp_user : 'Unknown') + '</h3><p>Other ISP: ' + (marker.properties.other_isp ? marker.properties.other_isp : 'Unknown') + '</p><p>Connection Type: ' + (marker.properties.connection_type ? marker.properties.connection_type : 'Unknown') + '</p><p>Cost of service: ' + (marker.properties.cost_of_service ? marker.properties.cost_of_service : 'Unknown') + '</p><p>Advertised download speed: ' + (marker.properties.advertised_download ? marker.properties.advertised_download : 'Unknown') + '</p><p>Advertised Upload Speed: ' + (marker.properties.advertised_upload ? marker.properties.advertised_upload : 'Unknown') + '</p><p>Actual Download Speed: ' + (marker.properties.actual_download ? marker.properties.actual_download : 'Unknown') + '</p><p>Actual Upload Speed: ' + (marker.properties.actual_upload ? marker.properties.actual_upload : 'Unknown') + '</p><p>Minimum Round Trip Time: ' + (marker.properties.min_rtt ? marker.properties.min_rtt : 'Unknown') + '</p><p>Latitute: ' + (marker.properties.latitute ? marker.properties.latitute : 'Unknown') + '</p><p>Longitude: ' + (marker.properties.longitude ? marker.properties.longitude : 'Unknown') +'</p>'))
          .addTo(map);
      });

      // Change the cursor to a pointer when the mouse is over the places layer.
      map.on('mouseenter', 'points', function() {
        map.getCanvas().style.cursor = 'pointer';
        console.log('on item');
      });

      // Change it back to a pointer when it leaves.
      map.on('mouseleave', 'points', function() {
        map.getCanvas().style.cursor = '';
        console.log('off item');
      });
    }


    surveyForm.addEventListener('submit', logSubmit);

    function logSubmit(event) {
      event.preventDefault();

      scroll.unfreeze();

      main.classList.add('visually-hidden');
      // consentForm.classList.add('visually-hidden');
      // surveyForm.classList.add('visually-hidden');

      const userLatitude = document.getElementById('latitude-mlab').value || '';
      const userLongitude = document.getElementById('longitude-mlab').value || '';
      const actualDownload = document.getElementById('actual_download-mlab').value || '';
      const actualUpload = document.getElementById('actual_upload-mlab').value || '';
      const minRTT = document.getElementById('min_rtt-mlab').value || '';
      const ispUser = document.getElementById('survey_service_type').value || '';
      const cost = document.getElementById('survey_current_cost').value || '';
      const advertisedDownload = document.getElementById('survey_subscribe_download').value || '';
      const advertisedUpload = document.getElementById('survey_subscribe_upload').value || '';

      if (!!userLatitude & !!userLongitude) {

        const userData = {
          "type": "FeatureCollection",
          "features": [{
            "type": "Feature",
            "geometry": {
              "type": "LineString",
              "coordinates": [
                [userLongitude, userLatitude],
              ]
            },
            properties: {
              isp_user: ispUser,
              cost_of_service: cost,
              advertised_download: advertisedDownload,
              advertised_upload: advertisedUpload,
              actual_download: actualDownload,
              actual_upload: actualUpload,
              min_rtt: minRTT,
            }
          }]
        }

        userData.features.forEach(function(marker) {

          // create a HTML element for each feature
          var el = document.createElement('div');
          el.className = 'marker';

          // make a marker for each feature and add to the map
          new mapboxgl.Marker(el)
            .setLngLat(marker.geometry.coordinates.flat())
            .setPopup(new mapboxgl.Popup({ offset: 25 }) // add popups
              .setHTML('<h3>ISP User: ' + (marker.properties.isp_user ? marker.properties.isp_user : 'Unknown') + '</h3><p>Other ISP: ' + (marker.properties.other_isp ? marker.properties.other_isp : 'Unknown') + '</p><p>Connection Type: ' + (marker.properties.connection_type ? marker.properties.connection_type : 'Unknown') + '</p><p>Cost of service: ' + (marker.properties.cost_of_service ? marker.properties.cost_of_service : 'Unknown') + '</p><p>Advertised download speed: ' + (marker.properties.advertised_download ? marker.properties.advertised_download : 'Unknown') + '</p><p>Advertised Upload Speed: ' + (marker.properties.advertised_upload ? marker.properties.advertised_upload : 'Unknown') + '</p><p>Actual Download Speed: ' + (marker.properties.actual_download ? marker.properties.actual_download : 'Unknown') + '</p><p>Actual Upload Speed: ' + (marker.properties.actual_upload ? marker.properties.actual_upload : 'Unknown') + '</p><p>Minimum Round Trip Time: ' + (marker.properties.min_rtt ? marker.properties.min_rtt : 'Unknown') + '</p><p>Latitute: ' + (marker.properties.latitute ? marker.properties.latitute : 'Unknown') + '</p><p>Longitude: ' + (marker.properties.longitude ? marker.properties.longitude : 'Unknown') +'</p>'))
            .addTo(map);
        });
      }

      results.children[0].classList.add('pos-fixed');
      results.children[0].classList.add('bg-white');
      results.children[0].classList.add('p-3');
      results.children[0].classList.add('results-bar');
      step2.outerHTML = results.innerHTML;
      surveyForm.classList.add('visually-hidden');
      background.classList.add('visually-hidden');
    }
  });
}
