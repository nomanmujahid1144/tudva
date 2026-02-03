import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import PageBanner from '../../components/banner/PageBanner';
import { Col, Container, Row, Image } from 'react-bootstrap';
import missionImageUrl from "../../../assets/images/about/01.jpg";

// Generate metadata dynamically based on locale
export async function generateMetadata({ params: { locale } }) {
  const t = await getTranslations({ locale, namespace: 'pages.learningRoom.metadata' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

const LearningRoom = async ({ params: { locale } }) => {
  const t = await getTranslations({ locale, namespace: 'pages.learningRoom' });
  const tBreadcrumb = await getTranslations({ locale, namespace: 'pages.learningRoom.breadcrumb' });

  return (
    <>
      <PageBanner
        bannerHeadline={t('banner.headline')}
        showBreadcrumb={true}
        breadcrumbItems={[
          { name: tBreadcrumb('home'), link: "/" },
          { name: tBreadcrumb('learningRoom'), link: "/learning-room" }
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

        {/* What are Learning Rooms Section */}
        <Row className="g-4 mt-4">
          <Col md={6}>
            <h2>{t('whatAre.title')}</h2>
            <p>
              {t('whatAre.paragraph1')}
            </p>
            <p>
              {t('whatAre.paragraph2')}
            </p>
          </Col>
          <Col md={6}>
            <Image
              src={missionImageUrl.src}
              alt={t('whatAre.imageAlt')}
              className="img-fluid rounded shadow"
              width={500}
              height={200}
              priority
            />
          </Col>
        </Row>

        {/* Find a Learning Room Section */}
        <Row className="g-4 mt-4">
          <Col md={6}>
            <Image
              src={missionImageUrl.src}
              alt={t('findNearYou.imageAlt')}
              className="img-fluid rounded shadow"
              width={500}
              height={200}
              priority
            />
          </Col>
          <Col md={6}>
            <h2>{t('findNearYou.title')}</h2>
            <p>
              {t('findNearYou.description')}
            </p>
            {/* Placeholder for map/search integration */}
            <div className="border p-3 mb-3">
              {t('findNearYou.mapPlaceholder')}
            </div>
            <p>{t('findNearYou.cantFind')}</p>

            <Link href={`/${locale}/contact-us`} className="btn btn-outline-primary">
              {t('findNearYou.suggestButton')}
            </Link>
          </Col>
        </Row>

        {/* For Institutions Section */}
        <Row className="g-4 mt-4">
          <Col md={6}>
            <h2>{t('forInstitutions.title')}</h2>
            <p>
              {t('forInstitutions.intro')}
            </p>
            <ul>
              <li>{t('forInstitutions.benefits.expandAccess')}</li>
              <li>{t('forInstitutions.benefits.provideResource')}</li>
              <li>{t('forInstitutions.benefits.fosterCommunity')}</li>
              <li>{t('forInstitutions.benefits.enhanceReputation')}</li>
            </ul>
            <p>
              {t('forInstitutions.outro')}
            </p>
            <Link href={`/${locale}/contact-us`} className="btn btn-secondary">
              {t('forInstitutions.contactButton')}
            </Link>
          </Col>
          <Col md={6}>
            <Image
              src={missionImageUrl.src}
              alt={t('forInstitutions.imageAlt')}
              className="img-fluid rounded shadow"
              width={500}
              height={200}
              priority
            />
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default LearningRoom;