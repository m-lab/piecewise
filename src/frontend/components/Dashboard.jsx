import React from 'react';

// Bootstrap imports
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Row from 'react-bootstrap/Row';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

// Local imports
import FormTab from './dashboard/FormTab.jsx';
import SettingsTab from './dashboard/SettingsTab.jsx';

export default function NavTabs() {
  return (
    <Container>
      <Row>
        <Col>
          <Navbar expand="lg" bg="dark" variant="dark">
            <Navbar.Brand>Dashboard</Navbar.Brand>
            <Navbar.Collapse className="justify-content-end">
              <Button href="/api/v1/logout">Logout</Button>
            </Navbar.Collapse>
          </Navbar>
        </Col>
      </Row>
      <Row>
        <Col>
          <Tabs defaultActiveKey="form">
            <Tab eventKey="form" title="Form">
              <FormTab />
            </Tab>
            <Tab eventKey="settings" title="Settings">
              <SettingsTab />
            </Tab>
          </Tabs>
        </Col>
      </Row>
    </Container>
  );
}
