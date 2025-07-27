import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import PageBanner from '../components/banner/PageBanner';

const TermsPage = () => {
  return (
    <>
      <PageBanner
        bannerHeadline="terms & conditions"
      />
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8}>
            <h1>Terms and Conditions</h1>
            <p>
              <strong>Effective Date:</strong> [DATE]  {/* Replace with actual date */}
            </p>

            <h2>1. Introduction</h2>
            <p>
              Welcome to Tudva! These Terms and Conditions (&quot;Terms&quot;) govern your access to and use of the Tudva
              platform, website, and services (collectively, the &quot;Platform&quot;). By accessing or using the Platform, you
              agree to be bound by these Terms. If you do not agree to these Terms, you may not access or use the
              Platform.
            </p>

            <h2>2. Account Registration</h2>
            <p>You must be at least 13 years old to use this platform...</p>

            <h2>3. User Conduct</h2>
            <p>You agree not to...</p>

            <h2>4. Intellectual Property</h2>
            <p>The Platform and its content are protected by copyright...</p>

            <h2>5. Disclaimer of Warranties</h2>
            <p>THE PLATFORM IS PROVIDED &quot;AS IS&quot; AND WITHOUT WARRANTIES OF ANY KIND...</p>

            <h2>6. Limitation of Liability</h2>
            <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, TUDVA SHALL NOT BE LIABLE...</p>

            <h2>7. Governing Law</h2>
            <p>These Terms shall be governed by the laws of [Your State/Country]...</p>

            <h2>8. Contact Us</h2>
            <p>If you have any questions about these Terms, please contact us at [your contact email].</p>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default TermsPage;