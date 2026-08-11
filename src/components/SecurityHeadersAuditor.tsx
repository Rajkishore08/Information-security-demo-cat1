import React from 'react';
import { useSecurity } from '../context/SecurityContext';
import { X, ShieldCheck, ShieldAlert, CheckCircle2, XCircle, Award } from 'lucide-react';

export const SecurityHeadersAuditor: React.FC = () => {
  const { isHeadersModalOpen, setIsHeadersModalOpen, mode } = useSecurity();

  if (!isHeadersModalOpen) return null;

  const headerChecks = [
    {
      header: 'Content-Security-Policy (CSP)',
      description: 'Restricts script sources and blocks inline XSS execution.',
      vulnerable: false,
      secure: true,
      value: "default-src 'self'; script-src 'self';"
    },
    {
      header: 'Strict-Transport-Security (HSTS)',
      description: 'Enforces HTTPS encryption and protects against SSL stripping.',
      vulnerable: false,
      secure: true,
      value: 'max-age=31536000; includeSubDomains'
    },
    {
      header: 'X-Frame-Options',
      description: 'Prevents Clickjacking attacks by disallowing framing.',
      vulnerable: false,
      secure: true,
      value: 'DENY'
    },
    {
      header: 'X-Content-Type-Options',
      description: 'Prevents MIME-sniffing vulnerabilities.',
      vulnerable: false,
      secure: true,
      value: 'nosniff'
    },
    {
      header: 'Cookie Security Flags (HttpOnly & Secure)',
      description: 'Blocks JavaScript access to session cookies (document.cookie).',
      vulnerable: false,
      secure: true,
      value: 'Set-Cookie: sess_id=...; Secure; HttpOnly; SameSite=Strict'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md font-sans">
      <div className="flex h-[80vh] w-full max-w-4xl flex-col rounded-2xl border border-gray-800 bg-gray-950 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800 bg-gray-900/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl font-bold ${
              mode === 'vulnerable' ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
            }`}>
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Live HTTP Security Headers & CSP Auditor
                <span className={`rounded px-2 py-0.5 text-xs font-bold ${
                  mode === 'vulnerable' ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                }`}>
                  Grade: {mode === 'vulnerable' ? 'F (Critical Risk 🔴)' : 'A+ (Hardened 🟢)'}
                </span>
              </h2>
              <p className="text-xs text-gray-400">Real-time audit score of web application HTTP response headers</p>
            </div>
          </div>

          <button
            onClick={() => setIsHeadersModalOpen(false)}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Audit List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className={`rounded-xl border p-4 flex items-center justify-between ${
            mode === 'vulnerable' ? 'border-red-800 bg-red-950/30 text-red-200' : 'border-emerald-800 bg-emerald-950/30 text-emerald-200'
          }`}>
            <div>
              <h3 className="text-sm font-bold flex items-center gap-2">
                {mode === 'vulnerable' ? <ShieldAlert className="h-5 w-5 text-red-400" /> : <ShieldCheck className="h-5 w-5 text-emerald-400" />}
                <span>Security Header Audit Status: {mode === 'vulnerable' ? '0 / 5 Headers Active' : '5 / 5 Headers Active'}</span>
              </h3>
              <p className="text-xs mt-1">
                {mode === 'vulnerable'
                  ? 'Vulnerable Mode: All HTTP defense headers are disabled, allowing inline XSS, clickjacking, and session cookie theft.'
                  : 'Secure Mode: Application headers are fully hardened against injection and session hijacking attacks.'}
              </p>
            </div>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {headerChecks.map((item, idx) => {
              const isActive = mode === 'secure' ? item.secure : item.vulnerable;
              return (
                <div
                  key={idx}
                  className={`rounded-xl border p-4 flex flex-col justify-between gap-2 transition ${
                    isActive ? 'border-emerald-800/80 bg-emerald-950/20' : 'border-red-900/60 bg-red-950/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">{item.header}</span>
                    {isActive ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" /> ACTIVE 200 OK
                      </span>
                    ) : (
                      <span className="text-red-400 font-bold flex items-center gap-1">
                        <XCircle className="h-4 w-4" /> MISSING HEADER
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-sans text-gray-300">{item.description}</p>

                  {isActive && (
                    <div className="rounded bg-black p-2 text-emerald-300 border border-emerald-950">
                      Header: <span className="font-bold text-amber-300">{item.value}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
