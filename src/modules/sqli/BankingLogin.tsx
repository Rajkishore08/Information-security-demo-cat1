import React, { useState } from 'react';
import { useSecurity } from '../../context/SecurityContext';
import type { BankCustomer } from '../../types/security';
import { Lock, User, ShieldAlert, ShieldCheck, Play, Sparkles, AlertTriangle } from 'lucide-react';

interface BankingLoginProps {
  onLoginSuccess: (user: BankCustomer) => void;
}

export const BankingLogin: React.FC<BankingLoginProps> = ({ onLoginSuccess }) => {
  const { mode, addLog, customers } = useSecurity();
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [lastExecutedSql, setLastExecutedSql] = useState<string | null>(null);
  const [boundParams, setBoundParams] = useState<string[] | null>(null);

  const presets = [
    { label: "Classic Bypass (' OR '1'='1)", user: "' OR '1'='1", pass: "anything" },
    { label: "Admin Comment Out (admin' --)", user: "admin' --", pass: "ignored" },
    { label: "Hash Comment (admin' #)", user: "admin' #", pass: "12345" },
    { label: "Normal User (alex_johnson)", user: "alex_johnson", pass: "user123" }
  ];

  const handleApplyPreset = (p: { user: string; pass: string }) => {
    setUsername(p.user);
    setPassword(p.pass);
    setLoginError(null);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (mode === 'vulnerable') {
      // ❌ VULNERABLE MODE: Dynamic String Interpolation SQL Query
      const constructedSql = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}';`;
      setLastExecutedSql(constructedSql);
      setBoundParams(null);

      addLog(
        'vuln',
        'SQL INJECTION',
        `Unsafe SQL Query constructed with input: username="${username}"`,
        constructedSql,
        { mode: 'Vulnerable', inputUsername: username, inputPassword: password }
      );

      // Evaluate vulnerability logic:
      // If payload contains ' OR '1'='1 or ' OR 1=1 or admin' -- or admin' #, SQL evaluates to TRUE
      const isSqlInjectionBypass = 
        username.includes("' OR '1'='1") || 
        username.includes("' OR 1=1") || 
        username.includes("' OR 'a'='a") ||
        username.startsWith("admin'") ||
        username.includes("OR TRUE");

      if (isSqlInjectionBypass) {
        const adminUser = customers.find((c) => c.role === 'Admin') || customers[0];
        addLog(
          'exploit',
          'SQL INJECTION EXPLOIT',
          `⚡ AUTHENTICATION BYPASS SUCCESSFUL! Logged in as Admin user [${adminUser.username}]`,
          `// DB Result: 1 row returned (Admin)\nSELECT * FROM users WHERE username='' OR '1'='1' AND password='...';`
        );
        onLoginSuccess(adminUser);
      } else {
        // Standard lookup
        const found = customers.find((c) => c.username === username);
        if (found) {
          addLog('info', 'SQL INJECTION', `User authenticated as ${found.username}`);
          onLoginSuccess(found);
        } else {
          setLoginError('Invalid username or password credentials.');
          addLog('warn', 'SQL INJECTION', 'Authentication failed: 0 rows returned');
        }
      }
    } else {
      // 🟢 SECURE MODE: Parameterized Query / Prepared Statement
      const preparedSql = `SELECT * FROM users WHERE username = ? AND password = ?;`;
      setLastExecutedSql(preparedSql);
      setBoundParams([username, password]);

      addLog(
        'secure',
        'PREPARED STATEMENT',
        `Executing Prepared Statement with bound parameter array`,
        `$stmt = $db->prepare("SELECT * FROM users WHERE username = ? AND password = ?");\n$stmt->bind_param("ss", "${username}", "${password}");`,
        { mode: 'Secure (Parameterized)', boundParam1: username, boundParam2: password }
      );

      // Exact match lookup only! Parameter binding treats literal string "' OR '1'='1" as string value
      const found = customers.find((c) => c.username === username);
      if (found) {
        addLog('secure', 'PREPARED STATEMENT', `Authentication successful for exact match user: ${found.username}`);
        onLoginSuccess(found);
      } else {
        setLoginError('Authentication Failed: No user found matching exact literal username string.');
        addLog(
          'secure',
          'PREPARED STATEMENT',
          `SQL Injection Attempt Neutralized! Input "${username}" searched as literal text string.`
        );
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Login Form Panel */}
      <div className="lg:col-span-6 rounded-2xl border border-gray-800 bg-gray-900/60 p-6 shadow-xl">
        <div className="flex items-center gap-3 border-b border-gray-800 pb-4 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-950 text-blue-400 border border-blue-800">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Online Banking Login Portal</h3>
            <p className="text-xs text-gray-400">Simulating SecureBank Authentication Gateway</p>
          </div>
        </div>

        {/* Attack Payload Presets */}
        <div className="mb-6 rounded-xl bg-gray-950 p-4 border border-gray-800">
          <label className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            Quick Attack Payload Presets:
          </label>
          <div className="flex flex-wrap gap-2">
            {presets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className="rounded-lg bg-gray-900 hover:bg-indigo-950 px-2.5 py-1.5 text-xs text-gray-300 hover:text-indigo-200 border border-gray-700 hover:border-indigo-700 transition"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">Username / Input Payload:</label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. ' OR '1'='1"
                className="w-full rounded-xl bg-gray-950 border border-gray-800 pl-10 pr-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">Password:</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full rounded-xl bg-gray-950 border border-gray-800 pl-10 pr-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {loginError && (
            <div className="flex items-center gap-2 rounded-xl bg-red-950/60 p-3 text-xs text-red-300 border border-red-800">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <button
            type="submit"
            className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white shadow-lg transition ${
              mode === 'vulnerable'
                ? 'bg-red-600 hover:bg-red-500 shadow-red-600/30'
                : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
            }`}
          >
            <Play className="h-4 w-4 fill-current" />
            <span>Submit Authentication Request</span>
          </button>
        </form>
      </div>

      {/* SQL Query Debugger & Execution Inspector */}
      <div className="lg:col-span-6 rounded-2xl border border-gray-800 bg-gray-900/60 p-6 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-4">
            <h3 className="text-sm font-bold text-gray-200 flex items-center gap-2">
              Database Query Execution Inspector
              {mode === 'vulnerable' ? (
                <span className="rounded bg-red-950 px-2 py-0.5 text-[10px] text-red-400 border border-red-800 font-bold">Unsafe Concatenation</span>
              ) : (
                <span className="rounded bg-emerald-950 px-2 py-0.5 text-[10px] text-emerald-400 border border-emerald-800 font-bold">Prepared Statement</span>
              )}
            </h3>
          </div>

          {lastExecutedSql ? (
            <div className="space-y-4">
              <div className="rounded-xl bg-black p-4 border border-gray-800 font-mono text-xs">
                <span className="text-gray-500 text-[10px] uppercase font-bold block mb-1">
                  {mode === 'vulnerable' ? 'Unsafe Interpolated SQL String:' : 'Pre-Compiled Prepared Query:'}
                </span>
                <p className="text-emerald-400 break-all">{lastExecutedSql}</p>

                {boundParams && (
                  <div className="mt-3 pt-3 border-t border-gray-800">
                    <span className="text-gray-500 text-[10px] uppercase font-bold block mb-1">Bound Parameter Array:</span>
                    <div className="space-y-1 text-purple-300 text-[11px]">
                      <p>Param $1 (username): <span className="text-amber-300">"{boundParams[0]}"</span></p>
                      <p>Param $2 (password): <span className="text-amber-300">"{boundParams[1]}"</span></p>
                    </div>
                  </div>
                )}
              </div>

              {/* Vulnerability Explanation Box */}
              {mode === 'vulnerable' ? (
                <div className="rounded-xl bg-red-950/30 p-4 border border-red-900/50 text-xs text-red-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-red-400">
                    <ShieldAlert className="h-4 w-4" />
                    <span>Vulnerability Mechanism:</span>
                  </div>
                  <p className="leading-relaxed">
                    Notice how entering <code className="bg-red-950 px-1 py-0.5 rounded text-red-300 font-mono">' OR '1'='1</code> modifies the internal database logic! 
                    The query evaluates as <code className="font-mono text-amber-300">WHERE username='' OR '1'='1'</code>, which resolves to <code className="font-mono text-emerald-400">TRUE</code> for every row in the database, logging in as the first user (Admin).
                  </p>
                </div>
              ) : (
                <div className="rounded-xl bg-emerald-950/30 p-4 border border-emerald-900/50 text-xs text-emerald-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-emerald-400">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Secure Defense Mechanism:</span>
                  </div>
                  <p className="leading-relaxed">
                    With Prepared Statements, the SQL query structure is sent to the database engine first. The user payload <code className="bg-emerald-950 px-1 py-0.5 rounded text-emerald-300 font-mono">' OR '1'='1</code> is bound strictly as a literal text string value. The database searches for a literal username named <code className="font-mono text-amber-300 font-bold">"' OR '1'='1"</code>, preventing SQL code execution!
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-48 flex-col items-center justify-center text-center text-gray-500">
              <Play className="h-8 w-8 mb-2 opacity-30" />
              <p className="text-xs">Submit the login form on the left to inspect the constructed database query execution in real-time.</p>
            </div>
          )}
        </div>

        <div className="mt-4 rounded-xl bg-gray-950 p-3 text-[11px] text-gray-400 border border-gray-800 flex items-center justify-between">
          <span>Target DB Engine: MySQL 8.0</span>
          <span className="text-indigo-400 font-mono">Port: 3306</span>
        </div>
      </div>
    </div>
  );
};
