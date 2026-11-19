import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Spinner, Card, Button } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';

const Wishlist = () => {
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    fetch('/api/wishlist', { headers: { Authorization: `Bearer ${user.token}` } })
      .then((res) => res.json())
      .then((data) => setProducts(Array.isArray(data.products) ? data.products : []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <Container className="text-center py-5">
        <h2>Wishlist</h2>
        <p className="text-secondary">Login to view your saved products.</p>
        <Button as={Link} to="/login">Login</Button>
      </Container>
    );
  }

  return (
    <Container>
      <h2 className="mb-4">My Wishlist</h2>
      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
      ) : products.length === 0 ? (
        <Card className="text-center p-5"><p className="mb-3">No products in your wishlist.</p><Button as={Link} to="/shop">Browse Products</Button></Card>
      ) : (
        <Row className="g-4">
          {products.map((product) => (
            <Col key={product._id} xs={12} sm={6} md={4} lg={3}>
              <ProductCard product={product} />
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default Wishlist;
