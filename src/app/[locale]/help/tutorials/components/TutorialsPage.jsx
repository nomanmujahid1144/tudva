'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Container, Row, Col, Card, Badge } from 'react-bootstrap';
import { FaPlayCircle, FaClock, FaArrowRight } from 'react-icons/fa';
import { BsCollectionPlay } from 'react-icons/bs';
import Link from 'next/link';
import PageBanner from '@/app/components/banner/PageBanner';

const categories = [
  { key: 'gettingStarted', variant: 'success', count: 5 },
  { key: 'courseEnrollment', variant: 'primary', count: 4 },
  { key: 'accountSettings', variant: 'warning', count: 6 },
  { key: 'certificates', variant: 'info', count: 3 },
];

const TutorialsPage = () => {
  const t = useTranslations('help.tutorials');
  const { locale } = useParams();

  return (
    <>
      <PageBanner bannerHeadline={t('pageTitle')} />

      {/* Hero */}
      <section className="bg-primary bg-opacity-10 py-5">
        <Container>
          <Row>
            <Col lg={7} className="mx-auto text-center">
              <BsCollectionPlay size={48} className="text-primary mb-3" />
              <h1 className="display-6">{t('heroTitle')}</h1>
              <p className="lead mb-0">{t('heroSubtitle')}</p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Categories */}
      <section className="py-5">
        <Container>
          <Row className="mb-4">
            <Col lg={6} className="mx-auto text-center">
              <h2>{t('categoriesTitle')}</h2>
              <p className="text-muted">{t('categoriesSubtitle')}</p>
            </Col>
          </Row>
          <Row className="g-4">
            {categories.map((cat, idx) => (
              <Col md={6} key={idx}>
                <Card className="h-100 border rounded-3 shadow-sm">
                  <Card.Body className="p-4 d-flex align-items-start gap-3">
                    <div
                      className={`bg-${cat.variant} bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0`}
                      style={{ width: 48, height: 48 }}
                    >
                      <FaPlayCircle className={`text-${cat.variant}`} size={20} />
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <h5 className="mb-0">{t(`categories.${cat.key}.title`)}</h5>
                        <Badge bg={cat.variant}>
                          {cat.count} {t('videos')}
                        </Badge>
                      </div>
                      <p className="text-muted small mb-3">{t(`categories.${cat.key}.desc`)}</p>
                      <ul className="list-unstyled mb-3">
                        {[1, 2, 3].map((i) => (
                          <li key={i} className="d-flex align-items-center gap-2 mb-1 small text-muted">
                            <FaClock size={11} />
                            {t(`categories.${cat.key}.tutorial${i}`)}
                          </li>
                        ))}
                      </ul>
                      <Link
                        href={`/${locale}/help/center`}
                        className={`btn btn-sm btn-outline-${cat.variant} d-inline-flex align-items-center gap-1`}
                      >
                        {t('viewAll')} <FaArrowRight size={11} />
                      </Link>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Need more help */}
      <section className="py-5 bg-light">
        <Container>
          <Row>
            <Col lg={6} className="mx-auto text-center">
              <h3>{t('moreHelpTitle')}</h3>
              <p className="text-muted mb-4">{t('moreHelpSubtitle')}</p>
              <Link href={`/${locale}/help/center`} className="btn btn-primary me-2">
                {t('visitHelpCenter')}
              </Link>
              <Link href={`/${locale}/help/community`} className="btn btn-outline-secondary">
                {t('joinCommunity')}
              </Link>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default TutorialsPage;