import { Icon } from '@iconify/react';

const StarRating = ({ rating = 0, onChange, large = false }) => {
  const numericRating = Number(rating);
  const safeRating = Number.isFinite(numericRating) ? Math.min(5, Math.max(0, numericRating)) : 0;
  const displayRating = Math.round(safeRating * 2) / 2;
  const iconSize = large ? 'fs-4' : 'small';

  return (
    <span
      className={`text-warning ${iconSize} d-inline-flex`}
      role={onChange ? 'group' : 'img'}
      aria-label={onChange ? 'Select a rating from 0.5 to 5 stars' : `${safeRating.toFixed(1)} out of 5 stars`}
    >
      {Array.from({ length: 5 }, (_, index) => {
        const starValue = index + 1;
        const icon = displayRating >= starValue
          ? 'mdi:star'
          : displayRating >= starValue - 0.5
            ? 'mdi:star-half-full'
            : 'mdi:star-outline';

        return (
          <span key={starValue} className="position-relative d-inline-flex">
            <Icon icon={icon} aria-hidden="true" />
            {onChange && (
              <>
                <button
                  type="button"
                  className="position-absolute top-0 bottom-0 start-0 p-0 border-0 bg-transparent"
                  style={{ width: '50%' }}
                  aria-label={`Set rating to ${starValue - 0.5} stars`}
                  aria-pressed={displayRating === starValue - 0.5}
                  onClick={() => onChange(starValue - 0.5)}
                />
                <button
                  type="button"
                  className="position-absolute top-0 bottom-0 end-0 p-0 border-0 bg-transparent"
                  style={{ width: '50%' }}
                  aria-label={`Set rating to ${starValue} ${starValue === 1 ? 'star' : 'stars'}`}
                  aria-pressed={displayRating === starValue}
                  onClick={() => onChange(starValue)}
                />
              </>
            )}
          </span>
        );
      })}
    </span>
  );
};

export default StarRating;
