'use client';

import React from 'react';
import useToggle from '@/hooks/useToggle';
import Image from 'next/image';
import { Button, CardBody, Collapse } from 'react-bootstrap';
import { studentReviewData } from '@/assets/data/other';
import { FaPaperPlane, FaRegStar, FaStar, FaStarHalfAlt } from 'react-icons/fa';
const ReviewCards = ({
  avatar,
  name,
  rating,
  time,
  description,
  reviewOn
}) => {
  const {
    isTrue: isOpen,
    toggle
  } = useToggle();
  return <>
        <div className="d-sm-flex">
          <Image className="avatar avatar-lg rounded-circle float-start me-3" src={avatar} alt="avatar" />
          <div>
            <div className="mb-3 d-sm-flex justify-content-sm-between align-items-center">
              <div>
                <h5 className="m-0">{name}</h5>
                <span className="me-3 small">{time.toLocaleDateString()} at {time.toLocaleTimeString()}</span>
              </div>
              <ul className="list-inline mb-0">
                {rating && <>
                    {Array(Math.floor(rating)).fill(0).map((_star, idx) => <li key={idx} className="list-inline-item me-1 small"><FaStar size={16} className="text-warning" /></li>)}
                    {!Number.isInteger(rating) && <li className="list-inline-item me-1 small"> <FaStarHalfAlt size={16} className="text-warning" /> </li>}
                    {rating < 5 && Array(5 - Math.ceil(rating)).fill(0).map((_star, idx) => <li key={idx} className="list-inline-item me-1 small"><FaRegStar size={16} className="text-warning" /></li>)}
                  </>}

              </ul>
            </div>
            <h6><span className="text-body fw-light">Review on:</span>&nbsp;{reviewOn}</h6>
            <p>{description}</p>
            <div className="text-end">
              <a href="#" className="btn btn-sm btn-primary-soft mb-1 mb-sm-0 me-1">Direct message</a>
              <Button onClick={toggle} aria-controls="example-collapse-text" className="btn btn-sm btn-light mb-0" role="button" aria-expanded="false">
                Reply
              </Button>
              <Collapse in={isOpen}>
              <div>
                <div className="d-flex mt-3">
                  <textarea className="form-control mb-0" placeholder="Add a comment..." rows={2} spellCheck="false" defaultValue={""} />
                  <button className="btn btn-sm btn-primary-soft ms-2 px-4 mb-0 flex-shrink-0"><FaPaperPlane className="fas fa-paper-plane fs-5" /></button>
                </div>
              </div>
              </Collapse>
            </div>
          </div>
        </div>
      </>;
};
const ReviewCard = () => {
  return <CardBody className="mt-2 mt-sm-4">
    {studentReviewData.map((item, idx) => <>
        <ReviewCards {...item} key={idx} />
        {studentReviewData.length - 1 != idx && <hr />}
        </>)}
  </CardBody>;
};
export default ReviewCard;
