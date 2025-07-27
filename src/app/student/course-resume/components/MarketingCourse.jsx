import { getAllCourseResume } from '@/helpers/data';
import Image from 'next/image';
import { Accordion, AccordionBody, AccordionHeader, AccordionItem, Button, Card, CardBody, CardHeader, CardTitle, Col, Row } from 'react-bootstrap';
import { BsLockFill, BsPencilSquare, BsPlayFill, BsTrashFill } from 'react-icons/bs';
import { FaPlay, FaRegClock, FaSignal, FaTable } from 'react-icons/fa';
const CourseNote = () => {
  return <>
      <a className="btn btn-xs btn-warning mb-0" data-bs-toggle="collapse" href="#addnote-1" role="button" aria-expanded="false" aria-controls="addnote-1">
        <BsPencilSquare className="me-2" />Note
      </a>&nbsp;
      <a href="#" className="btn btn-xs btn-dark mb-0">Play again</a>
      <div className="collapse" id="addnote-1">
        <Card className="card-body p-0 mt-2">
          <div className="d-flex justify-content-between bg-light rounded-2 p-2 mb-2">
            <div className="d-flex align-items-center">
              <span className="badge bg-dark me-2">5:20</span>
              <h6 className="d-inline-block text-truncate w-100px w-sm-200px mb-0 fw-light">Describe SEO Engine</h6>
            </div>
            <div className="d-flex">
              <Button variant='light' size='sm' className="btn-round me-2 mb-0"><BsPlayFill /></Button>
              <Button variant='light' size='sm' className="btn-round mb-0"><BsTrashFill /></Button>
            </div>
          </div>
          <div className="d-flex justify-content-between bg-light rounded-2 p-2 mb-2">
            <div className="d-flex align-items-center">
              <span className="badge bg-dark me-2">10:20</span>
              <h6 className="d-inline-block text-truncate w-100px w-sm-200px mb-0 fw-light">Know about all marketing</h6>
            </div>
            <div className="d-flex">
              <Button variant='light' size='sm' className="btn-round me-2 mb-0"><BsPlayFill /></Button>
              <Button variant='light' size='sm' className="btn-round mb-0"><BsTrashFill /></Button>
            </div>
          </div>
        </Card>
      </div>
    </>;
};
const CourseResumeCard = ({
  courseId,
  id,
  playlist,
  course
}) => {
  return <Card className="border">
      <CardHeader className="border-bottom">
        <Card>
          <Row className="g-0">
            <Col md={3}>
              {course?.image && <Image src={course.image} className="rounded-2" alt="Card image" />}
            </Col>
            <Col md={9}>
              <CardBody>
                <CardTitle as={'h3'}><a href="#">{course?.name}</a></CardTitle>
                <ul className="list-inline mb-2 ">
                  <li className="list-inline-item h6 fw-light mb-1 mb-sm-0 icons-center"><FaRegClock className="text-danger me-2" />6h 56m</li>&nbsp;
                  <li className="list-inline-item h6 fw-light mb-1 mb-sm-0 icons-center"><FaTable className="text-orange me-2" />{course?.lectures} lectures</li>&nbsp;
                  <li className="list-inline-item h6 fw-light icons-center"><FaSignal className="text-success me-2" />Beginner</li>
                </ul>
                <Button variant='primary-soft' size='sm' className="mb-0">Resume course</Button>
              </CardBody>
            </Col>
          </Row>
        </Card>
      </CardHeader>
      <CardBody>
        <h5>Course Curriculum</h5>
        <Accordion className="accordion-icon accordion-bg-light" id="accordionExample2">
          {playlist.map((item, idx) => <AccordionItem eventKey={`${idx}`} className="mb-3" key={idx}>
              <AccordionHeader className=" font-base" id="heading-1">
                <div className="fw-bold rounded collapsed d-block pe-4" data-bs-toggle="collapse" data-bs-target="#collapse-1" aria-expanded="true" aria-controls="collapse-1">
                  <span className="mb-0">{item.title}</span>
                  <span className="small d-block mt-1">(3 Lectures)</span>
                </div>
              </AccordionHeader>
              <AccordionBody className="mt-3">
                <div className="vstack gap-3">
                  <div className="overflow-hidden">
                    <div className="d-flex justify-content-between">
                      <p className="mb-1 h6">1/2 Completed</p>
                      <h6 className="mb-1 text-end">80%</h6>
                    </div>
                    <div className="progress progress-sm bg-primary bg-opacity-10">
                      <div className="progress-bar bg-primary aos" role="progressbar" data-aos="slide-right" data-aos-delay={200} data-aos-duration={1000} data-aos-easing="ease-in-out" style={{
                    width: '80%'
                  }} aria-valuenow={80} aria-valuemin={0} aria-valuemax={100}>
                      </div>
                    </div>
                  </div>
                  {item.lectures.map((lecture, idx) => <div key={idx}>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <div className="position-relative d-flex align-items-center">

                            {lecture.isPremium ? <a href="#" className="btn btn-light btn-round btn-sm mb-0 stretched-link position-static">
                                  <BsLockFill className="me-0" />
                                </a> : <Button variant={lecture.isNote ? "success" : "danger-soft"} size='sm' className="btn-round mb-0 stretched-link position-static">
                                  <FaPlay className="me-0" size={11} />
                                </Button>}
                            <span className="d-inline-block text-truncate ms-2 mb-0 h6 fw-light w-150px w-sm-200px">{lecture.title}</span>
                          </div>
                          <p className="mb-0 text-truncate">{lecture.time}</p>
                        </div>

                        {lecture.isNote && <CourseNote />}

                        {item.lectures.length - 1 != idx && <hr className="mb-0" />}

                      </div>)}
                </div>
              </AccordionBody>
            </AccordionItem>)}
        </Accordion>
      </CardBody>
    </Card>;
};
const MarketingCourse = async () => {
  const allCourseResume = await getAllCourseResume();
  return <>
      {allCourseResume.map((item, idx) => <CourseResumeCard key={idx} {...item} />)}
    </>;
};
export default MarketingCourse;
