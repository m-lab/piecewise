// base imports
import React, { useEffect } from 'react';
import { SketchPicker } from 'react-color';
import _ from 'lodash/core';

// bootstrap imports
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';

// custom styles
import './SettingsTab.css';

const defaultColorPrimary = '#333333';
const defaultColorSecondary = '#007bff';

export default function SettingsTab() {
  const [inputs, setInputs] = React.useState({});
  const [colorPrimary, setColorPrimary] = React.useState(defaultColorPrimary);
  const [colorSecondary, setColorSecondary] = React.useState(defaultColorSecondary);

  // color picker
  const handleChangeColorPrimary = color => {
    setColorPrimary(color.hex);
  };

  const handleChangeColorSecondary = color => {
    setColorSecondary(color.hex);
  };

  // other inputs
  const handleInputChange = event => {
    event.persist();
    setInputs(inputs => ({
      ...inputs,
      [event.target.name]: event.target.value,
    }));
  };

  const processError = errorMessage => {
    let text = `We're sorry your, request didn't go through. Please send the message below to the support team and we'll try to fix things as soon as we can.`;
    let debug = JSON.stringify(errorMessage);
    return [text, debug];
  };

  const uploadSettings = event => {
    event.preventDefault();
    let status;
    const json = JSON.stringify({
      title: inputs.title,
      header: inputs.header,
      footer: inputs.footer,
      color_one: colorPrimary,
      color_two: colorSecondary,
    });
    fetch('/api/v1/settings', {
      method: 'PUT',
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
          alert('Settings saved successfully.')
          return data;
        } else {
          const error = processError(data);
          throw new Error(`Error in response from server: ${error}`);
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
      .then(result => {
        if (status === 200 || status === 201) {
          if (!_.isEmpty(result.data)) {
            setInputs(result.data);
            setColorPrimary(result.data.color_one);
            setColorSecondary(result.data.color_two);
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
    downloadSettings()
      .then(data => {
        if (!_.isEmpty(data)) {
          setInputs(data);
          setColorPrimary(data.color_one);
          setColorSecondary(data.color_two);
        }
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
            name="title"
            placeholder="Enter a title for the site"
            defaultValue={inputs.title || ''}
            onChange={handleInputChange}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Welcome Message</Form.Label>
          <Form.Control
            required
            as="textarea"
            rows="3"
            name="header"
            placeholder="Welcome text shown when first visiting te site"
            defaultValue={inputs.header || ''}
            onChange={handleInputChange}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Thank You Message</Form.Label>
          <Form.Control
            required
            as="textarea"
            rows="3"
            name="footer"
            placeholder="Text shown after taking the survey"
            defaultValue={inputs.footer || ''}
            onChange={handleInputChange}
          />
        </Form.Group>
        <Form.Group className={'flex'}>
          <div className={'flex-item'}>
            <Form.Label>
              Choose a primary default color for the site:
            </Form.Label>
            <SketchPicker
              color={colorPrimary}
              onChangeComplete={handleChangeColorPrimary}
            />
          </div>
          <div className={'flex-item'}>
            <Form.Label>
              Choose a secondary default color for the site:
            </Form.Label>
            <SketchPicker
              color={colorSecondary}
              onChangeComplete={handleChangeColorSecondary}
            />
          </div>
        </Form.Group>
        <Button type="submit">Save</Button>
      </Form>
    </Container>
  );
}
