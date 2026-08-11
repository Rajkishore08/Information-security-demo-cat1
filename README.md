# 🛡️ CyberSec Vulnerability Lab & Educational Simulator
> **Information Security Lab (CAT 1) Project & Viva Presentation Suite**

An interactive, presentation-ready educational web application built to demonstrate major web application security vulnerabilities, attack vectors, live execution traces, side-by-side PHP/MySQL code diffs, and secure defense mechanisms.

Designed for college laboratory evaluations, viva examinations, and cybersecurity demonstrations.

---

## 🌟 Software Firm Vault Target Application (Module 5)

Module 5 features a real-time **ApexSoft Developer Credential & Secrets Vault** software firm application:

- **🔑 Secrets & API Key Manager**: Query internal API keys, PostgreSQL credentials, AWS keys, and restricted CTO Master Vault tokens (SQLi & IDOR Secret Lookup `?secret_id=999`).
- **🔐 Engineer Auth Portal**: Login gateway supporting SQL Injection bypass (`' OR '1'='1`) and password guessing attacks.
- **📢 Developer Board & Audit Logs**: Real-time team announcement feed demonstrating Stored XSS (`<script>alert(document.cookie)</script>`).
- **📜 Software License Procurement**: License purchasing module demonstrating Parameter Tampering (Tampering SAST Suite from ₹1,20,000 to ₹10).
- **🖥️ Server Diagnostics & Log Viewer**: Internal system tools demonstrating Local File Inclusion (LFI `?file=../../../../etc/passwd`) and OS Command Injection (`8.8.8.8; cat /etc/passwd`).
- **↗️ Standalone Window Launcher**: Dedicated, distraction-free target window sandbox.

---

## 🚀 Covered Security Vulnerabilities & Lab Tools

- **🔴 Vulnerable Mode vs. 🟢 Secure Mode Toggle**: Instant global mode switcher modifying server queries, sanitization, authorization, and rate limits in real time.
- **📄 Printable Viva Lab Report Generator (PDF / HTML)**: One-click formatted laboratory evaluation report complete with Student Registration details, experiment audit table, OWASP defense matrix, and Faculty Signature sign-off block.
- **🪟 Burp Suite / OWASP ZAP HTTP Proxy Inspector ("CyberProxy")**: Interactive proxy modal to capture, inspect, and modify HTTP POST/GET request payloads (`price=10`) inline before sending to server, and view live response security headers (`Content-Security-Policy`, `HSTS`, `X-Frame-Options`).
- **🎯 20+ Attack Payload Library**: Curated attack strings categorized across SQLi, XSS, Parameter Tampering, Command Injection, and Path Traversal with 1-tap copy and explanation tooltips.
- **🛡️ Live Security Headers Auditor & CSP Analyzer**: Real-time HTTP header audit scorecard comparing Vulnerable Mode (Grade: F - Missing Headers) vs. Secure Mode (Grade: A+ - Hardened Headers).
- **🎉 Interactive Confetti & Visual Flash Cues**: Audio and visual feedback effects triggering upon exploit confirmation or defense activation.

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
