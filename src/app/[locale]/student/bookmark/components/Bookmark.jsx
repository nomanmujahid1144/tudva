'use client';

import { coursesData } from '@/assets/data/products';
import useToggle from '@/hooks/useToggle';
import Image from 'next/image';
import React from 'react';
import { Card, CardBody, CardFooter, CardTitle, Col, Row } from 'react-bootstrap';
import { FaHeart, FaRegClock, FaRegHeart, FaRegStar, FaStar, FaStarHalfAlt, FaTable } from 'react-icons/fa';
const BookmarkCard = ({
  avatar,
  badge,
  category,
  rating,
  description,
  duration,
  id,
  image,
  label,
  lectures,
  name,
  title
}) => {
  const {
    isTrue: isOpen,
    toggle
  } = useToggle();
  return <Card className="shadow h-100">
      <Image src={image} className="card-img-top" alt="course image" />
      <CardBody className="pb-0">
        <div className="d-flex justify-content-between mb-2">
          <a href="#" className={`badge ${badge.class} bg-opacity-10`}>{badge.text}</a>
          <span role='button' className="text-danger" onClick={toggle}> {isOpen ? <FaHeart /> : <FaRegHeart />}</span>
        </div>
        <CardTitle className="fw-normal"><a href="#">{title}</a></CardTitle>
        <p className="mb-2 text-truncate-2">{description}</p>
        <ul className="list-inline mb-0 icons-center">
          {Array(Math.floor(rating.star)).fill(0).map((_star, idx) => <li key={idx} className="list-inline-item me-1 small"><FaStar size={14} className="text-warning" /></li>)}
          {!Number.isInteger(rating.star) && <li className="list-inline-item me-1 small"> <FaStarHalfAlt size={14} className="text-warning" /> </li>}
          {rating.star < 5 && Array(5 - Math.ceil(rating.star)).fill(0).map((_star, idx) => <li key={idx} className="list-inline-item me-1 small"><FaRegStar size={14} className="text-warning" /></li>)}
          <li className="list-inline-item ms-2 h6 fw-light mb-0">{rating.star}/ 5.0</li>
        </ul>
      </CardBody>
      <CardFooter className="pt-0 pb-3">
        <hr />
        <div className="d-flex justify-content-between">
          <span className="h6 fw-light mb-0"><FaRegClock className="text-danger me-2" />{duration}</span>
          <span className="h6 fw-light mb-0"><FaTable className="text-orange me-2" />{lectures} lectures</span>
        </div>
      </CardFooter>
    </Card>;
};
const Bookmark = () => {
  return <CardBody className="p-3 p-md-4">
      <Row className="g-4">
        {coursesData.slice(0, 6).map((item, idx) => <Col sm={6} lg={4} key={idx}>
              <BookmarkCard {...item} />
            </Col>)}
      </Row>
    </CardBody>;
};
export default Bookmark;
