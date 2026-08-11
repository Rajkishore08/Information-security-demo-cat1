import React, { useState } from 'react';
import { useSecurity } from '../../context/SecurityContext';
import { Search, Database, ShieldAlert } from 'lucide-react';

export const CustomerSearch: React.FC = () => {
  const { mode, addLog, customers } = useSecurity();
  const [searchTerm, setSearchTerm] = useState<string>('1');
  const [executedSql, setExecutedSql] = useState<string>('');
  const [displayedResults, setDisplayedResults] = useState<typeof customers>([]);
  const [isUnionExfiltrated, setIsUnionExfiltrated] = useState<boolean>(false);

  const presets = [
    { label: "Search ID 1 (Alex)", payload: "1" },
    { label: "Wildcard Exfiltrate (1 OR 1=1)", payload: "1 OR 1=1" },
    { label: "UNION Exfiltrate Credit Cards (1 UNION SELECT...)", payload: "1' UNION SELECT 99, 'EXFILTRATED_ADMIN', 'hacker', 'CARD-9999', 999999, 'stolen@hacker.org', '999-99-9999', '4532-8899-7711-9922' --" }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUnionExfiltrated(false);

    if (mode === 'vulnerable') {
      // ❌ VULNERABLE: Direct concatenation
      const rawSql = `SELECT id, username, role, accountNo, balance, email FROM customers WHERE id = ${searchTerm};`;
      setExecutedSql(rawSql);

      addLog('vuln', 'SQL INJECTION', `Executing unsafe search query:`, rawSql);

      if (searchTerm.includes('OR 1=1') || searchTerm.includes('OR TRUE') || searchTerm.includes("' OR '1'='1")) {
        // Return ALL rows in database!
        setDisplayedResults(customers);
        addLog('exploit', 'SQL DATA EXFILTRATION', `⚡ Exfiltrated all ${customers.length} customer records via 1 OR 1=1 payload!`);
      } else if (searchTerm.includes('UNION SELECT')) {
        setIsUnionExfiltrated(true);
        // Exfiltrated injected mock row
        const exfiltratedRow = {
          id: 99,
          username: 'EXFILTRATED_ADMIN_VAULT',
          role: 'Admin' as const,
          accountNo: 'CARD-9999-STOLEN',
          balance: 999999.00,
          email: 'stolen_vault@hacker.org',
          ssn: '999-99-9999 (EXFILTRATED)',
          creditCard: '4532-8899-7711-9922 (STOLEN)'
        };
        setDisplayedResults([exfiltratedRow, ...customers]);
        addLog('exploit', 'UNION SQLi EXPLOIT', `⚡ UNION SELECT payload exfiltrated sensitive credit card & SSN data from database vault!`);
      } else {
        const numericId = parseInt(searchTerm, 10);
        const filtered = customers.filter((c) => c.id === numericId || c.username.toLowerCase().includes(searchTerm.toLowerCase()));
        setDisplayedResults(filtered);
      }
    } else {
      // 🟢 SECURE: Parameterized integer binding
      const preparedSql = `SELECT id, username, role, accountNo, balance, email FROM customers WHERE id = ?;`;
      setExecutedSql(preparedSql);

      addLog(
        'secure',
        'PREPARED STATEMENT',
        `Executing parameterized customer lookup with bound integer parameter: "${searchTerm}"`,
        `$stmt = $db->prepare("SELECT ... WHERE id = ?");\n$stmt->bind_param("i", intval($searchTerm));`
      );

      const numericId = parseInt(searchTerm, 10);
      if (isNaN(numericId)) {
        setDisplayedResults([]);
        addLog('secure', 'PREPARED STATEMENT', `Input "${searchTerm}" rejected: Integer casting evaluated to 0.`);
      } else {
        const filtered = customers.filter((c) => c.id === numericId);
        setDisplayedResults(filtered);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Header Form */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-800 pb-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Database className="h-5 w-5 text-indigo-400" />
              Customer Lookup & Account Search API
            </h3>
            <p className="text-xs text-gray-400">Search customer database by Customer ID or payload parameter</p>
          </div>

          <div className="flex items-center gap-2">
            {presets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSearchTerm(p.payload);
                }}
                className="rounded-lg bg-gray-950 hover:bg-indigo-950 px-2.5 py-1.5 text-xs text-indigo-300 border border-gray-800 hover:border-indigo-800 transition"
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Enter Customer ID or SQL Injection Payload..."
              className="w-full rounded-xl bg-gray-950 border border-gray-800 pl-10 pr-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition"
          >
            Search
          </button>
        </form>
      </div>

      {/* Executed Query Banner */}
      {executedSql && (
        <div className="rounded-xl bg-black p-4 border border-gray-800 font-mono text-xs">
          <span className="text-gray-500 text-[10px] uppercase font-bold block mb-1">
            {mode === 'vulnerable' ? 'Unsafe SQL Execution Log:' : 'Parameterized SQL Execution Log:'}
          </span>
          <p className={mode === 'vulnerable' ? 'text-red-400 break-all' : 'text-emerald-400 break-all'}>
            {executedSql}
          </p>
        </div>
      )}

      {/* Results Table */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6 shadow-xl">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center justify-between">
          <span>Search Results ({displayedResults.length} records returned)</span>
          {isUnionExfiltrated && (
            <span className="text-red-400 font-bold flex items-center gap-1">
              <ShieldAlert className="h-4 w-4" /> Sensitive Data Exfiltrated via UNION SQLi!
            </span>
          )}
        </h4>

        {displayedResults.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center text-gray-500 text-xs">
            <Search className="h-6 w-6 mb-2 opacity-30" />
            <p>No customer records found matching query parameters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-gray-800 text-gray-400 uppercase font-mono">
                <tr>
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Username</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Account No</th>
                  <th className="py-3 px-4">Balance</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">SSN (Vault)</th>
                  <th className="py-3 px-4">Credit Card</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 font-mono">
                {displayedResults.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-800/40">
                    <td className="py-3 px-4 text-gray-400">#{c.id}</td>
                    <td className="py-3 px-4 text-white font-bold">{c.username}</td>
                    <td className="py-3 px-4">
                      <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                        c.role === 'Admin' ? 'bg-purple-950 text-purple-300 border border-purple-800' : 'bg-gray-800 text-gray-300'
                      }`}>
                        {c.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-indigo-300">{c.accountNo}</td>
                    <td className="py-3 px-4 text-emerald-400">₹{c.balance.toLocaleString()}</td>
                    <td className="py-3 px-4 text-gray-300">{c.email}</td>
                    <td className="py-3 px-4 text-amber-300">{c.ssn}</td>
                    <td className="py-3 px-4 text-red-300">{c.creditCard}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
