import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import PageBanner from '../../components/banner/PageBanner';
import { Col, Container, Row, Image } from 'react-bootstrap';
import missionImageUrl from "../../../assets/images/about/01.jpg";

// Generate metadata dynamically based on locale
export async function generateMetadata({ params: { locale } }) {
  const t = await getTranslations({ locale, namespace: 'pages.becomeTeacher.metadata' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

const BecomeTeacher = async ({ params: { locale } }) => {
  const t = await getTranslations({ locale, namespace: 'pages.becomeTeacher' });
  const tBreadcrumb = await getTranslations({ locale, namespace: 'pages.becomeTeacher.breadcrumb' });

  return (
    <>
      <PageBanner
        bannerHeadline={t('banner.headline')}
        showBreadcrumb={true}
        breadcrumbItems={[
          { name: tBreadcrumb('home'), link: "/" },
          { name: tBreadcrumb('becomeTeacher'), link: "/become-teacher" }
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

        {/* Why Teach Section */}
        <Row className="g-4 mt-4">
          <Col md={6}>
            <h2>{t('whyTeach.title')}</h2>
            <ul>
              <li>{t('whyTeach.reasons.makeDifference')}</li>
              <li>{t('whyTeach.reasons.sharePassion')}</li>
              <li>{t('whyTeach.reasons.flexibleSchedule')}</li>
              <li>{t('whyTeach.reasons.communitySupport')}</li>
              <li>{t('whyTeach.reasons.noFees')}</li>
              <li>{t('whyTeach.reasons.easyTools')}</li>
            </ul>
          </Col>
          <Col md={6}>
            <Image
              src={missionImageUrl.src}
              alt={t('whyTeach.imageAlt')}
              width={500}
              height={250}
              className="img-fluid rounded shadow"
              priority
            />
          </Col>
        </Row>

        {/* How to Become Section */}
        <Row className="mt-5">
          <Col>
            <h2>{t('howToBecome.title')}</h2>
            <ol>
              <li>
                {t('howToBecome.steps.step1.text')}{' '}
                <Link href={`/${locale}/auth/sign-up`}>
                  {t('howToBecome.steps.step1.linkText')}
                </Link>
                {t('howToBecome.steps.step1.textEnd')}
              </li>
              <li>{t('howToBecome.steps.step2')}</li>
              <li>{t('howToBecome.steps.step3')}</li>
              <li>{t('howToBecome.steps.step4')}</li>
              <li>{t('howToBecome.steps.step5')}</li>
              <li>{t('howToBecome.steps.step6')}</li>
            </ol>
          </Col>
        </Row>

        {/* Requirements Section */}
        <Row className="mt-5">
          <Col>
            <h2>{t('requirements.title')}</h2>
            <p>
              {t('requirements.intro')}
            </p>
            <ul>
              <li>{t('requirements.list.expertise')}</li>
              <li>{t('requirements.list.passion')}</li>
              <li>{t('requirements.list.commitment')}</li>
              <li>{t('requirements.list.communication')}</li>
              <li>{t('requirements.list.technical')}</li>
            </ul>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default BecomeTeacher;