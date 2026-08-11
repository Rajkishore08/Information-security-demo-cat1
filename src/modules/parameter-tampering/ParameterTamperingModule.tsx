import React, { useState } from 'react';
import { useSecurity } from '../../context/SecurityContext';
import { IdorShop } from './IdorShop';
import { PriceTamperingCheckout } from './PriceTamperingCheckout';
import { ShieldAlert, ShieldCheck, ShoppingCart, Tag } from 'lucide-react';

export const ParameterTamperingModule: React.FC = () => {
  const { mode } = useSecurity();
  const [activeTab, setActiveTab] = useState<'idor' | 'price'>('idor');

  return (
    <div className="space-y-6">
      {/* Module Info Banner */}
      <div className={`rounded-2xl border p-6 transition ${
        mode === 'vulnerable'
          ? 'border-red-900/50 bg-red-950/20'
          : 'border-emerald-900/50 bg-emerald-950/20'
      }`}>
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold ${
            mode === 'vulnerable'
              ? 'bg-red-900 text-red-300 border border-red-700'
              : 'bg-emerald-900 text-emerald-300 border border-emerald-700'
          }`}>
            {mode === 'vulnerable' ? <ShieldAlert className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              3. Parameter Tampering & IDOR Simulator - E-Commerce Store ("CyberShop")
              <span className={`rounded px-2 py-0.5 text-xs font-bold ${
                mode === 'vulnerable'
                  ? 'bg-red-950 text-red-400 border border-red-800'
                  : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
              }`}>
                {mode === 'vulnerable' ? 'Vulnerable Mode 🔴' : 'Secure Mode 🟢'}
              </span>
            </h2>
            <p className="mt-1 text-xs text-gray-300 leading-relaxed">
              {mode === 'vulnerable'
                ? 'Demonstrates how altering HTTP request parameters (URL product ID ?id=10 or request body price=10) allows users to bypass authorization checks to view unlisted admin items or buy expensive ₹85,000 laptops for ₹10.'
                : 'Demonstrates Server-Side Authorization & State Validation. The server checks user role permissions and recalculates product prices using database records, ignoring client-submitted parameters.'}
            </p>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-gray-800 bg-gray-900/40 px-2 py-2 gap-2 rounded-2xl">
        <button
          onClick={() => setActiveTab('idor')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === 'idor'
              ? 'bg-indigo-900/80 text-white border border-indigo-700 shadow-md'
              : 'text-gray-400 hover:bg-gray-800/60 hover:text-gray-200'
          }`}
        >
          <ShoppingCart className="h-4 w-4" />
          <span>Scenario A: IDOR / Hidden Product URL Tampering</span>
        </button>

        <button
          onClick={() => setActiveTab('price')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === 'price'
              ? 'bg-indigo-900/80 text-white border border-indigo-700 shadow-md'
              : 'text-gray-400 hover:bg-gray-800/60 hover:text-gray-200'
          }`}
        >
          <Tag className="h-4 w-4" />
          <span>Scenario B: Checkout Price Manipulation (₹85,000 → ₹10)</span>
        </button>
      </div>

      {/* Active Tab */}
      {activeTab === 'idor' ? <IdorShop /> : <PriceTamperingCheckout />}
    </div>
  );
};
