import { getTranslations } from 'next-intl/server';
import { Container, Row, Col } from 'react-bootstrap';
import PageBanner from '../../components/banner/PageBanner';

// Generate metadata dynamically based on locale
export async function generateMetadata({ params: { locale } }) {
  const t = await getTranslations({ locale, namespace: 'pages.whatMeansTudva.metadata' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

const WhatMeansTudvaPage = async ({ params: { locale } }) => {
  const t = await getTranslations({ locale, namespace: 'pages.whatMeansTudva' });
  const tBreadcrumb = await getTranslations({ locale, namespace: 'pages.whatMeansTudva.breadcrumb' });

  return (
    <>
      <PageBanner
        bannerHeadline={t('banner.headline')}
        showBreadcrumb={true}
        breadcrumbItems={[
          { name: tBreadcrumb('home'), link: "/" },
          { name: tBreadcrumb('whatMeansTudva'), link: "/what-means-tudva" }
        ]}
      />
      
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8} className="text-center">
            <h1>{t('hero.title')}</h1>
          </Col>
        </Row>

        <Row className="justify-content-center mt-4">
          <Col md={8}>
            <p>
              {t('content.paragraph1')}
            </p>
            <p>
              {t('content.paragraph2')}
            </p>
            <p>
              {t('content.paragraph3')}
            </p>
            <p className="text-center fw-bold mt-4">
              {t('content.conclusion')}
            </p>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default WhatMeansTudvaPage;