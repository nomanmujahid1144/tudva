import React from 'react';
import { Button, Card, Col, Row } from 'react-bootstrap';
import { BsPatchCheckFill } from 'react-icons/bs';
export const metadata = {
  title: 'Subscription'
};
const SubscriptionPage = () => {
  return <Card className="card-body bg-transparent border rounded-3">
      <Row className="g-4">
        <Col xs={6} lg={3}>
          <span>Active Plan</span>
          <h4>Basic</h4>
        </Col>
        <Col xs={6} lg={3}>
          <span>Monthly limit</span>
          <h4>Unlimited</h4>
        </Col>
        <Col xs={6} lg={3}>
          <span>Cost</span>
          <h4>$99/Month</h4>
        </Col>
        <Col xs={6} lg={3}>
          <span>Renewal Date</span>
          <h4>Feb 17, 2023</h4>
        </Col>
      </Row>
      <div className="overflow-hidden my-4">
        <h6 className="mb-0">85%</h6>
        <div className="progress progress-sm bg-primary bg-opacity-10">
          <div className="progress-bar bg-primary aos" role="progressbar" data-aos="slide-right" data-aos-delay={200} data-aos-duration={1000} data-aos-easing="ease-in-out" style={{
          width: '85%'
        }} aria-valuenow={85} aria-valuemin={0} aria-valuemax={100}>
          </div>
        </div>
      </div>
      <div className="d-sm-flex justify-content-sm-between align-items-center">
        <div>
          <div className="d-sm-flex">
            <div className="form-check form-switch form-check-md">
              <input className="form-check-input" type="checkbox" id="checkPrivacy1" defaultChecked />
              <label className="form-check-label" htmlFor="checkPrivacy1">Auto Renewal</label>
            </div>
          </div>
          <p className="mb-0 small">Your plan will automatically renew on: 02/17/2023. Payment Amount: USD250</p>
        </div>
        <div className="mt-2 mt-sm-0">
          <button type="button" className="btn btn-sm btn-danger-soft me-2 mb-0">Cancel plan</button>&nbsp;
          <Button variant='success' size='sm' className="mb-0">Upgrade plan</Button>
        </div>
      </div>
      <hr />
      <Row>
        <h6 className="mb-3">The plan includes</h6>
        <Col md={6}>
          <ul className="list-unstyled">
            <li className="mb-3 h6 fw-light"><BsPatchCheckFill className="text-success me-2" />Up to 05 users monthly</li>
            <li className="mb-3 h6 fw-light"><BsPatchCheckFill className="text-success me-2" />Free 5 host &amp; domain</li>
            <li className="mb-3 h6 fw-light"><BsPatchCheckFill className="text-success me-2" />Custom infrastructure</li>
            <li className="mb-3 h6 fw-light"><BsPatchCheckFill className="text-success me-2" />Access to all our room</li>
          </ul>
        </Col>
        <Col md={6}>
          <ul className="list-unstyled">
            <li className="mb-3 h6 fw-light"><BsPatchCheckFill className="text-success me-2" />24/7 dedicated Support</li>
            <li className="mb-3 h6 fw-light"><BsPatchCheckFill className="text-success me-2" />Unlimited updates</li>
            <li className="h6 fw-light"><BsPatchCheckFill className="text-success me-2" />Landing pages &amp; Web widgets</li>
          </ul>
        </Col>
      </Row>
    </Card>;
};
export default SubscriptionPage;
