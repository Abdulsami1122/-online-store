import { Star } from 'lucide-react';

export default function Rating({ value = 0, numReviews, showText = true }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = value >= star;
          const isHalf = value >= star - 0.5 && !isFilled;

          return (
            <Star
              key={star}
              size={14}
              style={{
                color: isFilled || isHalf ? '#fbbf24' : '#475569',
                fill: isFilled ? '#fbbf24' : isHalf ? '#fbbf2488' : 'none',
              }}
            />
          );
        })}
      </div>
      {showText && (
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: '0.25rem' }}>
          {value.toFixed(1)} {numReviews !== undefined && `(${numReviews})`}
        </span>
      )}
    </div>
  );
}
