import React from 'react';
import { Container, Row, Col, Image } from 'react-bootstrap';
import { useTranslations, useLocale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import missionImageUrl from "../../../assets/images/about/01.jpg";
import valuesImageUrl1 from "../../../assets/images/about/01.jpg";
import valuesImageUrl2 from "../../../assets/images/about/01.jpg";
import valuesImageUrl3 from "../../../assets/images/about/01.jpg";
import PageBanner from '../../components/banner/PageBanner';

// Generate metadata dynamically based on locale
export async function generateMetadata({ params: { locale } }) {
  const t = await getTranslations({ locale, namespace: 'pages.ourMission.metadata' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

const OurMissionPage = () => {
  const t = useTranslations('pages.ourMission');
  const tBreadcrumb = useTranslations('pages.ourMission.breadcrumb');

  const coreValues = [
    {
      key: 'accessibility',
      image: valuesImageUrl1
    },
    {
      key: 'community',
      image: valuesImageUrl2
    },
    {
      key: 'quality',
      image: valuesImageUrl3
    }
  ];

  return (
    <>
      <PageBanner
        bannerHeadline={t('banner.headline')}
        showBreadcrumb={true}
        breadcrumbItems={[
          { name: tBreadcrumb('home'), link: "/" },
          { name: tBreadcrumb('ourMission'), link: "/our-mission" }
        ]}
      />
      
      <Container fluid className="p-0">
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
                width={600}
                height={400}
                priority
              />
            </Col>
          </Row>

          {/* Core Values Section */}
          <Row className="mt-5 text-center">
            <Col>
              <h2>{t('coreValues.title')}</h2>
            </Col>
          </Row>
          <Row className="g-4 mt-2">
            {coreValues.map((value) => (
              <Col sm={6} md={4} key={value.key}>
                <div className="text-center">
                  <Image
                    src={value.image.src}
                    alt={t(`coreValues.${value.key}.imageAlt`)}
                    width={300}
                    height={200}
                    className="img-fluid rounded mb-3"
                    priority
                  />
                  <h4 className="mt-2">{t(`coreValues.${value.key}.title`)}</h4>
                  <p>{t(`coreValues.${value.key}.description`)}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </Container>
    </>
  );
};

export default OurMissionPage;