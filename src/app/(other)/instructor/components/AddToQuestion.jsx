import useToggle from '@/hooks/useToggle';
import React, { useEffect, useState } from 'react';
import { Button, Col, Form, Modal, ModalBody, ModalFooter, ModalHeader } from 'react-bootstrap';
import { BsPlusCircle, BsXLg } from 'react-icons/bs';
const AddToQuestion = ({ onAdd, faqToEdit, onUpdate }) => {
  const { isTrue, toggle } = useToggle();

  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  useEffect(() => {
    if (faqToEdit) {
      setQuestion(faqToEdit.question);
      setAnswer(faqToEdit.answer);
    } else {
      setQuestion("");
      setAnswer("");
    }
  }, [faqToEdit]);


  const handleSubmit = (e) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) {
      alert("Please enter both question and answer.");
      return;
    }

    if (faqToEdit) {
      // Update existing FAQ
      onUpdate(faqToEdit.id, { question, answer });
    } else {
      // Add new FAQ
      onAdd({ question, answer });
    }


    setQuestion('');
    setAnswer('');
    toggle();
  };


  return <>
    <Button variant='primary-soft' size='sm' onClick={toggle} className="mb-0" data-bs-toggle="modal" data-bs-target="#addQuestion"><BsPlusCircle className="me-2" />{faqToEdit? "Edit Question" : "Add Question"}</Button>
    <Modal className="fade" id="addQuestion" show={isTrue} onHide={toggle} tabIndex={-1} aria-labelledby="addQuestionLabel" aria-hidden="true">
      <ModalHeader className="bg-dark">
        <h5 className="modal-title text-white" id="addQuestionLabel">{faqToEdit? "Edit FAQ" : "Add FAQ"}</h5>
        <button type="button" className="btn btn-sm btn-light mb-0 ms-auto" data-bs-dismiss="modal" aria-label="Close" onClick={toggle}><BsXLg /></button>
      </ModalHeader>
      <ModalBody>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Question <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text"
              placeholder="Write a question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Answer <span className="text-danger">*</span></Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              placeholder="Write an answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />
          </Form.Group>
          <ModalFooter>
            <Button variant="danger-soft" onClick={toggle}>Close</Button>
            <Button variant="success" type="submit">{faqToEdit ? "Update FAQ" : "Save FAQ"}</Button>
          </ModalFooter>
        </Form>
      </ModalBody>
    </Modal>
  </>;
};
export default AddToQuestion;
