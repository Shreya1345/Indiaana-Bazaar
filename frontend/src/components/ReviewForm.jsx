import React, { useContext, useState } from 'react';
import { Card, Form, Button } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';

const ReviewForm = ({ productId, onSubmitted }) => {
  const { user } = useContext(AuthContext);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submitReview = async (event) => {
    event.preventDefault();
    if (!user) return alert('Please login to write a review.');
    setSubmitting(true);
    try {
      const res = await fetch(`/api/reviews/product/${productId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({ rating, comment })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Unable to submit review.');
      onSubmitted?.(data);
      setComment('');
      setRating(5);
    } catch (error) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="shadow-sm h-100">
      <Card.Body className="p-4">
        <h4 className="mb-3">Write a Review</h4>
        {user ? (
          <Form onSubmit={submitReview}>
            <Form.Group className="mb-3">
              <Form.Label>Rating</Form.Label>
              <Form.Select value={rating} onChange={(event) => setRating(Number(event.target.value))}>
                {[5, 4, 3, 2, 1].map((value) => (
                  <option key={value} value={value}>{value} Stars</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Comment</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                maxLength={1000}
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                required
                placeholder="Share your experience..."
              />
            </Form.Group>
            <Button type="submit" className="w-100" disabled={submitting || !comment.trim()}>
              {submitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </Form>
        ) : (
          <p className="text-secondary mb-0">Please login to write a review.</p>
        )}
      </Card.Body>
    </Card>
  );
};

export default ReviewForm;
