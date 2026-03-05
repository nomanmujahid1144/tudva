'use client';

import React from 'react';
import { FaAngleRight } from 'react-icons/fa';
import { BsEmojiSmile, BsLayers, BsInfoCircle, BsHouse } from 'react-icons/bs';
import { Card, CardBody, CardHeader, CardTitle, Col, Container, Row } from 'react-bootstrap';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

// Icons stay in component — only text comes from translations
const topicIcons = [BsEmojiSmile, BsLayers, BsInfoCircle, BsHouse];
const topicVariants = ['success', 'warning', 'info', 'primary'];
const topicKeys = ['getStarted', 'accountSetup', 'otherTopics', 'advancedUsage'];

const TopicsCard = ({ icon: Icon, title, features, variant, locale }) => {
  const t = useTranslations('help.center.topics');

  return (
    <Card className="bg-light h-100">
      <CardHeader className="bg-light pb-0 border-0">
        <Icon size={45} className={`text-${variant}`} />
        <CardTitle as="h5" className="mb-0 mt-2">{title}</CardTitle>
      </CardHeader>
      <CardBody>
        <ul className="nav flex-column">
          {features.map((feature, idx) => (
            <li className="nav-item" key={idx}>
              <Link className="nav-link d-flex" href={`/${locale}/help/center-detail`}>
                <FaAngleRight size={18} className="text-primary pt-1 me-2" />
                {feature}
              </Link>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
};

const RecommendedTopics = ({ locale }) => {
  const t = useTranslations('help.center.topics');

  const topics = topicKeys.map((key, idx) => ({
    icon: topicIcons[idx],
    variant: topicVariants[idx],
    title: t(`${key}.title`),
    features: [
      t(`${key}.feature1`),
      t(`${key}.feature2`),
      t(`${key}.feature3`),
      t(`${key}.feature4`),
      t(`${key}.feature5`),
    ],
  }));

  return (
    <section className="py-5">
      <Container>
        <Row>
          <Col xs={12} className="text-center">
            <h2 className="text-center mb-4">{t('sectionTitle')}</h2>
          </Col>
        </Row>
        <Row className="g-4">
          {topics.map((item, idx) => (
            <Col md={6} xl={3} key={idx}>
              <TopicsCard {...item} locale={locale} />
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default RecommendedTopics;