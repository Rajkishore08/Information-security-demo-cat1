import React, { useState } from 'react';
import { useSecurity } from '../../context/SecurityContext';
import { MOCK_ENTERPRISE_EMPLOYEES, INITIAL_ENTERPRISE_ANNOUNCEMENTS, MOCK_PRODUCTS } from '../../data/mockData';
import type { EnterpriseAnnouncement, Order, Product } from '../../types/security';
import { 
  Building2, 
  UserCheck, 
  Lock, 
  Megaphone, 
  DollarSign, 
  Server, 
  ShoppingCart, 
  Search, 
  AlertTriangle, 
  Send, 
  Terminal, 
  ShieldAlert, 
  ShieldCheck, 
  SlidersHorizontal,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const FullAppModule: React.FC = () => {
  const { mode, addLog, addOrder } = useSecurity();
  const [activeTab, setActiveTab] = useState<'home' | 'store' | 'notices' | 'payroll' | 'diagnostics'>('home');

  // Interactive Test Workbench Collapsible
  const [isTestBenchOpen, setIsTestBenchOpen] = useState<boolean>(true);

  // Authenticated Session State
  const [currentUser, setCurrentUser] = useState<{ name: string; role: string; empId: number } | null>({
    name: 'John Doe',
    role: 'Staff Member',
    empId: 101
  });

  // 1. Authentication State
  const [authInputUser, setAuthInputUser] = useState<string>('');
  const [authInputPass, setAuthInputPass] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);

  // 2. Notice Board State (XSS)
  const [announcements, setAnnouncements] = useState<EnterpriseAnnouncement[]>(INITIAL_ENTERPRISE_ANNOUNCEMENTS);
  const [noticeTitle, setNoticeTitle] = useState<string>('');
  const [noticeContent, setNoticeContent] = useState<string>('');
  const [activeXssAlert, setActiveXssAlert] = useState<string | null>(null);

  // 3. Payroll State (IDOR)
  const [payrollIdInput, setPayrollIdInput] = useState<number>(101);
  const [displayedPayroll, setDisplayedPayroll] = useState<typeof MOCK_ENTERPRISE_EMPLOYEES[0] | null>(MOCK_ENTERPRISE_EMPLOYEES[0]);
  const [payrollError, setPayrollError] = useState<string | null>(null);

  // 4. Perks Store State (Price Tampering)
  const [selectedProduct, setSelectedProduct] = useState<Product>(MOCK_PRODUCTS[3]); // Alienware Laptop ₹85,000
  const [storeTamperedPrice, setStoreTamperedPrice] = useState<number>(10);
  const [lastStoreOrder, setLastStoreOrder] = useState<Order | null>(null);

  // 5. Ping Diagnostics State (Command Injection)
  const [pingTarget, setPingTarget] = useState<string>('8.8.8.8');
  const [terminalOutput, setTerminalOutput] = useState<string | null>(null);

  // --- ATTACK HANDLERS ---

  // Auth Submit (SQLi & Brute Force)
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (mode === 'vulnerable') {
      const rawSql = `SELECT * FROM users WHERE username = '${authInputUser}' AND password = '${authInputPass}';`;
      addLog('vuln', 'ENTERPRISE AUTH', 'Executing dynamic SQL login query:', rawSql);

      if (authInputUser.includes("' OR '1'='1") || authInputUser.includes("' OR 1=1")) {
        setCurrentUser({ name: 'System CEO (Root Admin)', role: 'Executive Board', empId: 999 });
        addLog('exploit', 'SQLi EXPLOIT', '⚡ Authenticated as System CEO Admin via SQL Injection bypass!');
      } else if (authInputUser === 'employee_john' && authInputPass === 'welcome') {
        setCurrentUser({ name: 'John Doe', role: 'Staff Member', empId: 101 });
        addLog('exploit', 'BRUTE FORCE EXPLOIT', '⚡ Authenticated via dictionary password guessing!');
      } else {
        setAuthError('Invalid username or password credentials.');
      }
    } else {
      addLog('secure', 'ENTERPRISE AUTH', `Executing Prepared Statement lookup for "${authInputUser}"`);
      if (authInputUser === 'employee_john' && authInputPass === 'welcome') {
        setCurrentUser({ name: 'John Doe', role: 'Staff Member', empId: 101 });
        addLog('secure', 'ENTERPRISE AUTH', 'Authentication successful for exact string match.');
      } else {
        setAuthError('Authentication Failed: Prepared Statement rejected non-matching string input.');
      }
    }
  };

  // Notice Board Post (Stored XSS)
  const handlePostNotice = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveXssAlert(null);
    if (!noticeContent.trim()) return;

    const containsScript = noticeContent.includes('<script>') || noticeContent.includes('onerror=');

    if (mode === 'vulnerable') {
      const newAnn: EnterpriseAnnouncement = {
        id: `ann-${Date.now()}`,
        author: currentUser ? currentUser.name : 'Staff Contributor',
        title: noticeTitle || 'Employee Update',
        content: noticeContent,
        createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
        isXssExecuted: containsScript
      };
      setAnnouncements((prev) => [newAnn, ...prev]);

      addLog('vuln', 'ENTERPRISE NOTICE', 'Unsanitized HTML posted to Notice Board:', noticeContent);

      if (containsScript) {
        addLog('exploit', 'STORED XSS EXPLOIT', '⚡ Stored XSS executed on Notice Board!');
        setActiveXssAlert(`⚡ STORED XSS ALERT POPUP!\nExecuted JavaScript in browser session:\n"${noticeContent}"`);
      }
    } else {
      const safeContent = noticeContent.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const newAnn: EnterpriseAnnouncement = {
        id: `ann-${Date.now()}`,
        author: currentUser ? currentUser.name : 'Staff Contributor',
        title: noticeTitle || 'Employee Update',
        content: safeContent,
        createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
        isXssExecuted: false
      };
      setAnnouncements((prev) => [newAnn, ...prev]);
      addLog('secure', 'ENTERPRISE NOTICE', 'Content sanitized via htmlspecialchars() entity encoding.');
    }

    setNoticeTitle('');
    setNoticeContent('');
  };

  // Payroll Lookup (IDOR)
  const handlePayrollLookup = (empIdToQuery: number) => {
    setPayrollIdInput(empIdToQuery);
    setPayrollError(null);

    const emp = MOCK_ENTERPRISE_EMPLOYEES.find((e) => e.empId === empIdToQuery);

    if (mode === 'vulnerable') {
      if (emp) {
        setDisplayedPayroll(emp);
        addLog('vuln', 'PAYROLL IDOR', `Fetched payroll slip for emp_id=${empIdToQuery} without authorization checks.`);
        if (emp.isConfidential) {
          addLog('exploit', 'IDOR EXPLOIT', `⚡ Unlocked confidential CEO salary (₹45,00,000) via ?emp_id=999 tampering!`);
        }
      } else {
        setDisplayedPayroll(null);
      }
    } else {
      if (emp) {
        if (emp.isConfidential && (!currentUser || currentUser.role !== 'Executive Board')) {
          setDisplayedPayroll(null);
          setPayrollError(`HTTP 403 Forbidden: Employee ID ${empIdToQuery} contains confidential executive payroll. Current session role [${currentUser ? currentUser.role : 'Guest'}] is unauthorized.`);
          addLog('secure', 'IDOR DEFENSE', `🔒 Blocked unauthorized access to confidential record ID ${empIdToQuery}`);
        } else {
          setDisplayedPayroll(emp);
          addLog('secure', 'IDOR DEFENSE', `Verified authorization for employee ID ${empIdToQuery}`);
        }
      } else {
        setDisplayedPayroll(null);
      }
    }
  };

  // Perks Store Checkout (Price Tampering)
  const handleStoreCheckout = (e: React.FormEvent) => {
    e.preventDefault();

    const verifiedPrice = selectedProduct.price;
    const submittedUnitPrice = mode === 'vulnerable' ? storeTamperedPrice : verifiedPrice;
    const finalCharged = mode === 'vulnerable' ? submittedUnitPrice : verifiedPrice;

    const order: Order = {
      orderId: `OMNI-${Date.now().toString().slice(-6)}`,
      productName: selectedProduct.name,
      quantity: 1,
      unitPriceSubmitted: submittedUnitPrice,
      unitPriceVerified: verifiedPrice,
      totalPaid: finalCharged,
      status: finalCharged < verifiedPrice ? 'PRICE_TAMPERED' : 'SUCCESS',
      timestamp: new Date().toLocaleTimeString()
    };

    addOrder(order);
    setLastStoreOrder(order);

    if (mode === 'vulnerable') {
      addLog('vuln', 'PRICE TAMPERING', `Processed order with client-submitted price ₹${submittedUnitPrice}`);
      if (submittedUnitPrice < verifiedPrice) {
        addLog('exploit', 'PRICE TAMPERING EXPLOIT', `⚡ PRICE TAMPERED! Bought ₹${verifiedPrice.toLocaleString()} item for ₹${submittedUnitPrice}!`);
      }
    } else {
      addLog('secure', 'PRICE DEFENSE', `Server ignored client price input ₹${submittedUnitPrice} and billed database price ₹${verifiedPrice.toLocaleString()}`);
    }
  };

  // Ping Diagnostics (Command Injection)
  const handlePingSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'vulnerable') {
      const rawCmd = `ping -c 2 ${pingTarget}`;
      addLog('vuln', 'COMMAND INJECTION', 'Executing raw OS command:', rawCmd);

      if (pingTarget.includes(';') || pingTarget.includes('|') || pingTarget.includes('&')) {
        const payloadOutput = `PING 8.8.8.8 (8.8.8.8): 56 data bytes\n64 bytes from 8.8.8.8: icmp_seq=0 ttl=117 time=14.2 ms\n\n--- Executing Secondary Injected Command: cat /etc/passwd ---\nroot:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nwww-data:x:33:33:www-data:/var/www:/bin/bash\nomnicorp_admin:x:1001:1001:OmniCorp System Admin,,,:/home/omnicorp_admin:/bin/bash`;
        setTerminalOutput(payloadOutput);
        addLog('exploit', 'COMMAND INJECTION EXPLOIT', '⚡ OS Command Injection executed /etc/passwd read on server!', payloadOutput);
      } else {
        setTerminalOutput(`PING ${pingTarget} (${pingTarget}): 56 data bytes\n64 bytes from ${pingTarget}: icmp_seq=0 ttl=117 time=12.4 ms\n64 bytes from ${pingTarget}: icmp_seq=1 ttl=117 time=13.1 ms\n--- ${pingTarget} ping statistics ---\n2 packets transmitted, 2 packets received, 0.0% packet loss`);
      }
    } else {
      addLog('secure', 'COMMAND INJECTION DEFENSE', `Validating host input "${pingTarget}" against FILTER_VALIDATE_IP`);

      const isValidIp = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(pingTarget.trim());
      if (!isValidIp) {
        setTerminalOutput(`ERROR: Host parameter "${pingTarget}" rejected. Failed IP format validation (FILTER_VALIDATE_IP). Command execution blocked.`);
        addLog('secure', 'COMMAND INJECTION DEFENSE', `🔒 Command injection attempt blocked cleanly.`);
      } else {
        setTerminalOutput(`PING ${pingTarget} (${pingTarget}): 56 data bytes\n64 bytes from ${pingTarget}: icmp_seq=0 ttl=117 time=12.4 ms\n--- ${pingTarget} ping statistics ---\n1 packets transmitted, 1 packets received, 0.0% packet loss`);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Real-World User App Header Bar */}
      <div className="rounded-2xl border border-gray-800 bg-gray-950 p-4 sm:p-6 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              OmniCorp Enterprise Web Portal
              <span className="rounded bg-indigo-950 px-2 py-0.5 text-xs text-indigo-400 border border-indigo-800">
                Live App Target
              </span>
            </h2>
            <p className="text-xs text-gray-400">Integrated Enterprise System with Live Security Attack Vectors</p>
          </div>
        </div>

        {/* User Session Badge & Mode Display */}
        <div className="flex flex-wrap items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-2 rounded-xl bg-gray-900 px-3 py-1.5 border border-gray-800 text-xs">
              <UserCheck className="h-4 w-4 text-emerald-400" />
              <div>
                <span className="font-bold text-white block leading-tight">{currentUser.name}</span>
                <span className="text-[10px] text-indigo-300">{currentUser.role}</span>
              </div>
            </div>
          ) : (
            <span className="text-xs text-gray-500 font-mono">Session: Unauthenticated Guest</span>
          )}

          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${
            mode === 'vulnerable'
              ? 'bg-red-950/80 text-red-300 border-red-800'
              : 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
          }`}>
            {mode === 'vulnerable' ? <ShieldAlert className="h-4 w-4 text-red-400" /> : <ShieldCheck className="h-4 w-4 text-emerald-400" />}
            <span>{mode === 'vulnerable' ? 'Vulnerable Mode 🔴' : 'Secure Mode 🟢'}</span>
          </div>
        </div>
      </div>

      {/* QUICK ATTACK WORKBENCH & PAYLOAD PRESET TEST BENCH (Mobile Responsive Grid) */}
      <div className="rounded-2xl border border-indigo-900/60 bg-gray-900/90 shadow-2xl overflow-hidden">
        <button
          onClick={() => setIsTestBenchOpen((prev) => !prev)}
          className="w-full flex items-center justify-between bg-indigo-950/80 px-4 sm:px-6 py-3 border-b border-indigo-900/60 text-left transition hover:bg-indigo-900/60"
        >
          <div className="flex items-center gap-2 text-indigo-200 font-bold text-xs sm:text-sm">
            <SlidersHorizontal className="h-4 w-4 text-indigo-400" />
            <span>⚡ Interactive Attack Test Bench & Quick Payload Injection Bar</span>
            <span className="rounded bg-indigo-900 px-2 py-0.5 text-[10px] text-indigo-300 border border-indigo-700">
              Mobile & Presentation Ready
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-indigo-300">
            <span>{isTestBenchOpen ? 'Collapse Workbench' : 'Expand Workbench'}</span>
            {isTestBenchOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </button>

        {isTestBenchOpen && (
          <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-gray-950/80 font-sans">
            {/* Box 1: SQL Injection & Auth Bypass */}
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-3.5 space-y-2">
              <span className="text-xs font-bold text-blue-400 flex items-center gap-1">
                <Lock className="h-3.5 w-3.5" /> 1. SQL Injection / Auth Bypass
              </span>
              <div className="flex gap-1.5 flex-wrap">
                <button
                  onClick={() => {
                    setAuthInputUser("' OR '1'='1");
                    setAuthInputPass("anything");
                    setActiveTab('home');
                  }}
                  className="rounded bg-blue-950 hover:bg-blue-900 px-2 py-1 text-[11px] text-blue-200 border border-blue-800 transition"
                >
                  Apply Preset: ' OR '1'='1
                </button>
                <button
                  onClick={() => {
                    setAuthInputUser("employee_john");
                    setAuthInputPass("welcome");
                    setActiveTab('home');
                  }}
                  className="rounded bg-gray-800 hover:bg-gray-700 px-2 py-1 text-[11px] text-gray-300 border border-gray-700 transition"
                >
                  Brute Force: employee_john / welcome
                </button>
              </div>
            </div>

            {/* Box 2: Stored XSS Notice */}
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-3.5 space-y-2">
              <span className="text-xs font-bold text-purple-400 flex items-center gap-1">
                <Megaphone className="h-3.5 w-3.5" /> 2. Stored XSS Payload
              </span>
              <div className="flex gap-1.5 flex-wrap">
                <button
                  onClick={() => {
                    setNoticeTitle("Security Announcement");
                    setNoticeContent('<script>alert("XSS Payload Triggered! Cookie: " + document.cookie)</script>');
                    setActiveTab('notices');
                  }}
                  className="rounded bg-purple-950 hover:bg-purple-900 px-2 py-1 text-[11px] text-purple-200 border border-purple-800 transition"
                >
                  Apply &lt;script&gt; Alert Payload
                </button>
                <button
                  onClick={() => {
                    setNoticeTitle("Bonus Offer");
                    setNoticeContent('<img src="x" onerror="alert(\'Image OnError XSS Executed!\')" />');
                    setActiveTab('notices');
                  }}
                  className="rounded bg-gray-800 hover:bg-gray-700 px-2 py-1 text-[11px] text-gray-300 border border-gray-700 transition"
                >
                  Apply &lt;img onerror&gt; Payload
                </button>
              </div>
            </div>

            {/* Box 3: IDOR Payroll Slip */}
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-3.5 space-y-2">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5" /> 3. IDOR Confidential Payroll
              </span>
              <div className="flex gap-1.5 flex-wrap">
                <button
                  onClick={() => {
                    handlePayrollLookup(999);
                    setActiveTab('payroll');
                  }}
                  className="rounded bg-amber-950 hover:bg-amber-900 px-2 py-1 text-[11px] text-amber-200 border border-amber-800 transition"
                >
                  Fetch CEO Confidential Record ?emp_id=999
                </button>
                <button
                  onClick={() => {
                    handlePayrollLookup(101);
                    setActiveTab('payroll');
                  }}
                  className="rounded bg-gray-800 hover:bg-gray-700 px-2 py-1 text-[11px] text-gray-300 border border-gray-700 transition"
                >
                  Normal Employee ?emp_id=101
                </button>
              </div>
            </div>

            {/* Box 4: Price Tampering Checkout */}
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-3.5 space-y-2">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <ShoppingCart className="h-3.5 w-3.5" /> 4. Checkout Price Manipulation
              </span>
              <div className="flex gap-1.5 flex-wrap">
                <button
                  onClick={() => {
                    setStoreTamperedPrice(10);
                    setActiveTab('store');
                  }}
                  className="rounded bg-emerald-950 hover:bg-emerald-900 px-2 py-1 text-[11px] text-emerald-200 border border-emerald-800 transition"
                >
                  Tamper Price to ₹10 (Alienware Laptop)
                </button>
                <button
                  onClick={() => {
                    setStoreTamperedPrice(85000);
                    setActiveTab('store');
                  }}
                  className="rounded bg-gray-800 hover:bg-gray-700 px-2 py-1 text-[11px] text-gray-300 border border-gray-700 transition"
                >
                  Reset Price to ₹85,000
                </button>
              </div>
            </div>

            {/* Box 5: OS Command Injection */}
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-3.5 space-y-2 md:col-span-2 lg:col-span-2">
              <span className="text-xs font-bold text-red-400 flex items-center gap-1">
                <Server className="h-3.5 w-3.5" /> 5. OS Command Injection (Remote Code Execution)
              </span>
              <div className="flex gap-1.5 flex-wrap">
                <button
                  onClick={() => {
                    setPingTarget('8.8.8.8; cat /etc/passwd');
                    setActiveTab('diagnostics');
                  }}
                  className="rounded bg-red-950 hover:bg-red-900 px-2 py-1 text-[11px] text-red-200 border border-red-800 transition"
                >
                  Apply Payload: 8.8.8.8; cat /etc/passwd
                </button>
                <button
                  onClick={() => {
                    setPingTarget('8.8.8.8; whoami');
                    setActiveTab('diagnostics');
                  }}
                  className="rounded bg-red-950 hover:bg-red-900 px-2 py-1 text-[11px] text-red-200 border border-red-800 transition"
                >
                  Apply Payload: 8.8.8.8; whoami
                </button>
                <button
                  onClick={() => {
                    setPingTarget('8.8.8.8');
                    setActiveTab('diagnostics');
                  }}
                  className="rounded bg-gray-800 hover:bg-gray-700 px-2 py-1 text-[11px] text-gray-300 border border-gray-700 transition"
                >
                  Normal IP: 8.8.8.8
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* REAL USER APPLICATION NAVIGATION TABS */}
      <div className="flex border-b border-gray-800 bg-gray-900/60 p-2 gap-2 rounded-2xl overflow-x-auto">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl whitespace-nowrap transition ${
            activeTab === 'home'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span>Portal Home & Login</span>
        </button>

        <button
          onClick={() => setActiveTab('store')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl whitespace-nowrap transition ${
            activeTab === 'store'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
          }`}
        >
          <ShoppingCart className="h-4 w-4" />
          <span>Internal Perks Store</span>
        </button>

        <button
          onClick={() => setActiveTab('notices')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl whitespace-nowrap transition ${
            activeTab === 'notices'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
          }`}
        >
          <Megaphone className="h-4 w-4" />
          <span>Company Notice Board</span>
        </button>

        <button
          onClick={() => setActiveTab('payroll')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl whitespace-nowrap transition ${
            activeTab === 'payroll'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
          }`}
        >
          <DollarSign className="h-4 w-4" />
          <span>Payroll & Salary Slips</span>
        </button>

        <button
          onClick={() => setActiveTab('diagnostics')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl whitespace-nowrap transition ${
            activeTab === 'diagnostics'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
          }`}
        >
          <Server className="h-4 w-4" />
          <span>Server Diagnostics Utility</span>
        </button>
      </div>

      {/* PAGE VIEW 1: HOME & LOGIN */}
      {activeTab === 'home' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Login Form Box */}
          <div className="lg:col-span-6 rounded-2xl border border-gray-800 bg-gray-900/60 p-6 shadow-xl space-y-4">
            <div className="border-b border-gray-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Lock className="h-5 w-5 text-blue-400" />
                OmniCorp Staff Sign-In Gateway
              </h3>
              <p className="text-xs text-gray-400">Authenticating employee session context</p>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Username / Payload Input Box:</label>
                <input
                  type="text"
                  value={authInputUser}
                  onChange={(e) => setAuthInputUser(e.target.value)}
                  placeholder="e.g. employee_john or ' OR '1'='1"
                  className="w-full rounded-xl bg-gray-950 border border-gray-800 px-3.5 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Password Input Box:</label>
                <input
                  type="password"
                  value={authInputPass}
                  onChange={(e) => setAuthInputPass(e.target.value)}
                  placeholder="Password"
                  className="w-full rounded-xl bg-gray-950 border border-gray-800 px-3.5 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              {authError && (
                <div className="rounded-xl bg-red-950/60 p-3 text-xs text-red-300 border border-red-800 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 py-3 text-xs font-bold text-white shadow-lg transition"
              >
                Sign In to Portal
              </button>
            </form>
          </div>

          {/* Active Session Overview */}
          <div className="lg:col-span-6 rounded-2xl border border-gray-800 bg-gray-900/60 p-6 shadow-xl flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 font-mono">Current User Session State</h4>
              {currentUser ? (
                <div className="rounded-xl bg-emerald-950/40 p-4 border border-emerald-800 text-emerald-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-white text-sm">
                    <UserCheck className="h-5 w-5 text-emerald-400" />
                    <span>{currentUser.name}</span>
                  </div>
                  <p className="text-xs">Role: <span className="font-bold text-amber-300 font-mono">{currentUser.role}</span></p>
                  <p className="text-xs text-gray-300">Employee Reference: #{currentUser.empId}</p>
                </div>
              ) : (
                <div className="flex h-32 flex-col items-center justify-center text-gray-500 text-xs">
                  <Lock className="h-6 w-6 mb-2 opacity-30" />
                  <p>Not signed in. Use the form on the left to sign in.</p>
                </div>
              )}
            </div>

            <div className="mt-4 rounded-xl bg-gray-950 p-3 text-[11px] text-gray-400 border border-gray-800 flex items-center justify-between">
              <span>Backend Auth Engine: PHP 8.2 + MySQL</span>
              <span className="text-blue-400 font-mono">Session ID: sess_omni_9912</span>
            </div>
          </div>
        </div>
      )}

      {/* PAGE VIEW 2: INTERNAL PERKS STORE (Price Tampering) */}
      {activeTab === 'store' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 rounded-2xl border border-gray-800 bg-gray-900/60 p-6 shadow-xl space-y-4">
            <div className="border-b border-gray-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-emerald-400" />
                OmniStore Equipment Procurement
              </h3>
              <p className="text-xs text-gray-400">Order company hardware & asset upgrades</p>
            </div>

            {/* Hardware Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-300">Select Equipment Asset:</label>
              <select
                value={selectedProduct.id}
                onChange={(e) => {
                  const found = MOCK_PRODUCTS.find((p) => p.id === parseInt(e.target.value, 10));
                  if (found) setSelectedProduct(found);
                }}
                className="w-full rounded-xl bg-gray-950 border border-gray-800 px-3 py-2 text-xs text-white focus:outline-none"
              >
                {MOCK_PRODUCTS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Catalog Price: ₹{p.price.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-xl border border-gray-800 bg-gray-950 p-4 flex gap-4">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="h-20 w-20 object-cover rounded-lg shrink-0"
              />
              <div>
                <h4 className="text-sm font-bold text-white">{selectedProduct.name}</h4>
                <p className="text-xs text-gray-400 mt-1">{selectedProduct.description}</p>
                <p className="text-xs font-bold text-emerald-400 mt-2">
                  Database Catalog Price: ₹{selectedProduct.price.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Price Tamper Form */}
            <form onSubmit={handleStoreCheckout} className="space-y-4">
              {mode === 'vulnerable' ? (
                <div className="rounded-xl bg-black p-3.5 border border-red-900/60 font-mono text-xs space-y-2">
                  <span className="text-red-400 font-bold text-[10px] uppercase block">
                    ⚠️ Client-Side HTTP POST Form Body Input Box (Exposed Price Parameter):
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-300">"submitted_price": ₹</span>
                    <input
                      type="number"
                      value={storeTamperedPrice}
                      onChange={(e) => setStoreTamperedPrice(parseFloat(e.target.value) || 0)}
                      className="w-32 rounded bg-gray-900 px-2 py-1 text-red-300 font-bold border border-red-700 focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="rounded-xl bg-emerald-950/30 p-3.5 border border-emerald-900/60 text-xs text-emerald-200">
                  🟢 Secure Mode Active: Server verifies price against authoritative database record (₹{selectedProduct.price.toLocaleString()}).
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 py-3 text-xs font-bold text-white shadow-lg transition"
              >
                Submit Asset Order Request
              </button>
            </form>
          </div>

          <div className="lg:col-span-6 rounded-2xl border border-gray-800 bg-gray-900/60 p-6 shadow-xl">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 font-mono">Last Order Checkout Receipt</h4>
            {lastStoreOrder ? (
              <div className={`rounded-xl border p-4 font-mono text-xs space-y-2 ${
                lastStoreOrder.status === 'PRICE_TAMPERED'
                  ? 'border-red-800 bg-red-950/40 text-red-200'
                  : 'border-emerald-800 bg-emerald-950/40 text-emerald-200'
              }`}>
                <div className="flex justify-between font-bold text-white">
                  <span>Order ID: {lastStoreOrder.orderId}</span>
                  <span>{lastStoreOrder.timestamp}</span>
                </div>
                <p>Asset: {lastStoreOrder.productName}</p>
                <p>Submitted Price (Browser Input): ₹{lastStoreOrder.unitPriceSubmitted}</p>
                <p>Authoritative Price (DB Record): ₹{lastStoreOrder.unitPriceVerified}</p>
                <div className="border-t border-gray-800 pt-2 font-bold text-sm flex justify-between">
                  <span>Total Amount Billed:</span>
                  <span>₹{lastStoreOrder.totalPaid.toLocaleString()}</span>
                </div>
              </div>
            ) : (
              <div className="flex h-32 flex-col items-center justify-center text-gray-500 text-xs">
                <ShoppingCart className="h-6 w-6 mb-2 opacity-30" />
                <p>No asset orders submitted yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PAGE VIEW 3: COMPANY NOTICE BOARD (Stored XSS) */}
      {activeTab === 'notices' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 rounded-2xl border border-gray-800 bg-gray-900/60 p-6 shadow-xl space-y-4">
            <div className="border-b border-gray-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-purple-400" />
                Post Company Notice Box
              </h3>
              <p className="text-xs text-gray-400">Broadcast update to employee notice feed</p>
            </div>

            <form onSubmit={handlePostNotice} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Notice Title Input Box:</label>
                <input
                  type="text"
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  placeholder="e.g. Health & Safety Protocol"
                  className="w-full rounded-xl bg-gray-950 border border-gray-800 px-3.5 py-2.5 text-xs text-white focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Notice Content Input Box (XSS Target):</label>
                <textarea
                  value={noticeContent}
                  onChange={(e) => setNoticeContent(e.target.value)}
                  rows={4}
                  placeholder="Enter notice announcement or XSS script payload..."
                  className="w-full rounded-xl bg-gray-950 border border-gray-800 px-3.5 py-2.5 text-xs text-white font-mono focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-purple-600 hover:bg-purple-500 py-3 text-xs font-bold text-white shadow-lg transition flex items-center justify-center gap-2"
              >
                <Send className="h-4 w-4" />
                <span>Post Notice to Board</span>
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
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider font-mono">
                Live Employee Notice Feed ({announcements.length} notices)
              </h4>

              <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                {announcements.map((ann) => (
                  <div key={ann.id} className="rounded-xl border border-gray-800 bg-gray-950 p-4 space-y-1">
                    <div className="flex justify-between text-xs text-gray-400">
                      <span className="font-bold text-white">{ann.title}</span>
                      <span>By {ann.author} • {ann.createdAt}</span>
                    </div>
                    {mode === 'vulnerable' ? (
                      <div className="text-xs text-purple-200 pt-2 font-mono break-words" dangerouslySetInnerHTML={{ __html: ann.content }} />
                    ) : (
                      <div className="text-xs text-emerald-200 pt-2 font-mono break-words">{ann.content}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PAGE VIEW 4: PAYROLL & SALARY SLIPS (IDOR) */}
      {activeTab === 'payroll' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6 shadow-xl space-y-4">
            <div className="border-b border-gray-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-amber-400" />
                Employee Payroll & Salary Slip API (`/payroll.php?emp_id=...`)
              </h3>
              <p className="text-xs text-gray-400">Query confidential employee records by ID</p>
            </div>

            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <input
                  type="number"
                  value={payrollIdInput}
                  onChange={(e) => setPayrollIdInput(parseInt(e.target.value, 10) || 101)}
                  placeholder="Enter Employee ID Box (e.g. 101, 102, 999)"
                  className="w-full rounded-xl bg-gray-950 border border-gray-800 pl-10 pr-4 py-2.5 text-xs text-white font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>
              <button
                onClick={() => handlePayrollLookup(payrollIdInput)}
                className="rounded-xl bg-amber-600 hover:bg-amber-500 px-6 py-2.5 text-xs font-bold text-white transition"
              >
                Fetch Slip
              </button>
            </div>
          </div>

          {payrollError ? (
            <div className="rounded-2xl border border-red-800 bg-red-950/40 p-6 text-center text-red-300 font-mono text-xs">
              {payrollError}
            </div>
          ) : displayedPayroll ? (
            <div className={`rounded-2xl border p-6 shadow-xl space-y-3 ${
              displayedPayroll.isConfidential ? 'border-red-700 bg-red-950/40' : 'border-gray-800 bg-gray-900/60'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">{displayedPayroll.name} (Emp ID #{displayedPayroll.empId})</span>
                <span className="rounded bg-indigo-950 px-2 py-0.5 text-[10px] text-indigo-300 font-bold">{displayedPayroll.department}</span>
              </div>
              <div className="border-t border-gray-800 pt-3 text-xs space-y-1">
                <p>Annual Compensation: <span className="font-bold text-emerald-400 font-mono">₹{displayedPayroll.salary.toLocaleString()}</span></p>
                <p>Performance Appraisal: <span className="text-gray-300">{displayedPayroll.performanceReview}</span></p>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* PAGE VIEW 5: SERVER DIAGNOSTICS (Command Injection) */}
      {activeTab === 'diagnostics' && (
        <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6 shadow-xl space-y-4">
          <div className="border-b border-gray-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Server className="h-5 w-5 text-red-400" />
                Network Ping & Server Diagnostic Utility
              </h3>
              <p className="text-xs text-gray-400">Executes system ping shell commands via backend `shell_exec()`</p>
            </div>
            <span className="rounded bg-red-950 px-2 py-0.5 text-[10px] text-red-400 border border-red-800 font-bold">
              Command Injection Target
            </span>
          </div>

          <form onSubmit={handlePingSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Host IP / Shell Payload Input Box:</label>
              <input
                type="text"
                value={pingTarget}
                onChange={(e) => setPingTarget(e.target.value)}
                placeholder="e.g. 8.8.8.8; cat /etc/passwd"
                className="w-full rounded-xl bg-gray-950 border border-gray-800 px-4 py-2.5 text-xs text-white font-mono focus:border-red-500 focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-red-600 hover:bg-red-500 py-3 text-xs font-bold text-white shadow-lg transition flex items-center justify-center gap-2"
            >
              <Terminal className="h-4 w-4" />
              <span>Run Server Diagnostic Command</span>
            </button>
          </form>

          {terminalOutput && (
            <div className="rounded-xl bg-black p-4 border border-gray-800 font-mono text-xs text-emerald-300 overflow-x-auto">
              <span className="text-gray-500 text-[10px] uppercase font-bold block mb-1">Server Shell Terminal Output:</span>
              <pre>{terminalOutput}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
