// base imports
import React, { useEffect } from 'react';
import { ReactFormGenerator } from 'react-form-builder2';
import PropTypes from 'prop-types';

// Bootstrap imports
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';

// module imports
import Loading from './Loading.jsx';
import NdtWidget from './utils/NdtWidget.jsx';

export default function Survey(props) {
  const settings = props.location.state.settings;
  const locationConsent = props.location.state.locationConsent;
  const [form, setForm] = React.useState(null);
  const [formId, setFormId] = React.useState();
  const [location, setLocation] = React.useState({});
  const [results, setResults] = React.useState({});
  const [testsComplete, setTestsComplete] = React.useState(false);
  const [submitButton, setSubmitButton] = React.useState(null);

  const onFinish = (finished, results, location) => {
    if (finished) {
      setTestsComplete(true);
      setResults(results);
      setLocation(location);
    } else {
      setTestsComplete(false);
    }
  };

  const processError = errorMessage => {
    let text = `We're sorry, your request didn't go through. Please send the message below to the support team and we'll try to fix things as soon as we can.`;
    let debug = JSON.stringify(errorMessage);
    return [text, debug];
  };

  const uploadFormData = formData => {
    let status;
    fetch(`/api/v1/forms/${formId}/submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          c2sRate: results.c2sRate,
          s2cRate: results.s2cRate,
          MinRTT: results.MinRTT,
          latitude: location.latitude,
          longitude: location.longitude,
          fields: formData,
        },
      }),
    })
      .then(response => {
        status = response.status;
        return response.json();
      })
      .then(data => {
        if (status === 200 || status === 201) {
          props.history.push({
            pathname: '/thankyou',
            state: {
              results: results,
              settings: settings,
            },
          });
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

  useEffect(() => {
    document.title = `${settings.title} | Survey`;
    if (!form) {
      downloadForm()
        .then(res => {
          setFormId(res.data[0].id);
          setForm(res.data[0].fields);
          setSubmitButton(document.querySelector('.btn-toolbar input'));
          return;
        })
        .catch(error => {
          setForm(
            'No survey found. Please contact an administrator or login and create one.',
          );
          console.error('error:', error);
        });
    }

    if (submitButton) {
      submitButton.classList.add('disabled');
      submitButton.disabled = true;
    }

    if (testsComplete) {
      submitButton.classList.remove('disabled');
      submitButton.disabled = false;
    }
  }, [testsComplete, form, submitButton]);

  if (!form) {
    return <Loading />;
  } else if (typeof form === 'string') {
    return <div>{form}</div>;
  } else {
    return (
      <Container className={'mt-4'}>
        <style type="text/css">
          {`
            h1, h2, h3 {
              color: ${settings.color_one};
            }
            .form-group a {
              color: ${settings.color_two};
            }
            .form-group a:active, .form-group a:focus, .form-group a:hover {
              color: filter: brightness(75%) !important;
            }
            .btn-toolbar input {
              background-color: ${settings.color_two};
              border: 2px solid ${settings.color_two};
              color: #fff;
              cursor: pointer;
            }
            .btn-toolbar input.disabled {
              background-color: filter(50%);
              border: 2px solid #ccc;
              color: #ccc;
              cursor: not-allowed;
            }
          `}
        </style>
        {testsComplete ? (
          <div>You may now submit your survey to see your results.</div>
        ) : (
          <NdtWidget onFinish={onFinish} locationConsent={locationConsent} />
        )}
        <Row>
          <Col>
            <ReactFormGenerator
              answer_data={{}}
              form_method="POST"
              form_action="/api/v1/submissions"
              onSubmit={uploadFormData}
              data={form}
            />
          </Col>
        </Row>
      </Container>
    );
  }
}

Survey.propTypes = {
  location: PropTypes.shape({
    state: PropTypes.shape({
      settings: PropTypes.object.isRequired,
      locationConsent: PropTypes.bool.isRequired,
    }),
  }),
};
