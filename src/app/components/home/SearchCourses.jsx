"use client";

import { Col, Container, Row } from "react-bootstrap";
import { FaSearch } from "react-icons/fa";
import { useTranslations } from "next-intl";

const SearchCourses = () => {
  const t = useTranslations('home.searchCourses');

  return (
    <section className="pt-0 pt-lg-5">
      <Container>
        <Row className="mb-4 align-items-center text-center justify-content-center">
          <Col sm={12}>
            <p className="my-md-0 my-3 merienda-text xxx-large">{t('heading')}</p>
            <p className="mb-3 xx-large text-center text-md-end">{t('subheading')}</p>
            <div className="d-flex justify-content-center w-100">
              <form className="border rounded p-2 mb-4 w-100 w-md-50">
                <div className="input-group">
                  <input 
                    className="form-control border-0 me-1" 
                    type="search" 
                    placeholder={t('placeholder')} 
                  />
                  <button type="button" className="btn btn-danger mb-0 rounded">
                    <FaSearch />
                  </button>
                </div>
              </form>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default SearchCourses;