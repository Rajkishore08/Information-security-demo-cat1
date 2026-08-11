import React, { useState } from 'react';
import { useSecurity } from '../../context/SecurityContext';
import { PROJECT_USE_CASES } from '../../data/mockData';
import type { ProjectUseCase } from '../../types/security';
import { 
  Plane, 
  Cloud, 
  FolderLock, 
  Search, 
  Sparkles, 
  Globe, 
  Clock, 
  CheckCircle2, 
  Maximize2, 
  X,
  Copy,
  Check,
  DollarSign
} from 'lucide-react';

export const FullAppModule: React.FC = () => {
  const { mode, addLog } = useSecurity();
  const [selectedUseCaseId, setSelectedUseCaseId] = useState<ProjectUseCase['id']>('airline');
  const [isStandaloneOpen, setIsStandaloneOpen] = useState<boolean>(false);

  const activeUseCase = PROJECT_USE_CASES.find((u) => u.id === selectedUseCaseId) || PROJECT_USE_CASES[0];

  // 1. Airline State
  const [airlineFlightSearch, setAirlineFlightSearch] = useState<string>("DELHI' OR '1'='1");
  const [airlineFlightResults, setAirlineFlightResults] = useState<string[]>([]);
  const [airlineTicketPrice, setAirlineTicketPrice] = useState<number>(100);
  const [airlineBookingResult, setAirlineBookingResult] = useState<string | null>(null);
  const [airlinePassengerReview, setAirlinePassengerReview] = useState<string>('<script>alert("Passenger XSS Executed! Cookie stolen.")</script>');
  const [airlineReviews, setAirlineReviews] = useState<string[]>([
    'In-flight wifi was extremely fast!',
    'Great legroom in economy section.'
  ]);
  const [activeXssAlert, setActiveXssAlert] = useState<string | null>(null);

  // 2. SecureBank State
  const [bankAccountQuery, setBankAccountQuery] = useState<number>(999);
  const [bankAccountResult, setBankAccountResult] = useState<string | null>(null);
  const [timingLog, setTimingLog] = useState<{ user: string; ms: number } | null>(null);

  // 3. SaaS State
  const [saasPlanSearch, setSaasPlanSearch] = useState<string>("ENTERPRISE' OR '1'='1");
  const [saasTamperedPlanPrice, setSaasTamperedPlanPrice] = useState<number>(0);

  // 4. Cloud Vault State (LFI & IDOR)
  const [lfiFilePath, setLfiFilePath] = useState<string>('../../../../etc/passwd');
  const [lfiOutput, setLfiOutput] = useState<string | null>(null);
  const [vaultAccessLevel, setVaultAccessLevel] = useState<number>(9);

  // Copy helper
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(text);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  // --- HANDLERS FOR AIRLINE PORTAL ---
  const handleAirlineFlightSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'vulnerable') {
      const sql = `SELECT * FROM flights WHERE origin = '${airlineFlightSearch}';`;
      addLog('vuln', 'AIRLINE SQLi', `Unsafe flight query:`, sql);
      if (airlineFlightSearch.includes("' OR '1'='1") || airlineFlightSearch.includes("' OR 1=1")) {
        setAirlineFlightResults([
          'FL-101: Delhi → Mumbai (First Class - ₹18,000)',
          'FL-204: Bangalore → London (Business Class - ₹85,000)',
          'FL-999: RESTRICTED VIP CHARTER FLIGHT (Executive Jet - ₹4,50,000)'
        ]);
        addLog('exploit', 'AIRLINE SQLi EXPLOIT', '⚡ Exfiltrated restricted VIP charter flights via SQLi bypass!');
      } else {
        setAirlineFlightResults(['FL-101: Delhi → Mumbai (₹18,000)']);
      }
    } else {
      addLog('secure', 'AIRLINE SQLi DEFENSE', `Executing Prepared Statement lookup for origin "${airlineFlightSearch}"`);
      setAirlineFlightResults(['No flights found matching exact literal string origin.']);
    }
  };

  const handleAirlineBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const verifiedPrice = 18000; // Original First Class Ticket Price
    const charged = mode === 'vulnerable' ? airlineTicketPrice : verifiedPrice;

    if (mode === 'vulnerable') {
      setAirlineBookingResult(`CONFIRMED: First Class Flight Ticket booked for ₹${charged} (Submitted price ₹${airlineTicketPrice})`);
      addLog('vuln', 'AIRLINE PRICE TAMPERING', `Processed ticket booking at client-submitted price ₹${airlineTicketPrice}`);
      if (charged < verifiedPrice) {
        addLog('exploit', 'PRICE TAMPERING EXPLOIT', `⚡ Purchased ₹18,000 First Class Ticket for ₹${charged}!`);
      }
    } else {
      setAirlineBookingResult(`CONFIRMED: First Class Flight Ticket booked for ₹${verifiedPrice} (Server DB Verified Price)`);
      addLog('secure', 'AIRLINE PRICE DEFENSE', `Server overridden client price input ₹${airlineTicketPrice} with DB price ₹${verifiedPrice}`);
    }
  };

  const handleAirlineReviewPost = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveXssAlert(null);
    const containsScript = airlinePassengerReview.includes('<script>') || airlinePassengerReview.includes('onerror=');

    if (mode === 'vulnerable') {
      setAirlineReviews((prev) => [airlinePassengerReview, ...prev]);
      addLog('vuln', 'AIRLINE XSS', 'Unsanitized passenger review posted:', airlinePassengerReview);
      if (containsScript) {
        addLog('exploit', 'STORED XSS EXPLOIT', '⚡ Passenger review XSS script executed in browser!');
        setActiveXssAlert(`⚡ AIRLINE PASSENGER REVIEW XSS POPUP!\nExecuted JavaScript:\n"${airlinePassengerReview}"`);
      }
    } else {
      const safe = airlinePassengerReview.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      setAirlineReviews((prev) => [safe, ...prev]);
      addLog('secure', 'AIRLINE XSS DEFENSE', 'Review sanitized via htmlspecialchars().');
    }
  };

  // --- HANDLERS FOR SECUREBANK PORTAL ---
  const handleBankIdorLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'vulnerable') {
      if (bankAccountQuery === 999) {
        setBankAccountResult('ACC-999: VIP Executive Reserve Vault (Balance: ₹4,50,00,000.00 | SSN: ***-**-9912 | Owner: Chairman)');
        addLog('exploit', 'BANK IDOR EXPLOIT', '⚡ Accessed confidential VIP reserve vault via ?account_id=999 IDOR!');
      } else {
        setBankAccountResult(`ACC-${bankAccountQuery}: Standard Savings Account (Balance: ₹45,200.00)`);
      }
    } else {
      if (bankAccountQuery === 999) {
        setBankAccountResult('HTTP 403 Forbidden: Account ACC-999 is restricted to Executive Board.');
        addLog('secure', 'BANK IDOR DEFENSE', '🔒 Access denied to restricted account ACC-999');
      } else {
        setBankAccountResult(`ACC-${bankAccountQuery}: Standard Savings Account (Balance: ₹45,200.00)`);
      }
    }
  };

  const handleTimingAttackTest = (userToTest: string) => {
    const isExistingUser = userToTest === 'admin';
    const responseMs = isExistingUser ? 320 : 15; // Valid user takes longer due to password hash verification delay!
    setTimingLog({ user: userToTest, ms: responseMs });

    if (mode === 'vulnerable') {
      addLog(
        'vuln',
        'TIMING ATTACK',
        `Response time difference detected: User '${userToTest}' responded in ${responseMs}ms`,
        `// Vulnerable Code Delay Analysis:\nValid User 'admin': 320ms (password_verify hash check executed)\nInvalid User 'foo': 15ms (returned immediately)`,
        { username: userToTest, responseDelayMs: responseMs }
      );
    } else {
      addLog(
        'secure',
        'TIMING ATTACK DEFENSE',
        `Constant time authentication response enforced (300ms uniform delay for all users)`,
        `// Secure Constant-Time Defense:\nusleep(300000); // Equalized response timing`
      );
    }
  };

  // --- HANDLERS FOR CLOUD VAULT (LFI) ---
  const handleLfiExecute = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'vulnerable') {
      const rawCmd = `include("/var/www/uploads/" . "${lfiFilePath}");`;
      addLog('vuln', 'LOCAL FILE INCLUSION', 'Unsafe include() execution:', rawCmd);

      if (lfiFilePath.includes('..')) {
        const simulatedPasswd = `root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nwww-data:x:33:33:www-data:/var/www:/bin/bash\ncloudvault_admin:x:1001:1001:Cloud Vault Root Administrator,,,:/home/cloudvault_admin:/bin/bash`;
        setLfiOutput(simulatedPasswd);
        addLog('exploit', 'LFI EXPLOIT', '⚡ Local File Inclusion read system /etc/passwd file via path traversal!', simulatedPasswd);
      } else {
        setLfiOutput(`[File Content of ${lfiFilePath}]: Standard cloud document header.`);
      }
    } else {
      const isPathTraversal = lfiFilePath.includes('..') || lfiFilePath.startsWith('/');
      if (isPathTraversal) {
        setLfiOutput(`ERROR: Path traversal sequence detected in filename "${lfiFilePath}". Access denied by basename() whitelist policy.`);
        addLog('secure', 'LFI DEFENSE', `🔒 LFI attack blocked by basename() sanitization filter.`);
      } else {
        setLfiOutput(`[File Content of ${lfiFilePath}]: Safe file load.`);
      }
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner & Project Selector */}
      <div className="rounded-2xl border border-gray-800 bg-gray-950 p-4 sm:p-6 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-800 pb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              Integrated Project Use-Case Target Applications
              <span className="rounded bg-indigo-950 px-2 py-0.5 text-xs text-indigo-400 border border-indigo-800">
                Viva Assessment Ready
              </span>
            </h2>
            <p className="text-xs text-gray-400">Select a real-time use-case target application mapped to your project title & student credentials</p>
          </div>

          <button
            onClick={() => setIsStandaloneOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 px-4 py-2 text-xs font-bold text-white shadow-lg transition"
          >
            <Maximize2 className="h-4 w-4" />
            <span>Launch Standalone Target Window ↗️</span>
          </button>
        </div>

        {/* Project Selector Tabs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PROJECT_USE_CASES.map((uc) => {
            const isSelected = selectedUseCaseId === uc.id;
            return (
              <button
                key={uc.id}
                onClick={() => setSelectedUseCaseId(uc.id)}
                className={`p-3.5 rounded-xl border text-left transition ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-950/60 shadow-lg shadow-indigo-950/50 ring-1 ring-indigo-500/50'
                    : 'border-gray-800 bg-gray-900/60 hover:bg-gray-800/60 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-white truncate">{uc.projectTitle}</span>
                  {isSelected && <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" />}
                </div>
                <p className="text-[11px] text-indigo-300 font-bold">{uc.studentName} ({uc.rollNo})</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {uc.conceptsUsed.slice(0, 3).map((c, i) => (
                    <span key={i} className="rounded bg-black/60 px-1.5 py-0.5 text-[9px] text-gray-300 border border-gray-800">
                      {c}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* STUDENT METADATA & CONCEPTS BANNER */}
      <div className={`rounded-2xl bg-gradient-to-r ${activeUseCase.themeColor} p-4 sm:p-6 text-white shadow-2xl space-y-2`}>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/20 pb-3">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-mono bg-black/40 px-2 py-0.5 rounded text-white font-bold">
              Project Title Use-Case:
            </span>
            <h3 className="text-lg sm:text-xl font-black mt-1">{activeUseCase.projectTitle}</h3>
          </div>
          <div className="text-right text-xs font-mono">
            <span className="block font-bold">Student: {activeUseCase.studentName}</span>
            <span className="text-white/80">Roll No: {activeUseCase.rollNo}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
          <span className="font-bold text-white">Security Concepts Implemented:</span>
          {activeUseCase.conceptsUsed.map((c, idx) => (
            <span key={idx} className="rounded bg-black/40 px-2.5 py-1 text-xs font-bold text-white border border-white/20">
              ⚡ {c}
            </span>
          ))}
        </div>
      </div>

      {/* USE CASE 1: SMART AIRLINE BOOKING PORTAL */}
      {selectedUseCaseId === 'airline' && (
        <div className="space-y-6">
          {/* Phishing & IDN Homograph Warning Banner */}
          <div className="rounded-2xl border border-blue-900/60 bg-blue-950/40 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                <Globe className="h-4 w-4" /> IDN Homograph Cyrillic Domain Spoofing Simulator:
              </span>
              <button
                onClick={() => copyToClipboard('http://skуwings.com/login')}
                className="text-[11px] text-cyan-300 hover:text-white flex items-center gap-1"
              >
                {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedLink ? 'Copied!' : 'Copy Spoofed Link'}</span>
              </button>
            </div>
            <p className="text-xs text-gray-300">
              Legitimate Domain: <code className="font-mono text-emerald-400 font-bold bg-black px-1.5 py-0.5 rounded">skywings.com</code> | 
              Spoofed Cyrillic 'у' Domain: <code className="font-mono text-red-400 font-bold bg-black px-1.5 py-0.5 rounded">skуwings.com</code> (Punycode: <code className="font-mono text-amber-300">xn--skywings-j1a.com</code>)
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Flight Search (SQLi) */}
            <div className="lg:col-span-6 rounded-2xl border border-gray-800 bg-gray-900/60 p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono">
                <Plane className="h-5 w-5 text-cyan-400" />
                Flight Search API (SQL Injection Target)
              </h3>
              <form onSubmit={handleAirlineFlightSearch} className="flex gap-2">
                <input
                  type="text"
                  value={airlineFlightSearch}
                  onChange={(e) => setAirlineFlightSearch(e.target.value)}
                  placeholder="e.g. DELHI' OR '1'='1"
                  className="flex-1 rounded-xl bg-gray-950 border border-gray-800 px-3 py-2 text-xs text-white font-mono"
                />
                <button type="submit" className="rounded-xl bg-cyan-600 hover:bg-cyan-500 px-4 py-2 text-xs font-bold text-white">
                  Search Flights
                </button>
              </form>

              <div className="rounded-xl bg-black p-3 font-mono text-xs space-y-1">
                <span className="text-gray-500 text-[10px] font-bold uppercase">Flight Search Results:</span>
                {airlineFlightResults.map((r, i) => (
                  <p key={i} className="text-cyan-300">{r}</p>
                ))}
              </div>
            </div>

            {/* Ticket Price Tampering */}
            <div className="lg:col-span-6 rounded-2xl border border-gray-800 bg-gray-900/60 p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono">
                <DollarSign className="h-5 w-5 text-emerald-400" />
                First Class Ticket Checkout (Price Tampering)
              </h3>
              <form onSubmit={handleAirlineBooking} className="space-y-3">
                <div className="rounded-xl bg-black p-3 font-mono text-xs text-gray-300">
                  <p>First Class Ticket Original Price: <span className="font-bold text-emerald-400">₹18,000</span></p>
                  {mode === 'vulnerable' ? (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-red-400 font-bold">Tampered Ticket Price Input Box: ₹</span>
                      <input
                        type="number"
                        value={airlineTicketPrice}
                        onChange={(e) => setAirlineTicketPrice(parseFloat(e.target.value) || 0)}
                        className="w-28 rounded bg-gray-900 px-2 py-0.5 text-red-300 font-bold border border-red-700"
                      />
                    </div>
                  ) : (
                    <p className="mt-2 text-emerald-300">🟢 Secure Mode: Price validated on backend DB (₹18,000).</p>
                  )}
                </div>
                <button type="submit" className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2.5 text-xs font-bold text-white">
                  Book Flight Ticket
                </button>
              </form>

              {airlineBookingResult && (
                <div className="rounded-xl bg-gray-950 p-3 text-xs font-mono text-emerald-300 border border-gray-800">
                  {airlineBookingResult}
                </div>
              )}
            </div>
          </div>

          {/* Passenger Reviews (XSS) */}
          <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono">
              <Sparkles className="h-5 w-5 text-purple-400" />
              Passenger Feedback & Reviews (Stored XSS Target)
            </h3>
            <form onSubmit={handleAirlineReviewPost} className="flex gap-2">
              <input
                type="text"
                value={airlinePassengerReview}
                onChange={(e) => setAirlinePassengerReview(e.target.value)}
                placeholder="Enter review or XSS payload..."
                className="flex-1 rounded-xl bg-gray-950 border border-gray-800 px-3 py-2 text-xs text-white font-mono"
              />
              <button type="submit" className="rounded-xl bg-purple-600 hover:bg-purple-500 px-4 py-2 text-xs font-bold text-white">
                Post Review
              </button>
            </form>

            {activeXssAlert && (
              <div className="rounded-xl border border-red-700 bg-red-950 p-3 text-xs font-mono text-red-200">
                {activeXssAlert}
              </div>
            )}

            <div className="space-y-2">
              {airlineReviews.map((r, idx) => (
                <div key={idx} className="rounded-lg bg-black p-2.5 text-xs font-mono text-purple-200 border border-gray-800">
                  {mode === 'vulnerable' ? (
                    <div dangerouslySetInnerHTML={{ __html: r }} />
                  ) : (
                    <div>{r}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* USE CASE 2: SECUREBANK PORTAL */}
      {selectedUseCaseId === 'securebank' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Account Slip IDOR */}
            <div className="lg:col-span-6 rounded-2xl border border-gray-800 bg-gray-900/60 p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono">
                <Search className="h-5 w-5 text-emerald-400" />
                Account Details Slip API (?account_id=... IDOR Target)
              </h3>
              <form onSubmit={handleBankIdorLookup} className="flex gap-2">
                <input
                  type="number"
                  value={bankAccountQuery}
                  onChange={(e) => setBankAccountQuery(parseInt(e.target.value, 10) || 999)}
                  placeholder="Enter Account ID (e.g. 999)"
                  className="flex-1 rounded-xl bg-gray-950 border border-gray-800 px-3 py-2 text-xs text-white font-mono"
                />
                <button type="submit" className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white">
                  Fetch Account Slip
                </button>
              </form>

              {bankAccountResult && (
                <div className="rounded-xl bg-black p-3 text-xs font-mono text-emerald-300 border border-gray-800">
                  {bankAccountResult}
                </div>
              )}
            </div>

            {/* Response Timing Attack Visualizer */}
            <div className="lg:col-span-6 rounded-2xl border border-gray-800 bg-gray-900/60 p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono">
                <Clock className="h-5 w-5 text-amber-400" />
                Response Timing Attack Analyzer (User Enumeration)
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handleTimingAttackTest('admin')}
                  className="rounded-xl bg-amber-950 border border-amber-800 px-3 py-2 text-xs font-bold text-amber-300"
                >
                  Test Existing User ('admin')
                </button>
                <button
                  onClick={() => handleTimingAttackTest('unknown_user')}
                  className="rounded-xl bg-gray-800 border border-gray-700 px-3 py-2 text-xs font-bold text-gray-300"
                >
                  Test Non-Existing User
                </button>
              </div>

              {timingLog && (
                <div className="rounded-xl bg-black p-3 font-mono text-xs text-amber-300 border border-gray-800">
                  User Tested: "{timingLog.user}" | Measured Response Delay: <span className="font-bold text-white">{timingLog.ms}ms</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* USE CASE 3: SAAS SUBSCRIPTION PORTAL */}
      {selectedUseCaseId === 'saas' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 rounded-2xl border border-gray-800 bg-gray-900/60 p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono">
                <Cloud className="h-5 w-5 text-purple-400" />
                Plan Upgrade Checkout (Price Tampering: Enterprise Plan ₹0)
              </h3>
              <div className="rounded-xl bg-black p-3 text-xs font-mono text-gray-300">
                <p>Enterprise Tier Plan Original Cost: <span className="font-bold text-purple-400">₹49,999/yr</span></p>
                {mode === 'vulnerable' ? (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-red-400 font-bold">Tampered Plan Price Input: ₹</span>
                    <input
                      type="number"
                      value={saasTamperedPlanPrice}
                      onChange={(e) => setSaasTamperedPlanPrice(parseFloat(e.target.value) || 0)}
                      className="w-28 rounded bg-gray-900 px-2 py-0.5 text-red-300 font-bold border border-red-700"
                    />
                  </div>
                ) : (
                  <p className="mt-2 text-emerald-300">🟢 Secure Mode: Plan price verified on backend database (₹49,999).</p>
                )}
              </div>
            </div>

            <div className="lg:col-span-6 rounded-2xl border border-gray-800 bg-gray-900/60 p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono">
                <Search className="h-5 w-5 text-indigo-400" />
                Subscription Directory Search (SQLi)
              </h3>
              <input
                type="text"
                value={saasPlanSearch}
                onChange={(e) => setSaasPlanSearch(e.target.value)}
                className="w-full rounded-xl bg-gray-950 border border-gray-800 px-3 py-2 text-xs text-white font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* USE CASE 4: CLOUD VAULT (LFI) */}
      {selectedUseCaseId === 'cloudvault' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono">
              <FolderLock className="h-5 w-5 text-red-400" />
              Cloud File Viewer API (?file=... Local File Inclusion / LFI Target)
            </h3>
            <form onSubmit={handleLfiExecute} className="flex gap-2">
              <input
                type="text"
                value={lfiFilePath}
                onChange={(e) => setLfiFilePath(e.target.value)}
                placeholder="e.g. ../../../../etc/passwd"
                className="flex-1 rounded-xl bg-gray-950 border border-gray-800 px-3 py-2 text-xs text-white font-mono"
              />
              <button type="submit" className="rounded-xl bg-red-600 hover:bg-red-500 px-4 py-2 text-xs font-bold text-white">
                Read File Content
              </button>
            </form>

            <div className="flex items-center gap-2 font-mono text-xs text-gray-300">
              <span>Tamper User Vault Access Level Parameter:</span>
              <input
                type="number"
                value={vaultAccessLevel}
                onChange={(e) => setVaultAccessLevel(parseInt(e.target.value, 10) || 1)}
                className="w-20 rounded bg-gray-950 px-2 py-1 text-red-300 font-bold border border-gray-800"
              />
              <span className="text-[10px] text-gray-500">(Access Level 9 = Root Admin Privilege)</span>
            </div>

            {lfiOutput && (
              <div className="rounded-xl bg-black p-4 text-xs font-mono text-emerald-300 border border-gray-800 overflow-x-auto">
                <pre>{lfiOutput}</pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STANDALONE TARGET APPLICATION WINDOW MODAL */}
      {isStandaloneOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-lg">
          <div className="flex h-[92vh] w-full max-w-6xl flex-col rounded-2xl border border-indigo-500 bg-gray-950 shadow-2xl overflow-hidden font-sans">
            {/* Window Title Bar */}
            <div className={`flex items-center justify-between bg-gradient-to-r ${activeUseCase.themeColor} px-6 py-3 text-white`}>
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5" />
                <div>
                  <h2 className="text-base font-bold flex items-center gap-2">
                    {activeUseCase.projectTitle}
                    <span className="rounded bg-black/40 px-2 py-0.5 text-xs text-white border border-white/20">
                      Standalone Target Sandbox
                    </span>
                  </h2>
                  <p className="text-xs text-white/80">Student: {activeUseCase.studentName} ({activeUseCase.rollNo})</p>
                </div>
              </div>

              <button
                onClick={() => setIsStandaloneOpen(false)}
                className="rounded-lg p-1.5 text-white/80 hover:bg-black/40 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Standalone Window Address Bar */}
            <div className="flex items-center gap-2 bg-gray-900 px-4 py-2 border-b border-gray-800 text-xs font-mono text-gray-300">
              <span className="text-gray-500">https://{selectedUseCaseId}.target-lab.org/app</span>
              <span className="ml-auto rounded bg-emerald-950 px-2 py-0.5 text-[10px] text-emerald-400 font-bold border border-emerald-800">
                ACTIVE LAB SANDBOX
              </span>
            </div>

            {/* Dedicated Sandbox View Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-[#0b0f19] space-y-6">
              <div className="rounded-xl bg-gray-900/80 p-4 border border-gray-800 text-xs space-y-2">
                <span className="font-bold text-indigo-400 uppercase tracking-wider block">Use-Case Description & Evaluation Target:</span>
                <p className="text-gray-300 leading-relaxed">{activeUseCase.description}</p>
              </div>

              {/* Render current active target UI */}
              {selectedUseCaseId === 'airline' && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-white">Smart Airline Booking Portal Live Target</h4>
                  <form onSubmit={handleAirlineFlightSearch} className="flex gap-2">
                    <input
                      type="text"
                      value={airlineFlightSearch}
                      onChange={(e) => setAirlineFlightSearch(e.target.value)}
                      className="flex-1 rounded-xl bg-gray-950 border border-gray-800 px-3 py-2 text-xs text-white font-mono"
                    />
                    <button type="submit" className="rounded-xl bg-cyan-600 px-4 py-2 text-xs font-bold text-white">
                      Search Flights
                    </button>
                  </form>
                  <div className="rounded-xl bg-black p-3 text-xs font-mono text-cyan-300">
                    {airlineFlightResults.map((r, i) => <p key={i}>{r}</p>)}
                  </div>
                </div>
              )}

              {selectedUseCaseId === 'securebank' && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-white">SecureBank Core Banking Live Target</h4>
                  <form onSubmit={handleBankIdorLookup} className="flex gap-2">
                    <input
                      type="number"
                      value={bankAccountQuery}
                      onChange={(e) => setBankAccountQuery(parseInt(e.target.value, 10) || 999)}
                      className="flex-1 rounded-xl bg-gray-950 border border-gray-800 px-3 py-2 text-xs text-white font-mono"
                    />
                    <button type="submit" className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white">
                      Fetch Slip
                    </button>
                  </form>
                  {bankAccountResult && <div className="rounded-xl bg-black p-3 text-xs font-mono text-emerald-300">{bankAccountResult}</div>}
                </div>
              )}

              {selectedUseCaseId === 'saas' && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-white">SaaS Subscription Portal Live Target</h4>
                  <input
                    type="text"
                    value={saasPlanSearch}
                    onChange={(e) => setSaasPlanSearch(e.target.value)}
                    className="w-full rounded-xl bg-gray-950 border border-gray-800 px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              )}

              {selectedUseCaseId === 'cloudvault' && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-white">Cloud Vault LFI Live Target</h4>
                  <form onSubmit={handleLfiExecute} className="flex gap-2">
                    <input
                      type="text"
                      value={lfiFilePath}
                      onChange={(e) => setLfiFilePath(e.target.value)}
                      className="flex-1 rounded-xl bg-gray-950 border border-gray-800 px-3 py-2 text-xs text-white font-mono"
                    />
                    <button type="submit" className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white">
                      Read LFI File
                    </button>
                  </form>
                  {lfiOutput && <pre className="rounded-xl bg-black p-4 text-xs font-mono text-emerald-300">{lfiOutput}</pre>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
