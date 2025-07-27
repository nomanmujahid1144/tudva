import Link from "next/link";
import { FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <nav className="mt-4 d-flex justify-content-center" aria-label="navigation">
      <ul className="pagination pagination-primary-soft d-inline-block d-md-flex rounded mb-0">
        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
          <button className="page-link" onClick={() => onPageChange(1)}>
            <FaAngleDoubleLeft />
          </button>
        </li>

        {Array.from({ length: totalPages }, (_, index) => (
          <li key={index} className={`page-item ${currentPage === index + 1 ? "active" : ""}`}>
            <button className="page-link" onClick={() => onPageChange(index + 1)}>
              {index + 1}
            </button>
          </li>
        ))}

        <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
          <button className="page-link" onClick={() => onPageChange(totalPages)}>
            <FaAngleDoubleRight />
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
