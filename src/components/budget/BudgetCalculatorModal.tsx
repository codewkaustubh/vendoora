/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowRight, ArrowLeft, Check, Users, Sparkles } from 'lucide-react';
import { BrandTokens } from '../vendoora/BrandTokens';
import { CATEGORIES } from '../../data/vendooraMockData';
import { calculateEventBudget } from './budgetCalculatorModel';
import DonutChart from './DonutChart';

interface BudgetCalculatorModalProps {
  id?: string;
  isOpen: boolean;
  onClose: () => void;
  onBookClick?: (totalEstimate: string) => void;
}

export default function BudgetCalculatorModal({
  id,
  isOpen,
  onClose,
  onBookClick,
}: BudgetCalculatorModalProps) {
  const [step, setStep] = useState(1);
  const [eventType, setEventType] = useState('Birthday/Private Party');
  const [guests, setGuests] = useState(150);
  const [selectedServices, setSelectedServices] = useState<string[]>(['venues', 'catering', 'decor']);
  const [qualityTier, setQualityTier] = useState<'Budget' | 'Standard' | 'Premium'>('Standard');

  const guestSliderRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const totalSteps = 5;
  const progressPercent = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const toggleService = (serviceId: string) => {
    if (selectedServices.includes(serviceId)) {
      if (selectedServices.length > 1) {
        setSelectedServices(selectedServices.filter((id) => id !== serviceId));
      }
    } else {
      setSelectedServices([...selectedServices, serviceId]);
    }
  };

  // Perform deterministic calculation based on local state
  const results = calculateEventBudget(eventType, guests, selectedServices, qualityTier);

  // Vertical Slider Pointer Handlers for guests (10 - 1000 range)
  const handleVerticalSliderPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!guestSliderRef.current) return;
    const rect = guestSliderRef.current.getBoundingClientRect();
    // Invert calculation since vertical 100% is at the bottom, 0% is at the top
    const relativeY = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
    const percentage = 1 - relativeY / rect.height; // 0 to 1
    
    // Scale to range 10 to 1000 guests
    const minGuests = 10;
    const maxGuests = 1000;
    const computedGuests = Math.round(minGuests + percentage * (maxGuests - minGuests));
    setGuests(computedGuests);
  };

  return (
    <div id={id || 'budget-calculator-modal'} className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Card */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        transition={{ type: 'spring', damping: 25 }}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col bg-zinc-900 border border-zinc-800 rounded-[32px] text-white shadow-2xl z-10"
      >
        {/* Header */}
        <div className="p-6 border-b border-zinc-800/80 flex items-center justify-between">
          <div>
            <h3 className="font-heading font-bold text-xl text-zinc-50 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              Vendoora Estimator
            </h3>
            <p className="text-zinc-400 text-xs mt-1">Get an instant, reliable event budget range</p>
          </div>
          <button
            id="close-calculator-btn"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="w-full h-1 bg-zinc-800">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Body Content - Scrollable if content overflows */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h4 className="text-lg font-semibold text-zinc-100">What type of event are you hosting?</h4>
                  <p className="text-xs text-zinc-400 mt-1">Pricing formulas adjust according to your event profile</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {['Birthday/Private Party', 'Wedding/Engagement', 'Religious/Community Event', 'Corporate/Other'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setEventType(type)}
                      className={`p-5 rounded-2xl border text-left transition-all ${
                        eventType === type
                          ? 'border-[#6366F1] bg-[#6366F1]/10 text-white shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                          : 'border-zinc-800 bg-zinc-950/40 hover:border-zinc-700 hover:bg-zinc-900/40 text-zinc-300'
                      }`}
                    >
                      <span className="font-semibold text-sm">{type}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h4 className="text-lg font-semibold text-zinc-100">Estimate your guest count</h4>
                  <p className="text-xs text-zinc-400 mt-1">Catering and disposable elements are calculated per guest</p>
                </div>

                <div className="flex flex-col items-center justify-center py-4">
                  {/* Digital Counter Display */}
                  <div className="bg-zinc-950 border border-zinc-800 rounded-3xl px-8 py-4 mb-6 flex items-center gap-3 shadow-inner">
                    <Users className="w-5 h-5 text-indigo-400" />
                    <span className="text-3xl font-bold font-mono text-zinc-100 tracking-tight">{guests}</span>
                    <span className="text-xs font-semibold text-zinc-500 uppercase">Guests</span>
                  </div>

                  {/* Vertical Slider Component */}
                  <div className="flex items-center gap-6 h-56 select-none">
                    <span className="text-xs font-bold text-zinc-500">1000 Max</span>
                    <div
                      ref={guestSliderRef}
                      onPointerDown={(e) => {
                        (e.target as HTMLDivElement).setPointerCapture(e.pointerId);
                        handleVerticalSliderPointer(e);
                      }}
                      onPointerMove={(e) => {
                        if ((e.target as HTMLDivElement).hasPointerCapture(e.pointerId)) {
                          handleVerticalSliderPointer(e);
                        }
                      }}
                      onPointerUp={(e) => {
                        (e.target as HTMLDivElement).releasePointerCapture(e.pointerId);
                      }}
                      className="relative w-4 h-48 bg-zinc-800 rounded-full cursor-pointer overflow-visible"
                    >
                      {/* Active track */}
                      <div
                        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-500 to-indigo-500 rounded-full"
                        style={{ height: `${((guests - 10) / 990) * 100}%` }}
                      />
                      {/* Drag handle */}
                      <div
                        className="absolute w-6 h-6 bg-white border-2 border-indigo-500 rounded-full shadow-lg left-1/2 -translate-x-1/2 -translate-y-1/2 hover:scale-110 active:scale-95 transition-transform"
                        style={{ bottom: `calc(${((guests - 10) / 990) * 100}% - 12px)` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-zinc-500">10 Min</span>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h4 className="text-lg font-semibold text-zinc-100">Select needed services</h4>
                  <p className="text-xs text-zinc-400 mt-1">Choose at least one core service category</p>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[35vh] overflow-y-auto pr-1">
                  {CATEGORIES.map((cat) => {
                    const isSelected = selectedServices.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        onClick={() => toggleService(cat.id)}
                        className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center gap-1.5 transition-all ${
                          isSelected
                            ? 'border-[#6366F1] bg-[#6366F1]/10 text-white shadow-[0_0_10px_rgba(99,102,241,0.25)]'
                            : 'border-zinc-800 bg-zinc-950/20 hover:border-zinc-700/60 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <span className="text-xs font-medium truncate w-full">{cat.label}</span>
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h4 className="text-lg font-semibold text-zinc-100">Choose Quality Tier</h4>
                  <p className="text-xs text-zinc-400 mt-1">Standard fits 80% of client requirements cleanly</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {([
                    { id: 'Budget', label: 'Budget/Saver', desc: 'No-frills essential setups, great prices' },
                    { id: 'Standard', label: 'Standard/Premium', desc: 'Verified vendors, pristine styling and coordination' },
                    { id: 'Premium', label: 'Luxury/Elite', desc: 'Top tier designs, celebrity setups, VIP logistics' },
                  ] as const).map((tier) => (
                    <button
                      key={tier.id}
                      onClick={() => setQualityTier(tier.id)}
                      className={`p-5 rounded-2xl border text-left flex flex-col justify-between transition-all gap-2 ${
                        qualityTier === tier.id
                          ? 'border-[#6366F1] bg-[#6366F1]/10 text-white shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                          : 'border-zinc-800 bg-zinc-950/40 hover:border-zinc-700 hover:bg-zinc-900/40 text-zinc-300'
                      }`}
                    >
                      <div>
                        <span className="font-bold text-sm block">{tier.label}</span>
                        <span className="text-xs text-zinc-400 mt-1 block leading-relaxed">{tier.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div
                key="step-5"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center"
              >
                {/* Result Estimates */}
                <div className="space-y-6">
                  <div className="text-left">
                    <h4 className="text-base font-semibold text-zinc-400 uppercase tracking-wider">Your Estimated Budget</h4>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-4xl font-extrabold text-white font-mono">
                        ₹{(results.minTotal / 1000).toFixed(0)}k - ₹{(results.maxTotal / 1000).toFixed(0)}k
                      </span>
                    </div>
                    <p className="text-zinc-500 text-xs mt-1.5 leading-relaxed">
                      *Calculated for {guests} guests across {selectedServices.length} selected service lines in {eventType}.
                    </p>
                  </div>

                  <div className="border-t border-zinc-800 pt-4 space-y-3 text-xs text-zinc-400">
                    <div className="flex justify-between">
                      <span>Event Profile:</span>
                      <span className="font-semibold text-zinc-200">{eventType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Catering Size:</span>
                      <span className="font-semibold text-zinc-200">{guests} Plates</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Service Tier:</span>
                      <span className="font-semibold text-zinc-200">{qualityTier} Mode</span>
                    </div>
                  </div>

                  <button
                    id="book-estimate-btn"
                    onClick={() => onBookClick?.(`₹${(results.minTotal / 1000).toFixed(0)}k - ₹${(results.maxTotal / 1000).toFixed(0)}k`)}
                    className="w-full py-4 px-6 rounded-2xl bg-[#1E40AF] hover:bg-[#1D4ED8] text-white font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30"
                  >
                    <span>Book These Vendors Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Donut chart visualization */}
                <div className="bg-zinc-950/40 border border-zinc-800/80 rounded-[32px] p-4">
                  <DonutChart data={results.breakdown} totalAmount={results.minTotal} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer controls */}
        <div className="p-6 border-t border-zinc-800/80 bg-zinc-950/40 flex items-center justify-between">
          <button
            id="back-calculator-btn"
            onClick={handleBack}
            disabled={step === 1}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold border border-zinc-800 ${
              step === 1
                ? 'text-zinc-600 border-zinc-800/50 cursor-not-allowed'
                : 'text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          <span className="text-zinc-500 text-xs font-mono select-none">
            Step {step} / {totalSteps}
          </span>

          {step < totalSteps ? (
            <button
              id="next-calculator-btn"
              onClick={handleNext}
              className="flex items-center gap-2 px-5 py-2 rounded-full bg-white text-zinc-900 hover:bg-zinc-200 text-xs font-bold transition-all"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              id="reset-calculator-btn"
              onClick={() => setStep(1)}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white text-xs font-semibold transition-colors"
            >
              <span>Restart</span>
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
