import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Stack } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="premium-footer mt-auto">
      <Container fluid="xl">
        <Row className="align-items-center g-4">
          <Col md>
            <h5 className="footer-brand mb-1">Indiana Bazaar</h5>
            <p className="text-secondary small mb-0">Curated shopping, thoughtfully delivered.</p>
          </Col>
          <Col md="auto">
            <Stack direction="horizontal" gap={4} className="small justify-content-md-end footer-links">
              <Link to="/about">About</Link>
              <Link to="/return">Returns</Link>
              <Link to="/disclaimer">Disclaimer</Link>
            </Stack>
          </Col>
          <Col md="auto" className="text-secondary small text-md-end">
            &copy; {new Date().getFullYear()} Indiana Bazaar
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
