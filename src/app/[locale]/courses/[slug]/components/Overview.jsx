import { useTranslations } from "next-intl";
import { FaCheckCircle } from "react-icons/fa";

const Overview = ({ course }) => {
  const t = useTranslations('courses.detail.overview');
  
  // If no course is provided, use empty arrays/strings as fallbacks
  const description = course?.description || "";
  
  return (
    <>
      <h5 className="mb-3">{t('title')}</h5>
      {description ? (
        <div dangerouslySetInnerHTML={{ __html: description }} />
      ) : (
        <p className="mb-0">{t('noDescription')}</p>
      )}
    </>
  );
};

export default Overview;