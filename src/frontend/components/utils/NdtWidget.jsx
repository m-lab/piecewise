// base imports
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash/core';

// Bootstrap imports
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Spinner from 'react-bootstrap/Spinner';

// module imports
import NDTjs from '../../assets/js/ndt-browser-client.js';

const NDT_STATUS_LABELS = {
  preparing_s2c: 'Preparing download',
  preparing_c2s: 'Preparing upload',
  running_s2c: 'Measuring download speed',
  running_c2s: 'Measuring upload speed',
  finished_s2c: 'Finished download',
  finished_c2s: 'Finished upload',
  preparing_meta: 'Preparing metadata',
  running_meta: 'Sending metadata',
  finished_meta: 'Finished metadata',
  finished_all: 'Test complete',
};

class NdtHandler {
  constructor(callback) {
    this.cb = callback;
    this.state = undefined;
    this.time_switched = undefined;
  }

  event(msg, info) {
    console.debug(`EVENT: msg: ${msg}, info: ${info}`);
    this.cb(msg, info);
  }

  onstart() {
    this.event('Connecting...');
  }

  onstatechange(msg) {
    this.state = msg;
    this.time_switched = new Date().getTime();
    this.event(`${NDT_STATUS_LABELS[msg]}...`);
  }

  onprogress() {
    let progress_percentage;
    const time_in_progress = new Date().getTime() - this.time_switched;

    if (this.state === 'running_s2c' || this.state === 'running_c2s') {
      progress_percentage =
        time_in_progress < 10000 ? time_in_progress / 10000 : 1;
      const progress_label = NDT_STATUS_LABELS[this.state];
      this.event(progress_label, (progress_percentage * 100).toFixed(0));
    }
  }

  onfinish(results) {
    this.event(`${NDT_STATUS_LABELS[this.state]}`, results);
  }

  onerror(msg) {
    this.event(`Error: ${NDT_STATUS_LABELS[msg]}!`);
  }
}

function runNdt({
  server,
  port = '3010',
  protocol = 'wss',
  path = '/ndt_protocol',
  meter,
  updateInterval = 1000,
}) {
  const NDT_client = new NDTjs(
    server,
    port,
    protocol,
    path,
    meter,
    updateInterval,
  );

  console.log('server: ', server);
  NDT_client.startTest();
}

export default function NdtWidget(props) {
  // handle NDT test
  const { onFinish, locationConsent } = props;
  const [text, setText] = useState(null);
  const [progress, setProgress] = useState(null);
  const [location, setLocation] = useState({});
  const [results, setResults] = useState({});

  const onProgress = (msg, percent) => {
    if (msg === 'Test complete') {
      setResults({
        MinRTT: percent.MinRTT,
        c2sRate: percent.c2sRate,
        s2cRate: percent.s2cRate,
      });
    }
    if (msg) setText(msg);
    if (percent) setProgress(percent);
  };

  // check location consent
  const error = error => {
    document
      .getElementsByClassName('loader')[0]
      .append(`Error: ${error.code}: ${error.message}`);
  };

  const success = position => {
    document.getElementById('latitude').value = position.coords.latitude;
    document.getElementById('longitude').value = position.coords.longitude;

    setLocation({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    });

    var xhr = new XMLHttpRequest(),
      currentLocationURL =
        'https://nominatim.openstreetmap.org/reverse?format=json&lat=' +
        position.coords.latitude +
        '&lon=' +
        position.coords.longitude +
        '&zoom=18&addressdetails=1';

    var currentLoc;
    xhr.open('GET', currentLocationURL, true);
    xhr.send();
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          currentLoc = JSON.parse(xhr.responseText);
          console.log('Location received');
          document
            .getElementsByClassName('loader')[0]
            .append(
              'Searching from: ' +
                currentLoc.address.road +
                ', ' +
                currentLoc.address.city +
                ', ' +
                currentLoc.address.state,
            );
        } else {
          console.log('Location lookup failed');
        }
      }
    };
  };

  useEffect(() => {
    let mlabNsUrl;
    if (process.env.NODE_ENV === 'production') {
      console.info('In production mode, querying MLab NS.');
      mlabNsUrl = 'https://mlab-ns.appspot.com/ndt_ssl?format=json';
    } else {
      console.info(
        'In development mode, proxying MLab NS request for CORS reasons.',
      );
      mlabNsUrl = '/api/v1/mlabns';
    }

    if (locationConsent) {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(success, error);
      }
    }

    fetch(mlabNsUrl)
      .then(res => {
        console.debug('Raw response: ', res);
        if (res.status === 200) {
          return res.json();
        } else {
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }
      })
      .then(data => {
        console.debug('Received response from MLab NS: ', data);
        const meter = new NdtHandler(onProgress);
        runNdt({ server: data.fqdn, meter: meter });
        return data;
      })
      .catch(err => {
        console.error('M-Lab NS lookup failed: ', err.message);
        window.alert('M-Lab NS lookup failed. Please refresh the page.');
      });

    if (!_.isEmpty(results)) {
      onFinish(true, results, location);
    }
  }, [results]);

  return (
    <Container className={'loader'}>
      <Row>
        <Col xs="auto">
          <Spinner animation="border" />
        </Col>
        <Col>{progress || 0}%</Col>
      </Row>
      <Row>
        <Col>{text}</Col>
      </Row>
    </Container>
  );
}

NdtWidget.propTypes = {
  onFinish: PropTypes.func.isRequired,
};
