// src/app/privacy/page.tsx
import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import PageBanner from '../components/banner/PageBanner';

const PrivacyPage = () => {
  return (
    <>
      <PageBanner
        bannerHeadline="privacy policy"
      />
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8}>
            <h1>Privacy Policy</h1>
            <p>
              <strong>Effective Date:</strong> [DATE] {/* Replace with actual date */}
            </p>

            <h2>1. Information We Collect</h2>
            <p>We collect the following information: ... (email, name, IP address, etc. - DUMMY DATA)</p>

            <h2>2. How We Use Your Information</h2>
            <p>We use your information to: ... (provide the service, send emails, etc. - DUMMY DATA)</p>

            <h2>3. Sharing of Information</h2>
            <p>We may share your information with: ... (third-party service providers, etc. - DUMMY DATA)</p>

            <h2>4. Your Rights</h2>
            <p>You have the right to access, correct, and delete your data... (DUMMY DATA - MUST BE REPLACED)</p>

            <h2>5. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at [your contact email].</p>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default PrivacyPage;