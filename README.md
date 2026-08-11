# 🛡️ CyberSec Vulnerability Lab & Educational Simulator
> **Information Security Lab (CAT 1) Project & Viva Presentation Suite**

An interactive, presentation-ready educational web application built to demonstrate major web application security vulnerabilities, attack vectors, live execution traces, side-by-side PHP/MySQL code diffs, and secure defense mechanisms.

Designed for college laboratory evaluations, viva examinations, and cybersecurity demonstrations.

---

## 🌟 Key Features & Student Project Use-Cases

### 🎓 Interactive Student Project Title Selector & Standalone Target Window
Allows switching between real-time target applications tailored to specific student project titles and roll numbers:

1. **Smart Airline Booking & Security Portal ("SkyWings Airlines")**
   - **Student**: Aakash B (Roll No: `7176 22 31 001`)
   - **Concepts Implemented**: SQL Injection (Flight Search), Parameter Tampering (First Class Ticket ₹18,000 → ₹100), Phishing Link Generator, IDN Homograph Cyrillic Domain Spoofing (`skуwings.com` vs `skywings.com`), Passenger Review XSS.
2. **SecureBank Core Banking Portal ("SecureBank")**
   - **Student**: Anugraha VS (Roll No: `7176 22 31 003`)
   - **Concepts Implemented**: SQL Injection (Login Auth Bypass `' OR '1'='1`), Parameter Tampering, URL Interpretation / IDOR (`?account_id=999` VIP Vault), Response Timing Attack Analyzer (ms delay comparison), Password Brute Force.
3. **SaaS Subscription Portal ("CloudSaaS Suite")**
   - **Student**: Avanthika PG (Roll No: `7176 22 31 008`)
   - **Concepts Implemented**: SQL Injection (Plan Lookup), Password Guessing (Tenant Admin Login), Support Desk XSS, Parameter Tampering (Enterprise Plan ₹0 upgrade), Subscription Phishing.
4. **Cloud Vault Application ("CyberVault Drive")**
   - **Student**: Student Project 010 (Roll No: `7176 22 31 010`)
   - **Concepts Implemented**: SQL Injection (Directory Search), Cross-Site Scripting (Shared Note), Parameter Tampering (`access_level=9` Root Vault), Local File Inclusion (LFI `?file=../../../../etc/passwd`), Password Guessing.

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
