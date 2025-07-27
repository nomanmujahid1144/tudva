import React from 'react';
import { Container, Row, Col, Image } from 'react-bootstrap';
import learningImageUrl from "../../assets/images/about/01.jpg";
import communityImageUrl from "../../assets/images/about/02.jpg";
import freeImageUrl from "../../assets/images/about/04.jpg";
import PageBanner from '../components/banner/PageBanner';

export const metadata = { //Keep this metadata, you already had it
  title: 'Why Tudva'
};
const WhyTudva = () => {
    return (
        <>
        <PageBanner 
          bannerHeadline="why tudva"
        />
        <Container className="py-5"> {/* Added py-5 for padding on top and bottom */}
            <Row className="justify-content-center">
                <Col lg={8} className="text-center">
                    <h1>Why Choose Tudva?</h1>
                    <p className="lead">
                        Discover the benefits of learning with Tudva, a platform designed for lifelong learning.
                    </p>
                </Col>
            </Row>

            <Row className="g-4 mt-4"> {/* Added mt-4 for margin-top */}
                <Col md={6} lg={4}>
                    <div className="d-flex flex-column align-items-center">
                        <Image
                            src={learningImageUrl.src}
                            alt="Flexible Learning"
                            width={300}  // Set appropriate width/height, or use 'fill'
                            height={200}
                            className="img-fluid rounded mb-3" // Use Bootstrap's responsive image class
                            priority
                        />
                        <h3>Flexible Learning</h3>
                        <p>
                            Configure your own weekly learning schedule. Choose from live and recorded courses to fit your life.
                        </p>
                    </div>
                </Col>
                <Col md={6} lg={4}>
                <div className="d-flex flex-column align-items-center">
                        <Image
                            src={communityImageUrl.src}
                            alt="Community Based"
                            width={300}
                            height={200}
                            className="img-fluid rounded mb-3"
                            priority
                        />
                        <h3>Community-Based</h3>
                        <p>
                            Learn alongside a vibrant community of students and volunteer instructors.  Share knowledge and grow together.
                        </p>
                    </div>
                </Col>
                <Col md={6} lg={4}>
                <div className="d-flex flex-column align-items-center">
                        <Image
                            src={freeImageUrl.src}
                            alt="Free Access"
                            width={300}
                            height={200}
                            className="img-fluid rounded mb-3"
                            priority
                        />
                        <h3>Free Access</h3>
                        <p>
                            High-quality education should be accessible to everyone. Tudva is completely free to use.
                        </p>
                    </div>
                </Col>
            </Row>

            <Row className="mt-5"> {/* Section for additional details */}
                <Col>
                    <h2>How Tudva Works</h2>
                    <p>
                        Tudva is built on the principle of flexible, community-driven learning. Here&apos;s a brief overview:
                    </p>
                    <ul>
                        <li><strong>Create Your Schedule:</strong>  Students can configure their ideal learning day by selecting from a variety of courses.</li>
                        <li><strong>Live and Recorded Courses:</strong>  Choose between interactive live sessions or flexible recorded content.</li>
                        <li><strong>Training Rooms:</strong> Institutions provide spaces for students to participate online together.</li>
                        <li><strong>Volunteer Instructors:</strong>  Courses are created and led by passionate volunteers.</li>
                        <li><strong>Personal Learning Folder:</strong> Access course materials and recordings in your personal learning folder.</li>
                        <li><strong>Community Interaction:</strong>  Connect with other learners and instructors, contributing to a supportive learning environment.</li>
                    </ul>
                    <p>
                       Ready to get started?  <a href="/courses">Explore our courses</a> or <a href="/register">create an account</a> today!
                    </p>

                </Col>
            </Row>
        </Container>
        </>
    );
};

export default WhyTudva;