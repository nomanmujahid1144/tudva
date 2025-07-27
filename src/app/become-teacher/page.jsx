import React from 'react';
import PageBanner from '../components/banner/PageBanner';
import { Col, Container, Row, Image } from 'react-bootstrap';
import missionImageUrl from "../../assets/images/about/01.jpg";
export const metadata = {
  title: 'Become a Teacher | Tudva',
  description: 'Share your knowledge and passion with the world.  Learn how to become a volunteer instructor on Tudva.',
};
const BecomeTeacher = () => {
  return <>
    <PageBanner
      bannerHeadline="become a teacher"
    />
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col lg={8} className="text-center">
          <h1>Become a Tudva Instructor</h1>
          <p className="lead">
            Share your expertise and passion with a global community of learners.
          </p>
        </Col>
      </Row>

      <Row className="g-4 mt-4">
        <Col md={6}>
          <h2>Why Teach on Tudva?</h2>
          <ul>
            <li>Make a Difference:  Contribute to making high-quality education accessible to everyone.</li>
            <li>Share Your Passion:  Connect with students who are eager to learn what you know.</li>
            <li>Flexible Schedule:  Create and deliver courses on your own terms, choosing times that work for you.</li>
            <li>Community Support:  Join a network of passionate volunteer instructors.</li>
            <li>No Fees: Tudva is a free platform, both for learners and instructors.</li>
            <li>Easy-to-Use Tools:  Our platform provides the tools you need to create and manage your courses, upload materials, and interact with students.</li>
          </ul>
        </Col>
        <Col md={6}>
          <Image
            src={missionImageUrl.src}
            alt="Teacher with students"
            width={500}
            height={250}
            className="img-fluid rounded shadow"
            priority
          />
        </Col>
      </Row>

      <Row className="mt-5">
        <Col>
          <h2>How to Become a Teacher</h2>
          <ol>
            <li>Create an Account: If you don&apos;t already have one, <a href="/register">register for a free Tudva account</a>.</li>
            <li>Apply to Teach:  Fill out our instructor application form [Link to Application Form - e.g., /become-teacher/apply].  Tell us about your expertise, the topics you&apos;d like to teach, and your teaching experience (if any).  Prior teaching experience is not required.</li>
            <li>Review Process: Our team will review your application.  We&apos;ll look for a clear passion for teaching, expertise in your chosen subject, and a commitment to Tudva&apos;s mission.</li>
            <li>Get Approved:  If your application is approved, you&apos;ll receive an email with instructions on how to get started.</li>
            <li>Create Your Course:  Use our platform&apos;s tools to create your course, including modules, schedules, and learning materials.</li>
            <li>Start Teaching!:  Connect with students and share your knowledge!</li>
          </ol>
        </Col>
      </Row>

      <Row className="mt-5">
        <Col>
          <h2>Requirements</h2>
          <p>
            While we welcome instructors of all backgrounds, we do have some basic requirements:
          </p>
          <ul>
            <li>Expertise:  You should have a strong understanding of the subject you want to teach.</li>
            <li>Passion:  A genuine enthusiasm for sharing your knowledge with others.</li>
            <li>Commitment:  A willingness to dedicate the time needed to create and deliver high-quality courses.</li>
            <li>Communication Skills: The ability to communicate clearly and effectively with learners.</li>
            <li>Technical Proficiency:  Basic computer skills and the ability to use our online platform.</li>
          </ul>
        </Col>
      </Row>
    </Container>
  </>;
};
export default BecomeTeacher;
