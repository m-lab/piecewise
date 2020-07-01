// base imports
import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';

// bootstrap imports
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';

// module imports
import ChromeScreengrab from '../assets/images/chrome-location.jpg';
import FirefoxScreengrab from '../assets/images/firefox-location.jpg';

export default function Basic() {
  const history = useHistory();
  // handle geolocation consent
  const [locationConsent, setLocationConsent] = useState(false);
  // site settings
  const [settings, setSettings] = useState({});

  const processError = errorMessage => {
    let text = `We're sorry your, request didn't go through. Please send the message below to the support team and we'll try to fix things as soon as we can.`;
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
            return result.data;
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

  //function success(position) {
  //  document.getElementById('latitude-mlab').value = position.coords.latitude;
  //  document.getElementById('longitude-mlab').value = position.coords.longitude;
  //  document.getElementById('latitude').value = position.coords.latitude;
  //  document.getElementById('longitude').value = position.coords.longitude;

  //  var xhr = new XMLHttpRequest(),
  //    currentLocationURL =
  //      'https://nominatim.openstreetmap.org/reverse?format=json&lat=' +
  //      position.coords.latitude +
  //      '&lon=' +
  //      position.coords.longitude +
  //      '&zoom=18&addressdetails=1';

  //  var currentLoc;
  //  xhr.open('GET', currentLocationURL, true);
  //  xhr.send();
  //  xhr.onreadystatechange = function() {
  //    if (xhr.readyState === 4) {
  //      if (xhr.status === 200) {
  //        currentLoc = JSON.parse(xhr.responseText);
  //        console.log('Location received');
  //        // currentLocText.text(currentLoc.address.road + currentLoc.address.neighbourhood + currentLoc.address.suburb + currentLoc.address.city + currentLoc.address.state);
  //        document
  //          .getElementsByClassName('loader-item')[1]
  //          .append(
  //            'Searching from: ' +
  //              currentLoc.address.road +
  //              ', ' +
  //              currentLoc.address.city +
  //              ', ' +
  //              currentLoc.address.state,
  //          );
  //      } else {
  //        console.log('Location lookup failed');
  //      }
  //    }
  //  };
  //}

  if (!settings) {
    return <div>Loading...</div>;
  } else {
    return (
      <Container fluid="lg">
        <h1>{settings.title}</h1>
        <p>{settings.header}</p>
        <h2>Sharing your location</h2>
        <p>
          To get the most accurate location data, we ask you to allow your
          browser to share your location. This is not essential but it is very
          helpful for creating more accurate maps. Depending on your browser,
          you&lsquoll see a window similar to the images below, requesting your
          consent to share your location. If you are using Private Browsing mode
          or Incognito mode, you may need to disable that preference for this
          website.
        </p>
        <Container>
          <Row>
            <Card>
              <Card.Img
                src={FirefoxScreengrab}
                alt="Screenshot of geography location request in Firefox."
              />
              <Card.Text>
                Screenshot of geography location request in Firefox.
              </Card.Text>
            </Card>
          </Row>
          <Row>
            <Card>
              <Card.Img
                src={ChromeScreengrab}
                alt="Screenshot of geography location request in Chrome."
              />
              <Card.Text>
                Screenshot of geography location request in Chrome.
              </Card.Text>
            </Card>
          </Row>
        </Container>
        <Form onSubmit={handleSubmit}>
          <Container>
            <fieldset>
              <Form.Group>
                <Form.Label>
                  Do you want to use your browser location?
                </Form.Label>
                <Form.Check
                  type="radio"
                  id="location-yes"
                  label="Use my browser location"
                  onChange={() => setLocationConsent(true)}
                />
                <Form.Check
                  type="radio"
                  id="location-no"
                  label="Do not use my location"
                  onChange={() => setLocationConsent(false)}
                />
              </Form.Group>
            </fieldset>
            <Form.Group>
              <Form.Check
                required
                type="checkbox"
                id="consent"
                label="*I agree to the M-Lab privacy policy, which includes retention and publication of IP addresses, in addition to speed test results."
              />
              <Form.Text>This field is required</Form.Text>
            </Form.Group>
          </Container>
          <Container>
            <Button variant="primary" type="submit">
              Take the Test
            </Button>
          </Container>
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
