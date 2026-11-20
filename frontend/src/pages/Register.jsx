import { useState, useContext } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Registration successful!');
        login(data);
        navigate(location.state?.from || '/', { replace: true });
      } else {
        toast.error(data.message || 'Unable to register.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Unable to register. Please try again.');
    }
  };

  return (
    <Container>
      <Row className="justify-content-center">
        <Col xs={12} md={7} lg={5}>
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              <h2 className="text-center mb-4"><Icon icon="mdi:account-plus-outline" className="me-2 text-primary" aria-hidden="true" />Register</h2>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </Form.Group>
                <Button type="submit" variant="primary" className="w-100 d-inline-flex align-items-center justify-content-center gap-2">
                  <Icon icon="mdi:account-plus-outline" aria-hidden="true" /> Register
                </Button>
              </Form>
              <p className="text-center text-secondary mt-3 mb-0">Already have an account? <Link to="/login" state={location.state}>Login</Link></p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;
