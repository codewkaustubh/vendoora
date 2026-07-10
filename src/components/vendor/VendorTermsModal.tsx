/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { X, ShieldCheck, BadgeCheck, Zap, Coins, Recycle } from 'lucide-react';

interface VendorTermsModalProps {
  id?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function VendorTermsModal({ id, isOpen, onClose }: VendorTermsModalProps) {
  if (!isOpen) return null;

  const rules = [
    {
      title: 'Verification & Quality Vetting',
      desc: 'All suppliers undergo background checks, on-site portfolio inspections, and trade license verification. Only vendors keeping consistent, flawless quality metrics are sustained on the live Vendoora directory.',
      icon: ShieldCheck,
      color: 'text-blue-500 bg-blue-500/5',
    },
    {
      title: 'VENDOORA Price Promise',
      desc: 'Suppliers commit to rendering honest local marketplace rates. Artificially bloating service fees, quoting hidden overages post-booking, or unfair surcharge structures trigger instant account suspension.',
      icon: BadgeCheck,
      color: 'text-amber-500 bg-amber-500/5',
    },
    {
      title: 'Active Service Guarantee',
      desc: 'Booking schedules are legally binding. In the rare emergency of a schedule mismatch, suppliers must provide an equal or superior backup supplier or coordinate complete compensation instantly.',
      icon: Zap,
      color: 'text-indigo-500 bg-indigo-500/5',
    },
    {
      title: 'Structured Commission & Payouts',
      desc: 'A flat marketplace service commission of 5% is processed at event completion. Zero signup costs exist. Secure, encrypted client funds are held safely until OTP completion is authorized.',
      icon: Coins,
      color: 'text-emerald-500 bg-emerald-500/5',
    },
    {
      title: 'The Secondary Market "OLX" Covenant',
      desc: 'Vendors listing pre-owned tents, arrays, and equipment must represent grading (Mint, Excellent, Good, Fair) with absolute, factual accuracy. Mislabeled listings are subject to instant refund rules.',
      icon: Recycle,
      color: 'text-pink-500 bg-pink-500/5',
    },
  ];

  return (
    <div id={id || 'vendor-terms-modal'} className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
            <h3 className="font-heading font-bold text-lg text-zinc-900 dark:text-white">
              Vendor Terms & Conditions
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-0.5">
              The 5 core covenants governing verified partnerships
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-800 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {rules.map((rule, i) => {
            const Icon = rule.icon;
            return (
              <div key={i} className="flex gap-4 items-start">
                <div className={`p-2.5 rounded-2xl shrink-0 ${rule.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-heading font-semibold text-sm text-zinc-800 dark:text-zinc-100">
                    {i + 1}. {rule.title}
                  </h4>
                  <p className="text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed font-sans">
                    {rule.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-xs font-bold transition-all"
          >
            Acknowledge Rules
          </button>
        </div>
      </motion.div>
    </div>
  );
}
