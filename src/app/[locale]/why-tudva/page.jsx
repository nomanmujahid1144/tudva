import React from 'react';
import { Container, Row, Col, Image } from 'react-bootstrap';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import learningImageUrl from "../../../assets/images/about/01.jpg";
import communityImageUrl from "../../../assets/images/about/02.jpg";
import freeImageUrl from "../../../assets/images/about/04.jpg";
import PageBanner from '../../components/banner/PageBanner';

// Generate metadata dynamically based on locale
export async function generateMetadata({ params: { locale } }) {
  const t = await getTranslations({ locale, namespace: 'pages.whyTudva.metadata' });

  return {
    title: t('title'),
  };
}

const WhyTudva = () => {
  const t = useTranslations('pages.whyTudva');
  const tBreadcrumb = useTranslations('pages.whyTudva.breadcrumb');

  const features = [
    {
      key: 'flexible',
      image: learningImageUrl
    },
    {
      key: 'community',
      image: communityImageUrl
    },
    {
      key: 'free',
      image: freeImageUrl
    }
  ];

  const steps = ['schedule', 'courses', 'trainingRooms', 'instructors', 'folder', 'interaction'];

  return (
    <>
      <PageBanner 
        bannerHeadline={t('banner.headline')}
        showBreadcrumb={true}
        breadcrumbItems={[
          { name: tBreadcrumb('home'), link: "/" },
          { name: tBreadcrumb('whyTudva'), link: "/why-tudva" }
        ]}
      />
      
      <Container className="py-5">
        {/* Hero Section */}
        <Row className="justify-content-center">
          <Col lg={8} className="text-center">
            <h1>{t('hero.title')}</h1>
            <p className="lead">
              {t('hero.subtitle')}
            </p>
          </Col>
        </Row>

        {/* Features Section */}
        <Row className="g-4 mt-4">
          {features.map((feature) => (
            <Col md={6} lg={4} key={feature.key}>
              <div className="d-flex flex-column align-items-center">
                <Image
                  src={feature.image.src}
                  alt={t(`features.${feature.key}.alt`)}
                  width={300}
                  height={200}
                  className="img-fluid rounded mb-3"
                  priority
                />
                <h3>{t(`features.${feature.key}.title`)}</h3>
                <p className="text-center">
                  {t(`features.${feature.key}.description`)}
                </p>
              </div>
            </Col>
          ))}
        </Row>

        {/* How It Works Section */}
        <Row className="mt-5">
          <Col>
            <h2>{t('howItWorks.title')}</h2>
            <p>
              {t('howItWorks.intro')}
            </p>
            <ul>
              {steps.map((step) => (
                <li key={step}>
                  <strong>{t(`howItWorks.steps.${step}.title`)}</strong>{' '}
                  {t(`howItWorks.steps.${step}.description`)}
                </li>
              ))}
            </ul>
            <p>
              {t('howItWorks.cta.text')}{' '}
              <Link href="/courses">{t('howItWorks.cta.exploreCourses')}</Link>{' '}
              {t('howItWorks.cta.or')}{' '}
              <Link href="/auth/sign-up">{t('howItWorks.cta.createAccount')}</Link>{' '}
              {t('howItWorks.cta.today')}
            </p>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default WhyTudva;