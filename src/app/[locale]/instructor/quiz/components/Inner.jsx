import Image from 'next/image';
import React from 'react';
import cardImg from '@/assets/images/courses/4by3/01.jpg';
import { Accordion, AccordionBody, AccordionHeader, AccordionItem, Button, Card, CardBody, CardHeader, CardTitle, Col, Row } from 'react-bootstrap';
const Inner = () => {
  return <Card className="border bg-transparent rounded-3">
      <CardHeader className="bg-transparent border-bottom px-3">
        <Row className="g-4 align-items-center">
          <Col md={2}>
            <Image src={cardImg} className="rounded-2" alt="Card image" />
          </Col>
          <Col md={10}>
            <CardTitle as={'h3'} className="mb-0"><a href="#">The Complete Digital Marketing Course - 12 Courses in 1</a></CardTitle>
          </Col>
        </Row>
      </CardHeader>
      <CardBody className="p-4">
        <Accordion className="accordion-icon accordion-bg-light" id="accordionExample" defaultActiveKey={['0']}>
          <AccordionItem className="mb-3" eventKey="0">
            <AccordionHeader id="headingOne">
              <span className="text-secondary fw-bold me-3">01</span>
              <span className="fw-bold">How do you protect your business against cyber-crime?</span>
            </AccordionHeader>
            <AccordionBody className="mt-3">
              <p className="mb-3"><b className="text-dark">A</b> We have cybersecurity insurance coverage</p>
              <p className="mb-3"><b className="text-dark">B</b> Our dedicated staff will protect us</p>
              <p className="mb-3"><b className="text-dark">C</b> We give regular training for best practices</p>
              <p className="mb-3"><b className="text-dark">D</b> Third-party vendor protection</p>
              <Button variant='success-soft' size='sm' className="mb-0 me-1" data-bs-toggle="modal" data-bs-target="#editQuestion">Edit</Button>
              <button className="btn btn-danger-soft btn-sm mb-0">Delete</button>
            </AccordionBody>
          </AccordionItem>
          <AccordionItem eventKey="1" className=" mb-3">
            <AccordionHeader id="headingTwo">
              <span className="text-secondary fw-bold me-3">02</span>
              <span className="fw-bold">What is SEO?</span>
            </AccordionHeader>
            <AccordionBody className="mt-3">
              <p className="mb-3"><b className="text-dark">A</b> We have cybersecurity insurance coverage</p>
              <p className="mb-3"><b className="text-dark">B</b> Our dedicated staff will protect us</p>
              <p className="mb-3"><b className="text-dark">C</b> We give regular training for best practices</p>
              <p className="mb-3"><b className="text-dark">D</b> Third-party vendor protection</p>
              <Button variant='success-soft' size='sm' className="mb-0 me-1" data-bs-toggle="modal" data-bs-target="#editQuestion">Edit</Button>
              <button className="btn btn-danger-soft btn-sm mb-0">Delete</button>
            </AccordionBody>
          </AccordionItem>
          <AccordionItem eventKey="2" className=" mb-3">
            <AccordionHeader id="headingThree">
              <span className="text-secondary fw-bold me-3">03</span>
              <span className="fw-bold">Who should join this course?</span>
            </AccordionHeader>
            <AccordionBody className="mt-3">
              <p className="mb-3"><b className="text-dark">A</b> We have cybersecurity insurance coverage</p>
              <p className="mb-3"><b className="text-dark">B</b> Our dedicated staff will protect us</p>
              <p className="mb-3"><b className="text-dark">C</b> We give regular training for best practices</p>
              <p className="mb-3"><b className="text-dark">D</b> Third-party vendor protection</p>
              <Button variant='success-soft' size='sm' className="mb-0 me-1" data-bs-toggle="modal" data-bs-target="#editQuestion">Edit</Button>
              <button className="btn btn-danger-soft btn-sm mb-0">Delete</button>
            </AccordionBody>
          </AccordionItem>
          <AccordionItem eventKey="3">
            <AccordionHeader id="headingFour">
              <span className="text-secondary fw-bold me-3">04</span>
              <span className="fw-bold">What are the T&amp;C for this program?</span>
            </AccordionHeader>
            <AccordionBody className="mt-3">
              <p className="mb-3"><b className="text-dark">A</b> We have cybersecurity insurance coverage</p>
              <p className="mb-3"><b className="text-dark">B</b> Our dedicated staff will protect us</p>
              <p className="mb-3"><b className="text-dark">C</b> We give regular training for best practices</p>
              <p className="mb-3"><b className="text-dark">D</b> Third-party vendor protection</p>
              <Button variant='success-soft' className="mb-0 me-1" data-bs-toggle="modal" data-bs-target="#editQuestion">Edit</Button>
              <button className="btn btn-danger-soft btn-sm mb-0">Delete</button>
            </AccordionBody>
          </AccordionItem>
        </Accordion>
      </CardBody>
    </Card>;
};
export default Inner;
