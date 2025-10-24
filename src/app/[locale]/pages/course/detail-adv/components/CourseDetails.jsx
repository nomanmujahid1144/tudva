import { Card, CardBody, CardHeader, Col, Container, Row } from "react-bootstrap";
import { BsPatchExclamationFill } from "react-icons/bs";
import { FaGlobe, FaSignal, FaStar, FaUserGraduate } from "react-icons/fa";
import CourseDescription from "./CourseDescription";
import Curriculum from "./Curriculum";
import VideoPlayer from "./VideoPlayer";
import { faqsData } from "../data";
import PricingAndTags from "./PricingAndTags";
const Faqs = () => {
  return <Card className="border rounded-3">
      <CardHeader className="border-bottom">
        <h3 className="mb-0">Frequently Asked Questions</h3>
      </CardHeader>
      <CardBody>
        {faqsData.map((faq, idx) => <div className={`${idx == 0 ? 'mt-0' : 'mt-4'}`} key={idx}>
            <h6>{faq.question}</h6>
            <p className="mb-0">{faq.answer}</p>
          </div>)}
      </CardBody>
    </Card>;
};
const CourseDetails = () => {
  return <section className="pt-3 pt-xl-5">
      <Container data-sticky-container>
        <Row className="g-4">
          <Col xl={8}>
            <Row className="g-4">
              <Col xs={12}>
                <h2>The Complete Digital Marketing Course - 12 Courses in 1</h2>
                <p>Satisfied conveying a dependent contented he gentleman agreeable do be. Warrant private blushes removed an in equally totally if. Delivered dejection necessary objection do Mr prevailed. Mr feeling does chiefly cordial in do.</p>
                <ul className="list-inline mb-0">
                  <li className="list-inline-item fw-light h6 me-3 mb-1 mb-sm-0"><FaStar className="me-2" />4.5/5.0</li>
                  <li className="list-inline-item fw-light h6 me-3 mb-1 mb-sm-0"><FaUserGraduate className="me-2" />12k Enrolled</li>
                  <li className="list-inline-item fw-light h6 me-3 mb-1 mb-sm-0"><FaSignal className="me-2" />All levels</li>
                  <li className="list-inline-item fw-light h6 me-3 mb-1 mb-sm-0"><BsPatchExclamationFill className="me-2" />Last updated 09/2021</li>
                  <li className="list-inline-item fw-light h6"><FaGlobe className="me-2" />English</li>
                </ul>
              </Col>
              <Col xs={12} className="position-relative">
                <VideoPlayer />
              </Col>
              <Col xs={12}>
                <CourseDescription />
              </Col>
              <Col xs={12}>
                <Curriculum />
              </Col>
              <Col xs={12}>
                <Faqs />
              </Col>
            </Row>
          </Col>
          <Col xl={4}>
            <PricingAndTags />
          </Col>
        </Row>
      </Container>
    </section>;
};
export default CourseDetails;
