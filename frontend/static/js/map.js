var mapboxgl = require('mapbox-gl/dist/mapbox-gl.js');

mapboxgl.accessToken = 'pk.eyJ1IjoicmdhaW5lcyIsImEiOiJjamZuenFmZXIwa2JuMndwZXd1eGQwcTNuIn0.TbNK-TNQxiGUlWFdzEEavw';

const bounds = [
  [-167, 16], // Southwest coordinates
  [-46, 72] // Northeast coordinates
];

const mapContainer = document.getElementById('Map');
const main = document.getElementsByClassName('main')[0];
const survey = document.getElementById('SurveyForm');
const results = document.getElementById('results');
const loader = document.getElementById('Loader');

if (!!survey && !!mapContainer) {

  const map = new mapboxgl.Map({
    container: 'Map',
    center: [-98, 38],
    maxBounds: bounds,
    style: 'mapbox://styles/rgaines/ck3umm5lo10451cnyh5sixye6',
    zoom: 3,
  });

  map.on('load', function() {
    let size = 200;

    const pulsingDot = {
      width: size,
      height: size,
      data: new Uint8Array(size * size * 4),

      // get rendering context for the map canvas when layer is added to the map
      onAdd: function() {
        let canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        this.context = canvas.getContext('2d');
      },

      // called once before every frame where the icon will be used
      render: function() {
        let duration = 1000;
        var t = (performance.now() % duration) / duration;

        var radius = (size / 2) * 0.3;
        var outerRadius = (size / 2) * 0.7 * t + radius;
        var context = this.context;

        // draw outer circle
        context.clearRect(0, 0, this.width, this.height);
        context.beginPath();
        context.arc(
        this.width / 2,
        this.height / 2,
        outerRadius,
        0,
        Math.PI * 2
        );
        context.fillStyle = 'rgba(255, 200, 200,' + (1 - t) + ')';
        context.fill();

        // draw inner circle
        context.beginPath();
        context.arc(
        this.width / 2,
        this.height / 2,
        radius,
        0,
        Math.PI * 2
        );
        context.fillStyle = 'rgba(255, 100, 100, 1)';
        context.strokeStyle = 'white';
        context.lineWidth = 2 + 4 * (1 - t);
        context.fill();
        context.stroke();

        // update this image's data with data from the canvas
        this.data = context.getImageData(
        0,
        0,
        this.width,
        this.height
        ).data;


        // continuously repaint the map, resulting in the smooth animation of the dot
        map.triggerRepaint();

        // return `true` to let the map know that the image was updated
        return true;
      }
    };

    survey.addEventListener('submit', logSubmit);

    function logSubmit(event) {
      event.preventDefault();
      console.log(`Form Submitted! Time stamp: ${event.timeStamp}`);

      main.classList.add('visually-hidden');
      survey.classList.add('visually-hidden');
      loader.classList.remove('visually-hidden');
      results.classList.remove('visually-hidden');

      const userLatitude = document.getElementById('latitude').value;
      const userLongitude = document.getElementById('longitude').value;

      console.log('LOCATION: ', userLatitude, userLongitude);

      map.addImage('pulsing-dot', pulsingDot, { pixelRatio: 2 });

      map.addLayer({
        'id': 'points',
        'type': 'symbol',
        'source': {
          'type': 'geojson',
          'data': {
            'type': 'FeatureCollection',
            'features': [
              {
                'type': 'Feature',
                'geometry': {
                  'type': 'Point',
                  'coordinates': [userLatitude, userLongitude]
                }
              }
            ]
          }
        },
        'layout': {
          'icon-image': 'pulsing-dot'
        }
      });

      console.log(map.getSource('points'));
    }
  });

  map.on('click', function(e) {
    // let features = map.queryRenderedFeatures(e.point, {
    //   layers: ['points'] // replace this with the name of the layer
    // });
    //
    // if (!features.length) {
    //   return;
    // }
    //
    // let feature = features[0];
    //
    // let popup = new mapboxgl.Popup({ offset: [0, -15] })
    //   .setLngLat(feature.geometry.coordinates)
    //   .setHTML('<h3>' + feature.properties.title + '</h3><p>' + feature.properties.description + '</p>')
    //   .addTo(map);
  });

  // add markers to map
  // map.getSource('points').features.forEach(function(marker) {
  //
  //   // create a HTML element for each feature
  //   var el = document.createElement('div');
  //   el.className = 'marker';
  //
  //   // make a marker for each feature and add to the map
  //   new mapboxgl.Marker(el)
  //     .setLngLat(marker.geometry.coordinates)
  //     .setPopup(new mapboxgl.Popup({ offset: 25 }) // add popups
  //       .setHTML('<h3>ISP User: ' + (marker.properties.isp_user ? marker.properties.isp_user : 'Unknown') + '</h3><p>Other ISP: ' + (marker.properties.other_isp ? marker.properties.other_isp : 'Unknown') + '</p><p>Connection Type: ' + (marker.properties.connection_type ? marker.properties.connection_type : 'Unknown') + '</p><p>Cost of service: ' + (marker.properties.cost_of_service ? marker.properties.cost_of_service : 'Unknown') + '</p><p>Advertised download speed: ' + (marker.properties.advertised_download ? marker.properties.advertised_download : 'Unknown') + '</p><p>Advertised Upload Speed: ' + (marker.properties.advertised_upload ? marker.properties.advertised_upload : 'Unknown') + '</p><p>Actual Download Speed: ' + (marker.properties.actual_download ? marker.properties.actual_download : 'Unknown') + '</p><p>Actual Upload Speed: ' + (marker.properties.actual_upload ? marker.properties.actual_upload : 'Unknown') + '</p><p>Minimum Round Trip Time: ' + (marker.properties.min_rtt ? marker.properties.min_rtt : 'Unknown') + '</p><p>Latitute: ' + (marker.properties.latitute ? marker.properties.latitute : 'Unknown') + '</p><p>Longitude: ' + (marker.properties.longitude ? marker.properties.longitude : 'Unknown') +'</p>'))
  //     .addTo(map);
  // });
}
