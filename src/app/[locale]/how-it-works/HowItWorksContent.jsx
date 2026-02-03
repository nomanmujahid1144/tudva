"use client";

import React from 'react';
import { Container, Row, Col, Image } from 'react-bootstrap';
import { useTranslations } from 'next-intl';
import { 
  FaCalendarAlt, 
  FaVideo, 
  FaUsers, 
  FaGift, 
  FaBookOpen, 
  FaFolder 
} from 'react-icons/fa';
import missionImageUrl from "../../../assets/images/about/01.jpg";
import PageBanner from '../../components/banner/PageBanner';

const HowItWorksContent = () => {
  const t = useTranslations('pages.howItWorks');
  const tBreadcrumb = useTranslations('pages.howItWorks.breadcrumb');

  // Features array with translation keys and React Icons
  const features = [
    { key: "flexibleScheduling", icon: FaCalendarAlt },
    { key: "liveRecorded", icon: FaVideo },
    { key: "communitySupport", icon: FaUsers },
    { key: "freeAccess", icon: FaGift },
    { key: "diverseSubjects", icon: FaBookOpen },
    { key: "personalFolder", icon: FaFolder },
  ];

  return (
    <>
      <PageBanner
        bannerHeadline={t('banner.headline')}
        showBreadcrumb={true}
        breadcrumbItems={[
          { name: tBreadcrumb('home'), link: "/" },
          { name: tBreadcrumb('howItWorks'), link: "/how-it-works" }
        ]}
      />

      <Container className="py-5">
        {/* What Drives Us Section */}
        <Row className="g-4">
          <Col md={6} className="d-flex align-items-center">
            <div>
              <h2>{t('whatDrivesUs.title')}</h2>
              <p className="lead">
                {t('whatDrivesUs.lead')}
              </p>
              <p>
                {t('whatDrivesUs.vision')}
              </p>
            </div>
          </Col>
          <Col md={6}>
            <Image
              src={missionImageUrl.src}
              alt={t('whatDrivesUs.imageAlt')}
              className="img-fluid rounded shadow"
              width={500}
              height={300}
              priority
            />
          </Col>
        </Row>

        {/* Our Values Section */}
        <Row className="mt-5">
          <Col>
            <h2 className='text-center'>{t('ourValues.title')}</h2>
            <ul className="list-group list-group-flush">
              {features.map((feature) => {
                const IconComponent = feature.icon;
                return (
                  <li key={feature.key} className="list-group-item d-flex align-items-start">
                    <IconComponent 
                      style={{ width: "40px", height: "40px", marginRight: '1rem' }}
                    />
                    <div>
                      <h5>{t(`ourValues.features.${feature.key}.title`)}</h5>
                      <p>{t(`ourValues.features.${feature.key}.description`)}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default HowItWorksContent;