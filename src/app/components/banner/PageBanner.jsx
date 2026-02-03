import { Col, Container, Row } from "react-bootstrap";
import pattern4 from '@/assets/images/pattern/04.png';

const PageBanner = ({ 
  bannerHeadline, 
  bannerSubtext = null,
  showBreadcrumb = false,
  breadcrumbItems = []
}) => {
  return (
    <section 
      className="bg-dark align-items-center py-4 d-flex" 
      style={{
        background: `url(${pattern4.src}) no-repeat center center`,
        backgroundSize: 'cover'
      }}
    >
      <Container>
        <Row>
          <Col xs={12}>
            {/* Breadcrumb */}
            {showBreadcrumb && breadcrumbItems.length > 0 && (
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb breadcrumb-dark mb-2">
                  {breadcrumbItems.map((item, index) => (
                    <li 
                      key={index}
                      className={`breadcrumb-item ${index === breadcrumbItems.length - 1 ? 'active' : ''}`}
                      {...(index === breadcrumbItems.length - 1 ? { 'aria-current': 'page' } : {})}
                    >
                      {index === breadcrumbItems.length - 1 ? (
                        item.name
                      ) : (
                        <a href={item.link} className="text-white text-decoration-none">
                          {item.name}
                        </a>
                      )}
                    </li>
                  ))}
                </ol>
              </nav>
            )}

            {/* Headline */}
            <h1 className="text-white mb-2">{bannerHeadline}</h1>

            {/* Subtext */}
            {bannerSubtext && (
              <p className="text-white-50 mb-0">{bannerSubtext}</p>
            )}
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default PageBanner;