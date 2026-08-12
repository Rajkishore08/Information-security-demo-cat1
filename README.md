# 🛒 UrbanCart – Security Vulnerability Demonstration Web Application
> **Information Security Lab (CAT 1) Project & College Viva Presentation Suite**

UrbanCart is an interactive web-based e-commerce security laboratory application designed to simulate a real-world online shopping platform while intentionally incorporating web application security vulnerabilities.

Designed for college laboratory evaluations, viva examinations, and cybersecurity demonstrations.

---

## 🌟 Architecture & Core Objectives

UrbanCart provides two security modes for every vulnerability:
- **Vulnerable Mode 🔴**: Intentionally contains insecure implementation logic (dynamic SQL queries, unvalidated client prices, missing rate limits, unverified IDN homographs).
- **Patched Mode 🟢**: Implements industry-standard security controls (parameterized prepared statements, server-side SQLite DB validation, 3-attempt account lockouts, Punycode mixed-script warnings).

A central **Security Center Dashboard** allows administrators and lab evaluators to dynamically toggle security controls, observe real-time behavior, view timestamped event logs, and track the live **Security Scorecard (0 to 100%)**.

---

## 🚀 Scope of Security Concepts & Vulnerabilities Demonstrated

| # | Security Concept | Vulnerable Implementation | Patched Security Control | UrbanCart Module |
|---|---|---|---|---|
| **1** | **SQL Injection (SQLi)** | Dynamic query string concatenation (`SELECT * FROM users WHERE username='$user'`) | Parameterized Queries (Prepared Statements `$stmt->bind_param()`) | Auth Gateway & Search (`/login`) |
| **2** | **Brute Force & Rate Limiting** | Unlimited authentication attempts | Rate limiting & 30-second Account Lockout after 3 failed tries | Auth Gateway (`/login`) |
| **3** | **Parameter Tampering** | Trusting client-supplied price input (Tampering ₹3,499 → ₹1) | Server-side validation against authoritative SQLite `lab.db` | Shop Store & Checkout (`/checkout`) |
| **4** | **IDN Homograph Phishing** | No suspicious-domain warning on spoofed Cyrillic link | Mixed-script Cyrillic domain detection & Punycode warning (`xn--urbancrt-8ya.com`) | User Inbox (`/inbox`) |
| **5** | **Stored Cross-Site Scripting (XSS)** | Unescaped DOM echo (`<?php echo $_POST['comment']; ?>`) | Context-aware HTML Entity Encoding (`htmlspecialchars()`) | Customer Reviews (`/reviews`) |
| **6** | **LFI & Command Injection** | Unsafe `include()` path traversal & `shell_exec()` | `basename()` whitelist & `FILTER_VALIDATE_IP` escaping | Diagnostics (`/diagnostics`) |

---

## 🛠️ Technology Stack

- **Frontend Framework**: React 19 + TypeScript
- **Build Tooling**: Vite 8
- **Styling**: Tailwind CSS v4 + Glassmorphism Cyber Theme
- **Icons**: Lucide React
- **Visual Effects**: Canvas Confetti
- **Database Architecture**: Persistent In-Memory SQLite `lab.db` Store & Live Server Interceptor (Zero external database required—runs out of the box on any system!)

---

## ⚙️ Installation & Setup Instructions

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Steps
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Rajkishore08/Information-security-demo-cat1.git
   cd Information-security-demo-cat1
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start Local Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173/`.

4. **Build Production Bundle**:
   ```bash
   npm run build
   ```

---

## 🎓 Step-by-Step Viva Demonstration Walkthrough

### Step 1: Demonstrate SQL Injection (Vulnerability 1)
1. Navigate to **Login & Brute-Force**.
2. Under **Vulnerable Mode 🔴**, click preset `' OR '1'='1`. Submit authentication.
3. Observe successful authentication bypass logging in as UrbanCart System Administrator.
4. Toggle to **Patched Mode 🟢** and repeat test. Observe that prepared statement parameter binding treats `' OR '1'='1` strictly as literal string data.

### Step 2: Demonstrate Brute Force Protection (Vulnerability 2)
1. In **Patched Mode 🟢**, attempt invalid logins 3 times consecutively.
2. Observe the **30-Second Account Lockout** triggering and blocking further attempts during the cooldown period.

### Step 3: Demonstrate Parameter Tampering (Vulnerability 3)
1. Navigate to **Shop Store & Checkout**. Select Smartphone Pro Max (Original Price: ₹3,499).
2. In **Vulnerable Mode 🔴**, edit the client price input box to `1` and click Checkout. Observe the item purchased for ₹1!
3. Toggle to **Patched Mode 🟢** and submit again. Observe that the server overrides client input and calculates the order using authoritative SQLite `lab.db` prices (₹3,499).

### Step 4: Demonstrate IDN Homograph Phishing (Vulnerability 4)
1. Navigate to **Inbox & IDN Phishing**. Open the simulated security email.
2. In **Patched Mode 🟢**, click the suspicious link (`urbancаrt.com` with Cyrillic 'а').
3. Observe the **⚠ SECURITY WARNING** banner identifying mixed scripts and displaying ASCII Punycode (`xn--urbancrt-8ya.com`).

### Step 5: Open Central Security Center
1. Navigate to **Security Center & Event Log**.
2. Review the live matrix of all 6 security controls, toggle states, track the **Security Scorecard (0 to 100%)**, and inspect the timestamped `events` table log.

---

## 📜 Project Structure

```
.
├── index.html
├── package.json
├── vite.config.ts
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── types/
│   │   └── security.ts
│   ├── context/
│   │   └── SecurityContext.tsx
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── TerminalLogs.tsx
│   │   ├── CodeInspectorModal.tsx
│   │   ├── VivaFlashcardsModal.tsx
│   │   ├── LabReportModal.tsx
│   │   ├── BurpProxyModal.tsx
│   │   ├── PayloadLibraryModal.tsx
│   │   └── SecurityHeadersAuditor.tsx
│   ├── modules/
│   │   ├── sqli/
│   │   ├── xss/
│   │   ├── parameter-tampering/
│   │   ├── password-guessing/
│   │   └── full-app/
│   └── data/
│       └── mockData.ts
```

---

## 📝 License

This project is created for educational and laboratory evaluation purposes under the **MIT License**.
