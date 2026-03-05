'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { BsPeopleFill, BsChatDotsFill, BsStarFill, BsQuestionCircleFill } from 'react-icons/bs';
import { FaArrowRight } from 'react-icons/fa';
import Link from 'next/link';
import PageBanner from '@/app/components/banner/PageBanner';

const features = [
  { icon: BsChatDotsFill, variant: 'primary', key: 'discussions' },
  { icon: BsQuestionCircleFill, variant: 'success', key: 'questions' },
  { icon: BsStarFill, variant: 'warning', key: 'tips' },
  { icon: BsPeopleFill, variant: 'info', key: 'network' },
];

const CommunityPage = () => {
  const t = useTranslations('help.community');
  const { locale } = useParams();

  return (
    <>
      <PageBanner bannerHeadline={t('pageTitle')} />

      {/* Hero */}
      <section className="bg-primary bg-opacity-10 py-5">
        <Container>
          <Row>
            <Col lg={7} className="mx-auto text-center">
              <BsPeopleFill size={48} className="text-primary mb-3" />
              <h1 className="display-6">{t('heroTitle')}</h1>
              <p className="lead mb-4">{t('heroSubtitle')}</p>
              <Link href={`/${locale}/auth/sign-up`} className="btn btn-primary px-4">
                {t('heroCta')} <FaArrowRight className="ms-2" />
              </Link>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features */}
      <section className="py-5">
        <Container>
          <Row className="mb-4">
            <Col lg={6} className="mx-auto text-center">
              <h2>{t('featuresTitle')}</h2>
              <p className="text-muted">{t('featuresSubtitle')}</p>
            </Col>
          </Row>
          <Row className="g-4">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <Col md={6} key={idx}>
                  <Card className="h-100 border rounded-3 shadow-sm">
                    <Card.Body className="p-4 d-flex align-items-start gap-3">
                      <div
                        className={`bg-${feat.variant} bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0`}
                        style={{ width: 52, height: 52 }}
                      >
                        <Icon className={`text-${feat.variant}`} size={22} />
                      </div>
                      <div>
                        <h5 className="mb-2">{t(`features.${feat.key}.title`)}</h5>
                        <p className="text-muted small mb-0">{t(`features.${feat.key}.desc`)}</p>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </Container>
      </section>

      {/* Guidelines */}
      <section className="py-5 bg-light">
        <Container>
          <Row className="align-items-center g-4">
            <Col lg={6}>
              <h2>{t('guidelinesTitle')}</h2>
              <p className="text-muted mb-4">{t('guidelinesSubtitle')}</p>
              <ul className="list-unstyled">
                {[1, 2, 3, 4].map((i) => (
                  <li key={i} className="d-flex align-items-start gap-2 mb-3">
                    <div
                      className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{ width: 28, height: 28 }}
                    >
                      <span className="text-success fw-bold small">{i}</span>
                    </div>
                    <div>
                      <h6 className="mb-1">{t(`guidelines.rule${i}.title`)}</h6>
                      <p className="text-muted small mb-0">{t(`guidelines.rule${i}.desc`)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </Col>
            <Col lg={6}>
              <Card className="border-0 bg-primary bg-opacity-10 rounded-3 p-4">
                <Card.Body>
                  <h4>{t('ctaCardTitle')}</h4>
                  <p className="text-muted mb-4">{t('ctaCardDesc')}</p>
                  <Link href={`/${locale}/auth/sign-up`} className="btn btn-primary me-2">
                    {t('ctaJoin')}
                  </Link>
                  <Link href={`/${locale}/help/center`} className="btn btn-outline-secondary">
                    {t('ctaHelp')}
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default CommunityPage;