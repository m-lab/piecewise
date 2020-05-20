import React, { useEffect, useRef, useState } from "react";
import PropTypes from 'prop-types';

import Papa from 'papaparse';
import mapboxgl from 'mapbox-gl';
import csvData from '../data/ndia_PW_export.csv';

const path = require('path');
const GeoJSON = require('geojson');

mapboxgl.accessToken = 'pk.eyJ1IjoicmdhaW5lcyIsImEiOiJjamZuenFmZXIwa2JuMndwZXd1eGQwcTNuIn0.TbNK-TNQxiGUlWFdzEEavw';

export default function Map(props) {
  const [map, setMap] = useState(null);
  const [ geography, setGeography ] = useState({value: "county"});
  const [ measurement, setMeasurement ] = useState({value: "ml_download_Mbps"});
  const [ usaState, setUsaState ] = useState({value: "All States"});
  const mapContainer = useRef(null);
  const measureSelect = useRef(null);
  const geoSelect = useRef(null);
  const stateSelector = useRef(null);
  const timeSlider = useRef(null);
  const timePeriodLabel = useRef(null);
  const legend = useRef(null);
  const legendlabel = useRef(null);

  const _updateGeo = event => {
    setGeography({value: event.target.value});
  }

  const _updateMeasurement = event => {
    setMeasurement({value: event.target.value});
  }

  const _updateState = event => {
    setUsaState({value: event.target.value});
  }

  useEffect(() => {
    // Thanks to OTI for much help on planning functionality
    // https://github.com/opentechinstitute/UnitedStatesofBroadband

    const config = {
      time_periods: // time periods, as an array of [internalName, displayName]
        [['dec_2014', 'Jan 1-4, 2020'],
        ['jun_2015', 'Jan 5-11, 2020'],
        ['dec_2015', 'Jan 12-18, 2020'],
        ['jun_2016', 'Jan 19-25, 2020'],
        ['dec_2016', 'Jan 26-Feb 1, 2020'],
        ['jun_2017', 'Feb 2-8, 2020'],
        ['dec_2017', 'Feb 9-15, 2020'],
        ['jun_2018', 'Feb 16-22, 2020'],
        ['dec_2018', 'Feb 23-29, 2020']],
      state_centers: // jump-to-state info, an array of [displayName, [lon, lat, zoom]]
        [
          ["All States", [38.526600, -96.726486, 3]],
          ["Alabama", [32.806671, -86.791130, 6]],
          ["Alaska", [61.370716, -152.404419, 3]],
          ["Arizona", [33.96, -112.93, 5]],
          ["Arkansas", [34.969704, -92.373123, 5]],
          ["California", [37.56, -120.70, 5]],
          ["Colorado", [38.96, -106.95, 5.5]],
          ["Connecticut", [41.597782, -72.755371, 5]],
          ["Delaware", [39.318523, -75.507141, 7]],
          ["District of Columbia", [38.897438, -77.026817, 10]],
          ["Florida", [27.766279, -84.40, 5]],
          ["Georgia", [33.040619, -83.643074, 5]],
          ["Hawaii", [21.094318, -157.498337, 5]],
          ["Idaho", [44.240459, -114.478828, 5]],
          ["Illinois", [40.349457, -88.986137, 5]],
          ["Indiana", [39.849426, -86.258278, 5]],
          ["Iowa", [42.011539, -93.210526, 5]],
          ["Kansas", [38.526600, -96.726486, 5]],
          ["Kentucky", [37.668140, -84.670067, 5]],
          ["Louisiana", [31.169546, -91.867805, 5]],
          ["Maine", [45.33, -69.48, 6]],
          ["Maryland", [39.063946, -76.802101, 5]],
          ["Massachusetts", [42.230171, -71.530106, 5]],
          ["Michigan", [43.326618, -87.40, 5.5]],
          ["Minnesota", [45.694454, -93.900192, 5]],
          ["Mississippi", [32.741646, -89.678696, 6]],
          ["Missouri", [38.456085, -92.288368, 5]],
          ["Montana", [46.921925, -110.454353, 5]],
          ["Nebraska", [41.125370, -98.268082, 5]],
          ["Nevada", [38.313515, -117.055374, 5]],
          ["New Hampshire", [43.452492, -71.563896, 5]],
          ["New Jersey", [40.298904, -74.521011, 5]],
          ["New Mexico", [34.840515, -106.248482, 5]],
          ["New York", [42.165726, -74.948051, 5]],
          ["North Carolina", [35.630066, -79.806419, 5]],
          ["North Dakota", [47.528912, -99.784012, 5]],
          ["Ohio", [40.388783, -82.764915, 5]],
          ["Oklahoma", [35.565342, -96.928917, 5]],
          ["Oregon", [44.572021, -122.070938, 5]],
          ["Pennsylvania", [40.70, -78.78, 6]],
          ["Puerto Rico", [18.155, -66.6963, 7]],
          ["Rhode Island", [41.680893, -71.511780, 7]],
          ["South Carolina", [33.856892, -80.945007, 5]],
          ["South Dakota", [44.299782, -99.438828, 5]],
          ["Tennessee", [35.747845, -86.692345, 5]],
          ["Texas", [31.054487, -101.33, 5]],
          ["Utah", [40.150032, -111.862434, 5]],
          ["Vermont", [44.045876, -72.710686, 5]],
          ["Virginia", [37.769337, -78.169968, 5]],
          ["Washington", [47.400902, -121.490494, 5]],
          ["West Virginia", [38.491226, -80.954453, 5]],
          ["Wisconsin", [44.268543, -89.616508, 5]],
          ["Wyoming", [42.755966, -107.302490], 5]],
      geo_units: // Array of dynamic layer info, [displayName, layerId, layerSrc, internalLayerName]
        [
          ['County', 'county', 'mapbox://newamerica.usbb_county', 'usbb_county'],
          ['Zip Code', 'zcta', 'mapbox://newamerica.usbb_zcta', 'usbb_zcta'],
            ['US Census Tracts', 'census_tracts', 'mapbox://newamerica.usbb_tract', 'usbb_tract'],
          ['State Senate Districts', 'state_senate', 'mapbox://newamerica.usbb_state_senate', 'usbb_state_senate'],
          ['State House Districts', 'state_house', 'mapbox://newamerica.usbb_state_house', 'usbb_state_house'],
        ],
      ramps: // Array of display styling info, {displayName, internalName, mapboxGlStyleFn, stops, popupFn}
        [mkRamp({
          displayName: 'MLab Median Download',
          internalName: 'ml_download_Mbps',
          popupFn: mlabPopupFn,
          mapboxGlStyleFn(timePeriod, stops) {
            return ['case',
                ['has', `ml_download_Mbps_${timePeriod}`],
                ['interpolate', ['linear'], ['get', `ml_download_Mbps_${timePeriod}`], ...stops],
                '#808080'];
          },
          maxTime: 'dec_2018',
          stops: [
            -Infinity, '#2DC4B2',
            0.2, '#2DC4B2',
            4, '#3BB3C3',
            10, '#669EC4',
            25, '#8B88B6',
            50, '#A2719B',
            100, '#AA5E79'
          ]
        }), mkRamp({
          displayName: 'MLab Median Upload',
          internalName: 'ml_upload_Mbps',
          popupFn: mlabPopupFn,
          mapboxGlStyleFn(timePeriod, stops) {
            return ['case',
                ['has', `ml_upload_Mbps_${timePeriod}`],
              ['interpolate', ['linear'], ['get', `ml_upload_Mbps_${timePeriod}`], ...stops],
              '#808080'];
          },
          maxTime: 'dec_2018',
          stops: [
            -Infinity, '#cde5fa',
            0.2, '#acd2e8',
            1, '#8cbfd4',
            3, '#6facbf',
            5, '#5299a9',
            10, '#388692',
            25, '#20737a',
            50, '#0b6061',
            100, '#004d47']
        }), mkRamp({
          displayName: 'MLab Min RTT',
          internalName: 'mlab_min_rtt',
          popupFn: mlabPopupFn,
          mapboxGlStyleFn(timePeriod, stops) {
            return ['case',
                ['has', `ml_min_rtt_${timePeriod}`],
                ['interpolate', ['linear'], ['get', `ml_min_rtt_${timePeriod}`], ...stops],
              '#808080'];
          },
          maxTime: 'dec_2018',
          stops: [0, '#cde5fa',
              5, '#dfa8a9',
              10, '#c78c8c',
              25, '#b07070',
              50, '#995556',
              100, '#803a3c',
              300, '#cde5fa']
        }), mkRamp({
          displayName: 'MLab Download Test Count',
          internalName: 'mlab_dl_count_tests',
          popupFn: mlabPopupFn,
          mapboxGlStyleFn(timePeriod, stops) {
            return ['case',
                ['has', `ml_dl_count_tests_${timePeriod}`],
                ['interpolate', ['linear'], ['get', `ml_dl_count_tests_${timePeriod}`], ...stops],
              '#808080'];
          },
          maxTime: 'dec_2018',
          stops: [100, '#cde5fa',
              500, '#99c7dc',
              1000, '#69a8bb',
              5000, '#3d8997',
              10000, '#176b70',
              25000, '#004d47']
        }), mkRamp({
          displayName: 'MLab Upload Test Count',
          internalName: 'mlab_ul_count_tests',
          popupFn: mlabPopupFn,
          mapboxGlStyleFn(timePeriod, stops) {
            return ['case',
                ['has', `ml_ul_count_tests_${timePeriod}`],
                ['interpolate', ['linear'], ['get', `ml_ul_count_tests_${timePeriod}`], ...stops],
                '#808080'];
          },
          maxTime: 'dec_2018',
          stops: [100, '#cde5fa',
              500, '#99c7dc',
              1000, '#69a8bb',
              5000, '#3d8997',
              10000, '#176b70',
              25000, '#004d47']
        }), mkRamp({
          displayName: 'MLab Unique Download IPs',
          internalName: 'mlab_dl_count_ips',
          popupFn: mlabPopupFn,
          mapboxGlStyleFn(timePeriod, stops) {
            return ['case',
                ['has', `ml_dl_count_ips_${timePeriod}`],
                ['interpolate', ['linear'], ['get', `ml_dl_count_ips_${timePeriod}`], ...stops],
                '#808080'];
          },
          maxTime: 'dec_2018',
          stops: [100, '#cde5fa',
              500, '#99c7dc',
              1000, '#69a8bb',
              5000, '#3d8997',
              10000, '#176b70',
              25000, '#004d47']
        }), mkRamp({
          displayName: 'MLab Unique Upload IPs',
          internalName: 'mlab_ul_count_ips',
          popupFn: mlabPopupFn,
          mapboxGlStyleFn(timePeriod, stops) {
            return ['case',
                ['has', `ml_ul_count_ips_${timePeriod}`],
                ['interpolate', ['linear'], ['get', `ml_ul_count_ips_${timePeriod}`], ...stops],
                '#808080'];
          },
          maxTime: 'dec_2018',
          stops: [100, '#cde5fa',
              500, '#99c7dc',
              1000, '#69a8bb',
              5000, '#3d8997',
              10000, '#176b70',
              25000, '#004d47']
        }), /*mkRamp({
          displayName: 'FCC Unique Provider Count',
          internalName: 'fcc_provider_count',
          popupFn: fccPopupFn,
          mapboxGlStyleFn(timePeriod, stops) {
            return ['case',
                ['has', `fcc_reg_provider_count_${timePeriod}`],
                ['interpolate', ['linear'], ['get', `fcc_reg_provider_count_${timePeriod}`], ...stops],
                '#808080'];
          },
          maxTime: 'dec_2017',
          stops: [0, '#fff',
              1, '#EED322',
              5, '#E6B71E',
              10, '#B86B25',
              25, '#8B4225',
              50, '#723122']
        }),*/ mkRamp({
          displayName: 'FCC Advertised Download Speed',
          internalName: 'fcc_advertised_dl',
          popupFn: fccPopupFn,
          mapboxGlStyleFn(timePeriod, stops) {
            return ['case',
                ['has', `fcc_advertised_down_${timePeriod}`],
                ['interpolate', ['linear'], ['get', `fcc_advertised_down_${timePeriod}`], ...stops],
                '#808080'];
          },
          maxTime: 'dec_2017',
          stops: [
          -Infinity, '#cde5fa',
            0.2, '#cde5fa',
            4, '#78b2c6',
            10, '#5299a9',
            25, '#307f8a',
            50, '#12666a',
            100, '#004d47']
        }), mkRamp({
          displayName: 'FCC Advertised Upload Speed',
          internalName: 'fcc_advertised_ul',
          popupFn: fccPopupFn,
          mapboxGlStyleFn(timePeriod, stops) {
            return ['case',
                ['has', `fcc_advertised_up_${timePeriod}`],
                ['interpolate', ['linear'], ['get', `fcc_advertised_up_${timePeriod}`], ...stops],
                '#808080'];
          },
          maxTime: 'dec_2017',
          stops: [
            -Infinity, '#cde5fa',
            0.2, '#cde5fa',
            4, '#78b2c6',
            10, '#5299a9',
            25, '#307f8a',
            50, '#12666a',
            100, '#004d47']
        }), mkRamp({
          displayName: 'Download Comparison (FCC - MLab)',
          internalName: 'mlab_fcc_dl_comp',
          popupFn: diffPopupFn,
          mapboxGlStyleFn(timePeriod, stops) {
            return ['case',
                ['all', ['has', `fcc_advertised_down_${timePeriod}`], ['has', `ml_download_Mbps_${timePeriod}`]],
                ['interpolate',['linear'],
              ['-', ['get', `fcc_advertised_down_${timePeriod}`], ['get', `ml_download_Mbps_${timePeriod}`]],
              ...stops],'#808080'];
          },
          maxTime: 'dec_2017',
          stops: [
            -Infinity, '#690408',
            -25, '#96352d',
            -15, '#be6256',
            -10, '#e09287',
            -5, '#f7c7bf',
            -1, '#ffffff',
            1, '#d2cdf2',
            5, '#a39fdc',
            10, '#7374be',
            15, '#434d9b',
            25, '#002a74'
          ]
        }), mkRamp({
          displayName: 'Upload Comparison (FCC - MLab)',
          internalName: 'mlab_fcc_ul_comp',
          popupFn: diffPopupFn,
          mapboxGlStyleFn(timePeriod, stops) {
            return ['case',
                ['all', ['has', `fcc_advertised_down_${timePeriod}`], ['has', `ml_download_Mbps_${timePeriod}`]],
                ['interpolate',['linear'],
              ['-', ['get', `fcc_advertised_up_${timePeriod}`], ['get', `ml_upload_Mbps_${timePeriod}`]], ...stops], '#808080'];
          },
          maxTime: 'dec_2017',
          stops: [
            -Infinity, '#690408',
            -25, '#96352d',
            -15, '#be6256',
            -10, '#e09287',
            -5, '#f7c7bf',
            -1, '#ffffff',
            1, '#d2cdf2',
            5, '#a39fdc',
            10, '#7374be',
            15, '#434d9b',
            25, '#002a74'
          ]
        })
        ]
    };

    function mkRamp({
      displayName, internalName, popupFn, mapboxGlStyleFn, stops, maxTime
    }) {
      const styleFn = mapboxGlStyleFn;
      return {
        displayName, internalName, popupFn, stops, maxTime, mapboxGlStyleFn(timePeriod) {
          return styleFn(timePeriod, stops);
        }
      };
    }

    // The function that will be called when the user clicks on the map.  The feature under the mouse is passed in.
    var popupFn;

  	function mlabPopupFn(props) {
  		function rate(key) {
  			if (key in props) {
  				return `${props[key].toFixed(2)} Mbps`;
  			} else {
  				return '[No results]';
  			}
  		}
  		const rows = [
  			["Jan 1-4, 2020", "ml_download_Mbps_dec_2014", "ml_upload_Mbps_dec_2014"],
  			["Jan 5-11, 2020", "ml_download_Mbps_jun_2015", "ml_upload_Mbps_jun_2015"],
  			["Jan 12-18", "ml_download_Mbps_dec_2015", "ml_upload_Mbps_dec_2015"],
  			["Jan 19-25, 2020", "ml_download_Mbps_jun_2016", "ml_upload_Mbps_jun_2016"],
  			["Jan 26-Feb 1, 2020", "ml_download_Mbps_dec_2016", "ml_upload_Mbps_dec_2016"],
  			["Feb 2-8, 2020", "ml_download_Mbps_jun_2017", "ml_upload_Mbps_jun_2017"],
  			["Feb 9-15, 2020", "ml_download_Mbps_dec_2017", "ml_upload_Mbps_dec_2017"],
  			["Feb 16-22, 2020", "ml_download_Mbps_jun_2018", "ml_upload_Mbps_jun_2018"],
  			["Feb 23-29, 2020", "ml_download_Mbps_dec_2018", "ml_upload_Mbps_dec_2018"],
  		];
  		const formatRow = ([time, dl_key, ul_key]) =>
  			`<div class="report-date">${time}</div><div class="report-value">${rate(dl_key)}</div>` +
  			`<div class="report-value">${rate(ul_key)}</div>`;

  		var dataset = measureSelect.current.options[measureSelect.current.selectedIndex].parentNode.id;

  		return ('<h2>' + (props['county_name'] || props['tract_name'] || props['name']) + '</h2>' +
  			'<em>Source:' + dataset + '</em>' +
  			'<div class="report">' +
  			'<div></div><div class="report-header">↓</div><div class="report-header">↑</div>' +
  			rows.map(formatRow).join('\n') +
  			'</div>'
  		);
  	}

    function fccPopupFn(props) {
      function rate(key) {
        if (key in props) {
          return `${props[key].toFixed(2)} Mbps`;
        } else {
          return '[No results]';
        }
      }
      const rows = [
        ["Jan 1-4, 2020", "fcc_advertised_down_dec_2014", "fcc_advertised_up_dec_2014"],
        ["Jan 5-11, 2020", "fcc_advertised_down_jun_2015", "fcc_advertised_up_jun_2015"],
        ["Jan 12-18", "fcc_advertised_down_dec_2015", "fcc_advertised_up_dec_2015"],
        ["Jan 19-25, 2020", "fcc_advertised_down_jun_2016", "fcc_advertised_up_jun_2016"],
        ["Jan 26-Feb 1, 2020", "fcc_advertised_down_dec_2016", "fcc_advertised_up_dec_2016"],
        ["Feb 2-8, 2020", "fcc_advertised_down_jun_2017", "fcc_advertised_up_jun_2017"],
      ];
      const formatRow = ([time, dl_key, ul_key]) =>
        `<div class="report-date">${time}</div><div class="report-value">${rate(dl_key)}</div>` +
        `<div class="report-value">${rate(ul_key)}</div>`;

      var dataset = measureSelect.current.options[measureSelect.current.selectedIndex].parentNode.id;

      return ('<h2>' + (props['county_name'] || props['tract_name'] || props['name'] || props['NAME']) + '</h2>' +
        '<em>Source:' + dataset + '</em>' +
        '<div class="report">' +
        '<div></div><div class="report-header">↓</div><div class="report-header">↑</div>' +
        rows.map(formatRow).join('\n') +
        '</div>'
      );
    }

    function diffPopupFn(props){
      function rate(key1,key2) {
        if (key1 in props && key2 in props) {
          let diff = props[key1]-props[key2];
          return `${diff.toFixed(2)} Mbps`;
        } else {
          return '[No results]';
        }
      }
      const rows = [
        ["Jan 1-4, 2020", "fcc_advertised_down_dec_2014", "ml_download_Mbps_dec_2014", "fcc_advertised_up_dec_2014", "ml_upload_Mbps_dec_2014"],
        ["Jan 5-11, 2020", "fcc_advertised_down_jun_2015", "ml_download_Mbps_jun_2015", "fcc_advertised_up_jun_2015", "ml_upload_Mbps_jun_2015"],
        ["Jan 12-18", "fcc_advertised_down_dec_2015", "ml_download_Mbps_dec_2015", "fcc_advertised_up_dec_2015", "ml_upload_Mbps_dec_2015"],
        ["Jan 19-25, 2020", "fcc_advertised_down_jun_2016", "ml_download_Mbps_jun_2016", "fcc_advertised_up_jun_2016", "ml_upload_Mbps_jun_2016"],
        ["Jan 26-Feb 1, 2020", "fcc_advertised_down_dec_2016", "ml_download_Mbps_dec_2016", "fcc_advertised_up_dec_2016", "ml_upload_Mbps_dec_2016"],
        ["Feb 2-8, 2020", "fcc_advertised_down_jun_2017", "ml_download_Mbps_jun_2017", "fcc_advertised_up_jun_2017", "ml_upload_Mbps_jun_2017"]
      ];
      const formatRow = ([time, dl_key_fcc, dl_key_mlab, ul_key_fcc, ul_key_mlab]) =>
        `<div class="report-date">${time}</div><div class="report-value">${rate(dl_key_fcc,dl_key_mlab)}</div>` +
        `<div class="report-value">${rate(ul_key_fcc,ul_key_mlab)}</div>`;

      var dataset = measureSelect.current.options[measureSelect.current.selectedIndex].parentNode.id;

      return ('<h2>' + (props['county_name'] || props['tract_name'] || props['name'] || props['NAME']) + '</h2>' +
        '<em>Source:' + dataset + '</em>' +
        '<div class="report">' +
        '<div></div><div class="report-header">Download Difference</div><div class="report-header">Upload Difference</div>' +
        rows.map(formatRow).join('\n') +
        '</div>'
      );
    }

    const initializeMap = ({ setMap, mapContainer }) => {
      // Encode the map state into the fragment for linkability.
      function updateFragment() {
        const timeperiod = config.time_periods[timeSlider.current.value][0];
        const { lng: x, lat: y } = map.getCenter();
        const z = map.getZoom();
        const url = new URL(window.location);
        url.hash = `#${geoSelect.current.value}/${timeperiod}/${measureSelect.current.value}/${x.toFixed(2)}/${y.toFixed(2)}/${z.toFixed(2)}`;
        window.history.replaceState(undefined, 'USBB', url.toString());
      }

      function configureMap() {

        const ramp = config.ramps.find((ramp) => ramp.internalName == measureSelect.current.value);

        // Apply time constraint and clamp value.
        const maxTimeIndex = config.time_periods.findIndex((period) => period[0] == ramp.maxTime);
        console.log(ramp.maxTime, maxTimeIndex, config.time_periods.length);
        timeSlider.current.max = maxTimeIndex == -1 ? config.time_periods.length - 1 : maxTimeIndex;
        timeSlider.current.value = Math.min(timeSlider.current.max, timeSlider.current.value);

        const timePeriod = config.time_periods[timeSlider.current.value];

        const style = ramp.mapboxGlStyleFn(timePeriod[0]);

          // Apply layer visibility and style.
        for (const layer of config.geo_units) {
          map.setLayoutProperty(layer[1], 'visibility', layer[1] == geoSelect.current.value ? 'visible' : 'none');
          map.setPaintProperty(layer[1], 'fill-color', style);
        }
        // Update popup template.
        popupFn = ramp.popupFn;
        // Update legend.
        const breaks = ramp.stops;
        const cssRamp = breaks.filter((_, idx) => idx % 2).join(',');
        legend.current.style.background =
          `linear-gradient(to right, ${cssRamp})`;
        const cssLabels = breaks.filter((_, idx) => !(idx % 2)).filter(b => Number.isFinite(b));
        legendlabel.current.innerHTML =
          cssLabels.map((l) => `<div class="label">${l}</div>`).join('');

        // Update time period label.
        timePeriodLabel.current.innerText = timePeriod[1];

        // Update fragment.
        updateFragment();
      }

      const map = new mapboxgl.Map({
        bounds: new mapboxgl.LngLatBounds(
      		new mapboxgl.LngLat(-64.13512973018138, 55.068543614519314),
      		new mapboxgl.LngLat(-148.30882882584655, 18.958132980357163)
      	),
        center: [34, 5],
        container: mapContainer.current,
        style: 'mapbox://styles/rgaines/ck3umm5lo10451cnyh5sixye6',
        zoom: 2
      });

      map.on("load", () => {
        setMap(map);
        map.resize();

        for (const [_, id, url, sourceLayer] of config.geo_units) {
    			map.addLayer({
    				id,
    				type: "fill",
    				source: { url, type: "vector" },
    				"source-layer": sourceLayer,
    				layout: { visibility: 'none' },
    				paint: {
    					'fill-opacity': 0.7
    				}
    			})

    			// Change the cursor to a pointer when the mouse is over the states layer.
    			map.on('mouseenter', id, () => {
    				map.getCanvas().style.cursor = 'pointer';
    			});

    			// Change it back to a pointer when it leaves.
    			map.on('mouseleave', id, () => {
    				map.getCanvas().style.cursor = '';
    			});
    		}

        map.addLayer({
          "id": "us_states",
          "type": "line",
          "source": {
            type: 'vector',
            url: 'mapbox://newamerica.cjvopv39u05jt2wmna9mg5wz4-7j8om'
          },
          "layout": {
            'visibility': 'visible'
          },
          "source-layer": "us_states",
          "paint": {
            "line-color": "#000",
            "line-width": 0.5
          }
        });

        let popup = new mapboxgl.Popup({className: "popup-box"});

        const layers = config.geo_units.map((g) => g[1]);
        map.on('click', (e) => {
          let f = map.queryRenderedFeatures(e.point, {layers});
          if (f.length) {
          console.log(f[0]);
          popup.setLngLat(e.lngLat)
            .setHTML(popupFn(f[0].properties))
            .addTo(map);
          }
        });

        // Read settings from URL, if any.
    		// :geo/:timeperiod/:measure/:x/:y/:z
    		let fragment = window.location.hash;
    		if (fragment) {
    			const check = (v, test) => test(v) ? v : undefined;

    			const parts = fragment.slice(1).split("/");
    			const geo = check(parts[0], (v) => config.geo_units.some((u) => u[1] == v));
    			const timeperiod = check(parts[1], (v) => config.time_periods.some((x) => x[0] == v));
    			const measure = check(parts[2], (v) => config.ramps.some((r) => r.internalName == v));
    			const x = check(Number(parts[3]), (v) => !Number.isNaN(v));
    			const y = check(Number(parts[4]), (v) => !Number.isNaN(v));
    			const z = check(Number(parts[5]), (v) => !Number.isNaN(v));

    			if (geo) {
            geography.selected = true;
    			}
    			if (timeperiod !== undefined) {
    				const idx = config.time_periods.findIndex((x) => x[0] == timeperiod);
    				if (idx >= 0) {
    					timeSlider.current.value = idx
    				};
    			}
    			if (measure) {
            measurement.selected = true;
    			}
    			if ([x, y, z].every(n => n !== undefined)) {
    				map.jumpTo({ center: [x, y], zoom: z });
    			}
    		}
    		// Run the color ramp to start
        for (const {displayName,internalName} of config.ramps) {
          const opt = document.createElement('option')
          opt.value = internalName;
          opt.innerText = displayName;
          measureSelect.current.appendChild(opt);
        }

        for (const [displayName, layerId, src, srcLyr] of config.geo_units) {
      		const opt = document.createElement('option');
      		opt.value = layerId;
      		opt.innerText = displayName;
      		geoSelect.current.appendChild(opt);
      	}

        timeSlider.current.min = 0;
      	timeSlider.current.max = config.time_periods.length - 1;
      	timeSlider.current.step = 1;

        for (const [displayName, mapCoordinates] of config.state_centers) {
      		const opt = document.createElement('option');
      		opt.value = displayName;
      		opt.innerText = displayName;
      		stateSelector.current.appendChild(opt);
      	}

        [measureSelect, geoSelect, timeSlider].forEach((el) => el.current.addEventListener('input', () => {
      		configureMap();
      	}))

        stateSelector.current.addEventListener('input', (el) => {
          const state = config.state_centers.find((row) => row[0] == stateSelector.current.value);
          const state_geo = map.querySourceFeatures('us_states', {
            source_layer: 'us_states',
            filter: ['in', 'STATE', usaState]});
          if (state) {
            const [ lat, lon, zoom ] = state[1];
            map.flyTo({
              center: { lon, lat },
              zoom
            });
          }
        });

    		configureMap();

    		map.on('moveend', updateFragment);
      });
    };

    if (!map) {
      initializeMap({ setMap, mapContainer })
    };
  }, [map]);

  return (
    <div>
      <div className="maps">
        <div className="map-container">
          <div ref={el => (mapContainer.current = el)} className="map map-mlab" />
          <div className='map-overlay top'>
          	<div className='map-overlay-inner'>
          		<h2>Piecewise</h2>
          		<label htmlFor="measurement">Data <abbr title="Choose the measurement to show on the map.">?</abbr></label>
          		<select id="measurement" name="measurement" ref={measureSelect} onChange={_updateMeasurement} defaultValue={measurement.value} className='mb-2'>
          		</select>
          		<div style={{width:'100%'}}>
          		<details>
          			<summary>Sources & Data Notes:</summary>
          				Cum ceteris in veneratione tui montes, nascetur mus. Morbi fringilla convallis sapien, id pulvinar odio volutpat. Tityre, tu patulae recubans sub tegmine fagi dolor. Ambitioni dedisse scripsisse iudicaretur.
          		</details>
          		</div>
          		<label htmlFor="geo">Area <abbr title="Choose the detail level of the places on the map.">?</abbr></label>
          		<select id="geo" name="geo" ref={geoSelect} onChange={_updateGeo} defaultValue={geography.value} className='mb-2'>
          		</select>
          		<label htmlFor="slider">Time Period <abbr title="Choose the time period to show on the map.">?</abbr></label>
          		<label id='time_period' ref={timePeriodLabel}></label>
          		<input id='slider' type='range' ref={timeSlider} className="mb-2" />
          		<label htmlFor="state_select">Zoom to State <abbr title="Center the map on a specific state.">?</abbr></label>
          		<select id="state_select" name="state_select" ref={stateSelector} onChange={_updateState} defaultValue={usaState.value}>
          		</select>

          		<div className='session'>
          		  <h3>Legend</h3>
          		  <div id='legend' className='row colors' ref={legend}>
          		  </div>
          		  <div id="legendlabel" className='row labels' ref={legendlabel}>
          		    <div className='label'>0</div>
          		    <div className='label'>0</div>
          		    <div className='label'>0</div>
          		    <div className='label'>0</div>
          		    <div className='label'>0</div>
          		    <div className='label'>0</div>
          		  </div>
          		  <div id='noresultlegend' className='noresultrow'>
          		  </div>
          		  <div id="noresultlabel" className='row labels'>
          			  <div className='label label-no-results'>No tests available in time period</div>
          		  </div>
          		</div>
          	</div>
          </div>
        </div>
      </div>
    </div>
  )
}
