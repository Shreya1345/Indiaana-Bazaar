import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Button } from 'react-bootstrap';
import { motion } from 'framer-motion';
import WishlistButton from './WishlistButton';
import RatingDisplay from './RatingDisplay';

const ProductCard = ({ product }) => {
  const price = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(product.price);

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className="h-100"
    >
      <Card className="h-100 shadow-sm overflow-hidden">
        <div className="position-absolute end-0 top-0 p-2" style={{ zIndex: 3 }}>
          <WishlistButton productId={product._id} rounded />
        </div>
        <motion.div whileHover={{ scale: 1.03 }} transition={{ duration: 0.35 }}>
          <Card.Img variant="top" src={product.imageUrl} alt={product.name} style={{ height: '240px', objectFit: 'cover' }} />
        </motion.div>
        <Card.Body className="d-flex flex-column">
          <Card.Title className="text-truncate">{product.name}</Card.Title>
          <div className="mb-2">
            <RatingDisplay rating={product.ratings} count={product.numReviews} showCount={false} />
          </div>
          <Card.Text className="text-primary fw-bold fs-5 mb-3">{price}</Card.Text>
          <Button as={Link} to={`/product/${product._id}`} variant="primary" className="mt-auto">View Details</Button>
        </Card.Body>
      </Card>
    </motion.div>
  );
};

export default ProductCard;
