// base imports
import React, { useEffect } from 'react';

// bootstrap imports
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';

const defaultTitle = 'Piecewise';
const defaultHeader = 'Welcome to Piecewise!';
const defaultFooter = 'Thank you for taking a survey!';
const defaultColorOne = '#333333';
const defaultColorTwo = '#aaaaaa';

export default function SettingsTab() {
  const [title, setTitle] = React.useState(defaultTitle);
  const [header, setHeader] = React.useState(defaultHeader);
  const [footer, setFooter] = React.useState(defaultFooter);
  const [colorOne, setColorOne] = React.useState(defaultColorOne);
  const [colorTwo, setColorTwo] = React.useState(defaultColorTwo);

  const processError = errorMessage => {
    let text = `We're sorry your, request didn't go through. Please send the message below to the support team and we'll try to fix things as soon as we can.`;
    let debug = JSON.stringify(errorMessage);
    return [text, debug];
  };

  const uploadSettings = formData => {
    console.debug('formData: ', formData);
    let status;
    const json = JSON.stringify(formData);
    fetch('/api/v1/settings', {
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
          //let [text, debug] = processError(data);
          //setModalText(text);
          //setModalDebug(debug);
          //setOpenModal(true);
          throw new Error(`Error in response from server.`);
        }
      })
      .catch(error => {
        console.error('error:', error);
        throw Error(error.statusText);
      });
  };

  const downloadSettings = () => {
    let status;
    return fetch('/api/v1/settings', {
      method: 'GET',
    })
      .then(response => {
        status = response.status;
        return response.json();
      })
      .then(data => {
        if (status === 200 || status === 201) {
          return data;
        } else {
          //let [text, debug] = processError(data);
          //setModalText(text);
          //setModalDebug(debug);
          //setOpenModal(true);
          throw new Error(`Error in response from server.`);
        }
      })
      .catch(error => {
        console.error('error:', error);
        throw Error(error.statusText);
      });
  };

  useEffect(() => {
    downloadSettings()
      .then(data => {
        setTitle(data.data.title);
        setHeader(data.data.header);
        setFooter(data.data.footer);
        return;
      })
      .catch(error => {
        console.error('error:', error);
      });
  }, []);

  return (
    <Container className={'mt-2'}>
      <Form onSubmit={uploadSettings}>
        <Form.Group>
          <Form.Label>Site Title</Form.Label>
          <Form.Control
            required
            type="text"
            placeholder="Enter a title for the site"
            defaultValue={title}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Welcome Message</Form.Label>
          <Form.Control
            required
            as="textarea"
            rows="3"
            placeholder="Welcome text shown when first visiting te site"
            defaultValue={header}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Thank You Message</Form.Label>
          <Form.Control
            required
            as="textarea"
            rows="3"
            placeholder="Text shown after taking the survey"
            defaultValue={footer}
          />
        </Form.Group>
        <Button type="submit">Save</Button>
      </Form>
    </Container>
  );
}
