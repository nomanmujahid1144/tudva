import React from 'react';
import { Container, Row, Col, Image } from 'react-bootstrap';
// Use the provided image import
import missionImageUrl from "../../assets/images/about/01.jpg";
import PageBanner from '../components/banner/PageBanner';

const features = [
    { title: "Flexible Scheduling", description: "Create a personalized learning schedule that fits your life.", icon: "/icon-schedule.svg" }, // Replace with actual paths
    { title: "Live & Recorded Courses", description: "Choose from interactive live sessions or watch recorded courses at your own pace.", icon: "/icon-live.svg" },
    { title: "Community Support", description: "Connect with fellow learners and instructors in a supportive environment.", icon: "/icon-community.svg" },
    { title: "Free Access", description: "All courses are completely free of charge.", icon: "/icon-free.svg" },
    { title: "Diverse Subjects", description: "Explore a wide range of subjects, from languages to digital skills.", icon: "/icon-diverse.svg" },
    { title: "Personal Learning Folder", description: "Easily access course materials and recordings.", icon: "/icon-folder.svg" },
];


const HowItWorksPage = () => {
    return (
        <>
            <PageBanner
                bannerHeadline="how it works"
            />
            {/* <Container fluid className="p-0">
                <Row className="g-0">
                    <Col>
                        <div
                            className="text-bg-dark p-4 p-sm-5  text-center"

                            style={{
                                minHeight: '300px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <div>
                                <h1 className="display-4 fw-bold">How it Works</h1>
                                <p className="lead">
                                    Empowering Lifelong Learning for Everyone, Free of Charge and Community-Based.
                                </p>
                            </div>

                        </div>

                    </Col>
                </Row>
            </Container> */}

            <Container className="py-5">
                <Row className="g-4">
                    <Col md={6} className="d-flex align-items-center">
                        <div>
                            <h2>What Drives Us</h2>
                            <p className="lead" style={{ whiteSpace: 'pre-line' }}>{`
                                    At Tudva, we believe that learning should be a lifelong pursuit,
                                    unconstrained by cost, location, or background. We're building
                                    a platform where knowledge is freely shared, communities thrive,
                                    and individuals are empowered to reach their full potential.
                                `}</p>
                            <p>
                                We envision a world where anyone, anywhere, can access the education they need to improve their lives and contribute to society.
                            </p>
                        </div>
                    </Col>
                    <Col md={6}>
                        <Image
                            src={missionImageUrl.src}
                            alt="People learning together"
                            className="img-fluid rounded shadow"
                            width={500}  // Provide width and height, OR use fill and a parent with position: relative
                            height={300}
                            priority
                        />
                    </Col>
                </Row>

                <Row className="mt-5">
                    <Col>
                        <h2 className='text-center'>Our Values</h2>
                        <ul className="list-group list-group-flush">
                            {features.map((value, index) => (
                                <li key={index} className="list-group-item d-flex align-items-center">
                                    <img src={value.icon} alt={value.title} style={{ width: "40px", height: "40px", marginRight: '1rem' }} />
                                    <div>
                                        <h5>{value.title}</h5>
                                        <p>{value.description}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default HowItWorksPage;