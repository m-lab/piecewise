// base imports
import React from 'react';
import { CSVLink } from 'react-csv';

// Bootstrap imports
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Table from 'react-bootstrap/Table';

const headers = [
  { label: 'id', key: 'id' },
  { label: 'Download Speed', key: 'DownloadSpeed' },
  { label: 'Upload Speed', key: 'UploadValue' },
  { label: 'Latency', key: 'Latency' },
  { label: 'Latitude', key: 'Latitude' },
  { label: 'Longitude', key: 'Longitude' },
];

const runs = [{}];

export default function DataTab() {
  return (
    <Container className={'mt-4 mb-4'}>
      <Row>
        <Col>
          <Table striped bordered hover responsive size="sm">
            <thead>
              <tr>
                {headers.map(header => (
                  <th key={header.key}>{header.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {runs.map(run => (
                <tr key={run.id}>
                  <td>{run.id}</td>
                  <td>{run.c2sRate}</td>
                  <td>{run.s2cRate}</td>
                  <td>{run.MinRTT}</td>
                  <td>{run.latitude}</td>
                  <td>{run.longitude}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>
      <Row>
        <Col>
          <CSVLink data={runs ? runs : ''} headers={headers}>
            Export
          </CSVLink>
        </Col>
      </Row>
    </Container>
  );
}
