/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ReactNode } from 'react';

interface HorizontalScrollerProps {
  id: string;
  children: ReactNode;
  className?: string;
}

export default function HorizontalScroller({ id, children, className = '' }: HorizontalScrollerProps) {
  return (
    <div
      id={id}
      className={`w-full overflow-x-auto overflow-y-hidden flex items-stretch gap-6 pb-4 scroll-smooth scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700 ${className}`}
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      {children}
    </div>
  );
}
