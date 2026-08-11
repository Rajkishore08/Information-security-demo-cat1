import React, { useState, useEffect } from 'react';
import { useSecurity } from '../../context/SecurityContext';
import { DICTIONARY_PASSWORDS } from '../../data/mockData';
import type { DictionaryAttempt } from '../../types/security';
import { CaptchaModal } from './CaptchaModal';
import { KeyRound, Play, Pause, RotateCcw, Lock, Clock, Sparkles } from 'lucide-react';

export const DictionaryAttackSimulator: React.FC = () => {
  const { 
    mode, 
    addLog, 
    failedAttempts, 
    incrementFailedAttempts, 
    resetFailedAttempts, 
    isAccountLocked, 
    lockoutTimeRemaining, 
    captchaRequired,
    setCaptchaRequired
  } = useSecurity();

  const [targetUsername] = useState<string>('employee_john');
  const [correctPassword] = useState<string>('welcome'); // Target password at index 3 in list!

  const [attempts, setAttempts] = useState<DictionaryAttempt[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isCaptchaOpen, setIsCaptchaOpen] = useState<boolean>(false);
  const [captchaVerified, setCaptchaVerified] = useState<boolean>(false);

  // Control automated loop
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    if (isRunning && currentIndex < DICTIONARY_PASSWORDS.length && !isAccountLocked) {
      // Check CAPTCHA requirement in Secure Mode
      if (mode === 'secure' && captchaRequired && !captchaVerified) {
        setIsRunning(false);
        setIsCaptchaOpen(true);
        addLog(
          'secure',
          'BOT DEFENSE',
          '⚡ CAPTCHA Challenge Triggered: 3 consecutive failed login attempts detected. Halting dictionary attack runner!'
        );
        return;
      }

      const delay = mode === 'secure' ? 1500 : 400; // 1.5s rate-limit delay in Secure Mode!

      timeout = setTimeout(() => {
        executeAttempt(currentIndex);
        setCurrentIndex((prev) => prev + 1);
      }, delay);
    } else if (currentIndex >= DICTIONARY_PASSWORDS.length) {
      setIsRunning(false);
    }

    return () => clearTimeout(timeout);
  }, [isRunning, currentIndex, isAccountLocked, mode, captchaRequired, captchaVerified]);

  const executeAttempt = (idx: number) => {
    const passwordToTry = DICTIONARY_PASSWORDS[idx];
    const attemptNum = idx + 1;
    const isCorrect = passwordToTry === correctPassword;
    const delay = mode === 'secure' ? 1500 : 400;

    if (isAccountLocked) {
      const lockedAttempt: DictionaryAttempt = {
        attemptNum,
        password: passwordToTry,
        status: 'LOCKED',
        timestamp: new Date().toLocaleTimeString(),
        delayMs: delay
      };
      setAttempts((prev) => [lockedAttempt, ...prev]);
      addLog(
        'secure',
        'AUTH LOCKOUT',
        `Attempt #${attemptNum} ('${passwordToTry}') BLOCKED: Account is locked out for 30s.`
      );
      return;
    }

    if (isCorrect) {
      const successAttempt: DictionaryAttempt = {
        attemptNum,
        password: passwordToTry,
        status: 'SUCCESS',
        timestamp: new Date().toLocaleTimeString(),
        delayMs: delay
      };
      setAttempts((prev) => [successAttempt, ...prev]);
      setIsRunning(false);

      if (mode === 'vulnerable') {
        addLog(
          'exploit',
          'DICTIONARY ATTACK SUCCESS',
          `⚡ PASSWORD GUESSED! Target '${targetUsername}' compromised with password '${passwordToTry}' on attempt #${attemptNum}!`,
          `// Attack completed in ${attemptNum * 0.4} seconds\nLogged in as ${targetUsername}`
        );
      } else {
        addLog(
          'secure',
          'AUTH DEFENSE',
          `Target authenticated with correct password '${passwordToTry}' after passing CAPTCHA security checks.`
        );
      }
    } else {
      const failAttempt: DictionaryAttempt = {
        attemptNum,
        password: passwordToTry,
        status: 'FAIL',
        timestamp: new Date().toLocaleTimeString(),
        delayMs: delay
      };
      setAttempts((prev) => [failAttempt, ...prev]);
      incrementFailedAttempts();

      if (mode === 'vulnerable') {
        addLog(
          'vuln',
          'DICTIONARY ATTACK',
          `Attempt #${attemptNum}: Tried '${passwordToTry}' -> ❌ Failed (401 Unauthorized)`
        );
      } else {
        addLog(
          'secure',
          'RATE LIMITED AUTH',
          `Attempt #${attemptNum}: Tried '${passwordToTry}' -> ❌ Failed. (Throttled with 1.5s delay)`
        );
      }
    }
  };

  const handleStart = () => {
    if (currentIndex >= DICTIONARY_PASSWORDS.length) {
      handleReset();
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setCurrentIndex(0);
    setAttempts([]);
    setCaptchaVerified(false);
    resetFailedAttempts();
    addLog('info', 'DICTIONARY ATTACK', 'Reset dictionary attack state and target account session.');
  };

  const handleCaptchaVerify = (success: boolean) => {
    if (success) {
      setCaptchaVerified(true);
      setCaptchaRequired(false);
      setIsCaptchaOpen(false);
      addLog('secure', 'CAPTCHA PASSED', 'Human verification confirmed. Resuming login process...');
      setIsRunning(true);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Control Panel */}
      <div className="lg:col-span-5 rounded-2xl border border-gray-800 bg-gray-900/60 p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-3 border-b border-gray-800 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-950 text-amber-400 border border-amber-800">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Employee Login Gateway</h3>
            <p className="text-xs text-gray-400">Target Username: <span className="font-mono text-amber-300 font-bold">{targetUsername}</span></p>
          </div>
        </div>

        {/* Lockout Warning Banner */}
        {isAccountLocked && (
          <div className="rounded-xl border border-red-800 bg-red-950 p-4 text-xs text-red-200 animate-pulse-glow flex items-start gap-3">
            <Lock className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-red-300 text-sm block">🔒 ACCOUNT LOCKED OUT!</span>
              <p className="mt-1">
                Security defense triggered: Account locked for 5 consecutive failed attempts.
              </p>
              <div className="mt-2 text-xs font-mono font-bold text-yellow-300 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>Time remaining: {lockoutTimeRemaining} seconds</span>
              </div>
            </div>
          </div>
        )}

        {/* Wordlist Config */}
        <div className="rounded-xl bg-gray-950 p-4 border border-gray-800 space-y-2">
          <label className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" /> Dictionary Wordlist ({DICTIONARY_PASSWORDS.length} passwords):
          </label>
          <div className="flex flex-wrap gap-1 font-mono text-[11px]">
            {DICTIONARY_PASSWORDS.map((w, idx) => (
              <span
                key={idx}
                className={`rounded px-2 py-1 border ${
                  idx === currentIndex - 1
                    ? 'bg-amber-950 text-amber-300 border-amber-700 font-bold'
                    : 'bg-gray-900 text-gray-400 border-gray-800'
                }`}
              >
                {w}
              </span>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          {isRunning ? (
            <button
              onClick={handlePause}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-500 py-3 text-xs font-bold text-white shadow-lg transition"
            >
              <Pause className="h-4 w-4" />
              <span>Pause Attack</span>
            </button>
          ) : (
            <button
              onClick={handleStart}
              disabled={isAccountLocked}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold text-white shadow-lg transition ${
                isAccountLocked
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  : mode === 'vulnerable'
                  ? 'bg-red-600 hover:bg-red-500 shadow-red-600/30'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
              }`}
            >
              <Play className="h-4 w-4 fill-current" />
              <span>Start Dictionary Attack</span>
            </button>
          )}

          <button
            onClick={handleReset}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 px-4 text-xs font-bold text-gray-200 transition"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset</span>
          </button>
        </div>

        {/* Defense Metrics Card */}
        <div className="rounded-xl bg-gray-950 p-3.5 border border-gray-800 space-y-2 text-xs">
          <span className="font-bold text-gray-300 block">Security Controls Active:</span>
          <div className="space-y-1 font-mono text-[11px]">
            <div className="flex justify-between">
              <span className="text-gray-400">Failed Attempt Counter:</span>
              <span className={failedAttempts >= 5 ? 'text-red-400 font-bold' : 'text-amber-300'}>{failedAttempts} / 5</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Server Rate Limiting:</span>
              <span className={mode === 'secure' ? 'text-emerald-400 font-bold' : 'text-red-400'}>
                {mode === 'secure' ? 'Enabled (1.5s Throttling)' : 'Disabled (0ms)'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">CAPTCHA Challenge:</span>
              <span className={captchaRequired ? 'text-amber-400 font-bold' : 'text-gray-500'}>
                {captchaRequired ? 'Required (3 Failed Tries)' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Attempt Feed */}
      <div className="lg:col-span-7 rounded-2xl border border-gray-800 bg-gray-900/60 p-6 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono">
              Live Dictionary Attack Execution Feed ({attempts.length} attempts)
            </h3>
            {mode === 'vulnerable' ? (
              <span className="rounded bg-red-950 px-2 py-0.5 text-[10px] text-red-400 border border-red-800 font-bold">No Rate Limits</span>
            ) : (
              <span className="rounded bg-emerald-950 px-2 py-0.5 text-[10px] text-emerald-400 border border-emerald-800 font-bold">Lockout + CAPTCHA Active</span>
            )}
          </div>

          <div className="space-y-2 max-h-[450px] overflow-y-auto font-mono text-xs pr-1">
            {attempts.length === 0 ? (
              <div className="flex h-48 flex-col items-center justify-center text-gray-500">
                <KeyRound className="h-8 w-8 mb-2 opacity-30" />
                <p>Click "Start Dictionary Attack" to begin automated password guessing simulation.</p>
              </div>
            ) : (
              attempts.map((a) => (
                <div
                  key={a.attemptNum}
                  className={`flex items-center justify-between p-3 rounded-xl border transition ${
                    a.status === 'SUCCESS'
                      ? 'border-emerald-700 bg-emerald-950/60 text-emerald-200'
                      : a.status === 'LOCKED'
                      ? 'border-red-800 bg-red-950/60 text-red-300'
                      : 'border-gray-800 bg-gray-950 text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-400">#{a.attemptNum}</span>
                    <span className="font-bold text-white">Password: "{a.password}"</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-gray-500">({a.delayMs}ms)</span>
                    {a.status === 'SUCCESS' && (
                      <span className="rounded bg-emerald-950 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-700">
                        🟢 ACCESS GRANTED! 200 OK
                      </span>
                    )}
                    {a.status === 'FAIL' && (
                      <span className="rounded bg-gray-900 px-2 py-0.5 text-[10px] font-bold text-gray-400 border border-gray-800">
                        ❌ FAIL 401
                      </span>
                    )}
                    {a.status === 'LOCKED' && (
                      <span className="rounded bg-red-950 px-2 py-0.5 text-[10px] font-bold text-red-300 border border-red-800">
                        🔒 ACCOUNT LOCKED 429
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* CAPTCHA Challenge Modal */}
      <CaptchaModal
        isOpen={isCaptchaOpen}
        onVerify={handleCaptchaVerify}
        onClose={() => setIsCaptchaOpen(false)}
      />
    </div>
  );
};
