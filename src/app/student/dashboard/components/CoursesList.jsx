import ChoicesFormInput from '@/components/form/ChoicesFormInput';
import Image from 'next/image';
import React from 'react';
import courses8 from '@/assets/images/courses/4by3/08.jpg';
import courses3 from '@/assets/images/courses/4by3/03.jpg';
import courses5 from '@/assets/images/courses/4by3/05.jpg';
import courses1 from '@/assets/images/courses/4by3/01.jpg';
import courses2 from '@/assets/images/courses/4by3/02.jpg';
import { BsArrowRepeat, BsCheck, BsPlayCircle } from 'react-icons/bs';
import { FaAngleLeft, FaAngleRight, FaSearch } from 'react-icons/fa';
import { Button, Card, CardBody, CardHeader, Col, Row } from 'react-bootstrap';
const CoursesList = () => {
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
                <FaSearch />
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
            <tbody>
              <tr>
                <td>
                  <div className="d-flex align-items-center">
                    <div className="w-100px">
                      <Image src={courses8} className="rounded" alt='courses' />
                    </div>
                    <div className="mb-0 ms-2">
                      <h6><a href="#">Building Scalable APIs with GraphQL</a></h6>
                      <div className="overflow-hidden">
                        <h6 className="mb-0 text-end">85%</h6>
                        <div className="progress progress-sm bg-primary bg-opacity-10">
                          <div className="progress-bar bg-primary aos" role="progressbar" data-aos="slide-right" data-aos-delay={200} data-aos-duration={1000} data-aos-easing="ease-in-out" style={{
                          width: '85%'
                        }} aria-valuenow={85} aria-valuemin={0} aria-valuemax={100}>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
                <td>56</td>
                <td>40</td>
                <td>
                  <Button variant='primary-soft' size='sm' className="me-1 mb-1 mb-md-0"><BsPlayCircle className="me-1 icons-center" />Continue</Button>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="d-flex align-items-center">
                    <div className="w-100px">
                      <Image src={courses3} className="rounded" alt='courses' />
                    </div>
                    <div className="mb-0 ms-2">
                      <h6><a href="#">Create a Design System in Figma</a></h6>
                      <div className="overflow-hidden">
                        <h6 className="mb-0 text-end">100%</h6>
                        <div className="progress progress-sm bg-primary bg-opacity-10">
                          <div className="progress-bar bg-primary aos" role="progressbar" data-aos="slide-right" data-aos-delay={200} data-aos-duration={1000} data-aos-easing="ease-in-out" style={{
                          width: '100%'
                        }} aria-valuenow={100} aria-valuemin={0} aria-valuemax={100}>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
                <td>42</td>
                <td>42</td>
                <td>
                  <button className="btn btn-sm btn-success me-1 mb-1 mb-x;-0 disabled"><BsCheck className="me-1 icons-center" />Complete</button>
                  <Button variant='light' size='sm' className="me-1"><BsArrowRepeat className="me-1 icons-center" />Restart</Button>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="d-flex align-items-center">
                    <div className="w-100px">
                      <Image src={courses5} className="rounded" alt='courses' />
                    </div>
                    <div className="mb-0 ms-2">
                      <h6><a href="#">The Complete Web Development in python</a></h6>
                      <div className="overflow-hidden">
                        <h6 className="mb-0 text-end">60%</h6>
                        <div className="progress progress-sm bg-primary bg-opacity-10">
                          <div className="progress-bar bg-primary aos" role="progressbar" data-aos="slide-right" data-aos-delay={200} data-aos-duration={1000} data-aos-easing="ease-in-out" style={{
                          width: '60%'
                        }} aria-valuenow={60} aria-valuemin={0} aria-valuemax={100}>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
                <td>28</td>
                <td>12</td>
                <td>
                  <Button variant='primary-soft' size='sm' className="me-1 mb-1 mb-md-0"><BsPlayCircle className="me-1 icons-center" />Continue</Button>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="d-flex align-items-center">
                    <div className="w-100px">
                      <Image src={courses1} className="rounded" alt="courses" />
                    </div>
                    <div className="mb-0 ms-2">
                      <h6><a href="#">Digital Marketing Masterclass</a></h6>
                      <div className="overflow-hidden">
                        <h6 className="mb-0 text-end">40%</h6>
                        <div className="progress progress-sm bg-primary bg-opacity-10">
                          <div className="progress-bar bg-primary aos" role="progressbar" data-aos="slide-right" data-aos-delay={200} data-aos-duration={1000} data-aos-easing="ease-in-out" style={{
                          width: '40%'
                        }} aria-valuenow={40} aria-valuemin={0} aria-valuemax={100}>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
                <td>32</td>
                <td>18</td>
                <td>
                  <Button variant='primary-soft' size='sm' className="me-1 mb-1 mb-md-0"><BsPlayCircle className="me-1 icons-center" />Continue</Button>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="d-flex align-items-center">
                    <div className="w-100px">
                      <Image src={courses2} className="rounded" alt='courses' />
                    </div>
                    <div className="mb-0 ms-2">
                      <h6><a href="#">Graphic Design Masterclass</a></h6>
                      <div className="overflow-hidden">
                        <h6 className="mb-0 text-end">90%</h6>
                        <div className="progress progress-sm bg-primary bg-opacity-10">
                          <div className="progress-bar bg-primary aos" role="progressbar" data-aos="slide-right" data-aos-delay={200} data-aos-duration={1000} data-aos-easing="ease-in-out" style={{
                          width: '90%'
                        }} aria-valuenow={90} aria-valuemin={0} aria-valuemax={100}>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
                <td>16</td>
                <td>14</td>
                <td>
                  <Button variant='primary-soft' size='sm' className="me-1 mb-1 mb-md-0"><BsPlayCircle className="me-1 icons-center" />Continue</Button>
                </td>
              </tr>
            </tbody>
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
export default CoursesList;
