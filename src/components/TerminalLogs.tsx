import React, { useState } from 'react';
import { useSecurity } from '../context/SecurityContext';
import { Terminal, Trash2, X, ChevronDown, ChevronRight } from 'lucide-react';

interface TerminalLogsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TerminalLogs: React.FC<TerminalLogsProps> = ({ isOpen, onClose }) => {
  const { logs, clearLogs } = useSecurity();
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  if (!isOpen) return null;

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

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-800 bg-gray-950/95 backdrop-blur-lg shadow-2xl transition-all duration-300">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-gray-800 px-4 py-2 bg-gray-900/60">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-emerald-400" />
          <span className="text-xs font-bold text-gray-200 uppercase tracking-wider">
            Live Server Request Log & SQL Trace
          </span>
          <span className="text-xs text-gray-400">({logs.length} entries)</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={clearLogs}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-gray-400 hover:bg-gray-800 hover:text-red-400 transition"
            title="Clear Log Feed"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear</span>
          </button>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Log Feed List */}
      <div className="h-64 overflow-y-auto p-3 font-mono text-xs space-y-1.5">
        {logs.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-gray-500 py-8">
            <Terminal className="h-8 w-8 mb-2 opacity-30" />
            <p>No request logs captured yet. Interact with the application modules above!</p>
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
                      <div className="rounded bg-black/80 p-2.5 font-mono text-[11px] text-emerald-300 border border-gray-800 overflow-x-auto">
                        <pre>{log.codeSnippet}</pre>
                      </div>
                    )}
                    {log.details && (
                      <div className="rounded bg-gray-950 p-2 text-[10px] text-gray-400 border border-gray-800">
                        <span className="font-bold text-gray-300">Payload Metadata:</span>
                        <pre className="mt-1">{JSON.stringify(log.details, null, 2)}</pre>
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
