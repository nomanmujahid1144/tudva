"use client";

import { Button, Card, CardBody, CardHeader, Col, Collapse, Row } from "react-bootstrap";
import { Fragment } from "react";
import { FaAngleDown, FaAngleUp, FaPlay } from "react-icons/fa";
import { BsLockFill } from "react-icons/bs";
import useToggle from "@/hooks/useToggle";
import { curriculumData } from "../data";
const Curriculum = () => {
  const {
    isTrue: isOpen,
    toggle
  } = useToggle();
  return <Card className="border rounded-3">
      <CardHeader className="border-bottom">
        <h3 className="mb-0">Curriculum</h3>
      </CardHeader>
      <CardBody>
        <Row className="g-5">
          {curriculumData.slice(0, 2).map((item, idx) => <Col xs={12} key={idx}>
              <h5 className="mb-4">Introduction of Digital Marketing ({item.lectures.length} lectures)</h5>
              {item.lectures.map((lecture, idx) => <Fragment key={idx}>
                  <div className="d-sm-flex justify-content-sm-between align-items-center" key={idx}>
                    <div className="d-flex">
                      {lecture.isPremium ? <Button variant="light" className="btn btn-round mb-0 flex-shrink-0 flex-centered"><BsLockFill size={16} /></Button> : <Button variant="danger-soft" className="btn btn-round mb-0 flex-centered"><FaPlay size={16} /></Button>}

                      <div className="ms-2 ms-sm-3 mt-1 mt-sm-0">
                        <h6 className="mb-0">{lecture.title}</h6>
                        <p className="mb-2 mb-sm-0 small">{lecture.time}</p>
                      </div>
                    </div>
                    <Button size="sm" variant={lecture.isPremium ? "orange" : "success"} className="mb-0">{lecture.isPremium ? "Premium" : "Play"}</Button>
                  </div>
                  {item.lectures.length - 1 != idx && <hr />}
                </Fragment>)}
            </Col>)}
          <Collapse in={isOpen} className="mt-0">
            <div>
              {curriculumData.slice(3).map((item, idx) => <Col xs={12} key={idx} className="mt-5">
                  <h5 className="mb-4">Introduction of Digital Marketing ({item.lectures.length} lectures)</h5>
                  {item.lectures.map((lecture, idx) => <Fragment key={idx}>
                      <div className="d-sm-flex justify-content-sm-between align-items-center" key={idx}>
                        <div className="d-flex">
                          {lecture.isPremium ? <Button variant="light" className="btn btn-round mb-0 flex-shrink-0 flex-centered"><BsLockFill size={16} /></Button> : <Button variant="danger-soft" className="btn btn-round mb-0 flex-centered"><FaPlay size={16} /></Button>}

                          <div className="ms-2 ms-sm-3 mt-1 mt-sm-0">
                            <h6 className="mb-0">{lecture.title}</h6>
                            <p className="mb-2 mb-sm-0 small">{lecture.time}</p>
                          </div>
                        </div>
                        <Button size="sm" variant={lecture.isPremium ? "orange" : "success"} className="mb-0">{lecture.isPremium ? "Premium" : "Play"}</Button>
                      </div>
                      {item.lectures.length - 1 != idx && <hr />}
                    </Fragment>)}
                </Col>)}
            </div>
          </Collapse>
          <a onClick={toggle} className="mb-0 mt-4 btn-more d-flex align-items-center justify-content-center" href="#collapseCourse" role="button" aria-expanded="false" aria-controls="collapseCourse">
            See <span className="mx-1">{isOpen ? <>less video <FaAngleUp className="ms-1" /></> : <>more video <FaAngleDown className="ms-1" /></>} </span>
          </a>
        </Row>
      </CardBody>
    </Card>;
};
export default Curriculum;
