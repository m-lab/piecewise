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
import ndt7 from '../../assets/js/ndt7.js';

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
      setText(msg);
      setResults({
        MinRTT: percent.MinRTT,
        c2sRate: percent.c2sRate,
        s2cRate: percent.s2cRate,
      });
      return;
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
          document
            .getElementsByClassName('loader')[0]
            .append(`Error: ${xhr.responseText}`);
          console.log('Location lookup failed');
        }
      }
    };
  };

  useEffect(() => {

    if (locationConsent) {
      if (window.isSecureContext && 'geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(success, error);
      } else {
        alert(
          'Location lookup failed: The browser is not secure or the geolocator was not found.',
        );
      }
    }

    const meter = new NdtHandler(onProgress);

    // Load ndt7 download/upload workers as Blobs.
    ndt7.test(
      {
        userAcceptedDataPolicy: true,
        downloadworkerfile: '/static/js/ndt7-download-worker.js',
        uploadworkerfile: '/static/js/ndt7-upload-worker.js',
      },
      {
        serverChosen: function(server) {
          console.log('Testing to:', {
            machine: server.machine,
            locations: server.location,
          });
        },
        downloadComplete: function(data) {
          // (bytes/second) * (bits/byte) / (megabits/bit) = Mbps
          const serverBw = data.LastServerMeasurement.BBRInfo.BW * 8 / 1000000;
          const clientGoodput = data.LastClientMeasurement.MeanClientMbps;
          console.log(
              `Download test is complete:
      Instantaneous server bottleneck bandwidth estimate: ${serverBw} Mbps
      Mean client goodput: ${clientGoodput} Mbps`);
        },
        uploadComplete: function(data) {
          // TODO: used actual upload duration for rate calculation.
          // bytes * (bits/byte() * (megabits/bit) * (1/seconds) = Mbps
          const serverBw =
              data.LastServerMeasurement.TCPInfo.BytesReceived * 8 / 1000000 / 10;
          const clientGoodput = data.LastClientMeasurement.MeanClientMbps;
          console.log(
              `Upload test is complete:
      Mean server throughput: ${serverBw} Mbps
      Mean client goodput: ${clientGoodput} Mbps`);
        },
      },
    );
  }, []);

  useEffect(() => {
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
  locationConsent: PropTypes.bool,
};
