import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface RatingProps {
  value: number;
  max?: number;
  size?: number;
  readonly?: boolean;
  onChange?: (value: number) => void;
}

const Rating: React.FC<RatingProps> = ({ 
  value, 
  max = 5, 
  size = 16, 
  readonly = false,
  onChange
}) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const renderStar = (index: number) => {
    const starValue = index + 1;
    const isHovered = hoverValue !== null && starValue <= hoverValue;
    const isFilled = hoverValue === null && starValue <= value;
    const isHalf = hoverValue === null && starValue - 0.5 <= value && starValue > value;
    // Basic half-star approximation via SVG defs or simple color fill for full stars
    // For simplicity, we just fill full stars for ratings
    
    return (
      <button
        key={index}
        type="button"
        disabled={readonly}
        className={`rating-star ${readonly ? 'readonly' : ''}`}
        onMouseEnter={() => !readonly && setHoverValue(starValue)}
        onMouseLeave={() => !readonly && setHoverValue(null)}
        onClick={() => !readonly && onChange && onChange(starValue)}
        style={{ 
          background: 'none', 
          border: 'none', 
          padding: '2px', 
          cursor: readonly ? 'default' : 'pointer',
          color: (isHovered || isFilled || isHalf) ? 'var(--accent-primary)' : 'var(--text-light)',
          transition: 'transform 0.2s, color 0.2s',
          transform: (isHovered && !readonly) ? 'scale(1.2)' : 'scale(1)',
        }}
      >
        <Star 
          size={size} 
          fill={(isHovered || isFilled || isHalf) ? 'currentColor' : 'none'} 
          strokeWidth={1.5}
        />
      </button>
    );
  };

  return (
    <div className="rating-container" style={{ display: 'flex', alignItems: 'center' }}>
      {[...Array(max)].map((_, i) => renderStar(i))}
    </div>
  );
};

export default Rating;
