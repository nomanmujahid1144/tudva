import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import PageBanner from '../../components/banner/PageBanner';
import { Container, Row, Col } from 'react-bootstrap';

// Generate metadata dynamically based on locale
export async function generateMetadata({ params: { locale } }) {
  const t = await getTranslations({ locale, namespace: 'pages.getStarted.metadata' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

const GetStarted = () => {
  const t = useTranslations('pages.getStarted');
  const tBreadcrumb = useTranslations('pages.getStarted.breadcrumb');
  const locale = useLocale();

  // Helper to add locale to links
  const getLocalizedLink = (link) => {
    if (!link) return "";
    if (link.startsWith(`/${locale}/`)) return link;
    if (link === "/") return `/${locale}`;
    return `/${locale}${link}`;
  };

  return (
    <>
      <PageBanner
        bannerHeadline={t('banner.headline')}
        showBreadcrumb={true}
        breadcrumbItems={[
          { name: tBreadcrumb('home'), link: "/" },
          { name: tBreadcrumb('getStarted'), link: "/get-started" }
        ]}
      />
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8}>
            <h2>{t('hero.title')}</h2>
            <p className="lead">
              {t('hero.subtitle')}
            </p>

            {/* Step 1 */}
            <h3>{t('steps.step1.title')}</h3>
            <p>
              {t('steps.step1.description')}{' '}
              <Link href={getLocalizedLink('/auth/sign-up')}>
                {t('steps.step1.registerLink')}
              </Link>
              {t('steps.step1.description2')}
            </p>

            {/* Step 2 */}
            <h3>{t('steps.step2.title')}</h3>
            <p>
              {t('steps.step2.description')}{' '}
              <Link href={getLocalizedLink('/courses')}>
                {t('steps.step2.coursesLink')}
              </Link>{' '}
              {t('steps.step2.description2')}
            </p>

            {/* Step 3 */}
            <h3>{t('steps.step3.title')}</h3>
            <p>{t('steps.step3.description')}</p>
            <ul>
              <li>
                {t('steps.step3.list.item1')}{' '}
                <Link href="#">{t('steps.step3.list.myScheduleLink')}</Link>{' '}
                {t('steps.step3.list.item1b')}
              </li>
              <li>{t('steps.step3.list.item2')}</li>
              <li>{t('steps.step3.list.item3')}</li>
              <li>{t('steps.step3.list.item4')}</li>
              <li>{t('steps.step3.list.item5')}</li>
            </ul>

            {/* Step 4 */}
            <h3>{t('steps.step4.title')}</h3>
            <p>{t('steps.step4.description')}</p>

            {/* Step 5 */}
            <h3>{t('steps.step5.title')}</h3>
            <p>{t('steps.step5.description')}</p>

            {/* Step 6 */}
            <h3>{t('steps.step6.title')}</h3>
            <p>{t('steps.step6.description')}</p>

            {/* Step 7 */}
            <h3>{t('steps.step7.title')}</h3>
            <p>{t('steps.step7.description')}</p>

            {/* Help Section */}
            <h3>{t('help.title')}</h3>
            <p>
              {t('help.description')}{' '}
              <Link href={getLocalizedLink('/faq')}>{t('help.faqLink')}</Link>{' '}
              {t('help.or')}{' '}
              <Link href={getLocalizedLink('/contact-us')}>{t('help.contactLink')}</Link>{' '}
              {t('help.description2')}
            </p>

            {/* CTA Button */}
            <div className="text-center">
              <Link 
                href={getLocalizedLink('/auth/sign-up')} 
                className="btn btn-primary btn-lg"
              >
                {t('cta.button')}
              </Link>
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default GetStarted;