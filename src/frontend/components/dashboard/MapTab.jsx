// base imports
import React from 'react';

// Bootstrap imports
import Alert from 'react-bootstrap/Alert';
import Container from 'react-bootstrap/Container';

export default function MapTab() {
  return (
    <Container className={'mt-4 mb-4'}>
      <Alert variant="secondary">
        <p className="mb-0">
          <em>See mapped out data from completed tests.</em>
        </p>
      </Alert>
    </Container>
  );
}
