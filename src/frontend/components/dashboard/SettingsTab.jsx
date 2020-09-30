// base imports
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { EditorState, ContentState, convertToRaw } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { SketchPicker } from 'react-color';
import _ from 'lodash/core';

// bootstrap imports
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';

// custom styles
import './SettingsTab.css';

export default function SettingsTab(props) {
  const { defaults, setDefaults } = props;
  const [inputs, setInputs] = useState({});
  const [header, setHeader] = useState('');
  const [footer, setFooter] = useState('');
  const [editorStateHeader, setEditorStateHeader] = useState(
    EditorState.createEmpty(),
  );
  const [editorStateFooter, setEditorStateFooter] = useState(
    EditorState.createEmpty(),
  );

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

  const readFileDataAsBase64 = e => {
    const file = e.target.files[0];

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = event => {
        resolve(event.target.result);
      };

      reader.onerror = err => {
        reject(err);
      };

      reader.readAsDataURL(file);
    });
  };

  const handleLogoChange = event => {
    readFileDataAsBase64(event)
      .then(response => {
        setInputs(inputs => ({
          ...inputs,
          logo: response,
        }));
        return response;
      })
      .catch(error => {
        console.error('error:', error);
        throw Error(error.statusText);
      });
  };

  // other inputs
  const handleInputChange = event => {
    event.persist();
    console.log(event.target.value);
    setInputs(inputs => ({
      ...inputs,
      [event.target.name]: event.target.value,
    }));
  };

  const onEditorStateHeaderChange = es => {
    setEditorStateHeader(es);
    const html = toHtml(es);
    if (header !== html) {
      setHeader(html);
    }
  };

  const onEditorStateFooterChange = es => {
    setEditorStateFooter(es);
    const html = toHtml(es);
    if (footer !== html) {
      setFooter(html);
    }
  };

  const toHtml = es => {
    return draftToHtml(convertToRaw(es.getCurrentContent()));
  };

  const processError = errorMessage => {
    let text = `We're sorry your, request didn't go through. Please send the message below to the support team and we'll try to fix things as soon as we can.`;
    let debug = JSON.stringify(errorMessage);
    return [text, debug];
  };

  const uploadSettings = event => {
    event.preventDefault();
    const json = JSON.stringify({
      data: {
        title: inputs.title,
        header: header,
        footer: footer,
        color_one: inputs.color_one,
        color_two: inputs.color_two,
        logo: inputs.logo,
      },
    });
    fetch('/api/v1/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: json,
    })
      .then(response => {
        if (response.status === 204) {
          document.querySelector('[rel="shortcut icon"]').href = inputs.logo;
          alert('Settings saved successfully.');
          const newDefaults = { ...defaults, ...inputs };
          return setDefaults(newDefaults);
        } else if (response.status === 413) {
          alert('Image file too large. Please upload a file 1MB or less.');
          return;
        } else {
          const error = processError(response.json());
          alert(`Settings not saved. Error in response from server: ${error}`);
          throw new Error(`Error in response from server: ${error}`);
        }
      })
      .catch(error => {
        console.error('error:', error);
        throw Error(error.statusText);
      });
  };

  React.useEffect(() => {
    if (!_.isEmpty(defaults)) {
      setHeader(defaults.header);
      setFooter(defaults.footer);
      setEditorStateHeader(
        EditorState.push(
          editorStateHeader,
          ContentState.createFromBlockArray(
            htmlToDraft(header || defaults.header || ''),
          ),
        ),
      );
      setEditorStateFooter(
        EditorState.push(
          editorStateFooter,
          ContentState.createFromBlockArray(
            htmlToDraft(footer || defaults.footer || ''),
          ),
        ),
      );
    }
  }, [defaults]);

  return (
    <Container className={'mt-4 mb-4'}>
      <Alert variant="secondary">
        <p className="mb-0">
          <em>Fill out the sitewide settings with the form below.</em>
        </p>
      </Alert>
      <Form onSubmit={uploadSettings}>
        <Form.Group className={'mb-4'}>
          <Form.Label htmlFor="title">Site Title</Form.Label>
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
          <Form.Label htmlFor="logo">Sitewide logo</Form.Label>
          <img
            src={inputs.logo || defaults.logo || ''}
            aria-hidden="true"
            className={'logo'}
          />
          <Form.File
            id="logo"
            name="logo"
            defaultValue={inputs.logo || defaults.logo || ''}
            onChange={handleLogoChange}
          />
        </Form.Group>
        <Form.Group className={'mb-4'}>
          <Form.Label htmlFor="header">Welcome Message</Form.Label>
          <Editor
            required
            name="header"
            theme="snow"
            placeholder="Welcome text shown when first visiting the site"
            editorState={editorStateHeader}
            onEditorStateChange={onEditorStateHeaderChange}
          />
        </Form.Group>
        <Form.Group className={'mb-4'}>
          <Form.Label htmlFor="footer">Thank You Message</Form.Label>
          <Editor
            required
            name="footer"
            theme="snow"
            placeholder="Text shown after taking the survey"
            editorState={editorStateFooter}
            onEditorStateChange={onEditorStateFooterChange}
          />
        </Form.Group>
        <Form.Group className={'flex'}>
          <div className={'flex-item'}>
            <Form.Label htmlFor="color_one">
              Choose a primary default color for the site:
            </Form.Label>
            <SketchPicker
              name="color_one"
              color={inputs.color_one || defaults.color_one}
              onChangeComplete={handleChangeColorPrimary}
            />
          </div>
          <div className={'flex-item'}>
            <Form.Label htmlFor="color_two">
              Choose a secondary default color for the site:
            </Form.Label>
            <SketchPicker
              name="color_two"
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
