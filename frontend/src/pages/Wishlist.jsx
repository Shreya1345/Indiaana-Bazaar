import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Spinner, Card, Button } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import { Icon } from '@iconify/react';

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
        <h2 className="d-flex align-items-center justify-content-center gap-2">
          <Icon icon="mdi:heart-outline" aria-hidden="true" /> Wishlist
        </h2>
        <p className="text-secondary">Login to view your saved products.</p>
        <Button as={Link} to="/login" className="d-inline-flex align-items-center gap-2 mx-auto">
          <Icon icon="mdi:login" aria-hidden="true" /> Login
        </Button>
      </Container>
    );
  }

  return (
    <Container>
      <h2 className="mb-4 d-flex align-items-center gap-2">
        <Icon icon="mdi:heart" className="text-danger" aria-hidden="true" /> My Wishlist
      </h2>
      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
      ) : products.length === 0 ? (
        <Card className="text-center p-5">
          <Icon icon="mdi:heart-off-outline" width="40" className="text-secondary mx-auto mb-3" aria-hidden="true" />
          <p className="mb-3">No products in your wishlist.</p>
          <Button as={Link} to="/shop" className="d-inline-flex align-items-center gap-2 mx-auto">
            <Icon icon="mdi:storefront-outline" aria-hidden="true" /> Browse Products
          </Button>
        </Card>
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
