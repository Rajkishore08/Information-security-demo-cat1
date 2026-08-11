import React, { useState } from 'react';
import { useSecurity } from '../context/SecurityContext';
import { X, Globe, Send, Play, CornerDownRight } from 'lucide-react';

export const BurpProxyModal: React.FC = () => {
  const { isProxyModalOpen, setIsProxyModalOpen, mode, addLog } = useSecurity();

  const [requestMethod, setRequestMethod] = useState<'POST' | 'GET'>('POST');
  const [requestUrl, setRequestUrl] = useState<string>('https://cybershop.com/api/v1/checkout.php');
  const [requestBody, setRequestBody] = useState<string>(`{\n  "product_id": 4,\n  "quantity": 1,\n  "price": 10\n}`);
  
  const [responseHeaders, setResponseHeaders] = useState<string | null>(null);

  if (!isProxyModalOpen) return null;

  const handleForwardRequest = () => {
    if (mode === 'vulnerable') {
      // ❌ VULNERABLE MODE: Missing security headers
      const rawResponse = `HTTP/1.1 200 OK\nDate: ${new Date().toUTCString()}\nServer: Apache/2.4.52 (Ubuntu)\nContent-Type: application/json; charset=UTF-8\nSet-Cookie: sess_id=abc991823_stolen_token; Path=/\nAccess-Control-Allow-Origin: *\n\n{\n  "status": "SUCCESS",\n  "message": "Order processed with client price parameter",\n  "charged_amount": 10\n}`;
      setResponseHeaders(rawResponse);

      addLog(
        'vuln',
        'BURP PROXY INTERCEPT',
        `Forwarded intercepted HTTP POST request with modified body:`,
        `POST ${requestUrl}\nHost: cybershop.com\nContent-Type: application/json\n\n${requestBody}`,
        { mode: 'Vulnerable', missingHeaders: ['Content-Security-Policy', 'X-Frame-Options', 'HttpOnly Cookie Flag'] }
      );
    } else {
      // 🟢 SECURE MODE: Hardened Security Headers
      const rawResponse = `HTTP/1.1 200 OK\nDate: ${new Date().toUTCString()}\nServer: Apache/2.4.52 (Ubuntu)\nContent-Type: application/json; charset=UTF-8\nContent-Security-Policy: default-src 'self'; script-src 'self';\nX-Frame-Options: DENY\nX-Content-Type-Options: nosniff\nStrict-Transport-Security: max-age=31536000; includeSubDomains\nSet-Cookie: sess_id=abc991823_secure; Path=/; Secure; HttpOnly; SameSite=Strict\n\n{\n  "status": "SUCCESS",\n  "message": "Order processed with server-verified price ₹85,000",\n  "charged_amount": 85000\n}`;
      setResponseHeaders(rawResponse);

      addLog(
        'secure',
        'BURP PROXY INTERCEPT',
        `Server returned hardened HTTP response security headers`,
        `HTTP/1.1 200 OK\nContent-Security-Policy: default-src 'self';\nX-Frame-Options: DENY\nStrict-Transport-Security: max-age=31536000`,
        { activeSecurityHeaders: ['Content-Security-Policy', 'X-Frame-Options', 'HSTS', 'HttpOnly Cookie'] }
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="flex h-[88vh] w-full max-w-5xl flex-col rounded-2xl border border-gray-800 bg-gray-950 shadow-2xl overflow-hidden font-sans">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-800 bg-gray-900/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-950 border border-amber-800 text-amber-400">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                CyberProxy / Burp Suite Interceptor Simulator
                <span className="rounded bg-amber-950 px-2 py-0.5 text-xs text-amber-400 border border-amber-800 font-mono font-bold">
                  INTERCEPT IS ON ⚡
                </span>
              </h2>
              <p className="text-xs text-gray-400">Capture, inspect, and tamper raw HTTP packets before sending to server</p>
            </div>
          </div>

          <button
            onClick={() => setIsProxyModalOpen(false)}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Proxy Grid Layout */}
        <div className="grid flex-1 grid-cols-1 lg:grid-cols-2 gap-4 p-6 overflow-y-auto">
          {/* Left Column: Intercepted Request Packet */}
          <div className="flex flex-col rounded-xl border border-gray-800 bg-gray-900/60 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
              <span className="text-xs font-bold text-amber-400 uppercase font-mono flex items-center gap-1.5">
                <Send className="h-4 w-4" /> Intercepted HTTP Request Packet
              </span>
              <span className="text-[10px] text-gray-500 font-mono">PORT 8080 (BURP PROXY)</span>
            </div>

            {/* Target URL Bar */}
            <div className="flex gap-2">
              <select
                value={requestMethod}
                onChange={(e) => setRequestMethod(e.target.value as 'POST' | 'GET')}
                className="rounded-lg bg-black px-2.5 py-1 text-xs font-mono text-amber-300 font-bold border border-gray-800 focus:outline-none"
              >
                <option value="POST">POST</option>
                <option value="GET">GET</option>
              </select>
              <input
                type="text"
                value={requestUrl}
                onChange={(e) => setRequestUrl(e.target.value)}
                className="flex-1 rounded-lg bg-black px-3 py-1 text-xs font-mono text-gray-200 border border-gray-800 focus:outline-none"
              />
            </div>

            {/* HTTP Headers Preview */}
            <div className="rounded-lg bg-black p-3 font-mono text-[11px] text-gray-400 border border-gray-800 space-y-1">
              <p>Host: <span className="text-gray-200">cybershop.com</span></p>
              <p>User-Agent: <span className="text-gray-200">Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)</span></p>
              <p>Content-Type: <span className="text-gray-200">application/json</span></p>
              <p>Cookie: <span className="text-amber-300">sess_id=abc991823_token</span></p>
            </div>

            {/* Request Body Editor */}
            <div>
              <label className="block text-[11px] font-bold text-gray-300 mb-1">
                Edit Request Body Parameters (Inline Tampering):
              </label>
              <textarea
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                rows={5}
                className="w-full rounded-lg bg-black p-3 font-mono text-xs text-amber-300 border border-gray-800 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <button
              onClick={handleForwardRequest}
              className="flex items-center justify-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-500 py-2.5 text-xs font-bold text-white shadow-lg transition"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>Forward Tampered HTTP Request to Server</span>
            </button>
          </div>

          {/* Right Column: Server Response & Security Headers */}
          <div className="flex flex-col rounded-xl border border-gray-800 bg-gray-900/60 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
              <span className="text-xs font-bold text-gray-300 uppercase font-mono flex items-center gap-1.5">
                <CornerDownRight className="h-4 w-4 text-emerald-400" /> HTTP Response Packet & Headers
              </span>
              {mode === 'vulnerable' ? (
                <span className="rounded bg-red-950 px-2 py-0.5 text-[10px] text-red-400 border border-red-800 font-bold">Missing Security Headers</span>
              ) : (
                <span className="rounded bg-emerald-950 px-2 py-0.5 text-[10px] text-emerald-400 border border-emerald-800 font-bold">Hardened Security Headers</span>
              )}
            </div>

            {responseHeaders ? (
              <div className="flex-1 rounded-lg bg-black p-3 font-mono text-[11px] text-emerald-300 border border-gray-800 overflow-y-auto space-y-2">
                <pre className="whitespace-pre-wrap">{responseHeaders}</pre>
              </div>
            ) : (
              <div className="flex h-64 flex-col items-center justify-center text-gray-500 text-xs">
                <Globe className="h-8 w-8 mb-2 opacity-30" />
                <p>Click "Forward Tampered HTTP Request" to capture raw server response headers.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
