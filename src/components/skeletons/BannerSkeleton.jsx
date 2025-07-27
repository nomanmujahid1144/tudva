import { Card, Col, Container, Row } from "react-bootstrap";
import { FaSlidersH } from "react-icons/fa";

export const BannerSkeleton = ({ patternImg }) => {
    return (
        <section className="pt-0">
            <Container fluid className="px-0">
                <Card
                    className="bg-blue h-100px h-md-200px rounded-0"
                    style={{
                        background: `url(${patternImg.src}) no-repeat center center`,
                        backgroundSize: 'cover',
                        opacity: 0.7,
                    }}
                />
            </Container>

            <Container className="mt-n4">
                <Row>
                    <Col xs={12}>
                        <Card className="bg-transparent card-body pb-0 px-0 mt-2 mt-sm-0">
                            <Row className="d-sm-flex justify-sm-content-between mt-2 mt-md-0">
                                {/* Skeleton Avatar */}
                                <Col xs={'auto'}>
                                    <div className="avatar avatar-xxl position-relative mt-n3">
                                        <div
                                            className="rounded-circle border border-white border-3 shadow bg-light"
                                            style={{ width: 100, height: 100, animation: 'pulse 1.5s infinite ease-in-out' }}
                                        />
                                    </div>
                                </Col>

                                {/* Skeleton User Info & Stats */}
                                <Col className="d-sm-flex justify-content-between align-items-center">
                                    <div>
                                        <div className="my-1 bg-light rounded" style={{ width: '150px', height: '28px', animation: 'pulse 1.5s infinite ease-in-out' }} />
                                        <ul className="list-inline mb-0">
                                            <li className="list-inline-item me-3 mb-1 mb-sm-0">
                                                <div className="bg-light rounded" style={{ width: '120px', height: '18px', animation: 'pulse 1.5s infinite ease-in-out' }} />
                                            </li>
                                            <li className="list-inline-item me-3 mb-1 mb-sm-0">
                                                <div className="bg-light rounded" style={{ width: '160px', height: '18px', animation: 'pulse 1.5s infinite ease-in-out' }} />
                                            </li>
                                            <li className="list-inline-item me-3 mb-1 mb-sm-0">
                                                <div className="bg-light rounded" style={{ width: '170px', height: '18px', animation: 'pulse 1.5s infinite ease-in-out' }} />
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="mt-2 mt-sm-0">
                                        <div className="bg-light rounded" style={{ width: '130px', height: '38px', animation: 'pulse 1.5s infinite ease-in-out' }} />
                                    </div>
                                </Col>
                            </Row>
                        </Card>

                        {/* Mobile Menu Toggle (not part of skeleton) */}
                        <hr className="d-xl-none" />
                        <Col xs={12} xl={3} className="d-flex justify-content-between align-items-center">
                            <span className="h6 mb-0 fw-bold d-xl-none">Menu</span>
                            <button
                                className="btn btn-primary d-xl-none"
                                type="button"
                                disabled
                            >
                                <FaSlidersH />
                            </button>
                        </Col>
                    </Col>
                </Row>
            </Container>

            {/* CSS for skeleton animation */}
            <style jsx>{`
          @keyframes pulse {
            0% { opacity: 0.6; }
            50% { opacity: 0.3; }
            100% { opacity: 0.6; }
          }
        `}</style>
        </section>
    );
};