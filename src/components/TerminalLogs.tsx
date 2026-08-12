import React, { useState } from 'react';
import { useSecurity } from '../context/SecurityContext';
import { exportLabDBAsJSONFile, exportSQLiteDBDump, resetLocalDB } from '../services/dbStorage';
import { Terminal, Trash2, X, ChevronDown, ChevronRight, ChevronUp, Download, RotateCcw, Database } from 'lucide-react';

interface TerminalLogsProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}

export const TerminalLogs: React.FC<TerminalLogsProps> = ({ isOpen, onClose, onOpen }) => {
  const { logs, clearLogs } = useSecurity();
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'vuln':
        return <span className="rounded bg-red-950 px-1.5 py-0.5 text-[10px] font-bold text-red-400 border border-red-800">VULN 🔴</span>;
      case 'secure':
        return <span className="rounded bg-emerald-950 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-800">SECURE 🟢</span>;
      case 'exploit':
        return <span className="rounded bg-purple-950 px-1.5 py-0.5 text-[10px] font-bold text-purple-300 border border-purple-800">EXPLOIT ⚡</span>;
      case 'warn':
        return <span className="rounded bg-amber-950 px-1.5 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-800">WARN ⚠️</span>;
      default:
        return <span className="rounded bg-blue-950 px-1.5 py-0.5 text-[10px] font-bold text-blue-400 border border-blue-800">INFO ℹ️</span>;
    }
  };

  // FLOATING RE-OPEN BADGE (Shown when closed or minimized)
  if (!isOpen) {
    return (
      <button
        onClick={onOpen}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 px-4 py-2.5 text-xs font-bold text-white shadow-2xl shadow-indigo-600/40 border border-indigo-400/40 transition-all transform hover:scale-105 animate-bounce-slow"
        title="Open Live Server Request Log & SQL Trace Terminal"
      >
        <Terminal className="h-4 w-4 text-emerald-300" />
        <span>Live Server Logs & SQL Trace</span>
        <span className="rounded-full bg-emerald-950 px-2 py-0.5 text-[10px] font-mono text-emerald-400 border border-emerald-800 font-bold">
          {logs.length}
        </span>
      </button>
    );
  }

  // MINIMIZED BAR STATE
  if (isMinimized) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-800 bg-gray-950/95 backdrop-blur-lg px-4 py-2 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-3">
          <Terminal className="h-4 w-4 text-emerald-400 animate-pulse" />
          <span className="text-xs font-bold text-white font-mono flex items-center gap-2">
            Live Server Request Log & SQL Trace
            <span className="rounded bg-indigo-950 px-2 py-0.5 text-[10px] text-indigo-300 border border-indigo-800">
              {logs.length} entries
            </span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(false)}
            className="flex items-center gap-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-3 py-1 text-xs font-bold text-white transition"
          >
            <ChevronUp className="h-3.5 w-3.5" />
            <span>Maximize Terminal 🔼</span>
          </button>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-800 hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  // FULLY OPENED TERMINAL DRAWER
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-indigo-900/60 bg-gray-950/95 backdrop-blur-xl shadow-2xl transition-all duration-300">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-gray-800 px-4 py-2 bg-gray-900/80">
        <div className="flex items-center gap-3">
          <Terminal className="h-4 w-4 text-emerald-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            Live Server Request Log & SQL Trace
            <span className="rounded bg-indigo-950 px-2 py-0.5 text-[10px] text-indigo-300 border border-indigo-800 font-bold">
              {logs.length} Entries
            </span>
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <button
            onClick={exportSQLiteDBDump}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-950/90 hover:bg-emerald-900 px-2.5 py-1 text-[11px] font-bold text-emerald-300 border border-emerald-800 transition"
            title="Download SQLite Database File (lab_actions_audit.sql / lab.db)"
          >
            <Database className="h-3.5 w-3.5 text-emerald-400" />
            <span>Export SQLite lab.db 🗄️</span>
          </button>

          <button
            onClick={exportLabDBAsJSONFile}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-950/90 hover:bg-indigo-900 px-2.5 py-1 text-[11px] font-bold text-indigo-300 border border-indigo-800 transition"
            title="Download local lab_db.json file"
          >
            <Download className="h-3.5 w-3.5 text-indigo-400" />
            <span>Export lab_db.json 📥</span>
          </button>

          <button
            onClick={() => {
              if (confirm('Reset local lab_db.json to factory defaults?')) {
                resetLocalDB();
                window.location.reload();
              }
            }}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-gray-400 hover:bg-gray-800 hover:text-amber-300 transition"
            title="Reset local JSON DB"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset DB</span>
          </button>

          <button
            onClick={clearLogs}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-gray-400 hover:bg-gray-800 hover:text-red-400 transition"
            title="Clear Log Feed"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear</span>
          </button>

          <button
            onClick={() => setIsMinimized(true)}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition"
            title="Minimize Terminal"
          >
            <ChevronDown className="h-4 w-4" />
          </button>

          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-800 hover:text-white transition"
            title="Close Terminal Drawer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Log Feed List */}
      <div className="h-64 overflow-y-auto p-3 font-mono text-xs space-y-1.5 bg-[#070a12]/90">
        {logs.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-gray-500 py-8">
            <Database className="h-8 w-8 mb-2 opacity-30" />
            <p>No request logs captured in lab_db.json. Interact with CyberMart modules above!</p>
          </div>
        ) : (
          logs.map((log) => {
            const isExpanded = expandedLogId === log.id;
            return (
              <div
                key={log.id}
                className="rounded-lg border border-gray-800/80 bg-gray-900/70 hover:bg-gray-900 p-2 transition"
              >
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    {log.codeSnippet || log.details ? (
                      isExpanded ? (
                        <ChevronDown className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                      )
                    ) : (
                      <span className="w-3.5" />
                    )}
                    <span className="text-[11px] text-gray-500 font-mono shrink-0">[{log.timestamp}]</span>
                    {getLevelBadge(log.level)}
                    <span className="font-bold text-gray-300 shrink-0">[{log.category}]</span>
                    <span className="text-gray-200 truncate">{log.message}</span>
                  </div>
                </div>

                {/* Expanded Details Code View */}
                {isExpanded && (log.codeSnippet || log.details) && (
                  <div className="mt-2 pl-6 pt-2 border-t border-gray-800 space-y-2">
                    {log.codeSnippet && (
                      <div className="rounded-lg bg-black/90 p-2.5 border border-gray-800 text-emerald-300">
                        <pre className="text-[11px] leading-relaxed">{log.codeSnippet}</pre>
                      </div>
                    )}
                    {log.details && (
                      <div className="rounded-lg bg-gray-950 p-2 border border-gray-800 text-gray-400 text-[11px]">
                        <pre>{JSON.stringify(log.details, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
