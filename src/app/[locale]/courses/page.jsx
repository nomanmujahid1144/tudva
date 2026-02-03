import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import PageBanner from "../../components/banner/PageBanner";
import CourseList from "../../components/courses/CourseList";

// Generate metadata dynamically based on locale
export async function generateMetadata({ params: { locale } }) {
  const t = await getTranslations({ locale, namespace: 'pages.courses.metadata' });

  return {
    title: t('title'),
    description: t('description'),
    keywords: t('keywords'),
  };
}

const CourseHome = () => {
  const t = useTranslations('pages.courses');
  const tBreadcrumb = useTranslations('pages.courses.breadcrumb');

  return (
    <>
      <PageBanner 
        bannerHeadline={t('banner.headline')}
        bannerSubtext={t('banner.subtext')}
        showBreadcrumb={true}
        breadcrumbItems={[
          { name: tBreadcrumb('home'), link: "/" },
          { name: tBreadcrumb('courses'), link: "/courses" }
        ]}
      />
      <CourseList />
    </>
  );
};

export default CourseHome;