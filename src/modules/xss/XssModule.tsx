import React, { useState } from 'react';
import { useSecurity } from '../../context/SecurityContext';
import { FeedbackForm } from './FeedbackForm';
import { FeedbackSearch } from './FeedbackSearch';
import { ShieldAlert, ShieldCheck, MessageSquare, Search } from 'lucide-react';

export const XssModule: React.FC = () => {
  const { mode } = useSecurity();
  const [activeTab, setActiveTab] = useState<'stored' | 'reflected'>('stored');

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
              2. Cross-Site Scripting (XSS) Simulator - Student Feedback Portal
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
                ? 'Demonstrates how unescaped DOM insertion allows attackers to execute malicious JavaScript (<script>alert("Hacked")</script> or <img onerror=...>) in victim browsers, leading to session hijacking (stealing document.cookie) and DOM defacement.'
                : 'Demonstrates Context-Aware HTML Encoding (htmlspecialchars(), converting < to &lt;) and Content-Security-Policy (CSP) headers that neutralize script execution.'}
            </p>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-gray-800 bg-gray-900/40 px-2 py-2 gap-2 rounded-2xl">
        <button
          onClick={() => setActiveTab('stored')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === 'stored'
              ? 'bg-purple-900/80 text-white border border-purple-700 shadow-md'
              : 'text-gray-400 hover:bg-gray-800/60 hover:text-gray-200'
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          <span>Stored XSS (Feedback Posts)</span>
        </button>

        <button
          onClick={() => setActiveTab('reflected')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === 'reflected'
              ? 'bg-purple-900/80 text-white border border-purple-700 shadow-md'
              : 'text-gray-400 hover:bg-gray-800/60 hover:text-gray-200'
          }`}
        >
          <Search className="h-4 w-4" />
          <span>Reflected XSS (URL Query Parameters)</span>
        </button>
      </div>

      {/* Active Tab */}
      {activeTab === 'stored' ? <FeedbackForm /> : <FeedbackSearch />}
    </div>
  );
};
