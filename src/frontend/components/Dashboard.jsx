// base imports
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
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
import MapTab from './dashboard/MapTab/MapTab.jsx';
import SettingsTab from './dashboard/SettingsTab.jsx';

function UserTabs(props) {
  const { role, inputs, handleSettings } = props;
  if (role === 'admins' || role === 'editors') {
    return (
      <Tabs defaultActiveKey="map">
        <Tab eventKey="form" title="Form">
          <FormTab />
        </Tab>
        <Tab eventKey="settings" title="Settings">
          <SettingsTab defaults={inputs} setDefaults={handleSettings} />
        </Tab>
        <Tab eventKey="data" title="Data">
          <DataTab />
        </Tab>
        {inputs.mapboxKey && (
          <Tab eventKey="map" title="Map">
            <MapTab mapboxKey={inputs.mapboxKey} />
          </Tab>
        )}
      </Tabs>
    );
  } else if (role === 'viewers') {
    return (
      <Tabs defaultActiveKey="data">
        <Tab eventKey="data" title="Data">
          <DataTab />
        </Tab>
        {inputs.mapboxKey && (
          <Tab eventKey="map" title="Map">
            <MapTab mapboxKey={inputs.mapboxKey} />
          </Tab>
        )}
      </Tabs>
    );
  } else {
    return (
      <div>
        You are not authorized to view this page. If this is in error, contact
        an administrator.
      </div>
    );
  }
}

export default function Dashboard(props) {
  console.log('*** props ***', props);
  const role = props.role ? props.role : props.location.state.role;
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
          document.querySelector('[rel="shortcut icon"]').href = data.logo;
        }
        return;
      })
      .catch(error => {
        console.error('error:', error);
      });
  }, []);

  return (
    <div>
      <Row>
        <Col>
          <Navbar expand="lg" variant="dark" style={primary}>
            <Container>
              <Navbar.Brand>{inputs.title} | Dashboard</Navbar.Brand>
              <Navbar.Collapse className="justify-content-end">
                <Button href="/api/v1/logout" style={secondary}>
                  Logout
                </Button>
              </Navbar.Collapse>
            </Container>
          </Navbar>
        </Col>
      </Row>
      <Row className={'mt-4'}>
        <Col>
          <UserTabs
            role={role}
            inputs={inputs}
            handleSettings={handleSettings}
          />
        </Col>
      </Row>
    </div>
  );
}

Dashboard.propTypes = {
  history: PropTypes.object,
  role: PropTypes.string,
  location: PropTypes.shape({
    state: PropTypes.shape({
      role: PropTypes.string,
    }),
  }),
};
