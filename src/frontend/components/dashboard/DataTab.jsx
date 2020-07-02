// base imports
import React from 'react';

// Bootstrap imports
import Container from 'react-bootstrap/Container';
import Table from 'react-bootstrap/Table';

export default function DataTab() {
  return (
    <Container className={'mt-4 mb-4'}>
      <Table striped bordered hover responsive size="sm">
        <thead>
          <tr>
            <th>#</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Username</th>
          </tr>
        </thead>
        <tbody>
        </tbody>
      </Table>
    </Container>
  );
}
