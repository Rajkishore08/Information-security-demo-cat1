import React, { useState } from 'react';
import { useSecurity } from '../../context/SecurityContext';
import { Search, ShieldCheck, AlertTriangle } from 'lucide-react';

export const FeedbackSearch: React.FC = () => {
  const { mode, addLog } = useSecurity();
  const [searchQuery, setSearchQuery] = useState<string>('<script>alert("Reflected XSS Stolen Token: "+document.cookie)</script>');
  const [activeQuery, setActiveQuery] = useState<string | null>(null);
  const [activeReflectedAlert, setActiveReflectedAlert] = useState<string | null>(null);

  const presets = [
    { label: "Reflected Cookie Alert", payload: '<script>alert("Reflected XSS: Cookie=" + document.cookie)</script>' },
    { label: "Reflected Image OnError", payload: '<img src="x" onerror="alert(\'Reflected Image XSS!\')" />' },
    { label: "Normal Search ('cryptography')", payload: 'cryptography' }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveReflectedAlert(null);
    setActiveQuery(searchQuery);

    const containsScript = searchQuery.includes('<script>') || searchQuery.includes('onerror=');

    if (mode === 'vulnerable') {
      // ❌ VULNERABLE MODE: Reflected directly into response HTML string
      addLog(
        'vuln',
        'REFLECTED XSS',
        `Reflecting unescaped URL search parameter directly into response DOM:`,
        `// Vulnerable PHP Server:\n<?php $q = $_GET['query']; ?>\n<h2>Search results for: <?php echo $q; ?></h2>\n\n// Rendered Response:\n<h2>Search results for: ${searchQuery}</h2>`,
        { rawSearchQuery: searchQuery }
      );

      if (containsScript) {
        addLog(
          'exploit',
          'REFLECTED XSS EXPLOIT',
          `⚡ REFLECTED XSS EXECUTED IN BROWSER! Script in URL parameter executed on load!`,
          `alert("Reflected XSS: Cookie=" + document.cookie);`
        );
        setActiveReflectedAlert(`⚡ REFLECTED XSS EXECUTED!\nURL query parameter contained unescaped script tag:\n"${searchQuery}"`);
      }
    } else {
      // 🟢 SECURE MODE: Escaped HTML + CSP Policy
      addLog(
        'secure',
        'REFLECTED XSS DEFENSE',
        `URL parameter encoded via htmlspecialchars() + CSP Header active`,
        `// Secure Server Response:\nHeader: Content-Security-Policy: default-src 'self'; script-src 'self';\nHTML Output: &lt;script&gt;alert(&quot;...&quot;)&lt;/script&gt;`,
        { rawSearchQuery: searchQuery }
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Input Panel */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Search className="h-5 w-5 text-purple-400" />
              Feedback Search API (`/search.php?query=...`)
            </h3>
            <p className="text-xs text-gray-400 font-mono">Test Reflected XSS by sending script payloads via query parameters</p>
          </div>

          <div className="flex items-center gap-2">
            {presets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSearchQuery(p.payload)}
                className="rounded-lg bg-gray-950 hover:bg-purple-950 px-2.5 py-1.5 text-xs text-purple-300 border border-gray-800 hover:border-purple-800 transition"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter search query or XSS payload..."
              className="w-full rounded-xl bg-gray-950 border border-gray-800 pl-10 pr-4 py-2.5 text-xs text-white font-mono focus:border-purple-500 focus:outline-none"
              required
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-purple-600 hover:bg-purple-500 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-600/30 transition"
          >
            Execute Search
          </button>
        </form>
      </div>

      {/* Simulated Alert Dialog Box */}
      {activeReflectedAlert && (
        <div className="rounded-2xl border border-red-700 bg-red-950/90 p-4 text-white shadow-2xl animate-pulse-glow">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-yellow-300 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-yellow-300 font-mono">[REFLECTED XSS ALERT DIALOG]</h4>
              <pre className="mt-1 text-xs font-mono text-white whitespace-pre-wrap">{activeReflectedAlert}</pre>
              <div className="mt-3 flex items-center justify-between text-[11px] text-red-200 border-t border-red-800/80 pt-2">
                <span>Reflected URL: <code className="bg-black/60 px-1 py-0.5 rounded font-mono text-yellow-300">feedback.php?query={encodeURIComponent(searchQuery)}</code></span>
                <button
                  onClick={() => setActiveReflectedAlert(null)}
                  className="rounded bg-black px-2 py-1 text-xs text-white font-bold hover:bg-gray-800"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reflected Search Result DOM Banner */}
      {activeQuery && (
        <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <span className="text-xs font-bold text-gray-400 uppercase font-mono">
              Server Response HTML Output (Reflected Node):
            </span>
            {mode === 'vulnerable' ? (
              <span className="rounded bg-red-950 px-2 py-0.5 text-[10px] text-red-400 border border-red-800 font-bold">Unescaped Reflection</span>
            ) : (
              <span className="rounded bg-emerald-950 px-2 py-0.5 text-[10px] text-emerald-400 border border-emerald-800 font-bold">Escaped Text Node + CSP Active</span>
            )}
          </div>

          <div className="rounded-xl bg-black p-4 border border-gray-800 font-mono text-xs">
            <p className="text-gray-400 mb-2">Search Results for:</p>
            {mode === 'vulnerable' ? (
              <div
                className="text-red-300 text-sm font-bold border-l-2 border-red-500 pl-3 py-1"
                dangerouslySetInnerHTML={{ __html: activeQuery }}
              />
            ) : (
              <div className="text-emerald-300 text-sm font-bold border-l-2 border-emerald-500 pl-3 py-1">
                {activeQuery}
              </div>
            )}
          </div>

          {mode === 'secure' && (
            <div className="rounded-xl bg-emerald-950/30 p-3 border border-emerald-900/50 text-xs text-emerald-200 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>
                Content-Security-Policy (CSP) Header Enforcement: <code className="font-mono text-amber-300">script-src 'self'</code> blocks inline script execution from reflected URL strings!
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
