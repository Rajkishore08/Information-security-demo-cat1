import React, { useState } from 'react';
import { useSecurity } from '../../context/SecurityContext';
import { Code2, Sparkles, Send, ShieldAlert, AlertTriangle, User, BookOpen } from 'lucide-react';

export const FeedbackForm: React.FC = () => {
  const { mode, addLog, feedbacks, addFeedback } = useSecurity();
  const [studentName, setStudentName] = useState<string>('Rohan Sharma');
  const [course, setCourse] = useState<string>('Information Security CS401');
  const [comment, setComment] = useState<string>('<script>alert("Hacked! Session Cookie: " + document.cookie)</script>');
  const [activeAlertMessage, setActiveAlertMessage] = useState<string | null>(null);

  const presets = [
    {
      label: "Classic Alert (<script>alert('Hacked'))",
      payload: '<script>alert("Hacked! Session Cookie: token_abc123_stolen")</script>'
    },
    {
      label: "Image OnError XSS (<img src=x onerror=...)",
      payload: '<img src="invalid_image.jpg" onerror="alert(\'Stored XSS Triggered via Image OnError!\')" />'
    },
    {
      label: "DOM Hover Event (<div onmouseover=...)",
      payload: '<div style="background:#ef4444;color:white;padding:8px;border-radius:6px;cursor:pointer;" onmouseover="alert(\'Hover XSS Executed!\')">⚠️ Hover over this box to trigger XSS!</div>'
    },
    {
      label: "Legitimate Feedback",
      payload: 'The laboratory exercises were extremely clear and practical. Thank you professor!'
    }
  ];

  // Helper to escape HTML entity characters for Secure Mode
  const escapeHtml = (text: string) => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveAlertMessage(null);

    const isScriptPayload = comment.includes('<script>') || comment.includes('onerror=') || comment.includes('onmouseover=');

    if (mode === 'vulnerable') {
      // ❌ VULNERABLE MODE: Unsanitized HTML rendering
      addFeedback({
        studentName,
        course,
        rating: 5,
        comment,
        isSandboxedScriptExecuted: isScriptPayload
      });

      addLog(
        'vuln',
        'STORED XSS',
        `Unsanitized Stored XSS payload posted by student "${studentName}"`,
        `// VULNERABLE PHP rendering:\n<div class="comment">\n  <?php echo $_POST['comment']; ?>\n</div>\n// Output in DOM:\n${comment}`,
        { commentPayload: comment }
      );

      if (isScriptPayload) {
        addLog(
          'exploit',
          'STORED XSS EXPLOIT',
          `⚡ STORED XSS EXECUTED IN BROWSER! Attacker hijacked user DOM session context!`,
          `alert("Hacked! Session Cookie: token_abc123_stolen");`
        );
        setActiveAlertMessage(`⚡ STORED XSS POPUP TRIGGERED!\nPayload executed JavaScript in victim's browser context:\n"${comment}"`);
      }
    } else {
      // 🟢 SECURE MODE: HTML Entity Encoding
      const sanitizedComment = escapeHtml(comment);
      addFeedback({
        studentName,
        course,
        rating: 5,
        comment: sanitizedComment,
        isSandboxedScriptExecuted: false
      });

      addLog(
        'secure',
        'HTML SANITIZATION',
        `Stored payload sanitized via htmlspecialchars() entity encoding`,
        `// SECURE PHP rendering:\n<?php echo htmlspecialchars($_POST['comment'], ENT_QUOTES, 'UTF-8'); ?>\n// Rendered safe string:\n${sanitizedComment}`,
        { rawComment: comment, encodedComment: sanitizedComment }
      );
    }

    setComment('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Feedback Submission Form */}
      <div className="lg:col-span-5 rounded-2xl border border-gray-800 bg-gray-900/60 p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-3 border-b border-gray-800 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-950 text-purple-400 border border-purple-800">
            <Code2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Student Feedback Portal</h3>
            <p className="text-xs text-gray-400">EduFeedback Hub - Stored Review Collector</p>
          </div>
        </div>

        {/* Attack Presets */}
        <div className="rounded-xl bg-gray-950 p-3.5 border border-gray-800">
          <label className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1 mb-2">
            <Sparkles className="h-3.5 w-3.5" /> XSS Attack Payloads:
          </label>
          <div className="space-y-1.5">
            {presets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setComment(p.payload)}
                className="w-full text-left rounded-lg bg-gray-900 hover:bg-purple-950/80 px-2.5 py-1.5 text-xs text-gray-300 hover:text-purple-200 border border-gray-800 hover:border-purple-700 transition truncate"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Student Name:</label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full rounded-xl bg-gray-950 border border-gray-800 px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Course:</label>
            <input
              type="text"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              className="w-full rounded-xl bg-gray-950 border border-gray-800 px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Feedback Comment (XSS Target):</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="Write feedback comment or XSS payload..."
              className="w-full rounded-xl bg-gray-950 border border-gray-800 px-3 py-2 text-xs text-white font-mono focus:border-purple-500 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-lg transition ${
              mode === 'vulnerable'
                ? 'bg-red-600 hover:bg-red-500 shadow-red-600/30'
                : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
            }`}
          >
            <Send className="h-4 w-4" />
            <span>Submit Feedback Comment</span>
          </button>
        </form>
      </div>

      {/* Live Student Feedbacks & Rendered DOM View */}
      <div className="lg:col-span-7 space-y-4">
        {/* Interactive Alert Simulator Box */}
        {activeAlertMessage && (
          <div className="rounded-2xl border border-red-700 bg-red-950/90 p-4 text-white shadow-2xl animate-pulse-glow">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-yellow-300 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-yellow-300 font-mono">[ALERT POPUP DIALOG SIMULATED]</h4>
                <pre className="mt-1 text-xs font-mono text-white whitespace-pre-wrap">{activeAlertMessage}</pre>
                <div className="mt-3 flex items-center justify-between text-[11px] text-red-200 border-t border-red-800/80 pt-2">
                  <span>Simulated document.cookie: <code className="bg-black/60 px-1 py-0.5 rounded font-mono text-yellow-300">sess_id=abc991823_stolen_token</code></span>
                  <button
                    onClick={() => setActiveAlertMessage(null)}
                    className="rounded bg-black px-2 py-1 text-xs text-white font-bold hover:bg-gray-800"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-purple-400" />
              Public Student Feedbacks Feed ({feedbacks.length} comments)
            </h3>
            {mode === 'vulnerable' ? (
              <span className="rounded bg-red-950 px-2 py-0.5 text-[10px] text-red-400 border border-red-800 font-bold">RAW HTML (dangerouslySetInnerHTML)</span>
            ) : (
              <span className="rounded bg-emerald-950 px-2 py-0.5 text-[10px] text-emerald-400 border border-emerald-800 font-bold">Escaped Text Nodes</span>
            )}
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {feedbacks.map((fb) => (
              <div
                key={fb.id}
                className={`rounded-xl border p-4 transition ${
                  fb.isSandboxedScriptExecuted && mode === 'vulnerable'
                    ? 'border-red-800/80 bg-red-950/30'
                    : 'border-gray-800 bg-gray-950/80'
                }`}
              >
                <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-purple-400" />
                    <span className="font-bold text-white">{fb.studentName}</span>
                    <span>• {fb.course}</span>
                  </div>
                  <span>{fb.createdAt}</span>
                </div>

                {/* Rendered Comment */}
                <div className="mt-2 text-xs font-mono">
                  <span className="text-gray-500 text-[10px] block mb-1">Rendered DOM Output:</span>
                  {mode === 'vulnerable' ? (
                    <div
                      className="text-red-200 bg-black/60 p-2.5 rounded-lg border border-red-950 break-words"
                      dangerouslySetInnerHTML={{ __html: fb.comment }}
                    />
                  ) : (
                    <div className="text-emerald-200 bg-black/60 p-2.5 rounded-lg border border-emerald-950 break-words">
                      {fb.comment}
                    </div>
                  )}
                </div>

                {fb.isSandboxedScriptExecuted && mode === 'vulnerable' && (
                  <div className="mt-2 text-[10px] text-red-400 flex items-center gap-1 font-bold">
                    <ShieldAlert className="h-3.5 w-3.5" />
                    <span>⚠️ Stored XSS Script Payload executed upon rendering this feedback card!</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
