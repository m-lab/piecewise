// base imports
import React from 'react';
import { ReactFormBuilder } from 'react-form-builder2';

// Bootstrap imports
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';

// custom styles
import './FormTab.css';

export default function FormTab() {
  const processError = errorMessage => {
    let text = `We're sorry your, request didn't go through. Please send the message below to the support team and we'll try to fix things as soon as we can.`;
    let debug = JSON.stringify(errorMessage);
    return [text, debug];
  };

  const uploadForm = formData => {
    console.debug('formData: ', formData);
    let status;
    const json = JSON.stringify({ data: { fields: formData.task_data } });
    fetch('/api/v1/forms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: json,
    })
      .then(response => {
        status = response.status;
        return response.json();
      })
      .then(data => {
        if (status === 200 || status === 201) {
          return data;
        } else {
          let error = processError(data);
          throw new Error(`Error in response from server: ${error}`);
        }
      })
      .catch(error => {
        console.error('error:', error);
        throw Error(error.statusText);
      });
  };

  const downloadForm = () => {
    let status;
    return fetch('/api/v1/forms/latest', {
      method: 'GET',
    })
      .then(response => {
        status = response.status;
        return response.json();
      })
      .then(result => {
        if (status === 200 || status === 201) {
          console.log('***DOWNLOADFORM***:', result.data[0].fields);
          return result.data[0].fields;
        } else if (status === 404) {
          console.info('No existing forms found.');
          return [];
        } else {
          let error = processError(result);
          throw new Error(`Error in response from server: ${error}`);
        }
      })
      .catch(error => {
        console.error('error:', error);
        throw Error(error.statusText);
      });
  };

  return (
    <Container className={'mt-4 mb-4'}>
      <Row>
        <Col>
          <ReactFormBuilder onPost={uploadForm} onLoad={downloadForm} />
        </Col>
      </Row>
    </Container>
  );
}
