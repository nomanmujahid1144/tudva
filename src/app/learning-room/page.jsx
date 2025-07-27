import React from 'react';
import PageBanner from '../components/banner/PageBanner';
import { Col, Container, Row, Image } from 'react-bootstrap';
import missionImageUrl from "../../assets/images/about/01.jpg";
export const metadata = {
    title: 'Learning Rooms | Tudva',
    description: 'Discover Tudva Learning Rooms: collaborative spaces for online learning.',
};
const LearningRoom = () => {
    return <>
        <PageBanner
            bannerHeadline="learning room"
        />
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col lg={8} className="text-center">
                    <h1>Tudva Learning Rooms</h1>
                    <p className="lead">
                        Experience the power of collaborative learning in a supportive environment.
                    </p>
                </Col>
            </Row>

            <Row className="g-4 mt-4">
                <Col md={6}>
                    <h2>What are Learning Rooms?</h2>
                    <p>
                        {` Tudva Learning Rooms are physical spaces, provided by institutions and organizations,
            where students can gather to participate in Tudva's online courses together.
            They offer a dedicated environment for focused learning, fostering a sense of community
            and providing access to resources that might not be available at home.`}
                    </p>
                    <p>
                        {`Learning Rooms can be equipped with computers, reliable internet access, and
            headphones, allowing students to participate in live sessions and access recorded content
            without distractions. They're also a great place to connect with other learners in your area.`}
                    </p>
                </Col>
                <Col md={6}>
                    <Image
                        src={missionImageUrl.src}
                        alt="Students in a learning room"
                        className="img-fluid rounded shadow"
                        width={500}
                        height={200}
                        priority
                    />
                </Col>
            </Row>

            <Row className="g-4 mt-4">
                <Col md={6}>
                    <Image
                        src={missionImageUrl.src}
                        alt="Map of learning room locations"
                        className="img-fluid rounded shadow"
                        width={500}
                        height={200}
                        priority
                    />
                </Col>
                <Col md={6}>
                    <h2>Find a Learning Room Near You</h2>
                    <p>
                        {`Use our interactive map to find a Tudva Learning Room in your area.`}
                        {/* You'll replace this with your actual map/search functionality */}
                    </p>
                    {/* Placeholder for map/search integration */}
                    <div className="border p-3 mb-3">
                        Map/Search Placeholder.  Integrate your map/search component here.
                    </div>
                    <p>{`Can't find a Learning Room near you? Contact us to suggest a potential location!`}</p>

                    <a href="/contact" className="btn btn-outline-primary">Suggest a Location</a>
                </Col>
            </Row>

            <Row className="g-4 mt-4">
                <Col md={6}>
                    <h2>For Institutions: Host a Learning Room</h2>
                    <p>
                        {`Are you an institution interested in providing a Tudva Learning Room?  We'd love to partner with you!
                        Hosting a Learning Room offers several benefits:`}
                    </p>
                    <ul>
                        <li>Expand access to education in your community.</li>
                        <li>Provide a valuable resource for students who may lack access to technology or a quiet study space.</li>
                        <li>Foster a sense of community and collaboration among learners.</li>
                        <li>{`Enhance your institution's reputation as a supporter of lifelong learning.`}</li>
                    </ul>
                    <p>
                        To learn more about hosting a Learning Room, please contact us.
                    </p>
                    <a href="/contact-us" className="btn btn-secondary">Contact Us</a>
                </Col>
                <Col md={6}>
                    <Image
                        src={missionImageUrl.src}
                        alt="Institution hosting a learning room"
                        className="img-fluid rounded shadow"
                        width={500}
                        height={200}
                        priority
                    />
                </Col>
            </Row>
        </Container>
    </>;
};
export default LearningRoom;
