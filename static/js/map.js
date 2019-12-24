var mapboxgl = require('mapbox-gl/dist/mapbox-gl.js');

mapboxgl.accessToken = 'pk.eyJ1IjoicmdhaW5lcyIsImEiOiJjamZuenFmZXIwa2JuMndwZXd1eGQwcTNuIn0.TbNK-TNQxiGUlWFdzEEavw';

var bounds = [
  [-167, 16], // Southwest coordinates
  [-46, 72] // Northeast coordinates
];

var mapContainer = document.getElementById('Map');

if (!!mapContainer) {
  var map = new mapboxgl.Map({
    container: 'Map',
    center: [-98, 38],
    maxBounds: bounds,
    style: 'mapbox://styles/rgaines/ck3umm5lo10451cnyh5sixye6',
    zoom: 3,
  });

  // map.on('load', function() {
  //   map.addLayer(
  //     {
  //       'id': 'petfinder',
  //       'type': 'point',
  //       'source': {
  //         'type': 'geojson',
  //         'data': 'grant_type=client_credentials&client_id={' + process.env.PETFINDER_API_KEY + '&client_secret={' + process.env.PETFINDER_SECRET_KEY +'} https://www.petfinder.com/dog/spot-120/nj/jersey-city/nj333-petfinder-test-account/?referrer_id=d7e3700b-2e07-11e9-b3f3-0800275f82b1',
  //       }
  //     },
  //     'poi-label',
  //   )
  // });

  map.on('click', function(e) {
    var features = map.queryRenderedFeatures(e.point, {
      layers: ['poi-label'] // replace this with the name of the layer
    });

    if (!features.length) {
      return;
    }

    var feature = features[0];

    var popup = new mapboxgl.Popup({ offset: [0, -15] })
      .setLngLat(feature.geometry.coordinates)
      .setHTML('<h3>' + feature.properties.title + '</h3><p>' + feature.properties.description + '</p>')
      .addTo(map);
  });


  var geojson = {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-77.032, 38.913]
      },
      properties: {
        title: 'Mapbox',
        description: 'Washington, D.C.'
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-122.414, 37.776]
      },
      properties: {
        title: 'Mapbox',
        description: 'San Francisco, California'
      }
    }]
  };

  // add markers to map
  geojson.features.forEach(function(marker) {

    // create a HTML element for each feature
    var el = document.createElement('div');
    el.className = 'marker';

    // make a marker for each feature and add to the map
    new mapboxgl.Marker(el)
      .setLngLat(marker.geometry.coordinates)
      .setPopup(new mapboxgl.Popup({ offset: 25 }) // add popups
        .setHTML('<h3>ISP User: ' + (marker.properties.isp_user ? marker.properties.isp_user : 'Unknown') + '</h3><p>Other ISP: ' + (marker.properties.other_isp ? marker.properties.other_isp : 'Unknown') + '</p><p>Connection Type: ' + (marker.properties.connection_type ? marker.properties.connection_type : 'Unknown') + '</p><p>Cost of service: ' + (marker.properties.cost_of_service ? marker.properties.cost_of_service : 'Unknown') + '</p><p>Advertised download speed: ' + (marker.properties.advertised_download ? marker.properties.advertised_download : 'Unknown') + '</p><p>Advertised Upload Speed: ' + (marker.properties.advertised_upload ? marker.properties.advertised_upload : 'Unknown') + '</p><p>Actual Download Speed: ' + (marker.properties.actual_download ? marker.properties.actual_download : 'Unknown') + '</p><p>Actual Upload Speed: ' + (marker.properties.actual_upload ? marker.properties.actual_upload : 'Unknown') + '</p><p>Minimum Round Trip Time: ' + (marker.properties.min_rtt ? marker.properties.min_rtt : 'Unknown') + '</p><p>Latitute: ' + (marker.properties.latitute ? marker.properties.latitute : 'Unknown') + '</p><p>Longitude: ' + (marker.properties.longitude ? marker.properties.longitude : 'Unknown') +'</p>'))
      .addTo(map);
  });

}
