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

export default function NdtWidget(props) {
  // handle NDT test
  const { onFinish, locationConsent } = props;
  const [text, setText] = useState(null);
  const [progress, setProgress] = useState(null);
  const [location, setLocation] = useState({});
  const [results, setResults] = useState({});

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

    const TIME_EXPECTED = 10;
    let minRTT, c2sRateKbps, s2cRateKbps;

    ndt7.test(
      {
        userAcceptedDataPolicy: true,
        downloadworkerfile: '/static/js/ndt7-download-worker.js',
        uploadworkerfile: '/static/js/ndt7-upload-worker.js',
      },
      {
        serverChosen: (server) => {
          console.log('Testing to:', {
            machine: server.machine,
            locations: server.location,
          });
        },
        downloadMeasurement: (data) => {
          if (data.Source === 'client') {
            setProgress((data.Data.ElapsedTime / TIME_EXPECTED * 100).toFixed(2));
            setText("Measuring download speed... " + data.Data.MeanClientMbps.toFixed(2) + " Mb/s");
          }
        },
        downloadComplete: function(data) {
          setProgress(100);
          setText("Download test complete");
          s2cRateKbps = data.LastClientMeasurement.MeanClientMbps * 1000;
          minRTT = (data.LastServerMeasurement.TCPInfo.MinRTT / 1000);
          // (bytes/second) * (bits/byte) / (megabits/bit) = Mbps
          const serverBw = data.LastServerMeasurement.BBRInfo.BW * 8 / 1000000;
          const clientGoodput = data.LastClientMeasurement.MeanClientMbps;
          console.log(
              `Download test is complete:
      Instantaneous server bottleneck bandwidth estimate: ${serverBw} Mbps
      Mean client goodput: ${clientGoodput} Mbps`);
        },
        uploadMeasurement: (data) => {
          if (data.Source === 'client') {
            setProgress((data.Data.ElapsedTime / TIME_EXPECTED * 100).toFixed(2));
            setText("Measuring upload speed... " + data.Data.MeanClientMbps.toFixed(2) + " Mb/s");
          }
        },
        uploadComplete: (data) => {
          setProgress(100);
          setText("Upload test complete");
          c2sRateKbps = data.LastClientMeasurement.MeanClientMbps * 1000;
          // bytes * (bits/byte() * (megabits/bit) * (1/seconds) = Mbps
          const serverBw =
              data.LastServerMeasurement.TCPInfo.BytesReceived * 8 / 1000000 / 10;
          console.log(
              `Upload test is complete:
      Mean server throughput: ${serverBw} Mbps
      Mean client goodput: ${c2sRateKbps} Mbps`);
        },
      },
    ).then((exitcode) => {
      if (exitcode != 0) {
        setText("There was an error during the test. Please try again later.");
        return;
      }

      setText("Test complete");
      setResults({
        MinRTT: minRTT,
        c2sRate: c2sRateKbps,
        s2cRate: s2cRateKbps,
      })

      return;
    }).catch(() => {
      setText("There was an error during the test. Please try again later.");
      return;
    });
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
