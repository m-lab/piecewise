// base imports
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { css } from 'glamor';
import parse from 'html-react-parser';

// Bootstrap imports
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import NdtWidget from './utils/NdtWidget.jsx';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@material-ui/core';

function createData(name, measure) {
  return { name, measure };
}

const processError = errorMessage => {
  let text = `We're sorry your, request didn't go through. Please send the message below to the support team and we'll try to fix things as soon as we can.`;
  let debug = JSON.stringify(errorMessage);
  return [text, debug];
};

export default function ThankYou(props) {
  const data = props.location.state?.data?.data;
  const settings = props.location.state.settings;
  const locationConsent = props.location.state.locationConsent;

  const [results, setResults] = React.useState({});
  const [testsComplete, setTestsComplete] = React.useState(false);

  const onFinish = (finished, results, location) => {
    console.log(location);

    if (finished) {
      setTestsComplete(true);
      setResults(results);
    } else {
      setTestsComplete(false);
    }

    if (finished && data && data[0]) {
      const dataObject = data[0];
      const submissionPayloadData = {
        ...dataObject,
        c2sRate: results.c2sRate,
        s2cRate: results.s2cRate,
        MinRTT: Number(results.MinRTT),
      };
      const id = dataObject?.id || 0;

      delete submissionPayloadData.id;
      delete submissionPayloadData.created_at;
      delete submissionPayloadData.updated_at;
      const json = JSON.stringify({
        data: submissionPayloadData,
      });

      fetch(`/api/v1/submissions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: json,
      })
        // eslint-disable-next-line promise/always-return
        .then(response => {
          if (response.status === 204) {
            return response;
          } else {
            const error = processError(response.json());
            alert(
              `Settings not saved. Error in response from server: ${error}`,
            );
            throw new Error(`Error in response from server: ${error}`);
          }
        })
        .catch(error => {
          console.error('error:', error);
          throw Error(error.statusText);
        });
    }
  };

  // style rules
  let h1 = css({
    color: settings.color_one,
  });

  useEffect(() => {
    document.title = `${settings.title} | Thank You`;
  }, []);

  const rows = [
    createData('Download', `${(results.s2cRate / 1000).toFixed(2)} Mb/s`),
    createData('Upload', `${(results.c2sRate / 1000).toFixed(2)} Mb/s`),
    createData('Latency', `${results.MinRTT} ms`),
  ];

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
          {testsComplete ? (
            <div>Test of speed was completed.</div>
          ) : (
            <NdtWidget onFinish={onFinish} locationConsent={locationConsent} />
          )}
        </Col>
      </Row>
      {testsComplete && (
        <>
          <Row className={'mb-4'}>
            <Col md={{ span: 6 }}>
              <TableContainer component={Paper}>
                <Table sx={{ width: '100%' }} aria-label="simple table">
                  <TableHead>
                    <TableRow style={{ backgroundColor: '#42a5f5' }}>
                      <TableCell />
                      <TableCell style={{ color: '#fff' }}>NDT</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map(row => (
                      <TableRow
                        key={row.name}
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                        }}
                      >
                        <TableCell
                          component="th"
                          scope="row"
                          style={{
                            backgroundColor: '#42a5f5',
                            color: '#fff',
                            width: '150px',
                          }}
                        >
                          {row.name}
                        </TableCell>
                        <TableCell>{row.measure}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Col>
          </Row>
          <Row>
            <Col>
              <div>{parse(`<div>${settings.footer}</div>`)}</div>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
}

ThankYou.propTypes = {
  location: PropTypes.shape({
    state: PropTypes.shape({
      data: PropTypes.object.isRequired,
      settings: PropTypes.object.isRequired,
      locationConsent: PropTypes.bool.isRequired,
    }),
  }),
};
