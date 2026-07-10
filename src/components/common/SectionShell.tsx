/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ReactNode } from 'react';

interface SectionShellProps {
  id: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}

export default function SectionShell({
  id,
  title,
  subtitle,
  children,
  action,
  className = '',
}: SectionShellProps) {
  return (
    <section id={id} className={`w-full max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 ${className}`}>
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 md:mb-8 gap-4">
        <div>
          <h2 className="font-heading font-semibold text-2xl md:text-3xl tracking-tight text-zinc-900 dark:text-zinc-50">
            {title}
          </h2>
          {subtitle && (
            <p className="text-zinc-500 dark:text-zinc-400 text-sm md:text-base mt-1.5 font-sans">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="w-full">{children}</div>
    </section>
  );
}
