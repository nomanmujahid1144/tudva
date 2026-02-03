// src/components/dialog/ConfirmDialog.jsx
'use client';
import React from 'react';
import { Button, Modal } from 'react-bootstrap';
import { FaExclamationTriangle } from 'react-icons/fa';

const ConfirmDialog = ({ 
  show, 
  onHide, 
  onConfirm, 
  title,
  message,
  confirmText,
  cancelText,
  variant = 'danger'
}) => {
  const handleConfirm = () => {
    onConfirm();
    onHide();
  };

  const getIconColor = () => {
    switch(variant) {
      case 'danger': return '#dc3545';
      case 'warning': return '#ffc107';
      case 'info': return '#0dcaf0';
      default: return '#dc3545';
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      backdrop="static"
      size="md"
    >
      <Modal.Header className="border-0 pb-0">
        <Modal.Title as="h5">{title}</Modal.Title>
        <Button 
          variant="link" 
          className="btn-close" 
          onClick={onHide}
          aria-label="Close"
        />
      </Modal.Header>
      <Modal.Body className="text-center pt-0 pb-0">
        <FaExclamationTriangle 
          size={48} 
          className="my-3" 
          style={{ color: getIconColor() }} 
        />
        <p>{message}</p>
      </Modal.Body>
      <Modal.Footer className="border-0 justify-content-center pt-0">
        <Button variant="light" onClick={onHide}>
          {cancelText}
        </Button>
        <Button variant={variant} onClick={handleConfirm}>
          {confirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmDialog;