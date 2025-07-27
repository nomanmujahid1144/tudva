import { FaCheckCircle } from "react-icons/fa";

const Overview = ({ course }) => {
  // If no course is provided, use empty arrays/strings as fallbacks
  const description = course?.description || "";
  
  // Remove the "What you'll learn" section entirely
  return <>
      <h5 className="mb-3">Course Description</h5>
      {description ? (
        <div dangerouslySetInnerHTML={{ __html: description }} />
      ) : (
        <p className="mb-0">No description available for this course.</p>
      )}
    </>;
};

export default Overview;
