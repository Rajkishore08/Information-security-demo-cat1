import React from 'react';
import { useSecurity } from '../context/SecurityContext';
import type { ModuleId } from '../types/security';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Database, 
  Code2, 
  ShoppingCart, 
  KeyRound, 
  BookOpen, 
  Terminal,
  FileCode2,
  Layers
} from 'lucide-react';

interface NavbarProps {
  isTerminalOpen: boolean;
  setIsTerminalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Navbar: React.FC<NavbarProps> = ({ isTerminalOpen, setIsTerminalOpen }) => {
  const { 
    mode, 
    toggleMode, 
    activeModule, 
    setActiveModule, 
    logs, 
    setIsCodeModalOpen, 
    setIsVivaModalOpen 
  } = useSecurity();

  const modules: { id: ModuleId; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'sqli', label: '1. SQL Injection', icon: Database },
    { id: 'xss', label: '2. Cross-Site Scripting (XSS)', icon: Code2 },
    { id: 'parameter-tampering', label: '3. Parameter Tampering', icon: ShoppingCart },
    { id: 'password-guessing', label: '4. Password Guessing', icon: KeyRound },
    { id: 'full-app', label: '5. Full Unified App 🚀', icon: Layers }
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-800 bg-gray-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
            <ShieldAlert className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              CyberSec Vulnerability Lab
              <span className="rounded bg-indigo-950 px-2 py-0.5 text-xs font-semibold text-indigo-400 border border-indigo-800">
                Viva Edition
              </span>
            </h1>
            <p className="text-xs text-gray-400">Interactive Security & Defense Simulator</p>
          </div>
        </div>

        {/* Global Vulnerable / Secure Mode Toggle */}
        <div className="flex items-center gap-3 bg-gray-900/90 p-1.5 rounded-2xl border border-gray-800 shadow-inner">
          <button
            onClick={toggleMode}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
              mode === 'vulnerable'
                ? 'bg-red-600/90 text-white shadow-lg shadow-red-600/40 ring-2 ring-red-500/50'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <ShieldAlert className="h-4 w-4" />
            <span>Vulnerable Mode 🔴</span>
          </button>
          
          <button
            onClick={toggleMode}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
              mode === 'secure'
                ? 'bg-emerald-600/90 text-white shadow-lg shadow-emerald-600/40 ring-2 ring-emerald-500/50'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Secure Mode 🟢</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCodeModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-purple-300 bg-purple-950/60 hover:bg-purple-900/80 border border-purple-800/80 rounded-xl transition"
            title="View Code Diffs (PHP/MySQL)"
          >
            <FileCode2 className="h-4 w-4" />
            <span className="hidden sm:inline">Code Inspector</span>
          </button>

          <button
            onClick={() => setIsVivaModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-amber-300 bg-amber-950/60 hover:bg-amber-900/80 border border-amber-800/80 rounded-xl transition"
            title="Open Viva Questions & Answers"
          >
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Viva Prep</span>
          </button>

          <button
            onClick={() => setIsTerminalOpen((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border transition ${
              isTerminalOpen
                ? 'bg-gray-800 text-emerald-400 border-emerald-500/50'
                : 'bg-gray-900 text-gray-400 border-gray-800 hover:text-gray-200'
            }`}
          >
            <Terminal className="h-4 w-4" />
            <span>Logs</span>
            <span className="ml-1 rounded-full bg-emerald-950 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-800">
              {logs.length}
            </span>
          </button>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <div className="border-t border-gray-800/80 bg-gray-900/40">
        <div className="mx-auto flex max-w-7xl space-x-1 overflow-x-auto px-4 py-2 scrollbar-none">
          {modules.map((m) => {
            const Icon = m.icon;
            const isActive = activeModule === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setActiveModule(m.id)}
                className={`flex items-center gap-2 whitespace-nowrap px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
                  isActive
                    ? mode === 'vulnerable'
                      ? 'bg-red-950/70 text-red-300 border border-red-800/80 shadow-md shadow-red-950/50'
                      : 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/80 shadow-md shadow-emerald-950/50'
                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? (mode === 'vulnerable' ? 'text-red-400' : 'text-emerald-400') : 'text-gray-500'}`} />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
