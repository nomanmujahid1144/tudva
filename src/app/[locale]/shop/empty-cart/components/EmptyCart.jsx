import React from 'react';
import cartImg from '@/assets/images/element/cart.svg';
import Image from 'next/image';
import Link from 'next/link';
import { Col, Container, Row } from 'react-bootstrap';
const EmptyCart = () => {
  return <section>
      <Container>
        <Row>
          <Col xs={12} className="text-center">
            <Image src={cartImg} className="h-200px h-md-300px mb-3" alt='cart' />
            <h2>Your cart is currently empty</h2>
            <p className="mb-0">Please check out all the available courses and buy some courses that fulfill your needs.</p>
            <Link href="/demos/default/home" className="btn btn-primary mt-4 mb-0">Back to Shop</Link>
          </Col>
        </Row>
      </Container>
    </section>;
};
export default EmptyCart;
