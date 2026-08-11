import React, { useState } from 'react';
import { useSecurity } from '../context/SecurityContext';
import { X, Printer, FileText } from 'lucide-react';

export const LabReportModal: React.FC = () => {
  const { isReportModalOpen, setIsReportModalOpen, logs, mode } = useSecurity();

  const [studentName, setStudentName] = useState<string>('Rajkishore S');
  const [registerNo, setRegisterNo] = useState<string>('21BCE1042');
  const [courseCode, setCourseCode] = useState<string>('CS401 - Information Security Lab (CAT 1)');
  const [evaluationDate] = useState<string>(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));

  if (!isReportModalOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const exploitCount = logs.filter((l) => l.level === 'exploit').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md print:p-0 print:bg-white">
      <div className="flex h-[90vh] w-full max-w-5xl flex-col rounded-2xl border border-gray-800 bg-gray-950 shadow-2xl overflow-hidden print:h-auto print:max-w-none print:rounded-none print:border-none print:bg-white print:text-black">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-gray-800 bg-gray-900/80 px-6 py-4 print:hidden">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-950 border border-blue-800 text-blue-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Laboratory Evaluation & Viva Report Generator
                <span className="rounded bg-blue-950 px-2 py-0.5 text-xs text-blue-400 border border-blue-800">
                  Print & PDF Ready
                </span>
              </h2>
              <p className="text-xs text-gray-400">Generate printable lab experiment record for faculty evaluation</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-bold text-white shadow-lg transition"
            >
              <Printer className="h-4 w-4" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={() => setIsReportModalOpen(false)}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Form Inputs (Hidden during Print) */}
        <div className="border-b border-gray-800 bg-gray-900/40 p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs print:hidden">
          <div>
            <label className="block text-gray-400 mb-1">Student Name:</label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full rounded-lg bg-gray-950 border border-gray-800 px-3 py-1.5 text-white font-bold"
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-1">Registration / Roll Number:</label>
            <input
              type="text"
              value={registerNo}
              onChange={(e) => setRegisterNo(e.target.value)}
              className="w-full rounded-lg bg-gray-950 border border-gray-800 px-3 py-1.5 text-white font-bold"
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-1">Course & Assessment:</label>
            <input
              type="text"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
              className="w-full rounded-lg bg-gray-950 border border-gray-800 px-3 py-1.5 text-white font-bold"
            />
          </div>
        </div>

        {/* Printable Document Sheet Content */}
        <div className="flex-1 overflow-y-auto p-8 font-sans space-y-6 text-gray-100 print:text-black print:overflow-visible">
          {/* Document Header */}
          <div className="border-b border-gray-800 pb-6 print:border-gray-400">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white print:text-black uppercase">
                  Department of Computer Science & Engineering
                </h1>
                <p className="text-sm font-semibold text-blue-400 print:text-blue-700">
                  {courseCode}
                </p>
                <p className="text-xs text-gray-400 print:text-gray-600 mt-1">
                  Vulnerability Simulation & Secure Mitigation Laboratory Evaluation Report
                </p>
              </div>

              <div className="text-right text-xs font-mono border-l pl-4 border-gray-800 print:border-gray-400">
                <p className="font-bold text-white print:text-black">DATE: {evaluationDate}</p>
                <p className="text-emerald-400 print:text-emerald-700">STATUS: VERIFIED LAB RECORD</p>
              </div>
            </div>
          </div>

          {/* Student Meta Details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-gray-900/60 border border-gray-800 text-xs print:border-gray-400 print:bg-gray-100">
            <div>
              <span className="text-gray-400 print:text-gray-600 block text-[10px] uppercase font-bold">Student Name</span>
              <span className="font-bold text-white print:text-black text-sm">{studentName}</span>
            </div>
            <div>
              <span className="text-gray-400 print:text-gray-600 block text-[10px] uppercase font-bold">Register Number</span>
              <span className="font-bold text-white print:text-black text-sm font-mono">{registerNo}</span>
            </div>
            <div>
              <span className="text-gray-400 print:text-gray-600 block text-[10px] uppercase font-bold">Evaluation Mode</span>
              <span className="font-bold text-purple-400 print:text-purple-700 uppercase">{mode} MODE</span>
            </div>
            <div>
              <span className="text-gray-400 print:text-gray-600 block text-[10px] uppercase font-bold">Exploits Executed</span>
              <span className="font-bold text-emerald-400 print:text-emerald-700">{exploitCount} Attack Triggers</span>
            </div>
          </div>

          {/* Experiment Modules Summary Table */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white print:text-black uppercase tracking-wider">
              1. Laboratory Experiments Summary & Vulnerability Audit Matrix
            </h3>
            <table className="w-full text-left text-xs border border-gray-800 print:border-gray-400">
              <thead className="bg-gray-900 text-gray-300 font-bold border-b border-gray-800 print:bg-gray-200 print:text-black print:border-gray-400">
                <tr>
                  <th className="py-2.5 px-3">Exp #</th>
                  <th className="py-2.5 px-3">Vulnerability Category</th>
                  <th className="py-2.5 px-3">OWASP Top 10 ID</th>
                  <th className="py-2.5 px-3">Attack Payload Tested</th>
                  <th className="py-2.5 px-3">Secure Mitigation Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 print:divide-gray-400 font-mono">
                <tr>
                  <td className="py-2 px-3 font-bold">01</td>
                  <td className="py-2 px-3">SQL Injection (SQLi)</td>
                  <td className="py-2 px-3 text-red-400 print:text-red-700 font-bold">A03:2021 - Injection</td>
                  <td className="py-2 px-3 text-amber-300 print:text-amber-800">' OR '1'='1</td>
                  <td className="py-2 px-3 text-emerald-400 print:text-emerald-700">Parameterized Prepared Statements</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-bold">02</td>
                  <td className="py-2 px-3">Cross-Site Scripting (XSS)</td>
                  <td className="py-2 px-3 text-red-400 print:text-red-700 font-bold">A03:2021 - Injection (XSS)</td>
                  <td className="py-2 px-3 text-amber-300 print:text-amber-800">&lt;script&gt;alert(document.cookie)&lt;/script&gt;</td>
                  <td className="py-2 px-3 text-emerald-400 print:text-emerald-700">htmlspecialchars() HTML Entity Encoding</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-bold">03</td>
                  <td className="py-2 px-3">Parameter Tampering & IDOR</td>
                  <td className="py-2 px-3 text-red-400 print:text-red-700 font-bold">A01:2021 - Broken Access Control</td>
                  <td className="py-2 px-3 text-amber-300 print:text-amber-800">?id=10 / price=10</td>
                  <td className="py-2 px-3 text-emerald-400 print:text-emerald-700">Server-Side Authorization & DB Price Validation</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-bold">04</td>
                  <td className="py-2 px-3">Password Guessing / Brute-Force</td>
                  <td className="py-2 px-3 text-red-400 print:text-red-700 font-bold">A07:2021 - Auth Failures</td>
                  <td className="py-2 px-3 text-amber-300 print:text-amber-800">Dictionary Wordlist Attack</td>
                  <td className="py-2 px-3 text-emerald-400 print:text-emerald-700">Account Lockout, Rate Limiting & CAPTCHA</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-bold">05</td>
                  <td className="py-2 px-3">OS Command Injection (RCE)</td>
                  <td className="py-2 px-3 text-red-400 print:text-red-700 font-bold">A03:2021 - Command Injection</td>
                  <td className="py-2 px-3 text-amber-300 print:text-amber-800">8.8.8.8; cat /etc/passwd</td>
                  <td className="py-2 px-3 text-emerald-400 print:text-emerald-700">Strict IP Validation (FILTER_VALIDATE_IP)</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Session Log Audit Feed */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white print:text-black uppercase tracking-wider">
              2. Timestamped Real-Time Audit Logs ({logs.length} Captured Logs)
            </h3>
            <div className="rounded-xl bg-gray-900/60 p-4 border border-gray-800 font-mono text-[11px] max-h-48 overflow-y-auto space-y-1.5 print:bg-gray-100 print:border-gray-400 print:max-h-none print:text-black">
              {logs.slice(0, 8).map((log) => (
                <div key={log.id} className="flex items-center gap-2">
                  <span className="text-gray-500 font-bold">[{log.timestamp}]</span>
                  <span className="font-bold text-indigo-400 print:text-indigo-800">[{log.category}]</span>
                  <span className="text-gray-200 print:text-black">{log.message}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Signature & Evaluation Sign-Off Block */}
          <div className="pt-8 border-t border-gray-800 print:border-gray-400 grid grid-cols-2 gap-8 text-xs">
            <div className="space-y-8">
              <p className="text-gray-400 print:text-gray-700">Student Declaration:</p>
              <div className="border-b border-gray-700 print:border-gray-500 w-48" />
              <p className="font-bold text-white print:text-black">{studentName} ({registerNo})</p>
            </div>

            <div className="space-y-8 text-right">
              <p className="text-gray-400 print:text-gray-700">Faculty / Examiner Evaluation Sign-Off:</p>
              <div className="border-b border-gray-700 print:border-gray-500 w-48 ml-auto" />
              <p className="font-bold text-white print:text-black">Evaluated by Faculty (Signature & Date)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
