import React from 'react';
import PropTypes from 'prop-types';
import Alert from 'react-bootstrap/Alert';

export default function Error({ error, componentStack, resetErrorBoundary }) {
  return (
    <Alert
      key="error"
      variant="danger"
      onClose={resetErrorBoundary}
      dismissable
    >
      <Alert.Heading>Something went wrong:</Alert.Heading>
      <pre>{error.message}</pre>
      <pre>{componentStack}</pre>
    </Alert>
  );
}

Error.propTypes = {
  error: PropTypes.shape({
    message: PropTypes.string,
  }),
  componentStack: PropTypes.object,
  resetErrorBoundary: PropTypes.func,
};
