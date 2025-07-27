import ChoicesFormInput from '@/components/form/ChoicesFormInput';
import Image from 'next/image';
import React from 'react';
import avatar1 from '@/assets/images/avatar/01.jpg';
import avatar3 from '@/assets/images/avatar/03.jpg';
import avatar4 from '@/assets/images/avatar/04.jpg';
import avatar6 from '@/assets/images/avatar/06.jpg';
import avatar7 from '@/assets/images/avatar/07.jpg';
import avatar9 from '@/assets/images/avatar/09.jpg';
import { FaAngleLeft, FaAngleRight, FaBan, FaMapMarkerAlt, FaRegEnvelope, FaSearch } from 'react-icons/fa';
import { Button, Card, CardBody, CardHeader, Col, Row } from 'react-bootstrap';
export const metadata = {
  title: 'Student List'
};
const StudentListPage = () => {
  return <Card className="border bg-transparent rounded-3">
      <CardHeader className="bg-transparent border-bottom">
        <h3 className="mb-0">My Students List</h3>
      </CardHeader>
      <CardBody>
        <Row className="g-3 align-items-center justify-content-between mb-4">
          <Col md={8}>
            <form className="rounded position-relative">
              <input className="form-control pe-5 bg-transparent" type="search" placeholder="Search" aria-label="Search" />
              <button className="bg-transparent p-2 position-absolute top-50 end-0 translate-middle-y border-0 text-primary-hover text-reset" type="submit">
                <FaSearch className="fas fa-search fs-6 " />
              </button>
            </form>
          </Col>
          <Col md={3}>
            <form>
              <ChoicesFormInput className="form-select js-choice border-0 z-index-9 bg-transparent" aria-label=".form-select-sm">
                <option>Sort by</option>
                <option>Free</option>
                <option>Newest</option>
                <option>Oldest</option>
              </ChoicesFormInput>
            </form>
          </Col>
        </Row>
        <div className="table-responsive border-0">
          <table className="table table-dark-gray align-middle p-4 mb-0 table-hover">
            <thead>
              <tr>
                <th scope="col" className="border-0 rounded-start">Student name</th>
                <th scope="col" className="border-0">Progress</th>
                <th scope="col" className="border-0">Courses</th>
                <th scope="col" className="border-0">Enrolled date</th>
                <th scope="col" className="border-0 rounded-end">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div className="d-flex align-items-center position-relative">
                    <div className="avatar avatar-md mb-2 mb-md-0">
                      <Image src={avatar1} className="rounded" alt='avatar' />
                    </div>
                    <div className="mb-0 ms-2">
                      <h6 className="mb-0"><a href="#" className="stretched-link">Lori Stevens</a></h6>
                      <span className="text-body small"><FaMapMarkerAlt className="me-1 " />Mumbai</span>
                    </div>
                  </div>
                </td>
                <td className="text-center text-sm-start">
                  <div className=" overflow-hidden">
                    <h6 className="mb-0">85%</h6>
                    <div className="progress progress-sm bg-primary bg-opacity-10">
                      <div className="progress-bar bg-primary aos" role="progressbar" data-aos="slide-right" data-aos-delay={200} data-aos-duration={1000} data-aos-easing="ease-in-out" style={{
                      width: '85%'
                    }} aria-valuenow={85} aria-valuemin={0} aria-valuemax={100}>
                      </div>
                    </div>
                  </div>
                </td>
                <td>10</td>
                <td>4/1/2023</td>
                <td>
                  <Button variant='success-soft' className="btn-round me-2 mb-0 flex-centered" data-bs-toggle="tooltip" data-bs-placement="top" title="Message"><FaRegEnvelope size={15} className="far fa-envelope" /></Button>
                  <button className="btn btn-danger-soft btn-round mb-0 flex-centered" data-bs-toggle="tooltip" data-bs-placement="top" title="Block"><FaBan size={15} className="fas fa-ban" /></button>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="d-flex align-items-center position-relative">
                    <div className="avatar avatar-md mb-2 mb-md-0">
                      <Image src={avatar3} className="rounded" alt='avatar' />
                    </div>
                    <div className="mb-0 ms-2">
                      <h6 className="mb-0"><a href="#" className="stretched-link">Dennis Barrett</a></h6>
                      <span className="text-body small"><FaMapMarkerAlt className="me-1" />New york</span>
                    </div>
                  </div>
                </td>
                <td className="text-center text-sm-start">
                  <div className=" overflow-hidden">
                    <h6 className="mb-0">40%</h6>
                    <div className="progress progress-sm bg-primary bg-opacity-10">
                      <div className="progress-bar bg-primary aos" role="progressbar" data-aos="slide-right" data-aos-delay={200} data-aos-duration={1000} data-aos-easing="ease-in-out" style={{
                      width: '40%'
                    }} aria-valuenow={40} aria-valuemin={0} aria-valuemax={100}>
                      </div>
                    </div>
                  </div>
                </td>
                <td>12</td>
                <td>9/1/2023</td>
                <td>
                  <a href="#" className="btn btn-success-soft btn-round me-2 mb-0 flex-centered" data-bs-toggle="tooltip" data-bs-placement="top" title="Message"><FaRegEnvelope className="far fa-envelope" /></a>
                  <button className="btn btn-danger btn-round mb-0 flex-centered" data-bs-toggle="tooltip" data-bs-placement="top" title="Unblock"><FaBan className="fas fa-ban" /></button>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="d-flex align-items-center position-relative">
                    <div className="avatar avatar-md mb-2 mb-md-0">
                      <Image src={avatar4} className="rounded" alt='avatar' />
                    </div>
                    <div className="mb-0 ms-2">
                      <h6 className="mb-0"><a href="#" className="stretched-link">Billy Vasquez</a></h6>
                      <span className="text-body small"><FaMapMarkerAlt className="me-1" />Paris</span>
                    </div>
                  </div>
                </td>
                <td className="text-center text-sm-start">
                  <div className=" overflow-hidden">
                    <h6 className="mb-0">62%</h6>
                    <div className="progress progress-sm bg-primary bg-opacity-10">
                      <div className="progress-bar bg-primary aos" role="progressbar" data-aos="slide-right" data-aos-delay={200} data-aos-duration={1000} data-aos-easing="ease-in-out" style={{
                      width: '62%'
                    }} aria-valuenow={62} aria-valuemin={0} aria-valuemax={100}>
                      </div>
                    </div>
                  </div>
                </td>
                <td>08</td>
                <td>10/1/2023</td>
                <td>
                  <a href="#" className="btn btn-success-soft btn-round me-2 mb-0 flex-centered" data-bs-toggle="tooltip" data-bs-placement="top" title="Message"><FaRegEnvelope className="far fa-envelope" /></a>
                  <button className="btn btn-danger-soft btn-round mb-0 flex-centered" data-bs-toggle="tooltip" data-bs-placement="top" title="Block"><FaBan className="fas fa-ban" /></button>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="d-flex align-items-center position-relative">
                    <div className="avatar avatar-md mb-2 mb-md-0">
                      <Image src={avatar9} className="rounded" alt='avatar' />
                    </div>
                    <div className="mb-0 ms-2">
                      <h6 className="mb-0"><a href="#" className="stretched-link">Carolyn Ortiz</a></h6>
                      <span className="text-body small"><FaMapMarkerAlt className="me-1" />Delhi</span>
                    </div>
                  </div>
                </td>
                <td className="text-center text-sm-start">
                  <div className=" overflow-hidden">
                    <h6 className="mb-0">60%</h6>
                    <div className="progress progress-sm bg-primary bg-opacity-10">
                      <div className="progress-bar bg-primary aos" role="progressbar" data-aos="slide-right" data-aos-delay={200} data-aos-duration={1000} data-aos-easing="ease-in-out" style={{
                      width: '60%'
                    }} aria-valuenow={60} aria-valuemin={0} aria-valuemax={100}>
                      </div>
                    </div>
                  </div>
                </td>
                <td>06</td>
                <td>20/1/2023</td>
                <td>
                  <a href="#" className="btn btn-success-soft btn-round me-2 mb-0 flex-centered" data-bs-toggle="tooltip" data-bs-placement="top" title="Message"><FaRegEnvelope className="far fa-envelope" /></a>
                  <button className="btn btn-danger-soft btn-round mb-0 flex-centered" data-bs-toggle="tooltip" data-bs-placement="top" title="Block"><FaBan className="fas fa-ban" /></button>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="d-flex align-items-center position-relative">
                    <div className="avatar avatar-md mb-2 mb-md-0">
                      <Image src={avatar7} className="rounded" alt='avatar' />
                    </div>
                    <div className="mb-0 ms-2">
                      <h6 className="mb-0"><a href="#" className="stretched-link">Larry Lawson</a></h6>
                      <span className="text-body small"><FaMapMarkerAlt className="me-1 " />London</span>
                    </div>
                  </div>
                </td>
                <td className="text-center text-sm-start">
                  <div className=" overflow-hidden">
                    <h6 className="mb-0">35%</h6>
                    <div className="progress progress-sm bg-primary bg-opacity-10">
                      <div className="progress-bar bg-primary aos" role="progressbar" data-aos="slide-right" data-aos-delay={200} data-aos-duration={1000} data-aos-easing="ease-in-out" style={{
                      width: '35%'
                    }} aria-valuenow={35} aria-valuemin={0} aria-valuemax={100}>
                      </div>
                    </div>
                  </div>
                </td>
                <td>04</td>
                <td>12/1/2023</td>
                <td>
                  <a href="#" className="btn btn-success-soft btn-round me-2 mb-0 flex-centered" data-bs-toggle="tooltip" data-bs-placement="top" title="Message"><FaRegEnvelope className="far fa-envelope" /></a>
                  <button className="btn btn-danger-soft btn-round mb-0 flex-centered" data-bs-toggle="tooltip" data-bs-placement="top" title="Block"><FaBan className="fas fa-ban" /></button>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="d-flex align-items-center position-relative">
                    <div className="avatar avatar-md mb-2 mb-md-0">
                      <Image src={avatar6} className="rounded" alt='avatar' />
                    </div>
                    <div className="mb-0 ms-2">
                      <h6 className="mb-0"><a href="#" className="stretched-link">Frances Guerrero</a></h6>
                      <span className="text-body small"><FaMapMarkerAlt className="me-1 " />Pune</span>
                    </div>
                  </div>
                </td>
                <td className="text-center text-sm-start">
                  <div className=" overflow-hidden">
                    <h6 className="mb-0">42%</h6>
                    <div className="progress progress-sm bg-primary bg-opacity-10">
                      <div className="progress-bar bg-primary aos" role="progressbar" data-aos="slide-right" data-aos-delay={200} data-aos-duration={1000} data-aos-easing="ease-in-out" style={{
                      width: '42%'
                    }} aria-valuenow={42} aria-valuemin={0} aria-valuemax={100}>
                      </div>
                    </div>
                  </div>
                </td>
                <td>14</td>
                <td>8/1/2023</td>
                <td>
                  <a href="#" className="btn btn-success-soft btn-round me-2 mb-0 flex-centered" data-bs-toggle="tooltip" data-bs-placement="top" title="Message"><FaRegEnvelope className="far fa-envelope" /></a>
                  <button className="btn btn-danger-soft btn-round mb-0 flex-centered" data-bs-toggle="tooltip" data-bs-placement="top" title="Block"><FaBan className="fas fa-ban" /></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="d-sm-flex justify-content-sm-between align-items-sm-center mt-4 mt-sm-3">
          <p className="mb-0 text-center text-sm-start">Showing 1 to 8 of 20 entries</p>
          <nav className="d-flex justify-content-center mb-0" aria-label="navigation">
            <ul className="pagination pagination-sm pagination-primary-soft d-inline-block d-md-flex rounded mb-0">
              <li className="page-item mb-0"><a className="page-link" href="#" tabIndex={-1}><FaAngleLeft className="fas fa-angle-left" /></a></li>
              <li className="page-item mb-0"><a className="page-link" href="#">1</a></li>
              <li className="page-item mb-0 active"><a className="page-link" href="#">2</a></li>
              <li className="page-item mb-0"><a className="page-link" href="#">3</a></li>
              <li className="page-item mb-0"><a className="page-link" href="#"><FaAngleRight className="fas fa-angle-right" /></a></li>
            </ul>
          </nav>
        </div>
      </CardBody>
    </Card>;
};
export default StudentListPage;
