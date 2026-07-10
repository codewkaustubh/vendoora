/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { MessageCircle, Calculator } from 'lucide-react';

interface WhatsAppChatFabProps {
  id?: string;
  onOpenCalculator: () => void;
}

export default function WhatsAppChatFab({ id, onOpenCalculator }: WhatsAppChatFabProps) {
  const handleWhatsAppRedirect = () => {
    // Open standard Indian contact link or direct format
    window.open('https://wa.me/919999999999?text=Hello%20Vendoora!%20I%20want%20to%20plan%20my%20event.', '_blank');
  };

  return (
    <div id={id || 'stacked-fab-container'} className="fixed bottom-6 right-6 z-40 flex flex-col items-center gap-3">
      
      {/* Top Floating Action Button: Budget Calculator */}
      <motion.button
        id="fab-budget-calculator"
        onClick={onOpenCalculator}
        whileHover={{ scale: 1.1, y: -2 }}
        whileTap={{ scale: 0.9 }}
        className="w-10 h-10 rounded-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 shadow-md text-zinc-700 dark:text-zinc-200 cursor-pointer group relative"
        title="Open Budget Estimator"
      >
        <Calculator className="w-4 h-4 transition-transform group-hover:rotate-6" />
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-zinc-900/90 text-white rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 backdrop-blur-sm shadow-md whitespace-nowrap">
          Estimator
        </span>
      </motion.button>

      {/* Bottom Floating Action Button: WhatsApp Chat */}
      <motion.button
        id="fab-whatsapp-chat"
        onClick={handleWhatsAppRedirect}
        whileHover={{ scale: 1.1, y: -2 }}
        whileTap={{ scale: 0.9 }}
        className="w-14 h-14 rounded-full flex items-center justify-center bg-[#25D366] text-white shadow-[0_4px_15px_rgba(37,211,102,0.4)] cursor-pointer group relative overflow-visible"
        title="Chat on WhatsApp"
      >
        {/* Pulsing halo wave around the button */}
        <span className="absolute inset-0 rounded-full bg-[#25D366]/40 animate-ping" />
        <MessageCircle className="w-7 h-7 relative z-10 fill-white text-[#25D366]" />
        
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-zinc-900/90 text-white rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 backdrop-blur-sm shadow-md whitespace-nowrap">
          WhatsApp Support
        </span>
      </motion.button>

    </div>
  );
}
