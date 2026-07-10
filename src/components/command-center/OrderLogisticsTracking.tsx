/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CalendarClock, Timer, ShieldCheck, CheckCircle2, ChevronRight } from 'lucide-react';
import { UPCOMING_EVENTS } from '../../data/vendooraMockData';

export default function OrderLogisticsTracking() {
  // Real ticking countdown state starting at 1 hour 42 minutes 15 seconds (within 2h to render red warnings)
  const [secondsLeft, setSecondsLeft] = useState(1 * 3600 + 42 * 60 + 15);
  const [otpInput, setOtpInput] = useState('');
  const [isOtpSuccess, setIsOtpSuccess] = useState(false);

  // Tick the countdown every second
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleOtpVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpInput.length >= 4) {
      setIsOtpSuccess(true);
      setOtpInput('');
    }
  };

  const isCritical = secondsLeft < 2 * 3600; // less than 2 hours is critical (turns red)

  return (
    <div id="logistics-tracking-section" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
      
      {/* 1. Schedule Timeline (Left side) */}
      <div className="lg:col-span-7 space-y-6">
        <div>
          <h3 className="font-heading font-semibold text-lg md:text-xl text-zinc-100 flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-indigo-400" />
            Order Timeline & Logistics
          </h3>
          <p className="text-zinc-500 text-xs mt-0.5">
            Active service timelines and event dispatch schedules
          </p>
        </div>

        {/* Vertical Timeline Track */}
        <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-zinc-800">
          {UPCOMING_EVENTS.map((event) => (
            <div key={event.id} id={`timeline-item-${event.id}`} className="relative flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              
              {/* Timeline dot */}
              <div
                className={`absolute -left-[21px] w-[11px] h-[11px] rounded-full border-2 ${
                  event.status === 'in_progress'
                    ? 'bg-pink-500 border-pink-400 animate-pulse'
                    : 'bg-zinc-800 border-zinc-700'
                }`}
              />

              <div className="space-y-1">
                <span className="block text-[10px] font-mono text-zinc-500">
                  {event.date} • {event.time} hrs
                </span>
                <h5 className="font-heading font-semibold text-sm sm:text-base text-zinc-200">
                  {event.eventName}
                </h5>
                <p className="text-xs text-zinc-500 font-sans">{event.location}</p>
              </div>

              {/* Status Tags */}
              <div className="shrink-0 flex items-center">
                {event.status === 'in_progress' ? (
                  <span className="px-3 py-1 text-[10px] font-bold text-pink-400 bg-pink-500/10 border border-pink-500/20 rounded-full uppercase tracking-wider animate-pulse">
                    Live Dispatch
                  </span>
                ) : (
                  <span className="px-3 py-1 text-[10px] font-bold text-zinc-500 bg-zinc-800/40 border border-zinc-800 rounded-full uppercase tracking-wider">
                    Scheduled
                  </span>
                )}
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* 2. OTP Release & Countdown (Right side) */}
      <div className="lg:col-span-5 flex flex-col justify-between gap-6">
        
        {/* Next Event Ticking Timer */}
        <div className="p-5 md:p-6 rounded-[32px] border border-zinc-850 bg-zinc-900/40 backdrop-blur-md space-y-4 flex-1 flex flex-col justify-center">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">
              Next Live Dispatch
            </span>
            <Timer className={`w-4 h-4 ${isCritical ? 'text-red-500 animate-pulse' : 'text-zinc-400'}`} />
          </div>

          <div className="space-y-1">
            <h4 className="text-xs font-semibold text-zinc-400">Time Remaining to Setup</h4>
            <div className={`text-4xl sm:text-5xl font-extrabold font-mono tracking-tighter ${
              isCritical ? 'text-red-500 animate-pulse filter drop-shadow-[0_0_8px_rgba(239,68,68,0.3)]' : 'text-white'
            }`}>
              {formatTime(secondsLeft)}
            </div>
          </div>

          <div className="text-[10px] text-zinc-500 leading-relaxed font-sans">
            {isCritical ? (
              <span className="text-red-500 font-semibold block">
                🚨 Less than 2 hours remaining! Dispatch on-site crews and verify setups immediately.
              </span>
            ) : (
              <span>*Ensure all trucks are packed and on-site checkins complete before timer countdown reaches zero.</span>
            )}
          </div>
        </div>

        {/* OTP Payout Settlement Card */}
        <div className="p-5 md:p-6 rounded-[32px] border border-zinc-850 bg-zinc-900/40 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">
              Disbursement Settlement
            </span>
            <ShieldCheck className="w-4 h-4 text-[#10B981]" />
          </div>

          <AnimatePresence mode="wait">
            {!isOtpSuccess ? (
              <motion.form
                key="otp-form"
                onSubmit={handleOtpVerify}
                className="space-y-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
                    Enter Client OTP
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      required
                      placeholder="e.g. 5249"
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-white text-sm font-mono tracking-widest placeholder-zinc-700 focus:outline-none focus:border-[#10B981]"
                    />
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-100 hover:text-white border border-zinc-800 text-xs font-bold transition-all uppercase flex items-center gap-1 shrink-0"
                    >
                      Verify
                    </button>
                  </div>
                </div>
                <p className="text-[9px] text-zinc-500">
                  *Enter the completion OTP supplied by the client to confirm service fulfillment and release rental disbursements.
                </p>
              </motion.form>
            ) : (
              <motion.div
                key="otp-success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center text-center p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl space-y-2"
              >
                <CheckCircle2 className="w-8 h-8 text-[#10B981] animate-bounce" />
                <h5 className="font-heading font-bold text-xs sm:text-sm text-zinc-100">
                  OTP Verified. Funds Released!
                </h5>
                <p className="text-[10px] text-zinc-400 leading-relaxed font-mono">
                  Disbursement of ₹1,20,000 has been securely settled to your linked account.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
}
