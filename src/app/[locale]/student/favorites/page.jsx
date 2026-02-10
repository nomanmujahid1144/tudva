'use client';

import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import FavoritesList from '@/components/favorites/FavoritesList';
import { useTranslations } from 'next-intl';

export default function FavoritesPage() {
  const t = useTranslations('favorites.page');
  
  return (
    <main>
      <section className="pt-0">
        <Container>
          <Row className="mb-4">
            <Col>
              <h1 className="fs-2 mb-0">{t('title')}</h1>
              <p className="mb-0">{t('subtitle')}</p>
            </Col>
          </Row>
          
          <FavoritesList />
        </Container>
      </section>
    </main>
  );
}