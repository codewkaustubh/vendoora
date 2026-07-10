/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { DesignTokens } from './tokens';

export interface ModalProps {
  id?: string;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

export function Modal({
  id,
  isOpen,
  onClose,
  title,
  subtitle,
  size = 'md',
  children,
}: ModalProps) {
  const modalId = id || `modal-${Math.random().toString(36).substr(2, 9)}`;
  const titleId = `${modalId}-title`;
  const descId = `${modalId}-desc`;
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal when pressing Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Trap focus or manage body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Determine size constraints
  let sizeClasses = '';
  switch (size) {
    case 'sm':
      sizeClasses = 'max-w-md';
      break;
    case 'md':
      sizeClasses = 'max-w-lg';
      break;
    case 'lg':
      sizeClasses = 'max-w-2xl';
      break;
    case 'xl':
      sizeClasses = 'max-w-4xl';
      break;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          id={modalId}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          aria-describedby={subtitle ? descId : undefined}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
        >
          {/* Overlay Background Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={DesignTokens.motion.default}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container Content */}
          <motion.div
            ref={modalRef}
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={DesignTokens.motion.spring}
            className={`
              relative w-full ${sizeClasses} z-10
              bg-white dark:bg-zinc-950
              border border-zinc-200 dark:border-zinc-800
              ${DesignTokens.radius.card}
              ${DesignTokens.spacing.card}
              ${DesignTokens.shadows.xl}
              max-h-[85vh] overflow-y-auto scrollbar-thin
              focus:outline-none
            `.replace(/\s+/g, ' ').trim()}
            tabIndex={-1}
          >
            {/* Header section with optional Title/Subtitle */}
            <div className="flex items-start justify-between gap-4 mb-6 pb-4 border-b border-zinc-100 dark:border-zinc-900">
              <div className="space-y-1">
                {title && (
                  <h3
                    id={titleId}
                    className="font-heading font-bold text-base sm:text-lg text-zinc-900 dark:text-white"
                  >
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p
                    id={descId}
                    className="text-zinc-500 dark:text-zinc-400 text-xs"
                  >
                    {subtitle}
                  </p>
                )}
              </div>

              {/* Accessible Close Button */}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="
                  p-2 rounded-full text-zinc-400 hover:text-zinc-800 dark:hover:text-white
                  hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-all duration-200
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
                "
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Inner Content Slot */}
            <div className="text-zinc-700 dark:text-zinc-300 font-sans">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
export default Modal;
