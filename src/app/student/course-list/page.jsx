import ChoicesFormInput from '@/components/form/ChoicesFormInput';
import Image from 'next/image';
import { Button, Card, CardBody, CardHeader, Col, ProgressBar, Row } from 'react-bootstrap';
import { BsArrowRepeat, BsCheck, BsPlayCircle } from 'react-icons/bs';
import { FaAngleLeft, FaAngleRight, FaSearch } from 'react-icons/fa';
import { courseData } from './data';
export const metadata = {
  title: 'Course List Student'
};
const CourseData = ({
  completedLectures,
  image,
  name,
  totalLectures
}) => {
  const percentage = Math.trunc(completedLectures * 100 / totalLectures);
  return <tr>
      <td>
        <div className="d-flex align-items-center">
          <div className="w-100px">
            <Image src={image} className="rounded" alt='courses' />
          </div>
          <div className="mb-0 ms-2">
            <h6><a href="#">{name}</a></h6>
            <div className="overflow-hidden">

              <h6 className="mb-0 text-end">{percentage}%</h6>
              <ProgressBar now={percentage} className="progress progress-sm bg-opacity-10 aos" data-aos="slide-right" data-aos-delay={200} data-aos-duration={1000} data-aos-easing="ease-in-out" style={{
              width: '100%'
            }} aria-valuenow={100} aria-valuemin={0} aria-valuemax={100} />
            </div>
          </div>
        </div>
      </td>
      <td>{totalLectures}</td>
      <td>{completedLectures}</td>
      <td>
        {percentage === 100 ? <>
              <button className="btn btn-sm btn-success me-1 mb-1 mb-x;-0 disabled"><BsCheck className="me-1 icons-center" />Complete</button> &nbsp;
              <Button variant='light' size='sm' className="me-1"><BsArrowRepeat className="me-1 icons-center" />Restart</Button>
            </> : <Button variant='primary-soft' size='sm' className="me-1 mb-1 mb-md-0 icons-center"><BsPlayCircle className="me-1 " />Continue</Button>}

      </td>
    </tr>;
};
const CourseListPage = () => {
  return <Card className="bg-transparent border rounded-3">
      <CardHeader className="bg-transparent border-bottom">
        <h3 className="mb-0">My Courses List</h3>
      </CardHeader>
      <CardBody>
        <Row className="g-3 align-items-center justify-content-between mb-4">
          <Col md={8}>
            <form className="rounded position-relative">
              <input className="form-control pe-5 bg-transparent" type="search" placeholder="Search" aria-label="Search" />
              <button className="bg-transparent p-2 position-absolute top-50 end-0 translate-middle-y border-0 text-primary-hover text-reset" type="submit">
                <FaSearch className="fs-6 " />
              </button>
            </form>
          </Col>
          <Col md={3}>
            <form>
              <ChoicesFormInput className="form-select js-choice border-0 z-index-9 bg-transparent" aria-label=".form-select-sm">
                <option>Sort by</option>
                <option>Free</option>
                <option>Newest</option>
                <option>Most popular</option>
                <option>Most Viewed</option>
              </ChoicesFormInput>
            </form>
          </Col>
        </Row>
        <div className="table-responsive border-0">
          <table className="table table-dark-gray align-middle p-4 mb-0 table-hover">
            <thead>
              <tr>
                <th scope="col" className="border-0 rounded-start">Course Title</th>
                <th scope="col" className="border-0">Total Lectures</th>
                <th scope="col" className="border-0">Completed Lecture</th>
                <th scope="col" className="border-0 rounded-end">Action</th>
              </tr>
            </thead>
            {courseData.map((item, idx) => <tbody key={idx}>
                  <CourseData {...item} />
                </tbody>)}
          </table>
        </div>
        <div className="d-sm-flex justify-content-sm-between align-items-sm-center mt-4 mt-sm-3">
          <p className="mb-0 text-center text-sm-start">Showing 1 to 8 of 20 entries</p>
          <nav className="d-flex justify-content-center mb-0" aria-label="navigation">
            <ul className="pagination pagination-sm pagination-primary-soft d-inline-block d-md-flex rounded mb-0">
              <li className="page-item mb-0"><a className="page-link" href="#" tabIndex={-1}><FaAngleLeft className="icons-center" /></a></li>
              <li className="page-item mb-0"><a className="page-link" href="#">1</a></li>
              <li className="page-item mb-0 active"><a className="page-link" href="#">2</a></li>
              <li className="page-item mb-0"><a className="page-link" href="#">3</a></li>
              <li className="page-item mb-0"><a className="page-link" href="#"><FaAngleRight className="icons-center" /></a></li>
            </ul>
          </nav>
        </div>
      </CardBody>
    </Card>;
};
export default CourseListPage;
