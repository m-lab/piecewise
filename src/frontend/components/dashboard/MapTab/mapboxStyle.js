import streets from './mapboxStreets';

const mbStyle = {
  version: 8,
  name: 'piecewise',
  center: [-98, 38],
  maxZoom: 12,
  zoom: 3,
  bearing: 0,
  pitch: 0,
  sprite:
    'mapbox://sprites/jeremiak/cke0fpv9f1dds19pjx1sli5qs/ck2u8j60r58fu0sgyxrigm3cu',
  glyphs: 'mapbox://fonts/jeremiak/{fontstack}/{range}.pbf',
  sources: {
    ocean: {
      type: 'vector',
      url: 'mapbox://jeremiak.dgy1ahhh',
    },
    composite: {
      type: 'vector',
      tiles: [
        'https://storage.googleapis.com/maptiles-mlab-sandbox/piecewise/{z}/{x}/{y}.pbf',
      ],
    },
    streets: {
      type: 'vector',
      url: 'mapbox://mapbox.mapbox-streets-v8,mapbox.mapbox-terrain-v2',
    },
  },
  layers: [
    {
      id: 'background',
      type: 'background',
      paint: {
        'background-color': '#ECE1CB',
      },
    },
    {
      id: 'ocean',
      type: 'fill',
      source: 'ocean',
      'source-layer': 'ocean',
      paint: {
        'fill-color': '#1D2F6F',
      },
    },
    {
      id: 'counties-data',
      type: 'fill',
      source: 'composite',
      'source-layer': 'counties',
      paint: {
        'fill-color': '#ECE1CB',
      },
    },
    {
      id: 'tracts-data',
      type: 'fill',
      source: 'composite',
      'source-layer': 'tracts',
      paint: {
        'fill-color': '#ECE1CB',
      },
    },

    // streets['land'],
    streets['national-park'],
    streets['landuse'],
    // streets['pitch-outline'],
    streets['waterway'],
    streets['water'],
    // streets['land-structure-polygon'],
    // streets['land-structure-line'],
    // streets['aeroway-polygon'],
    // streets['aeroway-line'],
    streets['building-outline'],
    // streets['building'],
    // streets['tunnel-path'],
    // streets['tunnel-steps'],
    // streets['tunnel-pedestrian'],
    streets['tunnel-simple'],
    // streets['road-path'],
    // streets['road-steps'],
    // streets['road-pedestrian'],
    streets['road-simple'],
    // streets['bridge-path'],
    // streets['bridge-steps'],
    // streets['bridge-pedestrian'],
    // streets['bridge-case-simple'],
    streets['bridge-simple'],

    {
      id: 'counties-stroke',
      type: 'line',
      source: 'composite',
      'source-layer': 'counties',
      paint: {
        'line-color': '#1D2F6F',
        'line-width': 0.25,
      },
    },
    {
      id: 'tracts-stroke',
      type: 'line',
      source: 'composite',
      'source-layer': 'tracts',
      filter: ['==', ['get', 'name'], 'nosuchtract'],
      paint: {
        'line-color': '#1D2F6F',
        'line-width': 0.25,
      },
    },
    {
      id: 'states-stroke',
      type: 'line',
      source: 'composite',
      'source-layer': 'states',
      paint: {
        'line-color': '#1D2F6F',
        'line-width': 0.6,
      },
    },
    {
      id: 'counties-clicked',
      type: 'line',
      source: 'composite',
      'source-layer': 'counties',
      filter: ['==', ['get', 'name'], 'nosuchthing'],
      paint: {
        'line-color': '#F88DAD',
        'line-width': 1.65,
      },
    },
    {
      id: 'tracts-clicked',
      type: 'line',
      source: 'composite',
      'source-layer': 'tracts',
      filter: ['==', ['get', 'name'], 'nosuchthing'],
      paint: {
        'line-color': '#F88DAD',
        'line-width': 1.65,
      },
    },
    streets['road-label-simple'],
    // streets['path-pedestrian-label'],
    // streets['waterway-label'],
    // streets['natural-line-label'],
    // streets['natural-point-label'],
    // streets['water-line-label'],
    // streets['water-point-label'],
    // streets['poi-label'],
    // streets['airport-label'],
    // streets['settlement-subdivision-label'],
    streets['settlement-minor-label'],
    streets['settlement-major-label'],
    streets['state-label'],
    streets['country-label'],
  ],
};

export default mbStyle;
