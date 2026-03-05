'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { BsCheckCircleFill, BsArrowRight } from 'react-icons/bs';
import { FaUserPlus, FaSearch, FaBookOpen, FaPlayCircle, FaCertificate } from 'react-icons/fa';
import Link from 'next/link';
import PageBanner from '@/app/components/banner/PageBanner';

const steps = [
  {
    icon: FaUserPlus,
    variant: 'success',
    titleKey: 'step1.title',
    descKey: 'step1.desc',
    items: ['step1.item1', 'step1.item2', 'step1.item3'],
  },
  {
    icon: FaSearch,
    variant: 'primary',
    titleKey: 'step2.title',
    descKey: 'step2.desc',
    items: ['step2.item1', 'step2.item2', 'step2.item3'],
  },
  {
    icon: FaBookOpen,
    variant: 'warning',
    titleKey: 'step3.title',
    descKey: 'step3.desc',
    items: ['step3.item1', 'step3.item2', 'step3.item3'],
  },
  {
    icon: FaPlayCircle,
    variant: 'info',
    titleKey: 'step4.title',
    descKey: 'step4.desc',
    items: ['step4.item1', 'step4.item2', 'step4.item3'],
  },
  {
    icon: FaCertificate,
    variant: 'success',  // 'orange' is not a Bootstrap variant, changed to success
    titleKey: 'step5.title',
    descKey: 'step5.desc',
    items: ['step5.item1', 'step5.item2', 'step5.item3'],
  },
];

// Keep metadata export in a separate file or use generateMetadata pattern below
const FirstStepsPage = () => {
  const t = useTranslations('help.firstSteps');
  const { locale } = useParams();

  return (
    <>
      <PageBanner bannerHeadline={t('pageTitle')} />

      {/* Hero */}
      <section className="bg-primary bg-opacity-10 py-5">
        <Container>
          <Row>
            <Col lg={7} className="mx-auto text-center">
              <h1 className="display-6">{t('heroTitle')}</h1>
              <p className="lead mb-4">{t('heroSubtitle')}</p>
              <Link href={`/${locale}/auth/sign-up`} className="btn btn-primary px-4 me-2">
                {t('heroCta')}
              </Link>
              <Link href={`/${locale}/courses`} className="btn btn-outline-primary px-4">
                {t('heroBrowse')}
              </Link>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Steps */}
      <section className="py-5">
        <Container>
          <Row className="mb-5">
            <Col lg={6} className="mx-auto text-center">
              <h2>{t('stepsTitle')}</h2>
              <p className="text-muted">{t('stepsSubtitle')}</p>
            </Col>
          </Row>
          <Row className="g-4">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <Col md={6} lg={4} key={idx}>
                  <Card className="h-100 border rounded-3 shadow-sm">
                    <Card.Body className="p-4">
                      <div
                        className={`bg-${step.variant} bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3`}
                        style={{ width: 52, height: 52 }}
                      >
                        <Icon className={`text-${step.variant}`} size={22} />
                      </div>
                      <div className="d-flex align-items-center mb-2 gap-2">
                        <span className={`badge bg-${step.variant} bg-opacity-10 text-${step.variant}`}>
                          {t('stepLabel')} {idx + 1}
                        </span>
                        <h5 className="mb-0">{t(step.titleKey)}</h5>
                      </div>
                      <p className="text-muted small mb-3">{t(step.descKey)}</p>
                      <ul className="list-unstyled mb-0">
                        {step.items.map((item, i) => (
                          <li key={i} className="d-flex align-items-start gap-2 mb-1">
                            <BsCheckCircleFill className={`text-${step.variant} mt-1 flex-shrink-0`} size={14} />
                            <span className="small">{t(item)}</span>
                          </li>
                        ))}
                      </ul>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </Container>
      </section>

      {/* CTA */}
      <section className="bg-dark py-5">
        <Container>
          <Row>
            <Col lg={7} className="mx-auto text-center text-white">
              <h3>{t('ctaTitle')}</h3>
              <p className="text-white-50 mb-4">{t('ctaSubtitle')}</p>
              <Link href={`/${locale}/help/tutorials`} className="btn btn-primary me-2">
                {t('ctaTutorials')} <BsArrowRight className="ms-1" />
              </Link>
              <Link href={`/${locale}/help/center`} className="btn btn-outline-light">
                {t('ctaHelpCenter')}
              </Link>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default FirstStepsPage;