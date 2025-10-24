'use client'

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, Col, Container, Row } from 'react-bootstrap';
import { FaSlidersH } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import patternImg from '@/assets/images/pattern/04.png';
import placeholderAvatar from '../../../../public/assets/images/avatar/placeholder.svg';
import { BannerSkeleton } from '@/components/skeletons/BannerSkeleton';

const Banner = ({ toggleOffCanvas }) => {
  const { user, loading } = useAuth();

  // Show skeleton while loading
  if (loading) {
    return <BannerSkeleton patternImg={patternImg} />;
  }

  // Safe fallbacks for user data
  const profilePicture = user?.profilePicture;
  const userName = user?.fullName || "Guest Instructor";

  return (
    <section className="pt-0">
      <Container fluid className="px-0">
        <Card
          className="bg-blue h-100px h-md-200px rounded-0"
          style={{
            background: `url(${patternImg.src}) no-repeat center center`,
            backgroundSize: 'cover',
          }}
        />
      </Container>

      <Container className="mt-n4">
        <Row>
          <Col xs={12}>
            <Card className="bg-transparent card-body pb-0 px-0 mt-2 mt-sm-0">
              <Row className="d-sm-flex justify-sm-content-between mt-2 mt-md-0">
                {/* Profile Avatar */}
                <Col xs={'auto'}>
                  <div className="avatar avatar-xxl position-relative mt-n3">
                    {profilePicture ? (
                      <img
                        className="avatar-img rounded-circle border border-white border-3 shadow"
                        src={profilePicture}
                        alt={`${userName}'s profile`}
                        width={100}
                        height={100}
                        onError={(e) => {
                          console.log('Image failed to load, using default avatar');
                          e.target.src = placeholderAvatar.src || '/assets/images/avatar/placeholder.svg';
                        }}
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <div 
                        className="avatar-img rounded-circle border border-white shadow bg-light d-flex align-items-center justify-content-center mx-auto"
                        style={{ fontSize: '4rem', border: '4px solid #f8f9fa' }}
                      >
                        {(userName || 'User').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </Col>

                {/* Instructor Info & Stats */}
                <Col className="d-sm-flex justify-content-between align-items-center">
                  <div>
                    <h1 className="my-1 fs-4">{userName}</h1>
                    <ul className="list-inline mb-0">
                      <li className="list-inline-item me-3 mb-1 mb-sm-0">
                        <span className="h6">255</span>
                        <span className="text-body fw-light"> points</span>
                      </li>
                      <li className="list-inline-item me-3 mb-1 mb-sm-0">
                        <span className="h6">7</span>
                        <span className="text-body fw-light"> Created courses</span>
                      </li>
                      <li className="list-inline-item me-3 mb-1 mb-sm-0">
                        <span className="h6">52</span>
                        <span className="text-body fw-light"> Students enrolled</span>
                      </li>
                    </ul>
                  </div>
                  <div className="mt-2 mt-sm-0">
                    <Link href="/instructor/create-course" className="btn btn-outline-primary mb-0">
                      Create Course
                    </Link>
                  </div>
                </Col>
              </Row>
            </Card>

            {/* Mobile Menu Toggle */}
            <hr className="d-xl-none" />
            <Col xs={12} xl={3} className="d-flex justify-content-between align-items-center">
              <a className="h6 mb-0 fw-bold d-xl-none" href="#">
                Menu
              </a>
              <button
                onClick={toggleOffCanvas}
                className="btn btn-primary d-xl-none"
                type="button"
                aria-controls="offcanvasSidebar"
              >
                <FaSlidersH />
              </button>
            </Col>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Banner;