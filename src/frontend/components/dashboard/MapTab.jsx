// base imports
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import _ from 'lodash/core';

// Bootstrap imports
import Alert from 'react-bootstrap/Alert';
import Container from 'react-bootstrap/Container';

// custom styles
import './MapTab.css';

const url = 'https://ilsr-nc.measuringbroadband.org/api/v1/submissions';

const containerStyles = {
  // height: '600px',
  // width: '600px',
};

const mapStyles = {
  bottom: '0',
  left: '0',
  height: '70vh',
  inset: '90% 0px 0px',
  marginLeft: 'auto',
  marginRight: 'auto',
  position: 'absolute',
  right: '0',
  top: '90%',
  width: '93%',
};

// const bounds = [
//   [-167, 16], // Southwest coordinates
//   [-46, 72], // Northeast coordinates
// ];

export default function MapTab() {
  const [map, setMap] = useState(null);
  const mapContainer = useRef(null);
  const [geojson, setGeojson] = useState(null);

  // process api errors
  const processError = errorMessage => {
    let text = `We're sorry your, request didn't go through. Please send the message below to the support team and we'll try to fix things as soon as we can.`;
    let debug = JSON.stringify(errorMessage);
    return [text, debug];
  };

  // fetch data from api
  const getjson = () => {
    let status;
    return fetch('/api/v1/submissions', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': url,
      },
    })
      .then(response => {
        status = response.status;
        return response.json();
      })
      .then(result => {
        if (status === 200 || status === 201) {
          if (!_.isEmpty(result.data)) {
            setGeojson(result.data);
          }
          return result.data;
        } else {
          const error = processError(result);
          throw new Error(`Error in response from server: ${error}`);
        }
      })
      .catch(error => {
        throw Error(error.statusText);
      });
  };

  useEffect(() => {
    if (!geojson) {
      getjson()
        .then(data => {
          if (!_.isEmpty(data)) {
            const allPoints = data.map(point => ({
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [[point.longitude, point.latitude]],
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
              },
            }));

            setGeojson({
              type: 'FeatureCollection',
              features: allPoints,
            });
          }
          return;
        })
        .catch(error => {
          throw Error(error.statusText);
        });
    }

    mapboxgl.accessToken = process.env.PIECEWISE_MAPBOX_KEY;
    const initializeMap = ({ setMap, mapContainer }) => {
      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/rgaines/ck3umm5lo10451cnyh5sixye6', // stylesheet location
        // maxBounds: bounds,
        center: [-77.0364, 38.8951],
        zoom: 5,
      });

      map.on('load', () => {
        setMap(map);
        map.resize();

        if (geojson && geojson.features) {
          map.addSource('points', {
            type: 'geojson',
            data: geojson,
          });

          map.addLayer({
            id: 'points',
            type: 'circle',
            source: 'points',
            paint: {
              'circle-radius': 10,
              'circle-color': '#ff442b',
              'circle-opacity': 0.6,
            },
          });

          geojson.features.forEach(function(marker) {
            // create a HTML element for each feature
            var el = document.createElement('div');
            el.className = 'marker';

            // make a marker for each feature and add to the map
            new mapboxgl.Marker(el)
              .setLngLat(marker.geometry.coordinates.flat())
              .setPopup(
                new mapboxgl.Popup({ offset: 25 }) // add popups
                  .setHTML(
                    '<h3>ISP User: ' +
                      (marker.properties.isp_user
                        ? marker.properties.isp_user
                        : 'Unknown') +
                      '</h3><p>Other ISP: ' +
                      (marker.properties.other_isp
                        ? marker.properties.other_isp
                        : 'Unknown') +
                      '</p><p>Connection Type: ' +
                      (marker.properties.connection_type
                        ? marker.properties.connection_type
                        : 'Unknown') +
                      '</p><p>Cost of service: ' +
                      (marker.properties.cost_of_service
                        ? marker.properties.cost_of_service
                        : 'Unknown') +
                      '</p><p>Advertised download speed: ' +
                      (marker.properties.advertised_download
                        ? marker.properties.advertised_download
                        : 'Unknown') +
                      '</p><p>Advertised Upload Speed: ' +
                      (marker.properties.advertised_upload
                        ? marker.properties.advertised_upload
                        : 'Unknown') +
                      '</p><p>Actual Download Speed: ' +
                      (marker.properties.actual_download
                        ? marker.properties.actual_download
                        : 'Unknown') +
                      '</p><p>Actual Upload Speed: ' +
                      (marker.properties.actual_upload
                        ? marker.properties.actual_upload
                        : 'Unknown') +
                      '</p><p>Minimum Round Trip Time: ' +
                      (marker.properties.min_rtt
                        ? marker.properties.min_rtt
                        : 'Unknown') +
                      '</p><p>Latitute: ' +
                      (marker.properties.latitute
                        ? marker.properties.latitute
                        : 'Unknown') +
                      '</p><p>Longitude: ' +
                      (marker.properties.longitude
                        ? marker.properties.longitude
                        : 'Unknown') +
                      '</p>',
                  ),
              )
              .addTo(map);
          });

          // Change the cursor to a pointer when the mouse is over the places layer.
          map.on('mouseenter', 'points', function() {
            map.getCanvas().style.cursor = 'pointer';
          });

          // Change it back to a pointer when it leaves.
          map.on('mouseleave', 'points', function() {
            map.getCanvas().style.cursor = '';
          });
        }
      });
    };

    if (geojson && !map) initializeMap({ setMap, mapContainer });
  }, [geojson, map]);

  return (
    <Container className={'mt-4 mb-4'} style={containerStyles}>
      <Alert variant="secondary">
        <p className="mb-0">
          <em>See mapped out data from completed tests.</em>
        </p>
      </Alert>
      <div ref={el => (mapContainer.current = el)} style={mapStyles} />
    </Container>
  );
}
