import { Col, Container, Row } from "react-bootstrap";
import pattern4 from '@/assets/images/pattern/04.png';
const PageBanner = ({bannerHeadline}) => {
  return <section className="bg-dark align-items-center py-4 d-flex" style={{
    background: `url(${pattern4.src}) no-repeat center center`,
    backgroundSize: 'cover'
  }}>
      <Container>
        <Row>
          <Col xs={12}>
            <h1 className="text-white">{bannerHeadline}</h1>
          </Col>
        </Row>
      </Container>
    </section>;
};
export default PageBanner;
