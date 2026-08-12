import React, { useState } from 'react';
import { useSecurity } from '../../context/SecurityContext';
import { INITIAL_FIRM_SECRETS } from '../../data/mockData';
import type { FirmSecret } from '../../types/security';
import { Link2, ShieldAlert, FileText, Key } from 'lucide-react';

export const UrlInterpretationModule: React.FC = () => {
  const { mode, addLog } = useSecurity();
  const [requestedSecretId, setRequestedSecretId] = useState<number>(101);
  const [requestedRole, setRequestedRole] = useState<string>('Developer');
  const [activeSecret, setActiveSecret] = useState<FirmSecret | null>(INITIAL_FIRM_SECRETS[0]);
  const [accessDeniedMessage, setAccessDeniedMessage] = useState<string | null>(null);

  const handleFetchSecret = (id: number, roleOverride?: string) => {
    setAccessDeniedMessage(null);
    const targetRole = roleOverride || requestedRole;
    const isPatched = mode === 'secure';

    const secret = INITIAL_FIRM_SECRETS.find((s) => s.id === id);

    if (!secret) {
      setActiveSecret(null);
      setAccessDeniedMessage(`ERROR 404: Secret record ID #${id} not found in database.`);
      addLog('warn', 'IDOR LOG', `Requested secret ID #${id} not found.`);
      return;
    }

    if (!isPatched) {
      // VULNERABLE: Direct Object Reference without server-side role validation
      setActiveSecret(secret);
      if (secret.isConfidential || secret.id === 999) {
        addLog(
          'exploit',
          'IDOR VULN ⚡',
          `VULNERABLE IDOR: Accessible restricted secret #${id} ("${secret.title}") via URL parameter tampering!`,
          `// Vulnerable IDOR Endpoint\n$secret_id = $_GET['secret_id']; // Direct DB lookup without checking session role!\n$secret = $db->query("SELECT * FROM secrets WHERE id = $secret_id");`
        );
      } else {
        addLog('info', 'IDOR LOG', `Fetched secret #${id} ("${secret.title}")`);
      }
    } else {
      // PATCHED: Server-side Session & Role Authorization Check
      if (secret.isConfidential && targetRole !== 'CTO Admin') {
        setActiveSecret(null);
        setAccessDeniedMessage(`🔒 403 FORBIDDEN: User session role "${targetRole}" is not authorized to access restricted secret #${id} ("${secret.title}"). Access blocked by server-side Role Authorization Filter.`);
        addLog(
          'secure',
          'IDOR DEFENSE 🟢',
          `PATCHED IDOR: Blocked unauthorized URL access to restricted secret #${id} for role "${targetRole}".`,
          `// Patched IDOR Defense\nif ($secret['is_confidential'] && $_SESSION['user_role'] !== 'CTO Admin') {\n    http_response_code(403);\n    die("403 Forbidden: Unauthorized access.");\n}`
        );
      } else {
        setActiveSecret(secret);
        addLog('secure', 'IDOR LOG', `Authorized access granted to secret #${id} for role "${targetRole}".`);
      }
    }
  };

  return (
    <div className="space-y-6 font-sans text-gray-100">
      {/* Module Title Banner */}
      <div className="rounded-2xl glass-card border border-indigo-900/40 p-6 shadow-2xl space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30">
            <Link2 className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              5. URL Interpretation & Insecure Direct Object Reference (IDOR)
              <span className={`rounded-md px-2.5 py-0.5 text-xs font-mono font-bold ${
                mode === 'vulnerable' ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
              }`}>
                {mode === 'vulnerable' ? 'Vulnerable Mode 🔴' : 'Secure Mode 🟢'}
              </span>
            </h2>
            <p className="text-xs text-gray-400">OWASP A01:2021 - Broken Access Control & Parameter Tampering</p>
          </div>
        </div>
      </div>

      {/* Main Interactive Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: URL Parameter Test Bench */}
        <div className="lg:col-span-5 rounded-2xl glass-card p-6 shadow-xl space-y-4 border border-gray-800">
          <div className="border-b border-gray-800 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <Key className="h-4 w-4 text-blue-400" />
              URL Query Parameter Tampering Input
            </h3>
            <span className="text-xs text-gray-400 font-mono">?secret_id=...</span>
          </div>

          <div className="space-y-4 text-xs font-mono">
            {/* Address Bar Simulation */}
            <div className="rounded-xl bg-black/80 p-3 border border-gray-800 space-y-1 text-gray-300">
              <span className="text-gray-500 text-[11px] block">Simulated Browser Address Bar:</span>
              <div className="text-indigo-300 font-bold break-all">
                http://localhost:5173/api/secrets<span className="text-amber-400 font-bold">?secret_id={requestedSecretId}&role={requestedRole}</span>
              </div>
            </div>

            <div>
              <label className="block text-gray-400 mb-1">Select Target Secret ID Parameter Input Box:</label>
              <div className="grid grid-cols-2 gap-2">
                {INITIAL_FIRM_SECRETS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setRequestedSecretId(s.id);
                      handleFetchSecret(s.id);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      requestedSecretId === s.id
                        ? 'border-indigo-500 bg-indigo-950/80 text-white font-bold'
                        : 'border-gray-800 bg-gray-950/60 text-gray-300 hover:bg-gray-900'
                    }`}
                  >
                    <div className="text-[11px] font-bold">ID #{s.id}</div>
                    <div className="text-[10px] text-gray-400 truncate">{s.title}</div>
                    {s.isConfidential && (
                      <span className="mt-1 inline-block rounded bg-red-950 px-1.5 py-0.2 text-[9px] text-red-400 border border-red-800">
                        RESTRICTED 🔒
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-gray-400 mb-1">Simulated User Session Role:</label>
              <select
                value={requestedRole}
                onChange={(e) => {
                  setRequestedRole(e.target.value);
                  handleFetchSecret(requestedSecretId, e.target.value);
                }}
                className="w-full rounded-xl bg-gray-950 border border-gray-800 px-3 py-2 text-white font-mono"
              >
                <option value="Developer">Developer (Standard Seats)</option>
                <option value="DevOps">DevOps Engineer</option>
                <option value="CTO Admin">CTO Admin (Root Privileges)</option>
              </select>
            </div>

            <button
              onClick={() => handleFetchSecret(requestedSecretId)}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 py-3 text-xs font-bold text-white shadow-xl shadow-blue-600/20 transition"
            >
              Execute Request with URL Parameters
            </button>
          </div>
        </div>

        {/* Right Column: Server Secret Record Output */}
        <div className="lg:col-span-7 space-y-4">
          {accessDeniedMessage && (
            <div className="rounded-2xl border border-red-800 bg-red-950/60 p-5 text-xs font-mono text-red-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-red-300">
                <ShieldAlert className="h-5 w-5 text-red-400" />
                <span>IDOR DEFENSE: ACCESS DENIED</span>
              </div>
              <p>{accessDeniedMessage}</p>
            </div>
          )}

          {activeSecret && (
            <div className={`rounded-2xl glass-card p-6 shadow-xl space-y-4 border ${
              activeSecret.isConfidential ? 'border-amber-800/80 bg-amber-950/20' : 'border-gray-800'
            }`}>
              <div className="border-b border-gray-800 pb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                  <FileText className="h-4 w-4 text-emerald-400" />
                  Retrieved Secret Record #{activeSecret.id}
                </h3>
                {activeSecret.isConfidential ? (
                  <span className="rounded bg-red-950 px-2.5 py-0.5 text-[10px] font-bold text-red-400 border border-red-800">
                    RESTRICTED IDOR TARGET
                  </span>
                ) : (
                  <span className="rounded bg-emerald-950 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-800">
                    PUBLIC RECORD
                  </span>
                )}
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="rounded-xl bg-black/60 p-3 space-y-1">
                  <span className="text-gray-400 text-[10px] block">Title:</span>
                  <span className="text-white font-bold">{activeSecret.title}</span>
                </div>

                <div className="rounded-xl bg-black/60 p-3 space-y-1">
                  <span className="text-gray-400 text-[10px] block">Category & Environment:</span>
                  <span className="text-indigo-300">{activeSecret.category} ({activeSecret.environment})</span>
                </div>

                <div className="rounded-xl bg-black/90 p-4 border border-gray-800 space-y-1 text-emerald-300">
                  <span className="text-gray-400 text-[10px] block font-sans">Secret Key Value / Hash Token:</span>
                  <code className="text-xs font-bold break-all">{activeSecret.secretKey}</code>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
