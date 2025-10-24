"use client";

import useToggle from "@/hooks/useToggle";
import { splitArray } from "@/utils/array";
import { Card, CardBody, CardHeader, Col, Collapse, Row } from "react-bootstrap";
import { FaAngleDown, FaAngleUp, FaCheckCircle } from "react-icons/fa";
const CourseDescription = () => {
  const {
    isTrue,
    toggle
  } = useToggle();
  const features = ["Digital marketing course introduction", "Customer Life cycle", "What is Search engine optimization(SEO)", "Facebook ADS", "Facebook Messenger Chatbot", "Search engine optimization tools", "Why SEO", "URL Structure", "Featured Snippet", "SEO tips and tricks", "Google tag manager"];
  const featureChunks = splitArray(features, 2);
  return <Card className="border">
      <CardHeader className="border-bottom">
        <h3 className="mb-0">Course description</h3>
      </CardHeader>
      <CardBody>
        <p className="mb-3">Welcome to the <strong> Digital Marketing Ultimate Course Bundle - 12 Courses in 1 (Over 36 hours of content)</strong></p>
        <p className="mb-3">In this practical hands-on training, you’re going to learn to become a digital marketing expert with this <strong> ultimate course bundle that includes 12 digital marketing courses in 1!</strong></p>
        <p className="mb-0">If you wish to find out the skills that should be covered in a basic digital marketing course syllabus in India or anywhere around the world, then reading this blog will help. Before we delve into the advanced <strong><a href="#" className="text-reset text-decoration-underline">digital marketing course</a></strong> syllabus, let’s look at the scope of digital marketing and what the future holds.</p>
        <Collapse in={isTrue}>
          <div>
            <p className="my-3">We focus a great deal on the understanding of behavioral psychology and influence triggers which are crucial for becoming a well rounded Digital Marketer. We understand that theory is important to build a solid foundation, we understand that theory alone isn’t going to get the job done so that’s why this course is packed with practical hands-on examples that you can follow step by step.</p>
            <p className="mb-0">Behavioral psychology and influence triggers which are crucial for becoming a well rounded Digital Marketer. We understand that theory is important to build a solid foundation, we understand that theory alone isn’t going to get the job done so that’s why this course is packed with practical hands-on examples that you can follow step by step.</p>
          </div>
        </Collapse>
        <a className="p-0 mb-0 mt-2 btn-more d-flex align-items-center" onClick={toggle} href="#collapseContent" role="button" aria-expanded="false" aria-controls="collapseContent">
          See <span className="ms-1">{isTrue ? <>less <FaAngleUp className="ms-1" /></> : <>more <FaAngleDown className="ms-1" /></>} </span>
        </a>
        <h5 className="mt-4">What you’ll learn</h5>
        <Row className="mb-3">
          {featureChunks.map((chunk, idx) => <Col md={6} key={idx}>
              <ul className="list-group list-group-borderless">
                {chunk.map((feature, idx) => <li className="list-group-item h6 fw-light d-flex mb-0" key={idx}><FaCheckCircle className="text-success me-2" />{feature}</li>)}
              </ul>
            </Col>)}
        </Row>
        <p className="mb-0">As it so contrasted oh estimating instrument. Size like body some one had. Are conduct viewing boy minutes warrant the expense? Tolerably behavior may admit daughters offending her ask own. Praise effect wishes change way and any wanted. Lively use looked latter regard had. Do he it part more last in. </p>
      </CardBody>
    </Card>;
};
export default CourseDescription;
