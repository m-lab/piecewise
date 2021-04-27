// base imports
import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { css } from 'glamor';
import parse from 'html-react-parser';
import PropTypes from 'prop-types';

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
import defaultLogo from '../../common/assets/favicon.ico';

export default function Basic() {
  const history = useHistory();
  /* eslint-disable no-unused-vars */
  const [favicon, setFavicon] = useState(
    document.querySelector('[rel="shortcut icon"]'),
  );
  const [logo, setLogo] = useState(defaultLogo);
  const [primary, setPrimary] = useState(css({ color: '#333' }));
  const [secondary, setSecondary] = useState(
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

  let image = css({
    maxHeight: '150px',
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

  const handleLogo = settings => {
    if (settings.logo) {
      setFavicon(settings.logo);
      setLogo(settings.logo);
      document.querySelector('[rel="shortcut icon"]').href = settings.logo;
    }
  };

  // handle geolocation consent
  const [locationConsent, setLocationConsent] = useState(false);
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
            handleLogo(result.data);
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
        if (data) {
          setSettings(data);
          handleColors(data);
          handleLogo(data);
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
      pathname: '/geocoder',
      state: { settings: settings, locationConsent: locationConsent },
    });
  };

  if (!settings) {
    return <Loading />;
  } else {
    return (
      <Container fluid="lg" className={'mt-4 mb-4'}>
        <div>
          <img src={logo} aria-hidden="true" {...image} />
        </div>
        <h1 {...primary}>{settings.title}</h1>
        <div>{parse(`<div>${settings.header}</div>`)}</div>
        <h2 {...primary}>Sharing your location</h2>
        <p>
          To get the most accurate location data, we ask you to allow your
          browser to share your location. This is not essential but it is very
          helpful for creating more accurate maps. Depending on your browser,
          you&apos;ll see a window similar to the images below, requesting your
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
