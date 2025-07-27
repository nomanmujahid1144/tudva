import React from 'react';
import PageBanner from '../components/banner/PageBanner';
import { Container, Row, Col } from 'react-bootstrap';
export const metadata = {
    title: 'Get Started | Tudva', // More specific title
    description: 'Learn how to get started with Tudva and begin your learning journey.', // Add a meta description
  };
const GetStarted = () => {
    return <>
        <PageBanner
            bannerHeadline="get started"
        />
        <Container className="py-5"> {/* Added py-5 for padding */}
            <Row className="justify-content-center">
                <Col md={8}> {/* Use md={8} for a reasonable content width */}
                    <h2>Welcome to Tudva!</h2>
                    <p className="lead">
                        Ready to start learning? This guide will walk you through the basics of using the Tudva platform.
                    </p>

                    <h3>Step 1: Create Your Free Account</h3>
                    <p>
                       To access Tudva&apos;s courses, you&apos;ll need a free account.  Click the Sign Up button in the top
                        right corner of the page (or visit <a href="/auth/signup">/register</a>).  You&apos;ll need to provide your
                        email address, name, and choose a secure password.  Don&apos;t forget to confirm your email address
                        after signing up!
                    </p>

                    <h3>Step 2: Browse the Course Catalog</h3>
                    <p>
                        {`Once you're logged in, you can explore our wide range of courses.  Go to the <a href="/courses">Courses</a> page
                        to see all available courses. You can filter by subject, format (live or recorded), and the day of
                        the week the course is offered.`}
                    </p>

                    <h3>Step 3: Configure Your Learning Day</h3>
                    <p>
                        {`Tudva allows you to create a personalized weekly learning schedule.  Currently, we offer courses on
                        a specific day of the week (e.g., Wednesday). You can choose up to 6 lessons to fill your learning day.`}
                    </p>
                    <ul>
                        <li>Go to the <a href="#">My Schedule</a> page (this link might need adjustment).</li>
                        <li>{`You'll see a list of available time slots for the designated learning day.`}</li>
                        <li>Browse the available courses and click &quot;Book&quot; to add a course to a specific time slot.</li>
                        <li>The system will automatically prevent you from booking conflicting courses.</li>
                        <li>{`Once you've filled your schedule, you're ready to learn!`}</li>
                    </ul>

                    <h3>Step 4: Attend Live Courses (or Watch Recordings)</h3>
                    <p>
                        {`For live courses, join the session at the scheduled time. You'll be able to interact with the
                        instructor and other learners via live chat.  If you miss a live session, or if you've chosen a
                        recorded course, you can find the recording in your personal learning folder.`}
                    </p>

                    <h3>Step 5: Access Learning Materials</h3>
                    <p>
                        Instructors can upload course materials (PDFs, audio files, etc.) to their courses.  You can find
                        these materials in your personal learning folder.  Only the latest versions of materials are
                        displayed, but older versions are archived for your reference.
                    </p>

                    <h3>Step 6: Join the Community (Optional)</h3>
                    <p>
                        Connect with other learners and instructors in our community forums (link to forums, if you have them).  Share your
                        experiences, ask questions, and learn from others.
                    </p>

                    <h3>Step 7: (Optional) Consider becoming an instructor.</h3>
                    <p>
                        Share your knowledge with others.
                    </p>

                    <h3>Need Help?</h3>
                    <p>
                        Check out our <a href="/faq">FAQ</a> page or <a href="/contact-us">contact us</a> if you have any questions.
                    </p>

                    <div className="text-center">
                        <a href="/auth/sign-up" className="btn btn-primary btn-lg">Create Your Account</a>
                    </div>
                </Col>
            </Row>
        </Container>

    </>;
};
export default GetStarted;
