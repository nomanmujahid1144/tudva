import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { Card, CardBody, CardTitle } from 'react-bootstrap';
import { FaClipboardList, FaRegStar, FaStar, FaStarHalfAlt, FaUserGraduate } from 'react-icons/fa';
const InstructorCard = ({
  instructor
}) => {
  const {
    image,
    name,
    students,
    rating,
    subject,
    tasks
  } = instructor;
  return <Card className="bg-transparent">
      <div className="position-relative">
        <Image src={image} className="card-img" alt="course image" />
        <div className="card-img-overlay d-flex flex-column p-3">
          <div className="w-100 mt-auto text-end">
            <Link href="" className="badge text-bg-info rounded-1 me-1"><FaUserGraduate className="me-2" />{students}</Link>
            <Link href="" className="badge text-bg-orange rounded-1"><FaClipboardList className="me-2" />{tasks}</Link>
          </div>
        </div>
      </div>
      <CardBody className="text-center">
        <CardTitle><a href="#">{name}</a></CardTitle>
        <p className="mb-2">{subject}</p>
        <ul className="list-inline hstack justify-content-center">
          <li className="list-inline-item ms-2 h6 fw-light mb-0">{rating}/5.0</li>
          {Array(Math.floor(rating)).fill(0).map((_star, idx) => <li key={idx} className="list-inline-item me-1 small"><FaStar size={14} className="text-warning" /></li>)}
          {!Number.isInteger(rating) && <li className="list-inline-item me-1 small"> <FaStarHalfAlt size={14} className="text-warning" /> </li>}
          {rating < 5 && Array(5 - Math.ceil(rating)).fill(0).map((_star, idx) => <li key={idx} className="list-inline-item me-1 small"><FaRegStar size={14} className="text-warning" /></li>)}
        </ul>
      </CardBody>
    </Card>;
};
export default InstructorCard;
