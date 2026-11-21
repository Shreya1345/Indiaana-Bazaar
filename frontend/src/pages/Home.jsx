import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Spinner, Button, Badge } from 'react-bootstrap';
import { motion } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import { Icon } from '@iconify/react';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        setProducts(data.slice(0, 4)); // Featured products
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <Container>
      <section id="hero" aria-label="Featured store banner">
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="home-hero position-relative overflow-hidden rounded-4 p-4 p-md-5 mb-5 text-light"
          style={{
            minHeight: '420px',
            display: 'block',
            visibility: 'visible',
            opacity: 1
          }}
        >
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="position-absolute rounded-circle"
          style={{ width: '220px', height: '220px', right: '-70px', top: '-90px', background: 'rgba(255,255,255,.12)' }}
        />
        <Row className="align-items-center position-relative" style={{ minHeight: '330px' }}>
          <Col lg={7}>
            <Badge bg="light" text="primary" className="mb-3 px-3 py-2">Indiana Bazaar</Badge>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25, duration: 0.6 }}
              className="display-3 fw-bold"
            >
              Discover Products You'll Love
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.6 }}
              className="lead mb-4"
            >
              Shop trusted favorites, fresh arrivals, and great-value deals across every category.
            </motion.p>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Button as={Link} to="/shop" variant="light" size="lg" className="px-4 fw-semibold text-primary">
                <Icon icon="mdi:storefront-outline" className="me-2" aria-hidden="true" />
                Explore the Shop
              </Button>
            </motion.div>
          </Col>
          <Col lg={5} className="d-none d-lg-flex justify-content-center">
            <motion.img
              src="/Logo.png"
              alt="Indiana Bazaar"
              className="rounded-4 shadow-lg"
              initial={{ opacity: 0, scale: 0.85, rotate: -3 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: 0.35, duration: 0.7 }}
              style={{
                width: '260px',
                height: '260px',
                objectFit: 'cover',
                background: '#fff',
                border: '10px solid rgba(255,255,255,.18)'
              }}
            />
          </Col>
        </Row>
        </motion.section>
      </section>

      <section aria-label="Store benefits">
        <Row className="g-3 mb-5">
        {[
          ['Fast Delivery', 'Reliable shipping across India', 'mdi:truck-fast-outline', 'success'],
          ['Secure Checkout', 'Safe Razorpay payments', 'mdi:shield-check-outline', 'primary'],
          ['Easy Shopping', 'Simple cart and order tracking', 'mdi:shopping-outline', 'warning']
        ].map(([title, text, icon, variant], index) => (
          <Col md={4} key={title}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.12, duration: 0.45 }}
              whileHover={{ y: -6 }}
              className="h-100 rounded-4 border bg-white p-4 shadow-sm"
            >
              <div className={`display-6 mb-2 text-${variant}`}><Icon icon={icon} aria-hidden="true" /></div>
              <h5 className="mb-1">{title}</h5>
              <p className="text-secondary mb-0">{text}</p>
            </motion.div>
          </Col>
        ))}
        </Row>
      </section>

      <section id="featured-products" aria-label="Featured products" className="pt-3">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="d-flex align-items-center justify-content-between mb-4"
        >
          <div>
            <Badge bg="warning" text="dark" className="mb-2">Fresh selections</Badge>
            <h2 className="mb-0">Featured Products</h2>
          </div>
          <Button as={Link} to="/shop" variant="outline-primary" className="d-inline-flex align-items-center gap-2">
            View All <Icon icon="mdi:arrow-right" aria-hidden="true" />
          </Button>
        </motion.div>

        {loading ? (
          <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
        ) : (
          <Row className="g-4">
            {products.map((product, index) => (
              <Col key={product._id} xs={12} sm={6} lg={3}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: index * 0.1, duration: 0.55 }}
                  className="h-100"
                >
                  <ProductCard product={product} />
                </motion.div>
              </Col>
            ))}
          </Row>
        )}
      </section>
    </Container>
  );
};

export default Home;
