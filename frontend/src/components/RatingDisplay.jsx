import React from 'react';
import { Badge } from 'react-bootstrap';

const RatingDisplay = ({ rating = 0, count = 0, showCount = true, large = false }) => {
  const roundedRating = Math.round(Number(rating) || 0);
  return (
    <div className="d-flex align-items-center gap-2">
      <span className={`text-warning ${large ? 'fs-4' : 'small'}`} aria-label={`${Number(rating).toFixed(1)} out of 5 stars`}>
        {'★'.repeat(roundedRating)}{'☆'.repeat(5 - roundedRating)}
      </span>
      {showCount && (
        <Badge bg="light" text="dark">
          {Number(rating).toFixed(1)} ({count} reviews)
        </Badge>
      )}
    </div>
  );
};

export default RatingDisplay;
