import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import { motion } from 'framer-motion';
import ProductCard from '../components/ProductCard';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const query = searchParams.get('q')?.trim() || '';
        const res = await fetch(`/api/products${query ? `?q=${encodeURIComponent(query)}` : ''}`);
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [searchParams]);

  return (
    <Container>
      <motion.section
        aria-label="Shop banner"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="rounded-4 p-4 p-md-5 mb-5 text-light shadow"
        style={{
          background: 'linear-gradient(135deg, #0d6efd 0%, #6f42c1 100%)'
        }}
      >
        <h1 className="display-5 fw-bold mb-2">Shop Indiaana Bazaar</h1>
        <p className="lead mb-0">Discover products across all categories.</p>
      </motion.section>

      <section aria-label="Product catalog">
        <h2 className="mb-4">All Products</h2>
      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
      ) : (
        products.length === 0 ? (
          <div className="text-center py-5 text-secondary">
            <h5>No products found</h5>
            {searchParams.get('q') && <p>Try a different search term.</p>}
          </div>
        ) : (
          <Row className="g-4">
            {products.map((product) => (
              <Col key={product._id} xs={12} sm={6} md={4} lg={3}>
                <ProductCard product={product} />
              </Col>
            ))}
          </Row>
        )
      )}
      </section>
    </Container>
  );
};

export default Shop;
