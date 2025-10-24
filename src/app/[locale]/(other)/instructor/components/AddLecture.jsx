'use client'

import useToggle from '@/hooks/useToggle';
import React from 'react';
import { Button, Col, Form, Modal, ModalBody, ModalFooter, ModalHeader } from 'react-bootstrap';
import { BsPlusCircle, BsXLg } from 'react-icons/bs';
import { useState } from 'react';
const AddLecture = () => {
  const { isTrue, toggle } = useToggle();

  const [lectureHeading, setLectureHeading] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!lectureHeading.trim()) {
      alert('Please enter a lecture heading.'); // Basic validation
      return;
    }
    onAdd(lectureHeading); // Call the onAdd prop with the heading
    setLectureHeading(''); // Clear the input
  };

  return <>
    <Button variant='primary-soft' size='sm' onClick={toggle} className="mb-0" data-bs-toggle="modal" data-bs-target="#addLecture"><BsPlusCircle className="me-2" />Add Lecture</Button>
    <Modal className="fade" show={isTrue} tabIndex={-1} aria-labelledby="addLectureLabel" aria-hidden="true">
      <ModalHeader className="bg-dark">
        <h5 className="modal-title text-white" id="addLectureLabel">Add Lecture</h5>
        <button type="button" className="btn btn-sm btn-light mb-0 ms-auto" data-bs-dismiss="modal" onClick={toggle} aria-label="Close"><BsXLg /></button>
      </ModalHeader>
      <ModalBody>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Lecture Group Name <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter lecture group name"
              value={lectureHeading}
              onChange={(e) => setLectureHeading(e.target.value)}
            />
          </Form.Group>
        </Form>
      </ModalBody>
      <ModalFooter>
        <button type="button" className="btn btn-danger-soft my-0" data-bs-dismiss="modal" onClick={toggle}>Close</button>
        <button type="button" className="btn btn-success my-0" onClick={handleSubmit}>Save Lecture</button>
      </ModalFooter>
    </Modal>
  </>;
};
export default AddLecture;
