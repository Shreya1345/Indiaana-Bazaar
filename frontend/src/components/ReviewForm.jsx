import { useContext, useState } from 'react';
import { Card, Form, Button } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';
import StarRating from './StarRating';

const ReviewForm = ({ productId, onSubmitted }) => {
  const { user } = useContext(AuthContext);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submitReview = async (event) => {
    event.preventDefault();
    if (!user) return toast.error('Please login to write a review.');
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
      toast.success('Review submitted successfully.');
    } catch (error) {
      toast.error(error.message || 'Unable to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="shadow-sm h-100">
      <Card.Body className="p-4">
        <h4 className="mb-3"><Icon icon="mdi:comment-edit-outline" className="me-2 text-primary" aria-hidden="true" />Write a Review</h4>
        {user ? (
          <Form onSubmit={submitReview}>
            <Form.Group className="mb-3">
              <Form.Label>Rating</Form.Label>
              <div>
                <StarRating rating={rating} onChange={setRating} large />
                <div className="small text-secondary mt-1">{rating.toFixed(1)} out of 5</div>
              </div>
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
            <Button type="submit" className="w-100 d-inline-flex align-items-center justify-content-center gap-2" disabled={submitting || !comment.trim()}>
              <Icon icon={submitting ? 'mdi:loading' : 'mdi:send-outline'} aria-hidden="true" />
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
