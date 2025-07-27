// src/components/form/IconTextFormInput.jsx
import React from 'react';
import { FormControl, FormLabel, InputGroup } from 'react-bootstrap';
import Feedback from 'react-bootstrap/esm/Feedback';
import { Controller } from 'react-hook-form'; // Correct import

const IconTextFormInput = ({
  name,
  containerClassName,
  control,
  id,
  label,
  icon: Icon, // Use a more descriptive variable name
  noValidate,
  type = "text", // Default to text input
  placeholder,
  error,
  ...other
}) => {

  return (
    <div className={containerClassName ?? ''}>
      {label && <FormLabel htmlFor={id || name}>{label}</FormLabel>}
      <InputGroup size="lg">
        <InputGroup.Text className="bg-light rounded-start border-0 text-secondary px-3">
          {Icon && <Icon size={16} />} {/* Conditionally render, and use as a component */}
        </InputGroup.Text>
        <Controller
          name={name}
          control={control}
          defaultValue="" // Good practice
          render={({ field, fieldState }) => (
            <FormControl
              className="border-0 bg-light rounded-end ps-1"
              {...other}  // Other props from the parent (like placeholder)
              {...field} // value, onChange, onBlur, ref - VERY IMPORTANT
              type={type}        // Pass the type prop
              isInvalid={!!fieldState.error} // Use isInvalid for Bootstrap styling
              id={id || name}    // Use id for accessibility
              placeholder={placeholder}
            />
          )}
        />

      </InputGroup>
      {/* Display error message */}
        {error && <Feedback type="invalid" style={{ display: "block" }}>{error}</Feedback>}
    </div>
  );
};

export default IconTextFormInput;