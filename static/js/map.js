var mapboxgl = require('mapbox-gl/dist/mapbox-gl.js');

mapboxgl.accessToken = 'pk.eyJ1IjoicmdhaW5lcyIsImEiOiJjamZuenFmZXIwa2JuMndwZXd1eGQwcTNuIn0.TbNK-TNQxiGUlWFdzEEavw';

var bounds = [
  [-74.04728500751165, 40.68392799015035], // Southwest coordinates
  [-73.91058699000139, 40.87764500765852] // Northeast coordinates
];

var map = new mapboxgl.Map({
  container: 'Map',
  center: [-73.9978, 40.7209],
  maxBounds: bounds,
  style: 'mapbox://styles/rgaines/ck3umm5lo10451cnyh5sixye6',
  zoom: 13,
});
