import React from 'react';
import { useSecurity } from '../../context/SecurityContext';
import { DictionaryAttackSimulator } from './DictionaryAttackSimulator';
import { ShieldAlert, ShieldCheck } from 'lucide-react';

export const PasswordGuessingModule: React.FC = () => {
  const { mode } = useSecurity();

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
              4. Password Guessing & Dictionary Attack Simulator - Corporate Employee Portal
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
                ? 'Demonstrates how automated script bots run dictionary attacks against login endpoints with zero rate limiting or account lockout policies, compromising weak passwords like "welcome" or "admin123" in seconds.'
                : 'Demonstrates Multi-Layered Authentication Defenses: (1) Account Lockout after 5 failed attempts, (2) Rate Limiting & 1.5s server response delays, and (3) Interactive CAPTCHA challenges after 3 failed attempts.'}
            </p>
          </div>
        </div>
      </div>

      <DictionaryAttackSimulator />
    </div>
  );
};
