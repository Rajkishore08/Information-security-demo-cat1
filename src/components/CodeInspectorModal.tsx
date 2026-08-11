import React, { useState } from 'react';
import { useSecurity } from '../context/SecurityContext';
import { CODE_COMPARISONS } from '../data/mockData';
import { X, ShieldAlert, ShieldCheck, FileCode2, Copy, Check } from 'lucide-react';

export const CodeInspectorModal: React.FC = () => {
  const { isCodeModalOpen, setIsCodeModalOpen, activeModule } = useSecurity();
  const [selectedKey, setSelectedKey] = useState<string>(activeModule);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isCodeModalOpen) return null;

  const currentCode = CODE_COMPARISONS[selectedKey] || CODE_COMPARISONS.sqli;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="flex h-[90vh] w-full max-w-6xl flex-col rounded-2xl border border-gray-800 bg-gray-950 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-800 bg-gray-900/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-950 border border-purple-800 text-purple-400">
              <FileCode2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Source Code & Vulnerability Inspector
                <span className="rounded bg-purple-950 px-2 py-0.5 text-xs text-purple-400 border border-purple-800">
                  {currentCode.owaspCategory}
                </span>
              </h2>
              <p className="text-xs text-gray-400">Compare Vulnerable PHP implementation vs. Secure Prepared/Sanitized Code</p>
            </div>
          </div>

          <button
            onClick={() => setIsCodeModalOpen(false)}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex border-b border-gray-800 bg-gray-900/40 px-6 py-2 gap-2 overflow-x-auto">
          {Object.entries(CODE_COMPARISONS).map(([key, item]) => (
            <button
              key={key}
              onClick={() => setSelectedKey(key)}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
                selectedKey === key
                  ? 'bg-purple-900/80 text-purple-200 border border-purple-700 shadow-md'
                  : 'text-gray-400 hover:bg-gray-800/60 hover:text-gray-200'
              }`}
            >
              {item.title}
            </button>
          ))}
        </div>

        {/* Code Content Split View */}
        <div className="grid flex-1 grid-cols-1 lg:grid-cols-2 gap-4 p-6 overflow-y-auto">
          {/* Vulnerable Code Panel */}
          <div className="flex flex-col rounded-xl border border-red-900/40 bg-red-950/20 overflow-hidden">
            <div className="flex items-center justify-between border-b border-red-900/40 bg-red-950/60 px-4 py-2.5">
              <div className="flex items-center gap-2 text-red-400 font-bold text-xs">
                <ShieldAlert className="h-4 w-4" />
                <span>❌ Vulnerable Implementation (PHP / MySQL)</span>
              </div>
              <button
                onClick={() => handleCopy(currentCode.vulnerableCode, 'vuln')}
                className="flex items-center gap-1 text-[11px] text-red-300 hover:text-white transition"
              >
                {copiedKey === 'vuln' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedKey === 'vuln' ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>
            <div className="flex-1 p-4 bg-black/90 font-mono text-xs text-red-200 overflow-x-auto">
              <pre>{currentCode.vulnerableCode}</pre>
            </div>
          </div>

          {/* Secure Code Panel */}
          <div className="flex flex-col rounded-xl border border-emerald-900/40 bg-emerald-950/20 overflow-hidden">
            <div className="flex items-center justify-between border-b border-emerald-900/40 bg-emerald-950/60 px-4 py-2.5">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <ShieldCheck className="h-4 w-4" />
                <span>🟢 Secure Implementation (Prepared Statement / Encoders)</span>
              </div>
              <button
                onClick={() => handleCopy(currentCode.secureCode, 'secure')}
                className="flex items-center gap-1 text-[11px] text-emerald-300 hover:text-white transition"
              >
                {copiedKey === 'secure' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedKey === 'secure' ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>
            <div className="flex-1 p-4 bg-black/90 font-mono text-xs text-emerald-200 overflow-x-auto">
              <pre>{currentCode.secureCode}</pre>
            </div>
          </div>
        </div>

        {/* Defense Bullet Explanation */}
        <div className="border-t border-gray-800 bg-gray-900/90 px-6 py-4">
          <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
            Technical Analysis & Security Principles:
          </h4>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-300">
            {currentCode.explanation.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-gray-950 p-2 rounded-lg border border-gray-800">
                <span className="text-purple-400 font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
