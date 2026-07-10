/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { X, Scale, FileText, Info } from 'lucide-react';

interface LegalModalProps {
  id?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function LegalModal({ id, isOpen, onClose }: LegalModalProps) {
  if (!isOpen) return null;

  return (
    <div id={id || 'legal-modal'} className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="relative w-full max-w-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[32px] p-6 shadow-2xl z-10 max-h-[85vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-100 dark:border-zinc-900">
          <div>
            <h3 className="font-heading font-bold text-lg text-zinc-900 dark:text-white flex items-center gap-2">
              <Scale className="w-5 h-5 text-[#1E40AF]" />
              Legal & Compliance
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-0.5">
              General consumer policy and platform guidelines
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-800 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 font-sans text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          <section className="space-y-2">
            <h4 className="font-heading font-bold text-sm text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-zinc-400" />
              1. Platform Service Agreement
            </h4>
            <p>
              Vendoora serves strictly as a managed discoverability and secondary marketplace connector in India. All logistics, safety compliance, and contractual execution remain the legal liability of the respective vendor.
            </p>
          </section>

          <section className="space-y-2">
            <h4 className="font-heading font-bold text-sm text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-zinc-400" />
              2. Privacy & Data Integrity
            </h4>
            <p>
              We prioritize customer data security. Phone numbers, emails, location listings, and event budgets are encrypted and are only shared with matching suppliers when you actively opt-in to initiate booking queries.
            </p>
          </section>

          <section className="space-y-2">
            <h4 className="font-heading font-bold text-sm text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-zinc-400" />
              3. Platform Contacts & Support
            </h4>
            <p>
              For dispute mitigation, compliance audits, or license complaints, please write to us at support@vendoora.co.in or call our central service hotline at +91-22-49032042.
            </p>
          </section>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-xs font-bold transition-all"
          >
            Accept & Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
