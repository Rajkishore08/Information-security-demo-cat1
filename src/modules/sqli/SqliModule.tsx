import React, { useState } from 'react';
import { useSecurity } from '../../context/SecurityContext';
import { BankingLogin } from './BankingLogin';
import { CustomerSearch } from './CustomerSearch';
import { AdminPanel } from './AdminPanel';
import type { BankCustomer } from '../../types/security';
import { ShieldAlert, ShieldCheck, Lock, Search, LayoutDashboard } from 'lucide-react';

export const SqliModule: React.FC = () => {
  const { mode, currentUser, setCurrentUser } = useSecurity();
  const [activeTab, setActiveTab] = useState<'login' | 'search' | 'admin'>('login');

  const handleLoginSuccess = (user: BankCustomer) => {
    setCurrentUser(user);
    if (user.role === 'Admin') {
      setActiveTab('admin');
    } else {
      setActiveTab('search');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('login');
  };

  return (
    <div className="space-y-6">
      {/* Module Info Banner */}
      <div className={`rounded-2xl border p-6 transition ${
        mode === 'vulnerable'
          ? 'border-red-900/50 bg-red-950/20'
          : 'border-emerald-900/50 bg-emerald-950/20'
      }`}>
        <div className="flex items-start justify-between gap-4">
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
                1. SQL Injection (SQLi) Educational Simulator - Online Banking Portal
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
                  ? 'Demonstrates how string interpolation in SQL queries ($sql = "SELECT * FROM users WHERE username=\'$user\' AND password=\'$pass\'") allows an attacker to inject SQL operators like \' OR \'1\'=\'1, overriding logical evaluation to bypass authentication or exfiltrate sensitive credit card databases.'
                  : 'Demonstrates Parameterized Queries / Prepared Statements ($stmt->bind_param("ss", $user, $pass)). User inputs are bound strictly as literal text strings, neutralizing SQL injection attempts.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-gray-800 bg-gray-900/40 px-2 py-2 gap-2 rounded-2xl">
        <button
          onClick={() => setActiveTab('login')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === 'login'
              ? 'bg-indigo-900/80 text-white border border-indigo-700 shadow-md'
              : 'text-gray-400 hover:bg-gray-800/60 hover:text-gray-200'
          }`}
        >
          <Lock className="h-4 w-4" />
          <span>Login Gateway</span>
        </button>

        <button
          onClick={() => setActiveTab('search')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === 'search'
              ? 'bg-indigo-900/80 text-white border border-indigo-700 shadow-md'
              : 'text-gray-400 hover:bg-gray-800/60 hover:text-gray-200'
          }`}
        >
          <Search className="h-4 w-4" />
          <span>Customer Search API</span>
        </button>

        <button
          onClick={() => setActiveTab('admin')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === 'admin'
              ? 'bg-purple-900/80 text-white border border-purple-700 shadow-md'
              : 'text-gray-400 hover:bg-gray-800/60 hover:text-gray-200'
          }`}
        >
          <LayoutDashboard className="h-4 w-4" />
          <span>Admin Vault Panel</span>
          {currentUser && currentUser.role === 'Admin' && (
            <span className="rounded bg-red-950 px-1.5 py-0.5 text-[10px] text-red-400 font-mono font-bold">UNLOCKED</span>
          )}
        </button>
      </div>

      {/* Active Tab View */}
      {activeTab === 'login' && <BankingLogin onLoginSuccess={handleLoginSuccess} />}
      {activeTab === 'search' && <CustomerSearch />}
      {activeTab === 'admin' && (
        currentUser ? (
          <AdminPanel user={currentUser} onLogout={handleLogout} />
        ) : (
          <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-12 text-center text-gray-400">
            <Lock className="mx-auto h-12 w-12 text-gray-600 mb-3" />
            <h3 className="text-base font-bold text-white">Admin Vault Locked</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
              Please authenticate via the Login Gateway tab. In Vulnerable Mode, try entering payload <code className="text-red-400 font-mono font-bold bg-gray-950 px-1 py-0.5 rounded">' OR '1'='1</code> to bypass authentication!
            </p>
          </div>
        )
      )}
    </div>
  );
};
