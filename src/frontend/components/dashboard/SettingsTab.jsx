// base imports
import React from 'react';
import PropTypes from 'prop-types';
import { SketchPicker } from 'react-color';

// bootstrap imports
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';

// custom styles
import './SettingsTab.css';

export default function SettingsTab(props) {
  const { defaults, setDefaults } = props;
  const [inputs, setInputs] = React.useState({});

  // color picker
  const handleChangeColorPrimary = color => {
    setInputs(inputs => ({
      ...inputs,
      color_one: color.hex,
    }));
  };

  const handleChangeColorSecondary = color => {
    setInputs(inputs => ({
      ...inputs,
      color_two: color.hex,
    }));
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
      color_one: inputs.color_one,
      color_two: inputs.color_two,
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
          alert('Settings saved successfully.');
          return setDefaults(inputs);
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
            defaultValue={inputs.title || defaults.title || ''}
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
            defaultValue={inputs.header || defaults.header || ''}
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
            defaultValue={inputs.footer || defaults.footer || ''}
            onChange={handleInputChange}
          />
        </Form.Group>
        <Form.Group className={'flex'}>
          <div className={'flex-item'}>
            <Form.Label>
              Choose a primary default color for the site:
            </Form.Label>
            <SketchPicker
              color={inputs.color_one || defaults.color_one}
              onChangeComplete={handleChangeColorPrimary}
            />
          </div>
          <div className={'flex-item'}>
            <Form.Label>
              Choose a secondary default color for the site:
            </Form.Label>
            <SketchPicker
              color={inputs.color_two || defaults.color_two}
              onChangeComplete={handleChangeColorSecondary}
            />
          </div>
        </Form.Group>
        <Button type="submit">Save</Button>
      </Form>
    </Container>
  );
}

SettingsTab.propTypes = {
  defaults: PropTypes.object.isRequired,
  setDefaults: PropTypes.func.isRequired,
};
