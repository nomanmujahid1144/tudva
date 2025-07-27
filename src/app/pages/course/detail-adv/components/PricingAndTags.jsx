"use client";

import { currency } from "@/context/constants";
import { Button, Card, Col, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Row } from "react-bootstrap";
import { FaBookOpen, FaClock, FaCopy, FaFacebookSquare, FaGlobe, FaLinkedin, FaMedal, FaRegStar, FaShareAlt, FaSignal, FaStar, FaStarHalfAlt, FaTwitterSquare, FaUserClock } from "react-icons/fa";
import Sticky from 'react-sticky-el';
import Image from "next/image";
import avatar5 from '@/assets/images/avatar/05.jpg';
import useViewPort from "@/hooks/useViewPort";
const PriceCard = () => {
  return <Card className="card-body border p-4">
      <div className="d-flex justify-content-between align-items-center">
        <h3 className="fw-bold mb-0 me-2">{currency}295.55</h3>
        <Dropdown>
          <DropdownToggle as='a' className="btn btn-sm arrow-none btn-light rounded mb-0 small" role="button" aria-expanded="false">
            <FaShareAlt className="fa-fw" />
          </DropdownToggle>
          <DropdownMenu className="dropdown-w-sm dropdown-menu-end min-w-auto shadow rounded" aria-labelledby="dropdownShare">
            <li><DropdownItem href="#"><FaTwitterSquare className="me-2" />Twitter</DropdownItem></li>
            <li><DropdownItem href="#"><FaFacebookSquare className="me-2" />Facebook</DropdownItem></li>
            <li><DropdownItem href="#"><FaLinkedin className="me-2" />LinkedIn</DropdownItem></li>
            <li><DropdownItem href="#"><FaCopy className="me-2" />Copy link</DropdownItem></li>
          </DropdownMenu>
        </Dropdown>
      </div>
      <div className="mt-3 d-grid">
        <Button variant="outline-primary">Add to cart</Button>
        <Button variant="success">Buy now</Button>
      </div>
      <hr />
      <h5 className="mb-3">This course includes</h5>
      <ul className="list-group list-group-borderless border-0">
        <li className="list-group-item d-flex justify-content-between align-items-center">
          <span className="h6 fw-light mb-0"><FaBookOpen className="fa-fw text-primary me-1" />Lectures</span>
          <span>30</span>
        </li>
        <li className="list-group-item d-flex justify-content-between align-items-center">
          <span className="h6 fw-light mb-0"><FaClock className="fa-fw text-primary me-1" />Duration</span>
          <span>4h 50m</span>
        </li>
        <li className="list-group-item d-flex justify-content-between align-items-center">
          <span className="h6 fw-light mb-0"><FaSignal className="fa-fw text-primary me-1" />Skills</span>
          <span>Beginner</span>
        </li>
        <li className="list-group-item d-flex justify-content-between align-items-center">
          <span className="h6 fw-light mb-0"><FaGlobe className="fa-fw text-primary me-1" />Language</span>
          <span>English</span>
        </li>
        <li className="list-group-item d-flex justify-content-between align-items-center">
          <span className="h6 fw-light mb-0"><FaUserClock className="fa-fw text-primary me-1" />Deadline</span>
          <span>Nov 30 2021</span>
        </li>
        <li className="list-group-item d-flex justify-content-between align-items-center">
          <span className="h6 fw-light mb-0"><FaMedal className="fa-fw text-primary me-1" />Certificate</span>
          <span>Yes</span>
        </li>
      </ul>
      <hr />
      <div className="d-sm-flex align-items-center">
        <div className="avatar avatar-xl">
          <Image className="avatar-img rounded-circle" src={avatar5} alt="avatar" />
        </div>
        <div className="ms-sm-3 mt-2 mt-sm-0">
          <h5 className="mb-0"><a href="#">By Jacqueline Miller</a></h5>
          <p className="mb-0 small">Founder Eduport company</p>
        </div>
      </div>
      <div className="d-sm-flex justify-content-sm-between align-items-center mt-0 mt-sm-2">
        <ul className="list-inline mb-0">
          {Array(Math.floor(4.5)).fill(0).map((_star, idx) => <li key={idx} className="list-inline-item me-1 small"><FaStar size={14} className="text-warning" /></li>)}
          {!Number.isInteger(4.5) && <li className="list-inline-item me-1 small"> <FaStarHalfAlt size={14} className="text-warning" /> </li>}
          {4.5 < 5 && Array(5 - Math.ceil(4.5)).fill(0).map((_star, idx) => <li key={idx} className="list-inline-item me-1 small"><FaRegStar size={14} className="text-warning" /></li>)}
          <li className="list-inline-item ms-2 h6 fw-light mb-0">4.5/5.0</li>
        </ul>
        <Button variant="primary" size="sm" className="mb-0 mt-2 mt-sm-0">Follow</Button>
      </div>
    </Card>;
};
const PopularTags = () => {
  const tags = ["blog", "business", "theme", "bootstrap", "data science", "web development", "tips", "machine learning"];
  return <Card className="card-body border p-4">
      <h4 className="mb-3">Popular Tags</h4>
      <ul className="list-inline mb-0">
        {tags.map((tag, idx) => <li className="list-inline-item" key={idx}> <Button variant="outline-light" size="sm">{tag}</Button> </li>)}
      </ul>
    </Card>;
};
const PricingAndTags = () => {
  const {
    width
  } = useViewPort();
  return <Sticky disabled={width <= 768} topOffset={80} bottomOffset={0} boundaryElement="div.row" hideOnBoundaryHit={false} stickyStyle={{
    transition: '0.2s all linear'
  }}>
      <Row className="g-4">
        <Col md={6} xl={12}>
          <PriceCard />
        </Col>
        <Col md={6} xl={12}>
          <PopularTags />
        </Col>
      </Row>
    </Sticky>;
};
export default PricingAndTags;
