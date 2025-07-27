// src/app/our-mission/page.tsx
import React from 'react';
import { Container, Row, Col, Image } from 'react-bootstrap';
import missionImageUrl from "../../assets/images/about/01.jpg";
import valuesImageUrl1 from "../../assets/images/about/01.jpg";
import valuesImageUrl2 from "../../assets/images/about/01.jpg";
import valuesImageUrl3 from "../../assets/images/about/01.jpg";
import PageBanner from '../components/banner/PageBanner';


export const metadata = {
    title: 'Our Mission | Tudva',
    description: 'Learn about Tudva\'s mission to provide free, community-based, flexible education.',
};

const OurMissionPage = () => {
    return (
        <>
            <PageBanner
                bannerHeadline="our mission"
            />
            <Container fluid className="p-0">
                {/* Hero Section - Full Width */}
                {/* <Row className="g-0">
                    <Col>
                        <div
                            className="text-bg-dark p-4 p-sm-5  text-center"
                            style={{
                                minHeight: '300px', // Minimum height for the hero
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <div>
                                <h1 className="display-4">Our Mission</h1>
                                <p className="lead">
                                    Making high-quality education accessible to everyone.
                                </p>
                            </div>

                        </div>

                    </Col>
                </Row> */}
                <Container className="py-5">
                    <Row className="g-4">
                        <Col md={6} className="d-flex align-items-center">
                            <div>
                                <h2>What Drives Us</h2>
                                <p className="lead">
                                    At Tudva, we believe that learning should be a lifelong pursuit,
                                    unconstrained by cost, location, or background. We&apos;re building
                                    a platform where knowledge is freely shared, communities thrive,
                                    and individuals are empowered to reach their full potential.
                                </p>
                                <p>
                                    We envision a world where anyone, anywhere, can access the education they need to improve their lives and contribute to society.
                                </p>
                            </div>
                        </Col>
                        <Col md={6}>
                            {/* Use next/image for optimized image loading */}
                            <Image
                                src={missionImageUrl.src}
                                alt="People learning together"
                                className="img-fluid rounded shadow"
                                width={600}  // Provide width and height, OR use fill and a parent with position: relative
                                height={400}
                                priority
                            />
                        </Col>
                    </Row>

                    {/* Values Section */}
                    <Row className="mt-5 text-center">
                        <Col>
                            <h2>Our Core Values</h2>
                        </Col>
                    </Row>
                    <Row className="g-4 mt-2">
                        <Col sm={6} md={4}>
                            <div className="text-center">
                                <Image
                                    src={valuesImageUrl1.src}
                                    alt="Flexible Learning"
                                    width={300}  // Set appropriate width/height, or use 'fill'
                                    height={200}
                                    className="img-fluid rounded mb-3" // Use Bootstrap's responsive image class
                                    priority
                                />
                                <h4 className="mt-2">Accessibility</h4>
                                <p>Education is a right, not a privilege.</p>
                            </div>
                        </Col>
                        <Col sm={6} md={4}>
                            <div className="text-center">
                                <Image
                                    src={valuesImageUrl2.src}
                                    alt="Flexible Learning"
                                    width={300}  // Set appropriate width/height, or use 'fill'
                                    height={200}
                                    className="img-fluid rounded mb-3" // Use Bootstrap's responsive image class
                                    priority
                                />
                                <h4 className="mt-2">Community</h4>
                                <p>Learning is better together.</p>
                            </div>
                        </Col>
                        <Col sm={12} md={4}>
                            <div className="text-center">
                                <Image
                                    src={valuesImageUrl3.src}
                                    alt="Flexible Learning"
                                    width={300}  // Set appropriate width/height, or use 'fill'
                                    height={200}
                                    className="img-fluid rounded mb-3" // Use Bootstrap's responsive image class
                                    priority
                                />
                                <h4 className="mt-2">Quality</h4>
                                <p>High standards for content and experience.</p>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </Container>
        </>
    );
};

export default OurMissionPage;