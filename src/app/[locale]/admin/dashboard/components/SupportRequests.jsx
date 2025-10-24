'use client';

import { colorVariants } from '@/context/constants';
import { timeSince } from '@/utils/date';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import axiosInstance from '@/utils/axiosInstance';
import { checkIsLoggedInUser } from '@/helpers/checkLoggedInUser';
import { Card, CardBody, CardHeader, Col } from 'react-bootstrap';

const SupportRequestsCard = ({
  description,
  name,
  time,
  image
}) => {
  var randomItem = colorVariants[Math.floor(Math.random() * colorVariants.length)];
  return (
    <div className="d-flex justify-content-between position-relative">
      <div className="d-sm-flex">
        <div className="avatar avatar-md flex-shrink-0">
          {image ? (
            <Image
              className="avatar-img rounded-circle"
              src={image}
              alt={name}
              width={40}
              height={40}
            />
          ) : (
            <div className={`avatar-img rounded-circle bg-${randomItem} bg-opacity-10`}>
              <span className={`position-absolute top-50 text-${randomItem} start-50 translate-middle fw-bold`}>
                {name.charAt(0)}{description.charAt(0)}
              </span>
            </div>
          )}
        </div>
        <div className="ms-0 ms-sm-2 mt-2 mt-sm-0">
          <h6 className="mb-0"><a href="#" className="stretched-link">{name}</a></h6>
          <p className="mb-0">{description}</p>
          <span className="small">{timeSince(time)} </span>
        </div>
      </div>
    </div>
  );
};

const SupportRequests = () => {
  const [supportRequests, setSupportRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSupportRequests = async () => {
      try {
        setLoading(true);
        const { token } = await checkIsLoggedInUser();
        if (!token) return;

        const response = await axiosInstance.get('/api/admin/support-requests', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data && response.data.success) {
          setSupportRequests(response.data.supportRequests || []);
        } else {
          setError('Failed to fetch support requests');
        }
      } catch (error) {
        console.error('Error fetching support requests:', error);
        setError('Failed to fetch support requests');
      } finally {
        setLoading(false);
      }
    };

    fetchSupportRequests();
  }, []);

  return (
    <Col xxl={4}>
      <Card className="shadow h-100">
        <CardHeader className="border-bottom d-flex justify-content-between align-items-center p-4">
          <h5 className="card-header-title">Support Requests</h5>
          <Link href="/admin/support" className="btn btn-link p-0 mb-0">View all</Link>
        </CardHeader>
        <CardBody className="p-4">
          {loading ? (
            <div className="placeholder-glow">
              {[1, 2, 3].map((_, idx) => (
                <div key={idx} className="d-flex mb-3">
                  <span className="placeholder col-2 rounded-circle" style={{ height: '40px' }}></span>
                  <div className="ms-3 w-100">
                    <span className="placeholder col-4 mb-2"></span>
                    <span className="placeholder col-6"></span>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center text-danger">
              <p className="mb-0">{error}</p>
            </div>
          ) : supportRequests.length === 0 ? (
            <div className="text-center">
              <p className="mb-0">No support requests found</p>
            </div>
          ) : (
            supportRequests.map((item, idx) => (
              <React.Fragment key={item.id || idx}>
                <SupportRequestsCard
                  name={item.user?.fullName || 'Anonymous'}
                  description={item.message || item.title || 'No description'}
                  time={item.created_at}
                  image={item.user?.profilePicture}
                />
                {supportRequests.length - 1 !== idx && <hr />}
              </React.Fragment>
            ))
          )}
        </CardBody>
      </Card>
    </Col>
  );
};

export default SupportRequests;
