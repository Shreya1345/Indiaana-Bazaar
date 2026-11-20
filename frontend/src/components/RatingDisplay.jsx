import { Badge } from 'react-bootstrap';
import StarRating from './StarRating';

const RatingDisplay = ({ rating = 0, count = 0, showCount = true, large = false }) => {
  const numericRating = Number(rating) || 0;
  return (
    <div className="d-flex align-items-center gap-2">
      <StarRating rating={numericRating} large={large} />
      {showCount && (
        <Badge bg="light" text="dark">
          {numericRating.toFixed(1)} ({count} reviews)
        </Badge>
      )}
    </div>
  );
};

export default RatingDisplay;
