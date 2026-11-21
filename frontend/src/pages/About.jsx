import React from 'react';
import { Container, Row, Col, Card, Badge } from 'react-bootstrap';

const About = () => {
  return (
    <Container>
      <Row className="justify-content-center">
        <Col lg={9}>
          <Card className="border shadow-sm">
            <Card.Body className="p-4 p-md-5">
              <Badge bg="primary" className="mb-3 px-3 py-2">About Indiana Bazaar</Badge>
              <h1 className="display-6 fw-bold mb-3">A simpler way to discover and shop</h1>
              <p className="lead text-secondary">
                Indiana Bazaar is an online marketplace focused on clear product information,
                secure payments, and a smooth shopping experience for customers across India.
              </p>

              <Row className="g-4 mt-2">
                <Col md={4}>
                  <Card className="h-100 border bg-light">
                    <Card.Body>
                      <h5>Curated Products</h5>
                      <p className="text-secondary mb-0">Explore a focused collection of useful, quality products.</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="h-100 border bg-light">
                    <Card.Body>
                      <h5>Secure Payments</h5>
                      <p className="text-secondary mb-0">Payments are processed safely through Razorpay in INR.</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="h-100 border bg-light">
                    <Card.Body>
                      <h5>Customer Support</h5>
                      <p className="text-secondary mb-0">Manage orders, shipping details, and purchases conveniently.</p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <div className="border-top mt-4 pt-4">
                <h5>Our Promise</h5>
                <p className="text-secondary mb-0">
                  We aim to make online shopping transparent, reliable, and easy for every customer.
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default About;
