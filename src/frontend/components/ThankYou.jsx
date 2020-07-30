// base imports
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { css } from 'glamor';
import parse from 'html-react-parser';

// Bootstrap imports
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';

export default function ThankYou(props) {
  const results = props.location.state.results;
  const settings = props.location.state.settings;

  // style rules
  let h1 = css({
    color: settings.color_one,
  });

  useEffect(() => {
    document.title = `${settings.title} | Thank You`;
  }, []);

  return (
    <Container fluid="sm" className={'mt-4 mb-4'}>
      <Row className={'mb-4'}>
        <Col md={{ span: 6 }}>
          <h1 {...h1} className="thankyou-header">
            Thank you!
          </h1>
        </Col>
      </Row>
      <Row className={'mb-4'}>
        <Col md={{ span: 6 }}>
          <div>
            <strong>Download Speed:</strong>{' '}
            {(results.s2cRate / 1000).toFixed(2)} Mb/s
          </div>
          <div>
            <strong>Upload Speed:</strong> {(results.c2sRate / 1000).toFixed(2)}{' '}
            Mb/s
          </div>
          <div>
            <strong>Latency:</strong> {results.MinRTT} ms
          </div>
        </Col>
      </Row>
      <Row>
        <Col>
          <div>{parse(`<div>${settings.footer}</div>`)}</div>
        </Col>
      </Row>
    </Container>
  );
}

ThankYou.propTypes = {
  location: PropTypes.shape({
    state: PropTypes.shape({
      results: PropTypes.object.isRequired,
      settings: PropTypes.object.isRequired,
    }),
  }),
};
