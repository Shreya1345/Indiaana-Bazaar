import React from 'react';
import { Card } from 'react-bootstrap';

const ReviewList = ({ reviews = [] }) => (
  <Card className="shadow-sm h-100">
    <Card.Body className="p-4">
      <h3 className="mb-4">Customer Reviews</h3>
      {reviews.length === 0 ? (
        <p className="text-secondary mb-0">No reviews yet. Be the first to review this product.</p>
      ) : reviews.map((review) => (
        <div key={review._id} className="border-bottom pb-3 mb-3">
          <div className="d-flex justify-content-between align-items-start">
            <strong>{review.name || review.userId?.name || 'Customer'}</strong>
            <small className="text-secondary">{new Date(review.createdAt).toLocaleDateString()}</small>
          </div>
          <div className="text-warning">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div>
          <p className="text-secondary mb-0 mt-2">{review.comment}</p>
        </div>
      ))}
    </Card.Body>
  </Card>
);

export default ReviewList;
