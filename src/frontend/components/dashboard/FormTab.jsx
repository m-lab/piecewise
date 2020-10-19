// base imports
import React from 'react';
import { ReactFormBuilder } from 'react-form-builder2';

// Bootstrap imports
import Alert from 'react-bootstrap/Alert';
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

  const toolbarItems = [
    {
      key: 'Header',
      name: 'Header Text',
      icon: 'fa fa-heading',
      static: true,
      content: 'Placeholder Text...',
    },
    {
      key: 'Label',
      name: 'Label',
      static: true,
      icon: 'fa fa-font',
      content: 'Placeholder Text...',
    },
    {
      key: 'Paragraph',
      name: 'Paragraph',
      static: true,
      icon: 'fa fa-paragraph',
      content: 'Placeholder Text...',
    },
    {
      key: 'LineBreak',
      name: 'Line Break',
      static: true,
      icon: 'fa fa-arrows-alt-h',
    },
    {
      key: 'Dropdown',
      canHaveAnswer: true,
      name: 'Dropdown',
      icon: 'fa fa-caret-square-down',
      label: 'Placeholder Label',
      field_name: 'dropdown_',
      options: [],
    },
    {
      key: 'Checkboxes',
      canHaveAnswer: true,
      name: 'Checkboxes',
      icon: 'fa fa-check-square',
      label: 'Placeholder Label',
      field_name: 'checkboxes_',
      options: [],
    },
    {
      key: 'RadioButtons',
      canHaveAnswer: true,
      name: 'Multiple Choice',
      icon: 'fa fa-dot-circle',
      label: 'Placeholder Label',
      field_name: 'radio_buttons_',
      options: [],
    },
    {
      key: 'TextInput',
      canHaveAnswer: true,
      name: 'Text Input',
      label: 'Placeholder Label',
      icon: 'fa fa-font',
      field_name: 'text_input_',
    },
    {
      key: 'NumberInput',
      canHaveAnswer: true,
      name: 'Number Input',
      label: 'Placeholder Label',
      icon: 'fa fa-plus',
      field_name: 'number_input_',
    },
    {
      key: 'TextArea',
      canHaveAnswer: true,
      name: 'Multi-line Input',
      label: 'Placeholder Label',
      icon: 'fa fa-text-height',
      field_name: 'text_area_',
    },
    {
      key: 'Range',
      name: 'Range',
      icon: 'fa fa-sliders-h',
      label: 'Placeholder Label',
      field_name: 'range_',
      step: 1,
      default_value: 3,
      min_value: 1,
      max_value: 5,
      min_label: 'Easy',
      max_label: 'Difficult',
    },
  ];

  return (
    <Container className={'mt-4 mb-4'}>
      <Alert variant="secondary">
        <p className="mb-0">
          <em>
            Use the form builder below to create a survey for the end user to
            fill out. You may use and reorder the blocks as you wish.
          </em>
        </p>
      </Alert>
      <Row>
        <Col>
          <ReactFormBuilder
            onPost={uploadForm}
            onLoad={downloadForm}
            toolbarItems={toolbarItems}
          />
        </Col>
      </Row>
    </Container>
  );
}
