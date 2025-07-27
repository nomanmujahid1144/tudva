import React from 'react';
import error404Img from '@/assets/images/element/error404-01.svg';
import Image from 'next/image';
import Link from 'next/link';
import { Col, Row } from 'react-bootstrap';
export const metadata = {
  title: 'Not Found'
};
const NotFound = () => {
  return <Row>
      <Col xl={12} className="text-center">
        <Image src={error404Img} className="h-200px h-md-400px mb-4" alt='error404' />
        <h1 className="display-1 text-danger mb-0">404</h1>
        <h2>Oh no, something went wrong!</h2>
        <p className="mb-4">Either something went wrong or this page doesn&apos;t exist anymore.</p>
        <Link href="/admin/dashboard" className="btn btn-primary mb-0">Go to Dashboard</Link>
      </Col>
    </Row>;
};
export default NotFound;
