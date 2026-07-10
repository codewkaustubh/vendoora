/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Star, StarHalf } from 'lucide-react';

interface StarRatingProps {
  id?: string;
  rating: number;
  maxStars?: number;
  className?: string;
}

export default function StarRating({ id, rating, maxStars = 5, className = '' }: StarRatingProps) {
  const stars = [];
  const fullStarsCount = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.25 && rating % 1 <= 0.75;
  const roundedStarsCount = rating % 1 > 0.75 ? fullStarsCount + 1 : fullStarsCount;

  for (let i = 1; i <= maxStars; i++) {
    if (i <= roundedStarsCount) {
      stars.push(
        <Star
          key={i}
          id={id ? `${id}-star-full-${i}` : undefined}
          className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0 animate-pulse-scale"
        />
      );
    } else if (i === roundedStarsCount + 1 && hasHalfStar) {
      stars.push(
        <StarHalf
          key={i}
          id={id ? `${id}-star-half` : undefined}
          className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0"
        />
      );
    } else {
      stars.push(
        <Star
          key={i}
          id={id ? `${id}-star-empty-${i}` : undefined}
          className="w-4 h-4 text-zinc-300 dark:text-zinc-600 shrink-0"
        />
      );
    }
  }

  return (
    <div id={id} className={`flex items-center gap-1 ${className}`}>
      {stars}
      <span className="text-xs font-semibold ml-1 text-zinc-600 dark:text-zinc-300">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}
