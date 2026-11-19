import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Stack } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="bg-white text-dark border border-light-subtle rounded-3 shadow-sm mt-auto mx-3 mb-3 py-4">
      <Container className="d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div>
          <h5 className="text-primary mb-1">Indiaana Bazaar</h5>
          <p className="text-secondary small mb-0">Premium E-Commerce Platform.</p>
        </div>
        <Stack direction="horizontal" gap={3} className="small">
          <Link to="/about" className="text-secondary text-decoration-none">About Us</Link>
          <Link to="/return" className="text-secondary text-decoration-none">Return Policy</Link>
          <Link to="/disclaimer" className="text-secondary text-decoration-none">Disclaimer</Link>
        </Stack>
        <div className="text-secondary small">
          &copy; {new Date().getFullYear()} Indiaana Bazaar. All rights reserved.
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
