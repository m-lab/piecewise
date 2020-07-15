// base imports
import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import { css } from 'glamor';

// bootstrap imports
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';

// module imports
import Loading from './Loading.jsx';
import ChromeScreengrab from '../assets/images/chrome-location.jpg';
import FirefoxScreengrab from '../assets/images/firefox-location.jpg';

export default function Basic() {
  const history = useHistory();
  const [primary, setPrimary] = React.useState(css({ color: '#333' }));
  const [secondary, setSecondary] = React.useState(
    css({ backgroundColor: '#ccc !important', borderColor: '#ccc !important' }),
  );

  // style rules

  let card = css({
    height: '100%',
  });

  let cardText = css({
    fontStyle: 'italic',
    padding: '10px',
  });

  let location = css({
    marginLeft: '20px',
  });

  let mb2 = css({
    '@media(max-width: 768px)': {
      marginBottom: '20px',
    },
  });

  const handleColors = settings => {
    setPrimary(
      css({
        color: settings.color_one,
      }),
    );
    setSecondary(
      css({
        backgroundColor: `${settings.color_two} !important`,
        borderColor: `${settings.color_two} !important`,
        ':hover': {
          filter: 'brightness(85%)',
        },
      }),
    );
  };

  // handle geolocation consent
  const [locationConsent, setLocationConsent] = useState(true);
  // site settings
  const [settings, setSettings] = useState({});

  const processError = errorMessage => {
    let text = `We're sorry, your request didn't go through. Please send the message below to the support team and we'll try to fix things as soon as we can.`;
    let debug = JSON.stringify(errorMessage);
    return [text, debug];
  };

  // fetch settings from API
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
          if (result.data) {
            setSettings(result.data);
            handleColors(result.data);
            document.title = result.data.title;
            return;
          } else {
            const error = processError(result);
            throw new Error(`Error in response from server: ${error}`);
          }
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
        console.log('data: ', data);
        if (data) {
          setSettings(data);
          handleColors(data);
          document.title = data.title;
        }
        return;
      })
      .catch(error => {
        console.error('error:', error);
        throw Error(error.statusText);
      });
  }, []);

  const handleSubmit = event => {
    event.preventDefault();
    history.push({
      pathname: '/survey',
      state: { settings: settings, locationConsent: locationConsent },
    });
  };

  if (!settings) {
    return <Loading />;
  } else {
    return (
      <Container fluid="lg" className={'mt-4 mb-4'}>
        <h1 {...primary}>{settings.title}</h1>
        <p>{settings.header}</p>
        <h2 {...primary}>Sharing your location</h2>
        <p>
          To get the most accurate location data, we ask you to allow your
          browser to share your location. This is not essential but it is very
          helpful for creating more accurate maps. Depending on your browser,
          you&lsquoll see a window similar to the images below, requesting your
          consent to share your location. If you are using Private Browsing mode
          or Incognito mode, you may need to disable that preference for this
          website.
        </p>
        <Row className={'justify-content-md-center mb-4'}>
          <Col xs={12} md={{ span: 4 }} {...mb2}>
            <Card {...card}>
              <Card.Img
                src={FirefoxScreengrab}
                alt="Screenshot of geography location request in Firefox."
              />
              <Card.Text {...cardText}>
                Screenshot of geography location request in Firefox.
              </Card.Text>
            </Card>
          </Col>
          <Col xs={12} md={{ span: 4 }} {...mb2}>
            <Card {...card}>
              <Card.Img
                src={ChromeScreengrab}
                alt="Screenshot of geography location request in Chrome."
              />
              <Card.Text {...cardText}>
                Screenshot of geography location request in Chrome.
              </Card.Text>
            </Card>
          </Col>
        </Row>
        <Form onSubmit={handleSubmit}>
          <fieldset>
            <Form.Group>
              <Form.Label>Do you want to use your browser location?</Form.Label>
              <Form.Check
                type="radio"
                name="location"
                id="location-yes"
                label="Use my browser location"
                onChange={() => setLocationConsent(true)}
                defaultChecked
              />
              <Form.Check
                type="radio"
                name="location"
                id="location-no"
                label="Do not use my location"
                onChange={() => setLocationConsent(false)}
              />
            </Form.Group>
          </fieldset>
          <Form.Group {...location}>
            <Form.Check.Input required type="checkbox" id="consent" />
            <Form.Check.Label>
              *I agree to the{' '}
              <a href="https://www.measurementlab.net/privacy/">
                M-Lab privacy policy
              </a>
              , which includes retention and publication of IP addresses, in
              addition to speed test results.
            </Form.Check.Label>
            <Form.Text>This field is required</Form.Text>
          </Form.Group>
          <Button variant="primary" type="submit" {...secondary}>
            Take the Test
          </Button>
        </Form>
      </Container>
    );
  }
}

Basic.propTypes = {
  history: PropTypes.object,
  location: PropTypes.shape({
    state: PropTypes.shape({
      description: PropTypes.string,
      files: PropTypes.array,
      links: PropTypes.array,
    }),
  }),
};
