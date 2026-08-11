import React, { useState } from 'react';
import { useSecurity } from '../context/SecurityContext';
import { VIVA_QUESTIONS } from '../data/mockData';
import { X, BookOpen, Eye, EyeOff, Sparkles, CheckCircle2 } from 'lucide-react';

export const VivaFlashcardsModal: React.FC = () => {
  const { isVivaModalOpen, setIsVivaModalOpen } = useSecurity();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [revealedIds, setRevealedIds] = useState<Record<number, boolean>>({});

  if (!isVivaModalOpen) return null;

  const categories = ['ALL', 'SQL Injection', 'Cross-Site Scripting (XSS)', 'Parameter Tampering', 'Password Guessing'];

  const filteredQuestions = selectedCategory === 'ALL'
    ? VIVA_QUESTIONS
    : VIVA_QUESTIONS.filter((q) => q.category === selectedCategory);

  const toggleReveal = (idx: number) => {
    setRevealedIds((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="flex h-[85vh] w-full max-w-4xl flex-col rounded-2xl border border-gray-800 bg-gray-950 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-800 bg-gray-900/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-950 border border-amber-800 text-amber-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                College Viva Exam Question Bank
                <Sparkles className="h-4 w-4 text-amber-400" />
              </h2>
              <p className="text-xs text-gray-400">Master the fundamental security questions expected during your lab evaluation</p>
            </div>
          </div>

          <button
            onClick={() => setIsVivaModalOpen(false)}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Category Filters */}
        <div className="flex border-b border-gray-800 bg-gray-900/40 px-6 py-2 gap-2 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition ${
                selectedCategory === cat
                  ? 'bg-amber-900/80 text-amber-200 border border-amber-700 shadow-md'
                  : 'text-gray-400 hover:bg-gray-800/60 hover:text-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Question Cards Grid */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {filteredQuestions.map((q, idx) => {
            const isRevealed = revealedIds[idx];
            return (
              <div
                key={idx}
                className="rounded-xl border border-gray-800 bg-gray-900/70 p-4 transition-all hover:border-amber-700/50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="inline-block rounded bg-amber-950 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-800/60 mb-2">
                      {q.category}
                    </span>
                    <h3 className="text-sm font-semibold text-white">
                      Q{idx + 1}: {q.question}
                    </h3>
                  </div>

                  <button
                    onClick={() => toggleReveal(idx)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium border transition shrink-0 ${
                      isRevealed
                        ? 'bg-amber-950/80 text-amber-300 border-amber-700'
                        : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'
                    }`}
                  >
                    {isRevealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    <span>{isRevealed ? 'Hide Answer' : 'Show Answer'}</span>
                  </button>
                </div>

                {/* Revealed Answer Panel */}
                {isRevealed && (
                  <div className="mt-3 rounded-lg border border-amber-900/40 bg-amber-950/20 p-3 text-xs text-amber-100 flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-amber-300">Examiner Answer:</span>
                      <p className="mt-1 leading-relaxed">{q.answer}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
