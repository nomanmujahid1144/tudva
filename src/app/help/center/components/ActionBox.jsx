import React from 'react';
import { actionBoxData } from '../../data';
import { Button, Col, Container, Row } from 'react-bootstrap';
//actionBoxData: ActionBoxType[]

const ActionCard = ({
  actionName,
  description,
  icon: Icon,
  title,
  variant
}) => {
  return <Col lg={4}>
      <div className={`bg-${variant} bg-opacity-10 rounded-3 p-5`}>
        <h2 className={`display-5 text-${variant}`}><Icon size={65} /></h2>
        <h3>{title}</h3>
        <p>{description}</p>
        <Button variant='dark' className="mb-0">{actionName}</Button>
      </div>
    </Col>;
};
const ActionBox = () => {
  return <section>
      <Container>
        <Row className="g-4">
          {actionBoxData.map((item, idx) => <ActionCard key={idx} {...item} />)}
        </Row>
      </Container>
    </section>;
};
export default ActionBox;
