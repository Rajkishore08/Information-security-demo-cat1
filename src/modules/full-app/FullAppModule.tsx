import React, { useState } from 'react';
import { useSecurity } from '../../context/SecurityContext';
import { INITIAL_FIRM_SECRETS, INITIAL_FIRM_NOTES } from '../../data/mockData';
import type { FirmSecret, FirmNote, Order } from '../../types/security';
import { 
  FolderLock, 
  Key, 
  Lock, 
  Megaphone, 
  Server, 
  ShoppingCart, 
  Search, 
  Send, 
  Terminal, 
  SlidersHorizontal,
  Maximize2, 
  X,
  Copy,
  Check,
  UserCheck
} from 'lucide-react';

export const FullAppModule: React.FC = () => {
  const { mode, addLog, addOrder } = useSecurity();
  const [activeTab, setActiveTab] = useState<'secrets' | 'auth' | 'notices' | 'licenses' | 'diagnostics'>('secrets');
  const [isStandaloneOpen, setIsStandaloneOpen] = useState<boolean>(false);
  const [isTestBenchOpen, setIsTestBenchOpen] = useState<boolean>(true);

  // Authenticated User Session
  const [sessionUser, setSessionUser] = useState<{ name: string; role: string; empId: number } | null>({
    name: 'Dev Lead (Rohan)',
    role: 'Developer',
    empId: 104
  });

  // 1. Auth State (SQLi & Brute Force)
  const [loginUser, setLoginUser] = useState<string>("' OR '1'='1");
  const [loginPass, setLoginPass] = useState<string>('anything');
  const [loginError, setLoginError] = useState<string | null>(null);

  // 2. Secret Lookup State (IDOR & SQLi)
  const [secretQueryId, setSecretQueryId] = useState<number>(999);
  const [displayedSecret, setDisplayedSecret] = useState<FirmSecret | null>(INITIAL_FIRM_SECRETS[3]); // Restricted CTO Master Key
  const [secretError, setSecretError] = useState<string | null>(null);

  // 3. Notice Board State (Stored XSS)
  const [notes, setNotes] = useState<FirmNote[]>(INITIAL_FIRM_NOTES);
  const [noteTopic, setNoteTopic] = useState<string>('API Key Rotation Warning');
  const [noteContent, setNoteContent] = useState<string>('<script>alert("Vault Cookie Stolen: " + document.cookie)</script>');
  const [activeXssAlert, setActiveXssAlert] = useState<string | null>(null);

  // 4. Software License Store (Price Tampering)
  const [selectedLicensePrice, setSelectedLicensePrice] = useState<number>(10);
  const [lastLicenseOrder, setLastLicenseOrder] = useState<Order | null>(null);

  // 5. Diagnostics & Log Viewer (LFI & Command Injection)
  const [lfiPath, setLfiPath] = useState<string>('../../../../etc/passwd');
  const [lfiOutput, setLfiOutput] = useState<string | null>(null);
  const [pingHost, setPingHost] = useState<string>('8.8.8.8; cat /etc/passwd');
  const [pingOutput, setPingOutput] = useState<string | null>(null);

  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copyText = (txt: string) => {
    navigator.clipboard.writeText(txt);
    setCopiedText(txt);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // --- HANDLERS ---

  // Auth Handler
  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (mode === 'vulnerable') {
      const sql = `SELECT * FROM firm_users WHERE username = '${loginUser}' AND password = '${loginPass}';`;
      addLog('vuln', 'FIRM VAULT AUTH', 'Executing dynamic SQL login query:', sql);

      if (loginUser.includes("' OR '1'='1") || loginUser.includes("' OR 1=1")) {
        setSessionUser({ name: 'CTO Root Admin', role: 'CTO Admin', empId: 999 });
        addLog('exploit', 'SQLi EXPLOIT', '⚡ Authenticated as CTO Root Admin via SQL Injection bypass!');
      } else if (loginUser === 'admin123' || loginUser === 'welcome') {
        setSessionUser({ name: 'DevOps Lead', role: 'DevOps', empId: 102 });
        addLog('exploit', 'BRUTE FORCE EXPLOIT', `⚡ Authenticated via password guessing attack!`);
      } else {
        setLoginError('Invalid login credentials.');
      }
    } else {
      addLog('secure', 'FIRM VAULT AUTH', `Executing Prepared Statement lookup for "${loginUser}"`);
      if (loginUser === 'admin' && loginPass === 'Secr3tP@ss') {
        setSessionUser({ name: 'CTO Root Admin', role: 'CTO Admin', empId: 999 });
        addLog('secure', 'FIRM VAULT AUTH', 'Authentication successful for exact string match.');
      } else {
        setLoginError('Authentication Failed: Prepared Statement rejected non-matching string input.');
      }
    }
  };

  // Secret Lookup Handler (IDOR)
  const handleSecretLookup = (idToFetch: number) => {
    setSecretQueryId(idToFetch);
    setSecretError(null);

    const secret = INITIAL_FIRM_SECRETS.find((s) => s.id === idToFetch);

    if (mode === 'vulnerable') {
      if (secret) {
        setDisplayedSecret(secret);
        addLog('vuln', 'VAULT SECRET IDOR', `Fetched secret ID ${idToFetch} without authorization verification.`);
        if (secret.isConfidential) {
          addLog('exploit', 'IDOR EXPLOIT', '⚡ UNLOCKED RESTRICTED CTO MASTER KEY via ?secret_id=999 tampering!');
        }
      } else {
        setDisplayedSecret(null);
      }
    } else {
      if (secret) {
        if (secret.isConfidential && (!sessionUser || sessionUser.role !== 'CTO Admin')) {
          setDisplayedSecret(null);
          setSecretError(`HTTP 403 Forbidden: Secret ID ${idToFetch} is RESTRICTED to CTO Admin. Current role [${sessionUser ? sessionUser.role : 'Guest'}] is unauthorized.`);
          addLog('secure', 'IDOR DEFENSE', `🔒 Access denied to restricted secret ID ${idToFetch}`);
        } else {
          setDisplayedSecret(secret);
          addLog('secure', 'IDOR DEFENSE', `Verified authorization for secret ID ${idToFetch}`);
        }
      } else {
        setDisplayedSecret(null);
      }
    }
  };

  // Notice Board Handler (Stored XSS)
  const handlePostNote = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveXssAlert(null);

    const containsScript = noteContent.includes('<script>') || noteContent.includes('onerror=');

    if (mode === 'vulnerable') {
      const newNote: FirmNote = {
        id: `note-${Date.now()}`,
        author: sessionUser ? sessionUser.name : 'Anonymous Engineer',
        topic: noteTopic || 'General Announcement',
        content: noteContent,
        createdAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
      };
      setNotes((prev) => [newNote, ...prev]);
      addLog('vuln', 'FIRM NOTE XSS', 'Unsanitized HTML posted to Developer Board:', noteContent);

      if (containsScript) {
        addLog('exploit', 'STORED XSS EXPLOIT', '⚡ Stored XSS script executed on Developer Board!');
        setActiveXssAlert(`⚡ STORED XSS POPUP TRIGGERED!\nExecuted JavaScript in session:\n"${noteContent}"`);
      }
    } else {
      const safe = noteContent.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const newNote: FirmNote = {
        id: `note-${Date.now()}`,
        author: sessionUser ? sessionUser.name : 'Anonymous Engineer',
        topic: noteTopic || 'General Announcement',
        content: safe,
        createdAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
      };
      setNotes((prev) => [newNote, ...prev]);
      addLog('secure', 'FIRM NOTE XSS DEFENSE', 'Content sanitized via htmlspecialchars().');
    }

    setNoteTopic('');
    setNoteContent('');
  };

  // License Order Handler (Price Tampering)
  const handleLicenseCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    const verifiedPrice = 120000; // SAST Suite Original Price
    const charged = mode === 'vulnerable' ? selectedLicensePrice : verifiedPrice;

    const order: Order = {
      orderId: `FIRM-LIC-${Date.now().toString().slice(-6)}`,
      productName: 'ApexSoft Security Audit & SAST Suite',
      quantity: 1,
      unitPriceSubmitted: selectedLicensePrice,
      unitPriceVerified: verifiedPrice,
      totalPaid: charged,
      status: charged < verifiedPrice ? 'PRICE_TAMPERED' : 'SUCCESS',
      timestamp: new Date().toLocaleTimeString()
    };

    addOrder(order);
    setLastLicenseOrder(order);

    if (mode === 'vulnerable') {
      addLog('vuln', 'LICENSE PRICE TAMPERING', `Processed license purchase at client-submitted price ₹${selectedLicensePrice}`);
      if (charged < verifiedPrice) {
        addLog('exploit', 'PRICE TAMPERING EXPLOIT', `⚡ Purchased ₹1,20,000 SAST Suite for ₹${charged}!`);
      }
    } else {
      addLog('secure', 'LICENSE PRICE DEFENSE', `Server overridden client price input ₹${selectedLicensePrice} with DB price ₹${verifiedPrice.toLocaleString()}`);
    }
  };

  // LFI Handler
  const handleLfiRead = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'vulnerable') {
      const rawCode = `include("/var/www/firm_vault/" . "${lfiPath}");`;
      addLog('vuln', 'FIRM LFI', 'Unsafe include() execution:', rawCode);

      if (lfiPath.includes('..')) {
        const simulatedPasswd = `root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nwww-data:x:33:33:www-data:/var/www:/bin/bash\napexsoft_cto:x:1001:1001:ApexSoft CTO Admin,,,:/home/apexsoft_cto:/bin/bash`;
        setLfiOutput(simulatedPasswd);
        addLog('exploit', 'LFI EXPLOIT', '⚡ Path traversal read system /etc/passwd file!', simulatedPasswd);
      } else {
        setLfiOutput(`[File Content of ${lfiPath}]: Firm log file content.`);
      }
    } else {
      if (lfiPath.includes('..')) {
        setLfiOutput(`ERROR: Path traversal sequence detected in filename "${lfiPath}". Access denied by basename() filter.`);
        addLog('secure', 'LFI DEFENSE', `🔒 LFI attack blocked by basename() filter.`);
      } else {
        setLfiOutput(`[File Content of ${lfiPath}]: Safe file load.`);
      }
    }
  };

  // Command Injection Handler
  const handlePingExec = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'vulnerable') {
      const cmd = `ping -c 2 ${pingHost}`;
      addLog('vuln', 'COMMAND INJECTION', 'Executing raw shell command:', cmd);

      if (pingHost.includes(';') || pingHost.includes('|') || pingHost.includes('&')) {
        const out = `PING 8.8.8.8 (8.8.8.8): 56 data bytes\n64 bytes from 8.8.8.8: icmp_seq=0 ttl=117 time=14.2 ms\n\n--- Executing Secondary Injected Command: cat /etc/passwd ---\nroot:x:0:0:root:/root:/bin/bash\nwww-data:x:33:33:www-data:/var/www:/bin/bash\napexsoft_admin:x:1001:1001:ApexSoft System Admin,,,:/home/apexsoft_admin:/bin/bash`;
        setPingOutput(out);
        addLog('exploit', 'COMMAND INJECTION EXPLOIT', '⚡ OS Command Injection read /etc/passwd system files!', out);
      } else {
        setPingOutput(`PING ${pingHost} (${pingHost}): 56 data bytes\n64 bytes from ${pingHost}: icmp_seq=0 ttl=117 time=12.4 ms\n--- ${pingHost} ping statistics ---\n1 packets transmitted, 1 packets received, 0.0% packet loss`);
      }
    } else {
      const isValidIp = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(pingHost.trim());
      if (!isValidIp) {
        setPingOutput(`ERROR: Host parameter "${pingHost}" rejected. Failed IP format validation (FILTER_VALIDATE_IP). Command execution blocked.`);
        addLog('secure', 'COMMAND INJECTION DEFENSE', `🔒 Command injection attempt blocked by IP validation filter.`);
      } else {
        setPingOutput(`PING ${pingHost} (${pingHost}): 56 data bytes\n64 bytes from ${pingHost}: icmp_seq=0 ttl=117 time=12.4 ms\n--- ${pingHost} ping statistics ---\n1 packets transmitted, 1 packets received, 0.0% packet loss`);
      }
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Firm Vault App Header Bar */}
      <div className="rounded-2xl border border-gray-800 bg-gray-950 p-4 sm:p-6 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-purple-700 text-white shadow-lg">
            <FolderLock className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              ApexSoft Developer Credential & Secrets Vault
              <span className="rounded bg-red-950 px-2 py-0.5 text-xs text-red-400 border border-red-800 font-mono font-bold">
                REAL-TIME TARGET
              </span>
            </h2>
            <p className="text-xs text-gray-400">Software Firm Enterprise Vault with All Exploit Vectors Exposed</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {sessionUser ? (
            <div className="flex items-center gap-2 rounded-xl bg-gray-900 px-3 py-1.5 border border-gray-800 text-xs">
              <UserCheck className="h-4 w-4 text-emerald-400" />
              <div>
                <span className="font-bold text-white block leading-tight">{sessionUser.name}</span>
                <span className="text-[10px] text-purple-300 font-mono">{sessionUser.role}</span>
              </div>
            </div>
          ) : (
            <span className="text-xs text-gray-500 font-mono">Session: Unauthenticated Guest</span>
          )}

          <button
            onClick={() => setIsStandaloneOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-500 hover:to-purple-500 px-4 py-2 text-xs font-bold text-white shadow-lg transition"
          >
            <Maximize2 className="h-4 w-4" />
            <span>Standalone Window ↗️</span>
          </button>
        </div>
      </div>

      {/* QUICK ATTACK WORKBENCH & PAYLOAD PRESET TEST BENCH */}
      <div className="rounded-2xl border border-red-900/60 bg-gray-900/90 shadow-2xl overflow-hidden">
        <button
          onClick={() => setIsTestBenchOpen((prev) => !prev)}
          className="w-full flex items-center justify-between bg-red-950/80 px-4 sm:px-6 py-3 border-b border-red-900/60 text-left transition hover:bg-red-900/60"
        >
          <div className="flex items-center gap-2 text-red-200 font-bold text-xs sm:text-sm">
            <SlidersHorizontal className="h-4 w-4 text-red-400" />
            <span>⚡ Interactive Attack Test Bench & Quick Payload Injection Bar</span>
            <span className="rounded bg-red-900 px-2 py-0.5 text-[10px] text-red-300 border border-red-700 font-mono font-bold">
              Software Firm Vault Target
            </span>
          </div>
          <span className="text-xs text-red-300">{isTestBenchOpen ? 'Collapse' : 'Expand'}</span>
        </button>

        {isTestBenchOpen && (
          <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-gray-950/80">
            {/* Box 1: SQLi Login */}
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-3.5 space-y-2">
              <span className="text-xs font-bold text-blue-400 flex items-center gap-1">
                <Lock className="h-3.5 w-3.5" /> 1. SQL Injection / Auth Bypass
              </span>
              <div className="flex gap-1.5 flex-wrap">
                <button
                  onClick={() => {
                    setLoginUser("' OR '1'='1");
                    setLoginPass("anything");
                    setActiveTab('auth');
                  }}
                  className="rounded bg-blue-950 hover:bg-blue-900 px-2 py-1 text-[11px] text-blue-200 border border-blue-800 transition"
                >
                  Preset: ' OR '1'='1
                </button>
                <button
                  onClick={() => {
                    setLoginUser("admin123");
                    setLoginPass("welcome");
                    setActiveTab('auth');
                  }}
                  className="rounded bg-gray-800 hover:bg-gray-700 px-2 py-1 text-[11px] text-gray-300 border border-gray-700 transition"
                >
                  Brute Force: admin123
                </button>
              </div>
            </div>

            {/* Box 2: Stored XSS Note */}
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-3.5 space-y-2">
              <span className="text-xs font-bold text-purple-400 flex items-center gap-1">
                <Megaphone className="h-3.5 w-3.5" /> 2. Stored XSS Developer Note
              </span>
              <div className="flex gap-1.5 flex-wrap">
                <button
                  onClick={() => {
                    setNoteTopic("Security Audit");
                    setNoteContent('<script>alert("Vault Session Stolen: " + document.cookie)</script>');
                    setActiveTab('notices');
                  }}
                  className="rounded bg-purple-950 hover:bg-purple-900 px-2 py-1 text-[11px] text-purple-200 border border-purple-800 transition"
                >
                  Preset: &lt;script&gt; Cookie Theft
                </button>
              </div>
            </div>

            {/* Box 3: IDOR Secret Key */}
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-3.5 space-y-2">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                <Key className="h-3.5 w-3.5" /> 3. IDOR Master Secret Key
              </span>
              <div className="flex gap-1.5 flex-wrap">
                <button
                  onClick={() => {
                    handleSecretLookup(999);
                    setActiveTab('secrets');
                  }}
                  className="rounded bg-amber-950 hover:bg-amber-900 px-2 py-1 text-[11px] text-amber-200 border border-amber-800 transition"
                >
                  Fetch Restricted CTO Key ?secret_id=999
                </button>
              </div>
            </div>

            {/* Box 4: Price Tampering License */}
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-3.5 space-y-2">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <ShoppingCart className="h-3.5 w-3.5" /> 4. License Price Manipulation
              </span>
              <div className="flex gap-1.5 flex-wrap">
                <button
                  onClick={() => {
                    setSelectedLicensePrice(10);
                    setActiveTab('licenses');
                  }}
                  className="rounded bg-emerald-950 hover:bg-emerald-900 px-2 py-1 text-[11px] text-emerald-200 border border-emerald-800 transition"
                >
                  Tamper SAST License to ₹10
                </button>
              </div>
            </div>

            {/* Box 5: LFI & Command Injection */}
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-3.5 space-y-2 md:col-span-2">
              <span className="text-xs font-bold text-red-400 flex items-center gap-1">
                <Server className="h-3.5 w-3.5" /> 5. LFI File Read & Command Injection
              </span>
              <div className="flex gap-1.5 flex-wrap">
                <button
                  onClick={() => {
                    setLfiPath("../../../../etc/passwd");
                    setActiveTab('diagnostics');
                  }}
                  className="rounded bg-red-950 hover:bg-red-900 px-2 py-1 text-[11px] text-red-200 border border-red-800 transition"
                >
                  LFI: ../../../../etc/passwd
                </button>
                <button
                  onClick={() => {
                    setPingHost("8.8.8.8; cat /etc/passwd");
                    setActiveTab('diagnostics');
                  }}
                  className="rounded bg-red-950 hover:bg-red-900 px-2 py-1 text-[11px] text-red-200 border border-red-800 transition"
                >
                  RCE: 8.8.8.8; cat /etc/passwd
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* REAL FIRM VAULT APPLICATION NAVIGATION TABS */}
      <div className="flex border-b border-gray-800 bg-gray-900/60 p-2 gap-2 rounded-2xl overflow-x-auto">
        <button
          onClick={() => setActiveTab('secrets')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl whitespace-nowrap transition ${
            activeTab === 'secrets'
              ? 'bg-red-600 text-white shadow-md'
              : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
          }`}
        >
          <Key className="h-4 w-4" />
          <span>Firm Secrets & API Keys</span>
        </button>

        <button
          onClick={() => setActiveTab('auth')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl whitespace-nowrap transition ${
            activeTab === 'auth'
              ? 'bg-red-600 text-white shadow-md'
              : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
          }`}
        >
          <Lock className="h-4 w-4" />
          <span>Engineer Vault Auth</span>
        </button>

        <button
          onClick={() => setActiveTab('notices')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl whitespace-nowrap transition ${
            activeTab === 'notices'
              ? 'bg-red-600 text-white shadow-md'
              : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
          }`}
        >
          <Megaphone className="h-4 w-4" />
          <span>Developer Board</span>
        </button>

        <button
          onClick={() => setActiveTab('licenses')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl whitespace-nowrap transition ${
            activeTab === 'licenses'
              ? 'bg-red-600 text-white shadow-md'
              : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
          }`}
        >
          <ShoppingCart className="h-4 w-4" />
          <span>Software Licenses</span>
        </button>

        <button
          onClick={() => setActiveTab('diagnostics')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl whitespace-nowrap transition ${
            activeTab === 'diagnostics'
              ? 'bg-red-600 text-white shadow-md'
              : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
          }`}
        >
          <Server className="h-4 w-4" />
          <span>LFI & Server Diagnostics</span>
        </button>
      </div>

      {/* VIEW 1: SECRETS & API KEYS (IDOR) */}
      {activeTab === 'secrets' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6 shadow-xl space-y-4">
            <div className="border-b border-gray-800 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Key className="h-5 w-5 text-amber-400" />
                  Software Firm Secrets Lookup API (`/secrets.php?secret_id=...`)
                </h3>
                <p className="text-xs text-gray-400">Fetch internal API keys, database credentials, and cloud AWS tokens</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <input
                  type="number"
                  value={secretQueryId}
                  onChange={(e) => setSecretQueryId(parseInt(e.target.value, 10) || 101)}
                  placeholder="Enter Secret ID Box (e.g. 101, 102, 999)"
                  className="w-full rounded-xl bg-gray-950 border border-gray-800 pl-10 pr-4 py-2.5 text-xs text-white font-mono"
                />
              </div>
              <button
                onClick={() => handleSecretLookup(secretQueryId)}
                className="rounded-xl bg-amber-600 hover:bg-amber-500 px-6 py-2.5 text-xs font-bold text-white transition"
              >
                Fetch Secret Key
              </button>
            </div>
          </div>

          {secretError ? (
            <div className="rounded-2xl border border-red-800 bg-red-950/40 p-6 text-center text-red-300 font-mono text-xs">
              {secretError}
            </div>
          ) : displayedSecret ? (
            <div className={`rounded-2xl border p-6 shadow-xl space-y-3 ${
              displayedSecret.isConfidential ? 'border-red-700 bg-red-950/40' : 'border-gray-800 bg-gray-900/60'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">{displayedSecret.title} (Secret ID #{displayedSecret.id})</span>
                <span className="rounded bg-purple-950 px-2 py-0.5 text-[10px] text-purple-300 font-bold">{displayedSecret.category}</span>
              </div>
              <div className="border-t border-gray-800 pt-3 text-xs space-y-2">
                <div className="rounded bg-black p-3 font-mono text-xs text-emerald-300 border border-gray-800 flex items-center justify-between">
                  <span>Secret Value: <strong className="text-amber-300">{displayedSecret.secretKey}</strong></span>
                  <button onClick={() => copyText(displayedSecret.secretKey)} className="text-[11px] text-gray-400 hover:text-white flex items-center gap-1">
                    {copiedText === displayedSecret.secretKey ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedText === displayedSecret.secretKey ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <div className="flex justify-between text-gray-400 text-[11px]">
                  <span>Environment: {displayedSecret.environment}</span>
                  <span>Required Access Role: {displayedSecret.accessRole}</span>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* VIEW 2: AUTH PORTAL */}
      {activeTab === 'auth' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 rounded-2xl border border-gray-800 bg-gray-900/60 p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Lock className="h-5 w-5 text-blue-400" />
              Software Engineer Vault Authentication
            </h3>

            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Username / Payload Input Box:</label>
                <input
                  type="text"
                  value={loginUser}
                  onChange={(e) => setLoginUser(e.target.value)}
                  placeholder="e.g. admin123 or ' OR '1'='1"
                  className="w-full rounded-xl bg-gray-950 border border-gray-800 px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Password Input Box:</label>
                <input
                  type="password"
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  placeholder="Password"
                  className="w-full rounded-xl bg-gray-950 border border-gray-800 px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none"
                />
              </div>

              {loginError && (
                <div className="rounded-xl bg-red-950/60 p-3 text-xs text-red-300 border border-red-800">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 py-3 text-xs font-bold text-white shadow-lg transition"
              >
                Authenticate Vault Access
              </button>
            </form>
          </div>

          <div className="lg:col-span-6 rounded-2xl border border-gray-800 bg-gray-900/60 p-6 shadow-xl flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 font-mono">Current Session State</h4>
              {sessionUser ? (
                <div className="rounded-xl bg-emerald-950/40 p-4 border border-emerald-800 text-emerald-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-white text-sm">
                    <UserCheck className="h-5 w-5 text-emerald-400" />
                    <span>{sessionUser.name}</span>
                  </div>
                  <p className="text-xs">Role: <span className="font-bold text-amber-300 font-mono">{sessionUser.role}</span></p>
                  <p className="text-xs text-gray-300">Employee ID: #{sessionUser.empId}</p>
                </div>
              ) : (
                <div className="flex h-32 flex-col items-center justify-center text-gray-500 text-xs">
                  <Lock className="h-6 w-6 mb-2 opacity-30" />
                  <p>Unauthenticated Guest Session.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: DEVELOPER BOARD (XSS) */}
      {activeTab === 'notices' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 rounded-2xl border border-gray-800 bg-gray-900/60 p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-purple-400" />
              Post Developer Board Note
            </h3>

            <form onSubmit={handlePostNote} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Topic:</label>
                <input
                  type="text"
                  value={noteTopic}
                  onChange={(e) => setNoteTopic(e.target.value)}
                  className="w-full rounded-xl bg-gray-950 border border-gray-800 px-3.5 py-2.5 text-xs text-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Content Input Box (XSS Target):</label>
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  rows={4}
                  className="w-full rounded-xl bg-gray-950 border border-gray-800 px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-purple-600 hover:bg-purple-500 py-3 text-xs font-bold text-white shadow-lg transition flex items-center justify-center gap-2"
              >
                <Send className="h-4 w-4" />
                <span>Post Developer Note</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 space-y-4">
            {activeXssAlert && (
              <div className="rounded-xl border border-red-700 bg-red-950 p-4 text-xs font-mono text-red-200 animate-pulse-glow">
                {activeXssAlert}
              </div>
            )}

            <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6 shadow-xl space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider font-mono">Developer Audit & Announcement Feed</h4>
              <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                {notes.map((n) => (
                  <div key={n.id} className="rounded-xl border border-gray-800 bg-gray-950 p-4 space-y-1">
                    <div className="flex justify-between text-xs text-gray-400">
                      <span className="font-bold text-white">{n.topic}</span>
                      <span>By {n.author} • {n.createdAt}</span>
                    </div>
                    {mode === 'vulnerable' ? (
                      <div className="text-xs text-purple-200 pt-2 font-mono break-words" dangerouslySetInnerHTML={{ __html: n.content }} />
                    ) : (
                      <div className="text-xs text-emerald-200 pt-2 font-mono break-words">{n.content}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: SOFTWARE LICENSES (Price Tampering) */}
      {activeTab === 'licenses' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 rounded-2xl border border-gray-800 bg-gray-900/60 p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-emerald-400" />
              Software License Procurement
            </h3>

            <div className="rounded-xl border border-gray-800 bg-gray-950 p-4 space-y-2">
              <h4 className="text-sm font-bold text-white">ApexSoft Security Audit & SAST Suite</h4>
              <p className="text-xs text-gray-400">Original Tier Catalog Price: ₹1,20,000</p>
            </div>

            <form onSubmit={handleLicenseCheckout} className="space-y-4">
              {mode === 'vulnerable' ? (
                <div className="rounded-xl bg-black p-3.5 border border-red-900/60 font-mono text-xs space-y-2">
                  <span className="text-red-400 font-bold block">Tampered License Price Parameter Input Box: ₹</span>
                  <input
                    type="number"
                    value={selectedLicensePrice}
                    onChange={(e) => setSelectedLicensePrice(parseFloat(e.target.value) || 0)}
                    className="w-36 rounded bg-gray-900 px-2 py-1 text-red-300 font-bold border border-red-700"
                  />
                </div>
              ) : (
                <div className="rounded-xl bg-emerald-950/30 p-3.5 border border-emerald-900/60 text-xs text-emerald-200">
                  🟢 Secure Mode Active: License price verified on backend database (₹1,20,000).
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 py-3 text-xs font-bold text-white shadow-lg transition"
              >
                Procure License Seat
              </button>
            </form>
          </div>

          <div className="lg:col-span-6 rounded-2xl border border-gray-800 bg-gray-900/60 p-6 shadow-xl">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 font-mono">License Receipt</h4>
            {lastLicenseOrder ? (
              <div className={`rounded-xl border p-4 font-mono text-xs space-y-2 ${
                lastLicenseOrder.status === 'PRICE_TAMPERED'
                  ? 'border-red-800 bg-red-950/40 text-red-200'
                  : 'border-emerald-800 bg-emerald-950/40 text-emerald-200'
              }`}>
                <p className="font-bold text-white">Order ID: {lastLicenseOrder.orderId}</p>
                <p>Software: {lastLicenseOrder.productName}</p>
                <p>Submitted Price: ₹{lastLicenseOrder.unitPriceSubmitted}</p>
                <p>Authoritative Price: ₹{lastLicenseOrder.unitPriceVerified.toLocaleString()}</p>
                <div className="border-t border-gray-800 pt-2 font-bold flex justify-between">
                  <span>Total Amount Billed:</span>
                  <span>₹{lastLicenseOrder.totalPaid.toLocaleString()}</span>
                </div>
              </div>
            ) : (
              <div className="flex h-32 flex-col items-center justify-center text-gray-500 text-xs">
                <ShoppingCart className="h-6 w-6 mb-2 opacity-30" />
                <p>No license procurement transactions submitted yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 5: LFI & COMMAND INJECTION */}
      {activeTab === 'diagnostics' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LFI File Read */}
          <div className="lg:col-span-6 rounded-2xl border border-gray-800 bg-gray-900/60 p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono">
              <Server className="h-5 w-5 text-red-400" />
              Firm Vault File Reader API (?file=... LFI Target)
            </h3>
            <form onSubmit={handleLfiRead} className="flex gap-2">
              <input
                type="text"
                value={lfiPath}
                onChange={(e) => setLfiPath(e.target.value)}
                placeholder="e.g. ../../../../etc/passwd"
                className="flex-1 rounded-xl bg-gray-950 border border-gray-800 px-3 py-2 text-xs text-white font-mono"
              />
              <button type="submit" className="rounded-xl bg-red-600 hover:bg-red-500 px-4 py-2 text-xs font-bold text-white">
                Read File
              </button>
            </form>

            {lfiOutput && (
              <div className="rounded-xl bg-black p-3 text-xs font-mono text-emerald-300 border border-gray-800 overflow-x-auto">
                <pre>{lfiOutput}</pre>
              </div>
            )}
          </div>

          {/* OS Command Injection */}
          <div className="lg:col-span-6 rounded-2xl border border-gray-800 bg-gray-900/60 p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono">
              <Terminal className="h-5 w-5 text-red-400" />
              Server Ping Diagnostic Tool (RCE Target)
            </h3>
            <form onSubmit={handlePingExec} className="flex gap-2">
              <input
                type="text"
                value={pingHost}
                onChange={(e) => setPingHost(e.target.value)}
                placeholder="e.g. 8.8.8.8; cat /etc/passwd"
                className="flex-1 rounded-xl bg-gray-950 border border-gray-800 px-3 py-2 text-xs text-white font-mono"
              />
              <button type="submit" className="rounded-xl bg-red-600 hover:bg-red-500 px-4 py-2 text-xs font-bold text-white">
                Run Ping
              </button>
            </form>

            {pingOutput && (
              <div className="rounded-xl bg-black p-3 text-xs font-mono text-emerald-300 border border-gray-800 overflow-x-auto">
                <pre>{pingOutput}</pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STANDALONE TARGET WINDOW MODAL */}
      {isStandaloneOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-lg">
          <div className="flex h-[92vh] w-full max-w-6xl flex-col rounded-2xl border border-red-500 bg-gray-950 shadow-2xl overflow-hidden font-sans">
            <div className="flex items-center justify-between bg-gradient-to-r from-red-600 to-purple-700 px-6 py-3 text-white">
              <div className="flex items-center gap-3">
                <FolderLock className="h-5 w-5" />
                <div>
                  <h2 className="text-base font-bold flex items-center gap-2">
                    ApexSoft Developer Credential Vault
                    <span className="rounded bg-black/40 px-2 py-0.5 text-xs text-white border border-white/20">
                      Standalone Target Sandbox
                    </span>
                  </h2>
                  <p className="text-xs text-white/80">Real-time Firm Vault Target Application</p>
                </div>
              </div>

              <button
                onClick={() => setIsStandaloneOpen(false)}
                className="rounded-lg p-1.5 text-white/80 hover:bg-black/40 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center gap-2 bg-gray-900 px-4 py-2 border-b border-gray-800 text-xs font-mono text-gray-300">
              <span className="text-gray-500">https://vault.apexsoft-firm.org/app</span>
              <span className="ml-auto rounded bg-emerald-950 px-2 py-0.5 text-[10px] text-emerald-400 font-bold border border-emerald-800">
                ACTIVE LAB TARGET
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-[#0b0f19] space-y-6">
              <h3 className="text-sm font-bold text-white">Software Firm Secrets Vault Sandbox View</h3>
              <form onSubmit={(e) => { e.preventDefault(); handleSecretLookup(secretQueryId); }} className="flex gap-2">
                <input
                  type="number"
                  value={secretQueryId}
                  onChange={(e) => setSecretQueryId(parseInt(e.target.value, 10) || 101)}
                  className="flex-1 rounded-xl bg-gray-950 border border-gray-800 px-3 py-2 text-xs text-white font-mono"
                />
                <button type="submit" className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white">
                  Fetch Secret
                </button>
              </form>
              {displayedSecret && (
                <div className="rounded-xl bg-black p-4 text-xs font-mono text-amber-300 border border-gray-800">
                  <p>Secret ID #{displayedSecret.id}: {displayedSecret.title}</p>
                  <p>Value: {displayedSecret.secretKey}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
