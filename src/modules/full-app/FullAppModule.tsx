import React, { useState } from 'react';
import { useSecurity } from '../../context/SecurityContext';
import { CYBERMART_PRODUCTS, INITIAL_SECURITY_EVENTS } from '../../data/mockData';
import type { Product, Order, SecurityEvent } from '../../types/security';
import { 
  ShoppingCart, 
  Lock, 
  Mail, 
  MessageSquare, 
  Activity, 
  Server, 
  SlidersHorizontal, 
  Maximize2, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  DollarSign, 
  Award,
  Globe,
  Terminal
} from 'lucide-react';

interface CyberMartCoreProps {
  isStandalone?: boolean;
  onOpenStandalone?: () => void;
  onCloseStandalone?: () => void;
}

export const CyberMartCore: React.FC<CyberMartCoreProps> = ({ 
  isStandalone = false, 
  onOpenStandalone, 
  onCloseStandalone 
}) => {
  const { mode, setMode, addLog, addOrder } = useSecurity();
  const [activeTab, setActiveTab] = useState<'shop' | 'login' | 'inbox' | 'reviews' | 'admin' | 'diagnostics'>('shop');
  const [isTestBenchOpen, setIsTestBenchOpen] = useState<boolean>(true);

  // Security Controls State (Independent Toggles)
  const [controls, setControls] = useState<Record<string, boolean>>({
    sqli: mode === 'secure',
    brute_force: mode === 'secure',
    parameter_tampering: mode === 'secure',
    idn_homograph: mode === 'secure',
    xss: mode === 'secure',
    lfi: mode === 'secure'
  });

  // Security Events Table State
  const [events, setEvents] = useState<SecurityEvent[]>(INITIAL_SECURITY_EVENTS);

  // Helper to log CyberMart security event
  const recordSecurityEvent = (eventType: SecurityEvent['eventType'], isPatched: boolean, details: string) => {
    const newEvt: SecurityEvent = {
      id: `evt-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      eventType,
      status: isPatched ? 'PATCHED' : 'VULNERABLE',
      details
    };
    setEvents((prev) => [newEvt, ...prev]);

    addLog(
      isPatched ? 'secure' : 'exploit',
      `CYBERMART [${eventType}]`,
      `[${isPatched ? 'PATCHED 🟢' : 'VULNERABLE 🔴'}] ${details}`,
      undefined,
      { eventType, status: isPatched ? 'PATCHED' : 'VULNERABLE' }
    );
  };

  // Toggle individual control
  const toggleControl = (key: string) => {
    setControls((prev) => {
      const nextState = !prev[key];
      recordSecurityEvent(
        key === 'sqli' ? 'SQL Injection Bypass' :
        key === 'brute_force' ? 'Brute Force Lockout' :
        key === 'parameter_tampering' ? 'Parameter Tampering Attempt' : 'IDN Phishing Warning',
        nextState,
        `Demonstrator toggled ${key.toUpperCase()} control state to ${nextState ? 'PATCHED 🟢' : 'VULNERABLE 🔴'}`
      );
      return { ...prev, [key]: nextState };
    });
  };

  // Sync with global mode toggle
  const handleGlobalModeSync = (targetMode: 'vulnerable' | 'secure') => {
    setMode(targetMode);
    const isPatched = targetMode === 'secure';
    setControls({
      sqli: isPatched,
      brute_force: isPatched,
      parameter_tampering: isPatched,
      idn_homograph: isPatched,
      xss: isPatched,
      lfi: isPatched
    });
  };

  // Calculate Security Score (0 to 100%)
  const patchedCount = Object.values(controls).filter(Boolean).length;
  const totalControls = Object.keys(controls).length;
  const securityScore = Math.round((patchedCount / totalControls) * 100);

  // --- MODULE 1: SHOP STORE & CHECKOUT (Parameter Tampering) ---
  const [selectedProduct, setSelectedProduct] = useState<Product>(CYBERMART_PRODUCTS[0]); // Smartphone ₹3,499
  const [clientSubmittedPrice, setClientSubmittedPrice] = useState<number>(1); // Modified to ₹1
  const [checkoutQuantity, setCheckoutQuantity] = useState<number>(1);
  const [lastCheckoutOrder, setLastCheckoutOrder] = useState<Order | null>(null);

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isPatched = controls.parameter_tampering;
    const dbAuthoritativePrice = selectedProduct.price;
    const finalUnitCharged = isPatched ? dbAuthoritativePrice : clientSubmittedPrice;
    const totalCharged = finalUnitCharged * checkoutQuantity;

    const order: Order = {
      orderId: `CM-${Date.now().toString().slice(-6)}`,
      productName: selectedProduct.name,
      quantity: checkoutQuantity,
      unitPriceSubmitted: clientSubmittedPrice,
      unitPriceVerified: dbAuthoritativePrice,
      totalPaid: totalCharged,
      status: (!isPatched && clientSubmittedPrice < dbAuthoritativePrice) ? 'PRICE_TAMPERED' : 'SUCCESS',
      timestamp: new Date().toLocaleTimeString()
    };

    addOrder(order);
    setLastCheckoutOrder(order);

    if (!isPatched && clientSubmittedPrice < dbAuthoritativePrice) {
      recordSecurityEvent(
        'Parameter Tampering Attempt',
        false,
        `Vulnerable Checkout: Accepted client-submitted price ₹${clientSubmittedPrice} for ${selectedProduct.name} (DB Price: ₹${dbAuthoritativePrice.toLocaleString()})`
      );
    } else {
      recordSecurityEvent(
        'Parameter Tampering Attempt',
        true,
        `Patched Checkout: Server retrieved authoritative price ₹${dbAuthoritativePrice.toLocaleString()} from SQLite lab.db for ${selectedProduct.name}`
      );
    }
  };

  // --- MODULE 2: LOGIN AUTHENTICATION (SQL Injection & Brute Force) ---
  const [loginUsername, setLoginUsername] = useState<string>("' OR '1'='1");
  const [loginPassword, setLoginPassword] = useState<string>('anything');
  const [failedAttemptsCount, setFailedAttemptsCount] = useState<number>(0);
  const [accountLockRemaining, setAccountLockRemaining] = useState<number>(0);
  const [authStatusMessage, setAuthStatusMessage] = useState<{ type: 'success' | 'error' | 'lockout'; msg: string } | null>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthStatusMessage(null);

    // Check account lockout
    if (controls.brute_force && accountLockRemaining > 0) {
      setAuthStatusMessage({
        type: 'lockout',
        msg: `⚠ ACCOUNT LOCKED: 3 failed attempts exceeded. Temporary cooldown active (${accountLockRemaining}s remaining).`
      });
      return;
    }

    const isSqliPatched = controls.sqli;
    const isBrutePatched = controls.brute_force;

    // Check SQLi Bypass
    const isSqliPayload = loginUsername.includes("' OR '1'='1") || loginUsername.includes("' OR 1=1");

    if (!isSqliPatched && isSqliPayload) {
      setAuthStatusMessage({
        type: 'success',
        msg: '⚡ AUTHENTICATION SUCCESSFUL: Dynamic SQL query evaluated to TRUE! Logged in as CyberMart System Administrator.'
      });
      recordSecurityEvent('SQL Injection Bypass', false, `SQL Injection Bypass triggered on /login endpoint: username="${loginUsername}"`);
      return;
    }

    // Check Credential Verification
    if (loginUsername === 'admin' && loginPassword === 'admin123') {
      setFailedAttemptsCount(0);
      setAuthStatusMessage({ type: 'success', msg: 'AUTHENTICATION SUCCESSFUL: Valid credentials provided.' });
      recordSecurityEvent('SQL Injection Bypass', isSqliPatched, 'Successful login with valid admin credentials.');
    } else {
      // Failed login attempt
      const newFailedCount = failedAttemptsCount + 1;
      setFailedAttemptsCount(newFailedCount);

      if (isBrutePatched && newFailedCount >= 3) {
        setAccountLockRemaining(30);
        setAuthStatusMessage({
          type: 'lockout',
          msg: '🔒 ACCOUNT LOCKED: Maximum 3 failed attempts reached. Cooldown timer set to 30 seconds.'
        });
        recordSecurityEvent('Brute Force Lockout', true, `Brute force threshold reached (3 attempts). Account locked for 30s.`);

        // Countdown timer
        const timer = setInterval(() => {
          setAccountLockRemaining((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              setFailedAttemptsCount(0);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setAuthStatusMessage({
          type: 'error',
          msg: `Invalid username or password. ${isBrutePatched ? `Failed attempts: ${newFailedCount} / 3.` : 'Unlimited attempts allowed.'}`
        });
        recordSecurityEvent('Brute Force Lockout', isBrutePatched, `Failed login attempt #${newFailedCount} for user "${loginUsername}".`);
      }
    }
  };

  // --- MODULE 3: INBOX & IDN HOMOGRAPH PHISHING ---
  const [phishingDomain] = useState<string>('http://cybеrmart.com/verify?account_id=9918'); // Cyrillic 'е'
  const [punycodeDomain] = useState<string>('http://xn--cybmart-9ya.com/verify?account_id=9918');
  const [showPhishingWarning, setShowPhishingWarning] = useState<boolean>(false);

  const handlePhishingLinkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const isPatched = controls.idn_homograph;

    if (isPatched) {
      setShowPhishingWarning(true);
      recordSecurityEvent(
        'IDN Phishing Warning',
        true,
        `IDN Homograph Protection: Mixed script Cyrillic domain detected (${phishingDomain}). Punycode: ${punycodeDomain}`
      );
    } else {
      setShowPhishingWarning(false);
      recordSecurityEvent(
        'IDN Phishing Warning',
        false,
        `Vulnerable Mode: User clicked unverified Cyrillic homograph link without warning banner.`
      );
      alert(`⚠️ VULNERABLE MODE: Navigated to spoofed phishing domain "${phishingDomain}" without warning!`);
    }
  };

  // --- MODULE 4: CUSTOMER REVIEWS (Stored XSS) ---
  const [reviewsList, setReviewsList] = useState<{ id: string; author: string; text: string }[]>([
    { id: '1', author: 'Rahul M.', text: 'Fast delivery on Smartphone Pro Max! Highly recommended.' },
    { id: '2', author: 'Ananya S.', text: 'Headphones noise cancellation works perfectly for video calls.' }
  ]);
  const [newReviewText, setNewReviewText] = useState<string>('<script>alert("CyberMart XSS Executed!")</script>');
  const [xssTriggerAlert, setXssTriggerAlert] = useState<string | null>(null);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setXssTriggerAlert(null);
    const isPatched = controls.xss;
    const containsScript = newReviewText.includes('<script>') || newReviewText.includes('onerror=');

    if (!isPatched) {
      setReviewsList((prev) => [{ id: `rev-${Date.now()}`, author: 'Anonymous Buyer', text: newReviewText }, ...prev]);
      if (containsScript) {
        setXssTriggerAlert(`⚡ STORED XSS POPUP TRIGGERED!\nExecuted script:\n"${newReviewText}"`);
        recordSecurityEvent('Stored XSS Executed', false, `Unsanitized HTML rendered into DOM: ${newReviewText}`);
      }
    } else {
      const safe = newReviewText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      setReviewsList((prev) => [{ id: `rev-${Date.now()}`, author: 'Verified Buyer 🟢', text: safe }, ...prev]);
      recordSecurityEvent('Stored XSS Executed', true, `HTML sanitized via htmlspecialchars() entity encoding.`);
    }
    setNewReviewText('');
  };

  // --- MODULE 5: DIAGNOSTICS & LFI VIEWER ---
  const [lfiFile, setLfiFile] = useState<string>('../../../../etc/passwd');
  const [lfiOutput, setLfiOutput] = useState<string | null>(null);
  const [pingTarget, setPingTarget] = useState<string>('8.8.8.8; cat /etc/passwd');
  const [pingOutput, setPingOutput] = useState<string | null>(null);

  const handleLfiExecute = (e: React.FormEvent) => {
    e.preventDefault();
    const isPatched = controls.lfi;

    if (!isPatched) {
      if (lfiFile.includes('..')) {
        const out = `root:x:0:0:root:/root:/bin/bash\ncybermart_db_user:x:1001:1001:CyberMart DB Master Account,,,:/var/www/cybermart:/bin/bash\nsqlite3_lab:x:1002:1002:Lab Database Account,,,:/home/lab:/bin/bash`;
        setLfiOutput(out);
        recordSecurityEvent('LFI Path Traversal', false, `Unsafe include() executed reading /etc/passwd: ${lfiFile}`);
      } else {
        setLfiOutput(`[File Content of ${lfiFile}]: CyberMart log output.`);
      }
    } else {
      if (lfiFile.includes('..')) {
        setLfiOutput(`ERROR 403: Path traversal sequence ".." detected in file path "${lfiFile}". Rejected by basename() sanitization filter.`);
        recordSecurityEvent('LFI Path Traversal', true, `Path traversal attempt blocked by basename() whitelist filter.`);
      } else {
        setLfiOutput(`[File Content of ${lfiFile}]: Safe file load.`);
      }
    }
  };

  const handlePingExecute = (e: React.FormEvent) => {
    e.preventDefault();
    const isPatched = controls.lfi;

    if (!isPatched) {
      if (pingTarget.includes(';') || pingTarget.includes('|') || pingTarget.includes('&')) {
        const out = `PING 8.8.8.8 (8.8.8.8): 56 data bytes\n64 bytes from 8.8.8.8: icmp_seq=0 ttl=117 time=14.2 ms\n\n--- Executing Secondary Injected Shell Command: cat /etc/passwd ---\nroot:x:0:0:root:/root:/bin/bash\nwww-data:x:33:33:www-data:/var/www:/bin/bash`;
        setPingOutput(out);
        recordSecurityEvent('LFI Path Traversal', false, `Command Injection executed: ${pingTarget}`);
      } else {
        setPingOutput(`PING ${pingTarget} (${pingTarget}): 56 data bytes\n64 bytes from ${pingTarget}: icmp_seq=0 ttl=117 time=12.4 ms`);
      }
    } else {
      const isValidIp = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(pingTarget.trim());
      if (!isValidIp) {
        setPingOutput(`ERROR: Host parameter "${pingTarget}" failed FILTER_VALIDATE_IP check. Command execution blocked.`);
        recordSecurityEvent('LFI Path Traversal', true, `Command injection attempt blocked by IP format validation filter.`);
      } else {
        setPingOutput(`PING ${pingTarget} (${pingTarget}): 56 data bytes\n64 bytes from ${pingTarget}: icmp_seq=0 ttl=117 time=12.4 ms`);
      }
    }
  };

  return (
    <div className="space-y-6 font-sans text-gray-100">
      {/* CYBERMART BRAND HEADER & SECURITY SCORECARD */}
      <div className="rounded-2xl border border-gray-800 bg-gray-950 p-4 sm:p-6 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                CYBERMART E-Commerce Security Laboratory
                <span className="rounded bg-indigo-950 px-2 py-0.5 text-xs text-indigo-400 border border-indigo-800 font-mono font-bold">
                  lab.db SQLite Backend
                </span>
                {isStandalone && (
                  <span className="rounded bg-emerald-950 px-2 py-0.5 text-xs text-emerald-400 border border-emerald-800 font-mono font-bold">
                    Standalone Sandbox Active
                  </span>
                )}
              </h2>
              <p className="text-xs text-gray-400">Interactive Security Vulnerability Demonstration & Defense Platform</p>
            </div>
          </div>

          {/* Global Mode Sync Buttons & Security Score */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl bg-gray-900 px-3.5 py-1.5 border border-gray-800 text-xs">
              <Award className="h-4 w-4 text-indigo-400" />
              <span className="text-gray-300">Security Score:</span>
              <span className={`font-mono font-bold text-sm ${securityScore === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {securityScore}% ({patchedCount}/{totalControls} Patched)
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-gray-900 p-1 rounded-xl border border-gray-800">
              <button
                onClick={() => handleGlobalModeSync('vulnerable')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                  mode === 'vulnerable' ? 'bg-red-600 text-white shadow' : 'text-gray-400 hover:text-white'
                }`}
              >
                Vulnerable Mode 🔴
              </button>
              <button
                onClick={() => handleGlobalModeSync('secure')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                  mode === 'secure' ? 'bg-emerald-600 text-white shadow' : 'text-gray-400 hover:text-white'
                }`}
              >
                Patched Mode 🟢
              </button>
            </div>

            {!isStandalone && onOpenStandalone && (
              <button
                onClick={onOpenStandalone}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3.5 py-2 text-xs font-bold text-white shadow-lg transition"
              >
                <Maximize2 className="h-4 w-4" />
                <span>Standalone Window ↗️</span>
              </button>
            )}

            {isStandalone && onCloseStandalone && (
              <button
                onClick={onCloseStandalone}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-800 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* ATTACK WORKBENCH & PRESET BAR */}
        <div className="rounded-xl border border-indigo-900/60 bg-gray-900/90 shadow-xl overflow-hidden">
          <button
            onClick={() => setIsTestBenchOpen((prev) => !prev)}
            className="w-full flex items-center justify-between bg-indigo-950/80 px-4 py-2.5 border-b border-indigo-900/60 text-left transition hover:bg-indigo-900/60"
          >
            <div className="flex items-center gap-2 text-indigo-200 font-bold text-xs">
              <SlidersHorizontal className="h-4 w-4 text-indigo-400" />
              <span>⚡ Quick Attack Payload Presets (CyberMart Security Lab)</span>
            </div>
            <span className="text-xs text-indigo-300">{isTestBenchOpen ? 'Hide Presets' : 'Show Presets'}</span>
          </button>

          {isTestBenchOpen && (
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 bg-gray-950/80 text-xs">
              <div className="rounded-lg border border-gray-800 bg-gray-900 p-2.5 space-y-1.5">
                <span className="font-bold text-blue-400 flex items-center gap-1">
                  <Lock className="h-3.5 w-3.5" /> 1. SQL Injection
                </span>
                <button
                  onClick={() => {
                    setLoginUsername("' OR '1'='1");
                    setLoginPassword("anything");
                    setActiveTab('login');
                  }}
                  className="w-full rounded bg-blue-950 hover:bg-blue-900 py-1 text-[11px] text-blue-200 border border-blue-800 transition"
                >
                  Preset: ' OR '1'='1
                </button>
              </div>

              <div className="rounded-lg border border-gray-800 bg-gray-900 p-2.5 space-y-1.5">
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <DollarSign className="h-3.5 w-3.5" /> 2. Parameter Tampering
                </span>
                <button
                  onClick={() => {
                    setClientSubmittedPrice(1);
                    setActiveTab('shop');
                  }}
                  className="w-full rounded bg-emerald-950 hover:bg-emerald-900 py-1 text-[11px] text-emerald-200 border border-emerald-800 transition"
                >
                  Tamper Price: ₹3,499 → ₹1
                </button>
              </div>

              <div className="rounded-lg border border-gray-800 bg-gray-900 p-2.5 space-y-1.5">
                <span className="font-bold text-amber-400 flex items-center gap-1">
                  <Globe className="h-3.5 w-3.5" /> 3. IDN Homograph
                </span>
                <button
                  onClick={() => {
                    setActiveTab('inbox');
                  }}
                  className="w-full rounded bg-amber-950 hover:bg-amber-900 py-1 text-[11px] text-amber-200 border border-amber-800 transition"
                >
                  Click Cyrillic Homograph Link
                </button>
              </div>

              <div className="rounded-lg border border-gray-800 bg-gray-900 p-2.5 space-y-1.5">
                <span className="font-bold text-purple-400 flex items-center gap-1">
                  <MessageSquare className="h-3.5 w-3.5" /> 4. Stored XSS Review
                </span>
                <button
                  onClick={() => {
                    setNewReviewText('<script>alert("CyberMart XSS Executed!")</script>');
                    setActiveTab('reviews');
                  }}
                  className="w-full rounded bg-purple-950 hover:bg-purple-900 py-1 text-[11px] text-purple-200 border border-purple-800 transition"
                >
                  Inject &lt;script&gt; Cookie Alert
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex border-b border-gray-800 bg-gray-900/60 p-2 gap-2 rounded-2xl overflow-x-auto">
        <button
          onClick={() => setActiveTab('shop')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl whitespace-nowrap transition ${
            activeTab === 'shop' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
          }`}
        >
          <ShoppingCart className="h-4 w-4" />
          <span>Shop Store & Checkout</span>
        </button>

        <button
          onClick={() => setActiveTab('login')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl whitespace-nowrap transition ${
            activeTab === 'login' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
          }`}
        >
          <Lock className="h-4 w-4" />
          <span>Login & Brute-Force</span>
        </button>

        <button
          onClick={() => setActiveTab('inbox')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl whitespace-nowrap transition ${
            activeTab === 'inbox' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
          }`}
        >
          <Mail className="h-4 w-4" />
          <span>Inbox & IDN Phishing</span>
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl whitespace-nowrap transition ${
            activeTab === 'reviews' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          <span>Product Reviews (XSS)</span>
        </button>

        <button
          onClick={() => setActiveTab('admin')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl whitespace-nowrap transition ${
            activeTab === 'admin' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
          }`}
        >
          <Activity className="h-4 w-4 text-emerald-400" />
          <span>Security Center & Event Log</span>
        </button>

        <button
          onClick={() => setActiveTab('diagnostics')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl whitespace-nowrap transition ${
            activeTab === 'diagnostics' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
          }`}
        >
          <Server className="h-4 w-4 text-red-400" />
          <span>Diagnostics & LFI</span>
        </button>
      </div>

      {/* TAB 1: SHOP STORE & CHECKOUT (PARAMETER TAMPERING) */}
      {activeTab === 'shop' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-indigo-400" />
              CyberMart Product Catalog
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {CYBERMART_PRODUCTS.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => {
                    setSelectedProduct(prod);
                    setClientSubmittedPrice(1);
                  }}
                  className={`rounded-2xl border p-4 cursor-pointer transition ${
                    selectedProduct.id === prod.id
                      ? 'border-indigo-500 bg-indigo-950/50 shadow-lg ring-1 ring-indigo-500'
                      : 'border-gray-800 bg-gray-900/60 hover:bg-gray-800/60'
                  }`}
                >
                  <img src={prod.image} alt={prod.name} className="h-32 w-full object-cover rounded-xl mb-3" />
                  <h4 className="text-xs font-bold text-white mb-1">{prod.name}</h4>
                  <p className="text-[11px] text-gray-400 mb-2">{prod.description}</p>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-emerald-400 font-bold">Authoritative DB Price: ₹{prod.price.toLocaleString()}</span>
                    {selectedProduct.id === prod.id && <CheckCircle2 className="h-4 w-4 text-indigo-400" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 rounded-2xl border border-gray-800 bg-gray-900/60 p-6 shadow-xl space-y-4 h-fit">
            <div className="border-b border-gray-800 pb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white font-mono">Checkout & Price Validation</h3>
              <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                controls.parameter_tampering ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-red-950 text-red-400 border border-red-800'
              }`}>
                {controls.parameter_tampering ? 'PATCHED (SQLite Validation)' : 'VULNERABLE (Client Price Trusted)'}
              </span>
            </div>

            <form onSubmit={handleCheckoutSubmit} className="space-y-4 text-xs font-mono">
              <div className="rounded-xl bg-black p-3 space-y-1 text-gray-300">
                <p>Selected Product: <strong className="text-white">{selectedProduct.name}</strong></p>
                <p>SQLite lab.db Price: <strong className="text-emerald-400">₹{selectedProduct.price.toLocaleString()}</strong></p>
              </div>

              {!controls.parameter_tampering ? (
                <div className="rounded-xl bg-red-950/40 p-3 border border-red-800 space-y-2">
                  <label className="block text-red-300 font-bold">
                    Vulnerable Mode: Client-Submitted Price Parameter Input Box:
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-red-400 font-bold text-sm">₹</span>
                    <input
                      type="number"
                      value={clientSubmittedPrice}
                      onChange={(e) => setClientSubmittedPrice(parseFloat(e.target.value) || 0)}
                      className="w-full rounded-lg bg-gray-950 px-3 py-1.5 text-red-300 font-bold border border-red-700 text-sm focus:outline-none"
                    />
                  </div>
                  <p className="text-[10px] text-red-400">⚠️ Backend will process transaction at client-submitted price!</p>
                </div>
              ) : (
                <div className="rounded-xl bg-emerald-950/40 p-3 border border-emerald-800 text-emerald-200 text-[11px]">
                  🟢 Patched Mode: Client-submitted price is ignored. Backend retrieves authoritative price from SQLite `products` table.
                </div>
              )}

              <div>
                <label className="block text-gray-400 mb-1">Quantity:</label>
                <input
                  type="number"
                  min={1}
                  value={checkoutQuantity}
                  onChange={(e) => setCheckoutQuantity(parseInt(e.target.value, 10) || 1)}
                  className="w-full rounded-xl bg-gray-950 border border-gray-800 px-3 py-2 text-white font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 py-3 text-xs font-bold text-white shadow-lg transition"
              >
                Submit Checkout Request
              </button>
            </form>

            {lastCheckoutOrder && (
              <div className={`rounded-xl border p-4 font-mono text-xs space-y-1.5 ${
                lastCheckoutOrder.status === 'PRICE_TAMPERED' ? 'border-red-800 bg-red-950/40 text-red-200' : 'border-emerald-800 bg-emerald-950/40 text-emerald-200'
              }`}>
                <p className="font-bold">Transaction Receipt #{lastCheckoutOrder.orderId}</p>
                <p>Submitted Client Price: ₹{lastCheckoutOrder.unitPriceSubmitted}</p>
                <p>SQLite Authoritative Price: ₹{lastCheckoutOrder.unitPriceVerified.toLocaleString()}</p>
                <div className="border-t border-gray-800 pt-2 font-bold text-white flex justify-between">
                  <span>Total Amount Billed:</span>
                  <span>₹{lastCheckoutOrder.totalPaid.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: LOGIN AUTHENTICATION (SQL INJECTION & BRUTE FORCE) */}
      {activeTab === 'login' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 rounded-2xl border border-gray-800 bg-gray-900/60 p-6 shadow-xl space-y-4">
            <div className="border-b border-gray-800 pb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <Lock className="h-5 w-5 text-blue-400" />
                CyberMart Authentication Gateway
              </h3>
              <div className="flex gap-1">
                <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${controls.sqli ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-red-950 text-red-400 border border-red-800'}`}>
                  SQLi: {controls.sqli ? 'PATCHED' : 'VULNERABLE'}
                </span>
                <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${controls.brute_force ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-red-950 text-red-400 border border-red-800'}`}>
                  BruteForce: {controls.brute_force ? 'PATCHED' : 'VULNERABLE'}
                </span>
              </div>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-gray-300 mb-1">Username Input Box (SQLi / Username Target):</label>
                <input
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="e.g. admin or ' OR '1'='1"
                  className="w-full rounded-xl bg-gray-950 border border-gray-800 px-3.5 py-2.5 text-white font-mono focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-gray-300 mb-1">Password Input Box:</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full rounded-xl bg-gray-950 border border-gray-800 px-3.5 py-2.5 text-white font-mono focus:outline-none"
                />
              </div>

              {authStatusMessage && (
                <div className={`rounded-xl p-3.5 text-xs font-mono border ${
                  authStatusMessage.type === 'success' ? 'bg-emerald-950/60 border-emerald-800 text-emerald-200' :
                  authStatusMessage.type === 'lockout' ? 'bg-amber-950/60 border-amber-800 text-amber-200' :
                  'bg-red-950/60 border-red-800 text-red-200'
                }`}>
                  {authStatusMessage.msg}
                </div>
              )}

              <button
                type="submit"
                disabled={controls.brute_force && accountLockRemaining > 0}
                className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 py-3 text-xs font-bold text-white shadow-lg transition disabled:opacity-50"
              >
                {accountLockRemaining > 0 ? `Locked Out (${accountLockRemaining}s)` : 'Authenticate User'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-6 rounded-2xl border border-gray-800 bg-gray-900/60 p-6 shadow-xl space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider font-mono">Authentication Security Control Policies</h4>
            <div className="space-y-3 font-mono text-xs">
              <div className="rounded-xl border border-gray-800 bg-black p-4 space-y-1">
                <span className="text-blue-400 font-bold block">1. SQL Injection Query Strategy:</span>
                <p className="text-gray-300">
                  {controls.sqli ? (
                    <span className="text-emerald-400">🟢 PATCHED: SELECT * FROM users WHERE username = ? AND password = ? (Bound out-of-band parameters)</span>
                  ) : (
                    <span className="text-red-400">🔴 VULNERABLE: SELECT * FROM users WHERE username = '{loginUsername}' AND password = '{loginPassword}'</span>
                  )}
                </p>
              </div>

              <div className="rounded-xl border border-gray-800 bg-black p-4 space-y-1">
                <span className="text-amber-400 font-bold block">2. Brute Force Protection Policy:</span>
                <p className="text-gray-300">
                  {controls.brute_force ? (
                    <span className="text-emerald-400">🟢 PATCHED: Max 3 Failed Attempt Threshold → 30s Cooldown Account Lockout Active (Current Failed Tries: {failedAttemptsCount}/3)</span>
                  ) : (
                    <span className="text-red-400">🔴 VULNERABLE: Unlimited authentication attempts permitted without lockout or rate limiting.</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: INBOX & IDN HOMOGRAPH PHISHING */}
      {activeTab === 'inbox' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 rounded-2xl border border-amber-900/60 bg-gray-900/80 p-6 shadow-xl space-y-4">
            <div className="border-b border-gray-800 pb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <Mail className="h-5 w-5 text-amber-400" />
                CyberMart User Inbox (Simulated Phishing Mail)
              </h3>
              <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${controls.idn_homograph ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-red-950 text-red-400 border border-red-800'}`}>
                IDN Detection: {controls.idn_homograph ? 'PATCHED' : 'VULNERABLE'}
              </span>
            </div>

            <div className="rounded-xl border border-amber-800/80 bg-black p-4 space-y-3 font-sans">
              <div className="flex justify-between text-xs text-gray-400 border-b border-gray-800 pb-2">
                <div>
                  <p className="font-bold text-white">From: Security Team &lt;security@cybеrmart.com&gt;</p>
                  <p>Subject: URGENT: Verify your CyberMart Account Credentials</p>
                </div>
                <span className="text-[10px]">Today, 10:14 AM</span>
              </div>

              <div className="text-xs text-gray-300 space-y-2">
                <p>Dear Customer,</p>
                <p>We detected unusual activity on your CyberMart account. Please verify your credentials immediately to avoid account suspension.</p>
              </div>

              <div className="pt-2">
                <button
                  onClick={handlePhishingLinkClick}
                  className="rounded-xl bg-amber-600 hover:bg-amber-500 px-4 py-2 text-xs font-bold text-white transition"
                >
                  Verify Account Credentials →
                </button>
              </div>
            </div>

            {showPhishingWarning && (
              <div className="rounded-xl border border-red-700 bg-red-950 p-4 text-xs font-mono text-red-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-red-300">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                  <span>⚠ SECURITY WARNING: SUSPICIOUS IDN HOMOGRAPH DOMAIN DETECTED!</span>
                </div>
                <p>The requested domain contains suspicious internationalized Cyrillic characters visually mimicking genuine CyberMart domain.</p>
                <div className="rounded bg-black p-2 text-[11px] text-amber-300">
                  <p>Requested URL: <strong>{phishingDomain}</strong></p>
                  <p>ASCII Punycode Representation: <strong>{punycodeDomain}</strong></p>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-6 rounded-2xl border border-gray-800 bg-gray-900/60 p-6 shadow-xl space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider font-mono">IDN Homograph Security Explanation</h4>
            <div className="space-y-3 text-xs font-mono text-gray-300">
              <div className="rounded-xl bg-black p-4 border border-gray-800 space-y-2">
                <span className="font-bold text-amber-400 block">Homograph Character Analysis:</span>
                <p>Legitimate Domain: <code className="text-emerald-400 font-bold">cybermart.com</code> (Latin 'e')</p>
                <p>Spoofed Domain: <code className="text-red-400 font-bold">cybеrmart.com</code> (Cyrillic 'е' U+0435)</p>
                <p className="text-[11px] text-gray-400 mt-2">
                  In Patched Mode, script detection checks mixed character sets and displays Punycode representations (`xn--cybmart-9ya.com`) to alert users before credential entry.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CUSTOMER REVIEWS (STORED XSS) */}
      {activeTab === 'reviews' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 rounded-2xl border border-gray-800 bg-gray-900/60 p-6 shadow-xl space-y-4">
            <div className="border-b border-gray-800 pb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-purple-400" />
                Submit Product Review
              </h3>
              <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${controls.xss ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-red-950 text-red-400 border border-red-800'}`}>
                XSS: {controls.xss ? 'PATCHED' : 'VULNERABLE'}
              </span>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-gray-300 mb-1">Review Content Input Box (XSS Target):</label>
                <textarea
                  value={newReviewText}
                  onChange={(e) => setNewReviewText(e.target.value)}
                  rows={4}
                  className="w-full rounded-xl bg-gray-950 border border-gray-800 px-3.5 py-2.5 text-white font-mono focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-purple-600 hover:bg-purple-500 py-3 text-xs font-bold text-white shadow-lg transition"
              >
                Post Customer Review
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 space-y-4">
            {xssTriggerAlert && (
              <div className="rounded-xl border border-red-700 bg-red-950 p-4 text-xs font-mono text-red-200">
                {xssTriggerAlert}
              </div>
            )}

            <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6 shadow-xl space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider font-mono">CyberMart Product Reviews Feed</h4>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {reviewsList.map((r) => (
                  <div key={r.id} className="rounded-xl border border-gray-800 bg-black p-4 space-y-1">
                    <span className="text-xs font-bold text-white block">{r.author}</span>
                    {!controls.xss ? (
                      <div className="text-xs text-purple-200 font-mono" dangerouslySetInnerHTML={{ __html: r.text }} />
                    ) : (
                      <div className="text-xs text-emerald-200 font-mono">{r.text}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SECURITY CENTER & EVENT LOG ADMIN DASHBOARD */}
      {activeTab === 'admin' && (
        <div className="space-y-6 font-mono">
          <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-400" />
              CyberMart Central Security Center Admin Dashboard
            </h3>

            {/* Controls Matrix Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="rounded-xl border border-gray-800 bg-black p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white text-xs">1. SQL Injection</span>
                  <button
                    onClick={() => toggleControl('sqli')}
                    className={`px-3 py-1 rounded text-[10px] font-bold transition ${controls.sqli ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}
                  >
                    {controls.sqli ? 'PATCHED 🟢' : 'VULNERABLE 🔴'}
                  </button>
                </div>
                <p className="text-[11px] text-gray-400">Dynamic SQL string query vs Parameterized Prepared Statements.</p>
              </div>

              <div className="rounded-xl border border-gray-800 bg-black p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white text-xs">2. Brute Force Protection</span>
                  <button
                    onClick={() => toggleControl('brute_force')}
                    className={`px-3 py-1 rounded text-[10px] font-bold transition ${controls.brute_force ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}
                  >
                    {controls.brute_force ? 'PATCHED 🟢' : 'VULNERABLE 🔴'}
                  </button>
                </div>
                <p className="text-[11px] text-gray-400">Unlimited attempts vs 3-attempt threshold & 30s lockout.</p>
              </div>

              <div className="rounded-xl border border-gray-800 bg-black p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white text-xs">3. Parameter Tampering</span>
                  <button
                    onClick={() => toggleControl('parameter_tampering')}
                    className={`px-3 py-1 rounded text-[10px] font-bold transition ${controls.parameter_tampering ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}
                  >
                    {controls.parameter_tampering ? 'PATCHED 🟢' : 'VULNERABLE 🔴'}
                  </button>
                </div>
                <p className="text-[11px] text-gray-400">Trust client price vs Server-side SQLite lab.db validation.</p>
              </div>

              <div className="rounded-xl border border-gray-800 bg-black p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white text-xs">4. IDN Homograph Phishing</span>
                  <button
                    onClick={() => toggleControl('idn_homograph')}
                    className={`px-3 py-1 rounded text-[10px] font-bold transition ${controls.idn_homograph ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}
                  >
                    {controls.idn_homograph ? 'PATCHED 🟢' : 'VULNERABLE 🔴'}
                  </button>
                </div>
                <p className="text-[11px] text-gray-400">No warning vs Mixed-script Cyrillic domain detection & Punycode warning.</p>
              </div>

              <div className="rounded-xl border border-gray-800 bg-black p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white text-xs">5. Stored XSS</span>
                  <button
                    onClick={() => toggleControl('xss')}
                    className={`px-3 py-1 rounded text-[10px] font-bold transition ${controls.xss ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}
                  >
                    {controls.xss ? 'PATCHED 🟢' : 'VULNERABLE 🔴'}
                  </button>
                </div>
                <p className="text-[11px] text-gray-400">Unescaped HTML echo vs htmlspecialchars() entity encoding.</p>
              </div>

              <div className="rounded-xl border border-gray-800 bg-black p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white text-xs">6. LFI & RCE Filtering</span>
                  <button
                    onClick={() => toggleControl('lfi')}
                    className={`px-3 py-1 rounded text-[10px] font-bold transition ${controls.lfi ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}
                  >
                    {controls.lfi ? 'PATCHED 🟢' : 'VULNERABLE 🔴'}
                  </button>
                </div>
                <p className="text-[11px] text-gray-400">Unsafe include/exec vs basename() & FILTER_VALIDATE_IP.</p>
              </div>
            </div>
          </div>

          {/* Real-time Security Events Log Table */}
          <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6 shadow-xl space-y-4">
            <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Real-Time Security Event Monitor Table (`events` table)</h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-gray-800">
                <thead className="bg-black text-gray-400 font-bold border-b border-gray-800">
                  <tr>
                    <th className="py-2.5 px-3">Event ID</th>
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Event Type</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800 text-[11px]">
                  {events.map((e) => (
                    <tr key={e.id} className="hover:bg-gray-900">
                      <td className="py-2 px-3 font-bold text-gray-400">{e.id}</td>
                      <td className="py-2 px-3 text-gray-400">{e.timestamp}</td>
                      <td className="py-2 px-3 font-bold text-indigo-300">{e.eventType}</td>
                      <td className="py-2 px-3">
                        <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                          e.status === 'PATCHED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-red-950 text-red-400 border border-red-800'
                        }`}>
                          {e.status}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-gray-200">{e.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: DIAGNOSTICS & LFI VIEWER */}
      {activeTab === 'diagnostics' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono text-xs">
          <div className="lg:col-span-6 rounded-2xl border border-gray-800 bg-gray-900/60 p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Server className="h-5 w-5 text-red-400" />
              Log File Reader API (?file=... LFI Target)
            </h3>
            <form onSubmit={handleLfiExecute} className="flex gap-2">
              <input
                type="text"
                value={lfiFile}
                onChange={(e) => setLfiFile(e.target.value)}
                className="flex-1 rounded-xl bg-gray-950 border border-gray-800 px-3 py-2 text-white font-mono"
              />
              <button type="submit" className="rounded-xl bg-red-600 hover:bg-red-500 px-4 py-2 text-xs font-bold text-white">
                Read Log File
              </button>
            </form>

            {lfiOutput && (
              <div className="rounded-xl bg-black p-3 text-emerald-300 border border-gray-800 overflow-x-auto">
                <pre>{lfiOutput}</pre>
              </div>
            )}
          </div>

          <div className="lg:col-span-6 rounded-2xl border border-gray-800 bg-gray-900/60 p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Terminal className="h-5 w-5 text-red-400" />
              Server Host Ping Diagnostic Tool (RCE Target)
            </h3>
            <form onSubmit={handlePingExecute} className="flex gap-2">
              <input
                type="text"
                value={pingTarget}
                onChange={(e) => setPingTarget(e.target.value)}
                className="flex-1 rounded-xl bg-gray-950 border border-gray-800 px-3 py-2 text-white font-mono"
              />
              <button type="submit" className="rounded-xl bg-red-600 hover:bg-red-500 px-4 py-2 text-xs font-bold text-white">
                Run Ping
              </button>
            </form>

            {pingOutput && (
              <div className="rounded-xl bg-black p-3 text-emerald-300 border border-gray-800 overflow-x-auto">
                <pre>{pingOutput}</pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const FullAppModule: React.FC = () => {
  const [isStandaloneOpen, setIsStandaloneOpen] = useState<boolean>(false);

  return (
    <div className="space-y-6">
      {/* NORMAL IN-PAGE APPLICATION VIEW */}
      <CyberMartCore onOpenStandalone={() => setIsStandaloneOpen(true)} />

      {/* STANDALONE WINDOW SANDBOX MODAL VIEW */}
      {isStandaloneOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-xl font-sans">
          <div className="flex h-[95vh] w-full max-w-7xl flex-col rounded-2xl border border-indigo-500 bg-gray-950 shadow-2xl overflow-hidden ring-1 ring-indigo-500/50">
            {/* Standalone Window Browser Address Bar */}
            <div className="flex items-center justify-between bg-gradient-to-r from-indigo-950 via-gray-900 to-purple-950 px-6 py-3 border-b border-indigo-900/60 text-white">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-red-500/80 inline-block cursor-pointer" onClick={() => setIsStandaloneOpen(false)}></span>
                  <span className="h-3 w-3 rounded-full bg-amber-500/80 inline-block"></span>
                  <span className="h-3 w-3 rounded-full bg-emerald-500/80 inline-block"></span>
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-black/60 px-4 py-1.5 text-xs font-mono text-gray-300 border border-gray-800 min-w-[320px]">
                  <Lock className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-gray-400">http://localhost:5173</span>
                  <span className="text-indigo-300 font-bold">/cybermart/sandbox</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded bg-emerald-950 px-2.5 py-1 text-[10px] font-bold text-emerald-400 border border-emerald-800 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  STANDALONE LAB ACTIVE
                </span>

                <button
                  onClick={() => setIsStandaloneOpen(false)}
                  className="rounded-xl p-1.5 text-gray-400 hover:bg-gray-800 hover:text-white transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Standalone Window Body - Renders Full CyberMart Application Core */}
            <div className="flex-1 overflow-y-auto p-6 bg-[#090d16]">
              <CyberMartCore 
                isStandalone={true} 
                onCloseStandalone={() => setIsStandaloneOpen(false)} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
