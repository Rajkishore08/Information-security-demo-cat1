import React, { useState } from 'react';
import { useSecurity } from '../../context/SecurityContext';
import { Mail, Globe, AlertTriangle, Lock } from 'lucide-react';

export const PhishingIdnModule: React.FC = () => {
  const { mode, addLog } = useSecurity();
  const [phishingDomain] = useState<string>('http://cybеrmart.com/verify?account_id=9918'); // Cyrillic 'е' (U+0435)
  const [punycodeDomain] = useState<string>('http://xn--cybmart-9ya.com/verify?account_id=9918');
  const [showPhishingWarning, setShowPhishingWarning] = useState<boolean>(false);
  const [harvestedEmail, setHarvestedEmail] = useState<string>('user@victim-corp.com');
  const [harvestedPassword, setHarvestedPassword] = useState<string>('p@ssword123');
  const [isCredentialHarvested, setIsCredentialHarvested] = useState<boolean>(false);

  const handleLinkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const isPatched = mode === 'secure';

    if (isPatched) {
      setShowPhishingWarning(true);
      addLog(
        'secure',
        'IDN HOMOGRAPH 🟢',
        `PATCHED: Blocked spoofed Cyrillic homograph domain link (${phishingDomain}). Punycode: ${punycodeDomain}`,
        `// IDN Mixed-Script Sanitization Defense\nif (mb_detect_mixed_scripts($domain)) {\n    $ascii_punycode = idn_to_ascii($domain);\n    show_security_warning_banner($ascii_punycode);\n}`
      );
    } else {
      setShowPhishingWarning(false);
      setIsCredentialHarvested(true);
      addLog(
        'exploit',
        'IDN HOMOGRAPH ⚡',
        `VULNERABLE: User clicked spoofed Cyrillic homograph domain link (${phishingDomain}) without warning!`,
        `// Vulnerable Implementation: Direct redirect without domain script inspection\nheader("Location: " . $_GET['redirect_url']);`
      );
      alert(`⚠️ VULNERABLE MODE: Navigated to spoofed phishing domain "${phishingDomain}" without warning! Credentials harvested.`);
    }
  };

  return (
    <div className="space-y-6 font-sans text-gray-100">
      {/* Module Title Banner */}
      <div className="rounded-2xl glass-card border border-indigo-900/40 p-6 shadow-2xl space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-red-600 text-white shadow-lg shadow-amber-500/30">
            <Globe className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              6. IDN Homograph Attack & Spoofed Phishing Website
              <span className={`rounded-md px-2.5 py-0.5 text-xs font-mono font-bold ${
                mode === 'vulnerable' ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
              }`}>
                {mode === 'vulnerable' ? 'Vulnerable Mode 🔴' : 'Secure Mode 🟢'}
              </span>
            </h2>
            <p className="text-xs text-gray-400">OWASP A07:2021 - Identification & Authentication Failures (Social Engineering)</p>
          </div>
        </div>
      </div>

      {/* Main Interactive Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Simulated Phishing Email */}
        <div className="lg:col-span-6 rounded-2xl glass-card p-6 shadow-xl space-y-4 border border-gray-800">
          <div className="border-b border-gray-800 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <Mail className="h-4 w-4 text-amber-400" />
              Simulated Phishing Security Mail Input
            </h3>
            <span className="text-xs text-amber-400 font-mono">Incoming Email</span>
          </div>

          <div className="rounded-xl border border-amber-800/80 bg-black/80 p-4 space-y-3 font-sans">
            <div className="flex justify-between text-xs text-gray-400 border-b border-gray-800 pb-2">
              <div>
                <p className="font-bold text-white">From: CyberMart Security &lt;security@cybеrmart.com&gt;</p>
                <p>Subject: URGENT: Verify your Account Credentials</p>
              </div>
              <span className="text-[10px]">Today, 10:14 AM</span>
            </div>

            <div className="text-xs text-gray-300 space-y-2">
              <p>Dear Customer,</p>
              <p>We detected unusual login activity on your CyberMart account. Please verify your credentials immediately to avoid account suspension.</p>
            </div>

            <div className="pt-2">
              <button
                onClick={handleLinkClick}
                className="rounded-xl bg-amber-600 hover:bg-amber-500 px-4 py-2.5 text-xs font-bold text-white transition shadow-lg shadow-amber-600/20"
              >
                Verify Account Credentials →
              </button>
            </div>
          </div>

          {showPhishingWarning && (
            <div className="rounded-xl border border-red-700 bg-red-950/90 p-4 text-xs font-mono text-red-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-red-300">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <span>⚠ SECURITY WARNING: SUSPICIOUS IDN HOMOGRAPH DOMAIN DETECTED!</span>
              </div>
              <p>The requested domain contains suspicious internationalized Cyrillic characters visually mimicking genuine CyberMart domain.</p>
              <div className="rounded bg-black/80 p-2.5 text-[11px] text-amber-300 border border-amber-900/60">
                <p>Requested URL: <strong>{phishingDomain}</strong></p>
                <p>ASCII Punycode Representation: <strong>{punycodeDomain}</strong></p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Fake Harvester Landing Page */}
        <div className="lg:col-span-6 rounded-2xl glass-card p-6 shadow-xl space-y-4 border border-gray-800">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider font-mono">Spoofed Phishing Credential Harvester Screen</h4>
          
          <div className="rounded-xl border border-gray-800 bg-black/60 p-4 space-y-3 font-mono text-xs">
            <div className="flex items-center gap-2 rounded bg-gray-950 p-2 border border-gray-800 text-[11px] text-gray-300">
              <Lock className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-gray-500">http://</span>
              <span className="text-red-400 font-bold">cybеrmart.com</span>
              <span className="text-gray-400">/verify</span>
              <span className="ml-auto text-[9px] text-red-400 border border-red-800 px-1 rounded">Spoofed Cyrillic</span>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-gray-400 mb-1">Target Victim Email Input Box:</label>
                <input
                  type="email"
                  value={harvestedEmail}
                  onChange={(e) => setHarvestedEmail(e.target.value)}
                  className="w-full rounded-xl bg-gray-950 border border-gray-800 px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Target Victim Password Input Box:</label>
                <input
                  type="password"
                  value={harvestedPassword}
                  onChange={(e) => setHarvestedPassword(e.target.value)}
                  className="w-full rounded-xl bg-gray-950 border border-gray-800 px-3 py-2 text-white font-mono"
                />
              </div>

              {isCredentialHarvested && (
                <div className="rounded-xl border border-red-800 bg-red-950/80 p-3 text-red-200 text-xs space-y-1">
                  <span className="font-bold text-red-300 block">⚡ CREDENTIALS HARVESTED BY PHISHING SERVER!</span>
                  <p>Email: {harvestedEmail}</p>
                  <p>Password: {harvestedPassword}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
