import React from 'react';
import PropTypes from 'prop-types';

// Bootstrap imports
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';

export default function ThankYou(props) {
  const results = props.location.state.results;
  const settings = props.location.state.settings;

  return (
    <>
      <style type="text/css">
        {`
      .thankyou-header {
        color: {{ settings.color_one }};
      }
      `}
      </style>
      <Container fluid="sm">
        <Row>
          <Col md={{ span: 8, offset: 2 }}>
            <Row className="align-items-center">
              <Col>
                <h1 className="thankyou-header">Thank you!</h1>
              </Col>
              <Col>
                <Row>
                  <strong>Download Speed:</strong>{' '}
                  {(results.s2cRate / 1000).toFixed(2)} Mb/s
                </Row>
                <Row>
                  <strong>Upload Speed:</strong>{' '}
                  {(results.c2sRate / 1000).toFixed(2)} Mb/s
                </Row>
                <Row>
                  <strong>Latency:</strong> {results.MinRTT} ms
                </Row>
              </Col>
            </Row>
            <Row>
              <p>{settings.footer}</p>
            </Row>
          </Col>
        </Row>
      </Container>
    </>
  );
}

ThankYou.propTypes = {
  results: PropTypes.object.required,
  settings: PropTypes.object.required,
  location: PropTypes.shape({
    state: PropTypes.shape({
      results: PropTypes.object,
      settings: PropTypes.object,
    }).required,
  }).required,
};
