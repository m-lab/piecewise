// base imports
import React, { useEffect, useState } from 'react';
import _ from 'lodash/core';

// Bootstrap imports
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Row from 'react-bootstrap/Row';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

// Local imports
import DataTab from './dashboard/DataTab.jsx';
import FormTab from './dashboard/FormTab.jsx';
import MapTab from './dashboard/MapTab.jsx';
import SettingsTab from './dashboard/SettingsTab.jsx';

export default function NavTabs() {
  const [inputs, setInputs] = useState({});

  // update styles according to settings
  const primary = {
    backgroundColor: inputs.color_one,
  };

  const secondary = {
    backgroundColor: inputs.color_two,
    borderColor: inputs.color_two,
  };

  // handle settings change from settings form
  const handleSettings = settings => {
    setInputs(settings);
  };

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
          if (!_.isEmpty(result.data)) {
            setInputs(result.data);
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
          document.title = `${data.title} | Dashboard`;
        }
        return;
      })
      .catch(error => {
        console.error('error:', error);
      });
  }, []);

  return (
    <Container>
      <Row>
        <Col>
          <Navbar expand="lg" variant="dark" style={primary}>
            <Navbar.Brand>{inputs.title} | Dashboard</Navbar.Brand>
            <Navbar.Collapse className="justify-content-end">
              <Button href="/api/v1/logout" style={secondary}>
                Logout
              </Button>
            </Navbar.Collapse>
          </Navbar>
        </Col>
      </Row>
      <Row className={'mt-4'}>
        <Col>
          <Tabs defaultActiveKey="form">
            <Tab eventKey="form" title="Form">
              <FormTab />
            </Tab>
            <Tab eventKey="settings" title="Settings">
              <SettingsTab defaults={inputs} setDefaults={handleSettings} />
            </Tab>
            <Tab eventKey="data" title="Data">
              <DataTab />
            </Tab>
            <Tab eventKey="map" title="Map">
              <MapTab />
            </Tab>
          </Tabs>
        </Col>
      </Row>
    </Container>
  );
}
