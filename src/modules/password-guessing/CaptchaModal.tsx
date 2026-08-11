import React, { useState, useEffect } from 'react';
import { ShieldCheck, RefreshCw, X } from 'lucide-react';

interface CaptchaModalProps {
  isOpen: boolean;
  onVerify: (success: boolean) => void;
  onClose: () => void;
}

export const CaptchaModal: React.FC<CaptchaModalProps> = ({ isOpen, onVerify, onClose }) => {
  const [captchaCode, setCaptchaCode] = useState<string>('');
  const [userInput, setUserInput] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    setUserInput('');
    setErrorMsg(null);
  };

  useEffect(() => {
    if (isOpen) {
      generateCaptcha();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.trim().toUpperCase() === captchaCode) {
      onVerify(true);
    } else {
      setErrorMsg('Incorrect CAPTCHA code. Please try again.');
      generateCaptcha();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-950 p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <ShieldCheck className="h-5 w-5" />
            <span>Bot Verification Challenge</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-xs text-gray-300">
          Security Alert: Multiple failed login attempts detected. Please complete the CAPTCHA challenge below to verify human identity.
        </p>

        {/* CAPTCHA Visual Canvas Box */}
        <div className="flex items-center justify-between rounded-xl bg-gray-900 p-4 border border-gray-800">
          <div className="select-none font-mono text-2xl font-black tracking-widest text-emerald-400 italic bg-black px-6 py-3 rounded-lg border border-gray-700 shadow-inner">
            {captchaCode.split('').join(' ')}
          </div>

          <button
            type="button"
            onClick={generateCaptcha}
            className="rounded-lg bg-gray-800 hover:bg-gray-700 p-2.5 text-gray-300 transition"
            title="Generate New CAPTCHA"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Enter CAPTCHA Code:</label>
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Case-insensitive code"
              className="w-full rounded-xl bg-gray-900 border border-gray-800 px-3 py-2 text-sm text-white uppercase tracking-wider font-mono focus:border-emerald-500 focus:outline-none"
              required
            />
          </div>

          {errorMsg && <p className="text-xs text-red-400 font-bold">{errorMsg}</p>}

          <button
            type="submit"
            className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 transition"
          >
            Verify CAPTCHA & Proceed
          </button>
        </form>
      </div>
    </div>
  );
};
