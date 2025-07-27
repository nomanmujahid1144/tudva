// src/app/what-means-tudva/page.tsx
import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import PageBanner from '../components/banner/PageBanner';

const WhatMeansTudvaPage = () => {
    return (
        <>
            <PageBanner
                bannerHeadline="tudva means"
            />
            <Container className="py-5">
                <Row className="justify-content-center">
                    <Col md={8} className="text-center">
                        <h1>What Does &quot;Tudva&quot; Mean?</h1>
                    </Col>
                </Row>

                <Row className="justify-content-center mt-4">
                    <Col md={8}>
                        <p style={{ whiteSpace: 'pre-line' }}>
                            &quot;Tudva&quot; is a [YOUR LANGUAGE] word that means [MEANING OF TUDVA].  It reflects our core values of [LIST CORE VALUES - e.g., knowledge, accessibility, community].  We chose this name because [REASON FOR CHOOSING THE NAME].

                            [Optional: Add a paragraph expanding on the meaning, the origin of the word, or any relevant cultural context.  Be specific and engaging!].

                            [Optional: Another paragraph with further details, perhaps connecting the meaning to your platform&apos;s features.]

                            We hope that the name &quot;Tudva&quot; will inspire you on your learning journey!
                        </p>
                    </Col>
                </Row>

            </Container>
        </>
    );
};

export default WhatMeansTudvaPage;