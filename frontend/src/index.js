import React from 'react';
import ReactDOM from 'react-dom';
import Papa from 'papaparse';
import mapboxgl from 'mapbox-gl';
import { fs } from 'filer';
// import * as csvData from './ndia_PW_export.csv';

const path = require('path');
const sh = new fs.Shell();
const csv2geojson = require('csv2geojson');
let csvData;

mapboxgl.accessToken = 'pk.eyJ1IjoicmdhaW5lcyIsImEiOiJjamZuenFmZXIwa2JuMndwZXd1eGQwcTNuIn0.TbNK-TNQxiGUlWFdzEEavw';

class Application extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      bounds: [
        [-167, 16], // Southwest coordinates
        [-46, 72] // Northeast coordinates
      ],
      data: [],
      lng: 5,
      lat: 34,
      zoom: 2
    };
    this.getData = this.getData.bind(this);
  }

  componentDidMount() {
    this.getCsvData();

    const map = new mapboxgl.Map({
      bounds: this.state.bounds,
      container: this.mapContainer,
      style: 'mapbox://styles/rgaines/ck3umm5lo10451cnyh5sixye6',
      center: [this.state.lng, this.state.lat],
      zoom: this.state.zoom
    });

    map.on('load', function() {

      map.addSource('mlab-basetiles', {
        type: 'vector',
        tiles: [
          'https://maptiles.mlab-sandbox.measurementlab.net/us_counties/us_counties/{z}/{x}/{y}.pbf'
        ]
      });

      map.addLayer({
        'id': 'mlab-basetiles',
        'type': 'line',
        'source': 'mlab-basetiles',
        'source-layer': 'us_counties',
        'layout': {
          'line-join': 'round',
          'line-cap': 'round'
        },
        'paint': {
          'line-color': '#ff69b4',
          'line-width': 1
        }
      });

      map.addSource('results', {
        'type': 'geojson',
        'data': this.data
      });

      map.addLayer({
        'id': 'results-heat',
        'type': 'heatmap',
        'source': 'results',
        'maxzoom': 9,
        'paint':{
          // Increase the heatmap weight based on frequency and property magnitude
          'heatmap-weight': [
            'interpolate',
            ['linear'],
            ['get', 'mag'],
            0,
            0,
            6,
            1
          ],
        }
      })

      map.addControl(new mapboxgl.NavigationControl());
    });
  }

  fetchCsv() {
    return fetch('./data/ndia_PW_export.csv').then(function (response) {
      let reader = response.body.getReader();
      let decoder = new TextDecoder('utf-8');

      return reader.read().then(function (result) {
        return decoder.decode(result.value);
      });
    });
  }

  getData(result) {
    const geojson = csv2geojson.csv2geojson(result, {
        latfield: 'latitude',
        lonfield: 'longitude',
    }, function(err, data) {
      try {
        console.log("Success! ", data);
        this.setState({data: result.data});
      } catch {
        console.warn("Error: ", err);
      }
    });
  }

  async getCsvData() {
    let csvData = await this.fetchCsv();
    console.log('csv: ', this.data);

    Papa.parse(csvData, {
      complete: this.getData
    });
  }

  render() {
    return (
      <div className="maps">
        <div ref={el => this.mapContainer = el} className="map map-mlab" />
      </div>
    )
  }
}

ReactDOM.render(<Application />, document.getElementById('app'));
