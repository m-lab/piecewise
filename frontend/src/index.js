import React from 'react';
import ReactDOM from 'react-dom';
import Papa from 'papaparse';
import mapboxgl from 'mapbox-gl';
import * as d3 from 'd3';
import csvData from './data/ndia_PW_export.csv';

const path = require('path');
const GeoJSON = require('geojson');

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

    const mapMlab = new mapboxgl.Map({
      bounds: this.state.bounds,
      container: this.mapMlabContainer,
      style: 'mapbox://styles/rgaines/ck3umm5lo10451cnyh5sixye6',
      center: [this.state.lng, this.state.lat],
      zoom: this.state.zoom
    });

    mapMlab.on('load', function() {

      mapMlab.addSource('mlab-basetiles', {
        type: 'vector',
        tiles: [
          'https://maptiles.mlab-sandbox.measurementlab.net/us_counties/us_counties/{z}/{x}/{y}.pbf'
        ]
      });

      mapMlab.addLayer({
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

      mapMlab.addSource('results', {
        'type': 'geojson',
        'data': this.data
      });

      mapMlab.addLayer({
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

      mapMlab.addControl(new mapboxgl.NavigationControl());
    });

    const mapPublic = new mapboxgl.Map({
      bounds: this.state.bounds,
      container: this.mapPublicContainer,
      style: 'mapbox://styles/rgaines/ck3umm5lo10451cnyh5sixye6',
      center: [this.state.lng, this.state.lat],
      zoom: this.state.zoom
    });

    mapPublic.on('load', function() {

      mapPublic.addSource('mlab-basetiles', {
        type: 'vector',
        tiles: [
          'https://maptiles.mlab-sandbox.measurementlab.net/us_counties/us_counties/{z}/{x}/{y}.pbf'
        ]
      });

      mapPublic.addLayer({
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

      mapPublic.addSource('results', {
        'type': 'geojson',
        'data': this.data
      });

      mapPublic.addLayer({
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

      mapPublic.addControl(new mapboxgl.NavigationControl());

      // slider by week
      document.getElementById('slider').addEventListener('input', function(e) {
        const week = parseInt(e.target.value);
        // update the map
        mapMlab.setFilter('results-heat', ['==', ['number', ['get', 'Week']], week]);

        // update text in the UI
        document.getElementById('active-week').innerText = week;
      });
    });
  }

  fetchCsv() {
    // return fetch(csv).then(function (response) {
    //   let reader = response.body.getReader();
    //   let decoder = new TextDecoder('utf-8');
    //
    //   return reader.read().then(function (result) {
    //     return decoder.decode(result.value);
    //   });
    // });
  }

  getData(result) {
    // const geojson = csv2geojson.csv2geojson(result, {
    //     latfield: 'latitude',
    //     lonfield: 'longitude',
    // }, function(err, data) {
    //   try {
    //     console.log("Success! ", data);
    //     this.setState({data: result.data});
    //   } catch {
    //     console.warn("Error: ", err);
    //   }
    // });

    // console.log(result);
  }

  async getCsvData() {
    // let csvData = await this.fetchCsv();
    // const data = Papa.parse(csvData, {
    //   config: {
    //     header: true,
    //   },
    //   complete: this.getData,
    // });

    // d3.csv(csvData, function(data) {
    //   this.data = GeoJSON.parse(data, {Point: ['lat', 'lng']});
    // });
    //
    // console.log(this.data);
  }

  render() {
    return (
      <div>
        <div id='console'>
          <h1 className='h1'>Piecewise map data</h1>
          <p>Comparison of test data.</p>
          <div className='session'>
            <div className='selects'>
              <label className='vh' for='test-select'>Choose a type of test result:</label>
              <select name="tests" id="test-select" className='h2 select'>
                <option value="download">Download Speed</option>
                <option value="upload">Upload Speed</option>
                <option value="latency">Latency</option>
              </select>
              <label className='vh' for='area-select'>Choose an area:</label>
              <select name="areas" id="area-select" className='h2 select'>
                <option value="county">County</option>
                <option value="zip">Zip Code</option>
                <option value="census">US Census Tract</option>
                <option value="senate">State Senate Districts</option>
                <option value="house">State House Districts</option>
              </select>
              <div className='select select-state'>
                <label className='select-state-item' for='state-select'>Zoom to state?</label>
                <select name="states" id="state-select" className='h2 select-state-item'>
                  <option value="AL">Alabama</option>
                  <option value="AK">Alaska</option>
                  <option value="AZ">Arizona</option>
                  <option value="AR">Arkansas</option>
                  <option value="CA">California</option>
                  <option value="CO">Colorado</option>
                  <option value="CT">Connecticut</option>
                  <option value="DE">Delaware</option>
                  <option value="DC">District Of Columbia</option>
                  <option value="FL">Florida</option>
                  <option value="GA">Georgia</option>
                  <option value="HI">Hawaii</option>
                  <option value="ID">Idaho</option>
                  <option value="IL">Illinois</option>
                  <option value="IN">Indiana</option>
                  <option value="IA">Iowa</option>
                  <option value="KS">Kansas</option>
                  <option value="KY">Kentucky</option>
                  <option value="LA">Louisiana</option>
                  <option value="ME">Maine</option>
                  <option value="MD">Maryland</option>
                  <option value="MA">Massachusetts</option>
                  <option value="MI">Michigan</option>
                  <option value="MN">Minnesota</option>
                  <option value="MS">Mississippi</option>
                  <option value="MO">Missouri</option>
                  <option value="MT">Montana</option>
                  <option value="NE">Nebraska</option>
                  <option value="NV">Nevada</option>
                  <option value="NH">New Hampshire</option>
                  <option value="NJ">New Jersey</option>
                  <option value="NM">New Mexico</option>
                  <option value="NY">New York</option>
                  <option value="NC">North Carolina</option>
                  <option value="ND">North Dakota</option>
                  <option value="OH">Ohio</option>
                  <option value="OK">Oklahoma</option>
                  <option value="OR">Oregon</option>
                  <option value="PA">Pennsylvania</option>
                  <option value="RI">Rhode Island</option>
                  <option value="SC">South Carolina</option>
                  <option value="SD">South Dakota</option>
                  <option value="TN">Tennessee</option>
                  <option value="TX">Texas</option>
                  <option value="UT">Utah</option>
                  <option value="VT">Vermont</option>
                  <option value="VA">Virginia</option>
                  <option value="WA">Washington</option>
                  <option value="WV">West Virginia</option>
                  <option value="WI">Wisconsin</option>
                  <option value="WY">Wyoming</option>
                </select>
              </div>
            </div>
            <div className='row colors'>
            </div>
            <div className='row labels'>
              <div className='label'>0</div>
              <div className='label'>25</div>
              <div className='label'>50</div>
              <div className='label'>100</div>
              <div className='label'>125</div>
              <div className='label'>150</div>
              <div className='label'>200+mbps</div>
            </div>
          </div>
          <div className='session' id='sliderbar'>
            <h2>Week: <label id='active-week'>Jan 1-7,2020</label></h2>
            <input id='slider' className='row' type='range' min='1' max='52' step='1' defaultValue='1' />
          </div>
        </div>
        <div className="maps">
          <div ref={el => this.mapMlabContainer = el} className="map map-mlab" />
          <div ref={el => this.mapPublicContainer = el} className="map map-public" />
        </div>
      </div>
    )
  }
}

ReactDOM.render(<Application />, document.getElementById('app'));
