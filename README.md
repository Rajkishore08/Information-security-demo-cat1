# 🛒 CYBERMART: SECURITY VULNERABILITY DEMONSTRATION & MITIGATION PLATFORM
> **CS401 - Information Security Laboratory (CAT 1) Project**  
> Department of Computer Science & Engineering  
> **GitHub Repository**: [https://github.com/Rajkishore08/Information-security-demo-cat1.git](https://github.com/Rajkishore08/Information-security-demo-cat1.git)

---

## 📄 ABSTRACT

**CyberMart** is an interactive, web-based e-commerce security laboratory application designed to bridge the gap between theoretical cybersecurity concepts and practical vulnerability exploitation and defense. The application simulates a real-world online shopping platform while intentionally incorporating major web application security vulnerabilities.

CyberMart features a dual-mode security execution engine:
- **Vulnerable Mode 🔴**: Demonstrates flawed coding practices such as dynamic SQL string concatenation, unvalidated client-side prices, unlimited login attempts, unescaped DOM rendering, and unverified internationalized domain names.
- **Patched Mode 🟢**: Implements industry-standard security controls including parameterized prepared statements, server-side SQLite database price validation, 3-attempt account lockout cooldowns, context-aware `htmlspecialchars()` entity encoding, and Punycode homograph domain detection.

A centralized **Security Center Dashboard** (`/admin`) allows administrators and laboratory examiners to dynamically toggle security controls, monitor live timestamped event logs in an `events` audit table, inspect side-by-side PHP/MySQL code diffs, and track a real-time **Security Scorecard (0% to 100%)**.

---

## 📚 FULL ACADEMIC DOCUMENTATION

For full, detailed technical specifications, system architecture diagrams, database schemas, algorithms, and viva walkthrough guides, please refer to the comprehensive academic documentation file:

👉 **[PROJECT_DOCUMENTATION.md](file:///Users/rajkishores/Sem%209/Information%20Security%20Lab/CAT%201/PROJECT_DOCUMENTATION.md)**

---

## 🎯 PROBLEM DEFINITION

Modern web application development frequently suffers from critical security oversights due to reliance on insecure client-side parameters, lack of input sanitization, and improper database query construction. Specifically, web applications face four major technical challenges:
1. **Dynamic Database Construction**: Developers concatenate raw user input directly into database queries, exposing systems to Authentication Bypass via SQL Injection (SQLi).
2. **Unrestricted Authentication Endpoints**: Applications fail to enforce attempt thresholds or rate limiting, enabling automated brute-force attacks.
3. **Over-Trusting Client State**: E-commerce platforms trust HTTP request parameters (such as product prices) sent from the browser, allowing clients to tamper with transaction totals.
4. **Visual Domain Deception**: Users fall victim to Internationalized Domain Name (IDN) Homograph phishing attacks where visually identical Cyrillic characters trick victims.

---

## 🚀 PROBLEM OBJECTIVE

1. **Demonstrate Exploitation & Defense**: To provide a practical, interactive web application demonstrating the mechanics of 6 major OWASP Top 10 vulnerabilities.
2. **Dual-State Security Comparison**: To enable side-by-side comparison between vulnerable dynamic logic and secure patched implementations.
3. **Demonstrate SQL Injection Mitigation**: To illustrate how parameterized queries (prepared statements) treat user input strictly as literal scalar data out-of-band.
4. **Implement Rate Limiting & Account Lockout**: To enforce a 3-attempt failure threshold triggering a mandatory 30-second account lockout cooldown.
5. **Enforce Server-Side Price Integrity**: To demonstrate server-side validation against authoritative SQLite `lab.db` prices, rejecting client-submitted price overrides.
6. **Detect IDN Homograph Phishing**: To implement mixed-script character inspection and display ASCII Punycode warnings (`xn--cybmart-9ya.com`) prior to credential entry.
7. **Maintain Centralized Security Audit Center**: To log all security events with timestamps into an `events` audit table and present a real-time Security Scorecard (0% to 100%).

---

## 🔬 PROBLEM SCOPE

| # | Security Vulnerability | Vulnerable Implementation | Patched Security Control | Target Module |
|---|---|---|---|---|
| **1** | **SQL Injection (SQLi)** | Dynamic query string concatenation (`SELECT * FROM users WHERE username='$user' AND password='$pass'`) | Parameterized Queries (Prepared Statements `$stmt->bind_param("ss", ...)`) | Auth Gateway (`/login`) |
| **2** | **Brute Force Attack** | Unlimited login authentication attempts without throttling | Rate limiting & 30-second Account Lockout after 3 failed tries | Auth Gateway (`/login`) |
| **3** | **Parameter Tampering** | Trusting client-supplied price parameter input box (Tampering ₹3,499 → ₹1) | Server-side validation against authoritative SQLite `lab.db` prices | Shop Store (`/checkout`) |
| **4** | **IDN Homograph Phishing** | No warning on spoofed Cyrillic link (`cybеrmart.com`) | Mixed-script Cyrillic domain detection & Punycode warning (`xn--cybmart-9ya.com`) | User Inbox (`/inbox`) |
| **5** | **Stored Cross-Site Scripting (XSS)** | Unescaped DOM echo (`<?php echo $_POST['comment']; ?>`) | Context-aware HTML Entity Encoding (`htmlspecialchars()`) | Customer Reviews (`/reviews`) |
| **6** | **LFI & OS Command Injection** | Unsafe `include()` path traversal & `shell_exec()` | `basename()` whitelist & `FILTER_VALIDATE_IP` escaping | System Diagnostics (`/diagnostics`) |

---

## 🏗️ SYSTEM ARCHITECTURE

```
                  ┌─────────────────────────────────────────┐
                  │          USER INTERFACE (BROWSER)        │
                  └────────────────────┬────────────────────┘
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │    GLOBAL SECURITY CONTEXT (state.py)    │
                  │  [Mode: Vulnerable 🔴 vs Patched 🟢]    │
                  └────────────────────┬────────────────────┘
                                       │
         ┌─────────────────────────────┼─────────────────────────────┐
         ▼                             ▼                             ▼
┌─────────────────┐           ┌─────────────────┐           ┌─────────────────┐
│ SHOP & CHECKOUT │           │ AUTH & LOCKOUT  │           │ SECURITY CENTER │
│   (Tampering)   │           │ (SQLi & Brute)  │           │   (Admin Log)   │
└────────┬────────┘           └────────┬────────┘           └────────┬────────┘
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │       PERSISTENT DATABASE (lab.db)      │
                  │  - users (id, username, password, role) │
                  │  - products (id, name, price, image)    │
                  │  - events (id, timestamp, type, status) │
                  └─────────────────────────────────────────┘
```

---

## 🛠️ TOOLS & TECHNOLOGIES USED

| Category | Technology | Usage Description |
|---|---|---|
| **Frontend Framework** | React 19 + TypeScript | Modular component state rendering and type safety |
| **Build Tooling** | Vite 8 | High-speed HMR development server and production bundler |
| **Styling Engine** | Tailwind CSS v4 | Custom cyber glassmorphism design system |
| **Icon System** | Lucide React | Clean, intuitive user interface icons |
| **Visual Effects** | Canvas Confetti | Exploit confirmation celebration effects |
| **Proxy Inspector** | CyberProxy (Burp Simulator) | Intercepts raw HTTP POST/GET request packets inline |
| **Report Generator** | Printable PDF Engine | Formats laboratory experiment record with examiner sign-off |
| **Database Engine** | SQLite3 (`lab.db`) | Persistent relational database storing users, products, and events |

---

## ⚙️ INSTALLATION & RUN INSTRUCTIONS

```bash
git clone https://github.com/Rajkishore08/Information-security-demo-cat1.git
cd Information-security-demo-cat1
npm install
npm run dev
```

Open your browser and navigate to `http://localhost:5173/`.
