'use client';

import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import FavoritesList from '@/components/favorites/FavoritesList';

export default function FavoritesPage() {
  return (
    <main>
      <section className="pt-0">
        <Container>
          <Row className="mb-4">
            <Col>
              <h1 className="fs-2 mb-0">My Favorite Courses</h1>
              <p className="mb-0">Courses you've saved for later</p>
            </Col>
          </Row>
          
          <FavoritesList />
        </Container>
      </section>
    </main>
  );
}
