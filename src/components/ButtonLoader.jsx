'use client';

import React from 'react';
import { Spinner } from 'react-bootstrap';

const ButtonLoader = ({ isLoading, children, spinnerSize = 'sm', spinnerVariant = 'light' }) => {
  return (
    <>
      {isLoading ? (
        <span className="d-flex align-items-center justify-content-center">
          <Spinner
            as="span"
            animation="border"
            size={spinnerSize}
            role="status"
            aria-hidden="true"
            variant={spinnerVariant}
            className="me-2"
          />
          <span>Loading...</span>
        </span>
      ) : (
        children
      )}
    </>
  );
};

export default ButtonLoader;
