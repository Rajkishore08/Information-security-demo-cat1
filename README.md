# 🛡️ CyberSec Vulnerability Lab & Educational Simulator
> **Information Security Lab (CAT 1) Project & Viva Presentation Suite**

An interactive, presentation-ready educational web application built to demonstrate major web application security vulnerabilities, attack vectors, live execution traces, side-by-side PHP/MySQL code diffs, and secure defense mechanisms.

Designed for college laboratory evaluations, viva examinations, and cybersecurity demonstrations.

---

## 🌟 Key Features & Advanced Lab Enhancements

- **🔴 Vulnerable Mode vs. 🟢 Secure Mode Toggle**: Instant global mode switcher that modifies server-side query construction, sanitization logic, access controls, and rate limits across all modules in real time.
- **📄 Printable Viva Lab Report Generator (PDF / HTML)**: One-click formatted laboratory evaluation report complete with Student Registration details, experiment audit table, OWASP defense matrix, and Faculty Signature sign-off block.
- **🪟 Burp Suite / OWASP ZAP HTTP Proxy Inspector ("CyberProxy")**: Interactive proxy modal to capture, inspect, and modify HTTP POST/GET request payloads (`price=10`) inline before sending to server, and view live response security headers (`Content-Security-Policy`, `HSTS`, `X-Frame-Options`).
- **🎯 20+ Attack Payload Library**: Curated attack strings categorized across SQLi, XSS, Parameter Tampering, Command Injection, and Path Traversal with 1-tap copy and explanation tooltips.
- **🛡️ Live Security Headers Auditor & CSP Analyzer**: Real-time HTTP header audit scorecard comparing Vulnerable Mode (Grade: F - Missing Headers) vs. Secure Mode (Grade: A+ - Hardened Headers).
- **🎉 Interactive Confetti & Visual Flash Cues**: Audio and visual feedback effects triggering upon exploit confirmation or defense activation.
- **💻 Live Request Terminal & SQL Execution Logger**: Colorized drawer terminal capturing raw HTTP requests, constructed SQL strings vs. bound prepared parameters, HTML entity encoding, and defense triggers.
- **📄 Side-by-Side Code Inspector**: Interactive modal presenting vulnerable PHP/MySQL implementations alongside secure parameterized queries, `htmlspecialchars()` encoders, and `FILTER_VALIDATE_IP` filters.
- **📱 Mobile-Responsive Real Target Portal & Attack Workbench**: Integrated enterprise web portal ("OmniCorp Enterprise") equipped with an interactive 1-tap attack payload test bench designed for mobile screens and quick presentation testing.

---

## 🚀 Covered Security Vulnerabilities

| # | Vulnerability | OWASP Mapping | Target Scenario | Attack Payload / Method | Secure Defense |
|---|---|---|---|---|---|
| **1** | **SQL Injection (SQLi)** | A03:2021 - Injection | Banking Login & Search | `' OR '1'='1`, `1 UNION SELECT credit_card FROM vault` | Parameterized Queries (Prepared Statements) |
| **2** | **Cross-Site Scripting (XSS)** | A03:2021 - Injection (XSS) | Student & Employee Notice Board | `<script>alert(document.cookie)</script>`, `<img onerror=...>` | Context-Aware HTML Entity Encoding (`htmlspecialchars`) & CSP |
| **3** | **Parameter Tampering & IDOR** | A01:2021 - Broken Access Control | E-Commerce Store & Payroll API | URL `?id=10` / `?emp_id=999`, Form POST `"price": 10` | Server-Side State Validation & Session Authorization Checks |
| **4** | **Password Guessing** | A07:2021 - Identification & Auth Failures | Corporate Employee Login | Automated Dictionary Attack (`admin123`, `welcome`) | Account Lockout (5 tries), 1.5s Rate Limiting, & CAPTCHA Challenge |
| **5** | **OS Command Injection (RCE)** | A03:2021 - Injection (Command Injection) | Server Ping Diagnostic Tool | `8.8.8.8; cat /etc/passwd`, `8.8.8.8; whoami` | Strict IP Format Validation (`FILTER_VALIDATE_IP`) & Escaping |

---

## 🛠️ Tech Stack

- **Frontend Framework**: React 19 + TypeScript
- **Build Tooling**: Vite 8
- **Styling**: Tailwind CSS v4 + Custom Cyber Glassmorphic Design
- **Icons**: Lucide React
- **Visual Effects**: Canvas Confetti
- **Architecture**: Simulated In-Memory Database & Live Server Request Interceptor (Zero external database required—runs out of the box on any system!)

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

## 🎓 Viva Presentation & Testing Walkthrough Guide

### Step 1: Generate Viva Lab Report
1. Click **Viva Report** in the top navigation bar.
2. Fill in your Name, Registration Number, and Course Code.
3. Click **Print / Save as PDF** to generate an official laboratory record with Faculty Sign-Off block.

### Step 2: Test HTTP Interceptor via Burp Proxy
1. Click **Burp Proxy** in the top navigation bar.
2. Modify the request body inline (e.g. change `"price": 85000` to `"price": 10`).
3. Click **Forward Tampered HTTP Request** to inspect server response headers (`Content-Security-Policy`, `HSTS`, `X-Frame-Options`).

### Step 3: Audit Security Headers
1. Click **Headers Audit** in the top navigation bar.
2. In **Vulnerable Mode 🔴**, observe Grade F (0/5 Security Headers).
3. Toggle to **Secure Mode 🟢** and observe Grade A+ (5/5 Hardened Security Headers).

### Step 4: Explore Attack Payload Library
1. Click **Payloads** in the top navigation bar.
2. Browse 20+ attack strings across SQLi, XSS, Parameter Tampering, Command Injection, and Path Traversal with 1-tap copy.

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
