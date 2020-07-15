// base imports
import React, { useEffect, useState } from 'react';
import { CSVLink } from 'react-csv';
import _ from 'lodash/core';

// Bootstrap imports
import Alert from 'react-bootstrap/Alert';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Table from 'react-bootstrap/Table';

const headers = [
  { label: 'id', key: 'id' },
  { label: 'Date', key: 'date' },
  { label: 'Download Speed', key: 'c2sRate' },
  { label: 'Upload Speed', key: 's2cRate' },
  { label: 'Latency', key: 'MinRTT' },
  { label: 'Latitude', key: 'latitude' },
  { label: 'Longitude', key: 'longitude' },
];

export default function DataTab() {
  const [submissions, setSubmissions] = useState([{}]);

  // process api errors
  const processError = errorMessage => {
    let text = `We're sorry your, request didn't go through. Please send the message below to the support team and we'll try to fix things as soon as we can.`;
    let debug = JSON.stringify(errorMessage);
    return [text, debug];
  };

  // fetch submissions from API
  const downloadSubmissions = () => {
    let status;
    return fetch('/api/v1/submissions', {
      method: 'GET',
    })
      .then(response => {
        status = response.status;
        return response.json();
      })
      .then(result => {
        if (status === 200 || status === 201) {
          if (!_.isEmpty(result.data)) {
            setSubmissions(result.data);
          }
          return result.data;
        } else {
          const error = processError(result);
          throw new Error(`Error in response from server: ${error}`);
        }
      })
      .catch(error => {
        console.error('error:', error);
        throw Error(error.statusText);
      });
  };

  useEffect(() => {
    downloadSubmissions()
      .then(data => {
        if (!_.isEmpty(data)) {
          setSubmissions(data);
        }
        return;
      })
      .catch(error => {
        console.error('error:', error);
      });
  }, []);

  return (
    <Container className={'mt-4 mb-4'}>
      <Alert variant="secondary">
        <p className="mb-0">
          <em>
            View data from tests that have been run, and export data to a CSV.
          </em>
        </p>
      </Alert>
      <Row>
        <Col>
          <Table striped bordered hover responsive size="sm">
            <thead>
              <tr>
                {headers.map(header => (
                  <th key={header.key}>{header.label}</th>
                ))}
                {submissions[0].fields
                  ? submissions[0].fields.map(field => (
                      <th key={field.name}>{field.label}</th>
                    ))
                  : null}
              </tr>
            </thead>
            <tbody>
              {submissions.map(submission => (
                <tr key={submission.id}>
                  <td>{submission.id}</td>
                  <td>{submission.date}</td>
                  <td>{submission.s2cRate}</td>
                  <td>{submission.c2sRate}</td>
                  <td>{submission.MinRTT}</td>
                  <td>{submission.latitude}</td>
                  <td>{submission.longitude}</td>
                  {submission.fields
                    ? submission.fields.map(field => (
                        <td key={field.name}>{field.value}</td>
                      ))
                    : null}
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>
      <Row>
        <Col>
          <CSVLink data={submissions ? submissions : ''} headers={headers}>
            Export
          </CSVLink>
        </Col>
      </Row>
    </Container>
  );
}
