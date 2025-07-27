import React from 'react';
import Counter from './components/Counter';
import Earnings from './components/Earnings';
import SupportRequests from './components/SupportRequests';
import TopInstructors from './components/TopInstructors';
import NoticeBoard from './components/NoticeBoard';
import TrafficSourcesChart from './components/TrafficSourcesChart';
import { Col, Row } from 'react-bootstrap';
export const metadata = {
  title: 'Admin Dashboard'
};
const AdminDashboardPage = () => {
  return <>
      <Row>
        <Col xs={12} className=" mb-3">
          <h1 className="h3 mb-2 mb-sm-0">Dashboard</h1>
        </Col>
      </Row>
      <Counter />
      <Row className="g-4 mb-4">
        <Earnings />
        <SupportRequests />
      </Row>
      <Row className="g-4">
        <TopInstructors />
        <NoticeBoard />
        <TrafficSourcesChart />
      </Row>
    </>;
};
export default AdminDashboardPage;
