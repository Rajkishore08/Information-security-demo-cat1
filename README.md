# 🛡️ CyberSec Vulnerability Lab & Educational Simulator
> **Information Security Lab (CAT 1) Project & Viva Presentation Suite**

An interactive, presentation-ready educational web application built to demonstrate major web application security vulnerabilities, attack vectors, live execution traces, side-by-side PHP/MySQL code diffs, and secure defense mechanisms.

Designed for college laboratory evaluations, viva examinations, and cybersecurity demonstrations.

---

## 🌟 Key Features

- **🔴 Vulnerable Mode vs. 🟢 Secure Mode Toggle**: Instant global mode switcher that modifies server-side query construction, sanitization logic, access controls, and rate limits across all modules in real time.
- **💻 Live Request Terminal & SQL Execution Logger**: Colorized drawer terminal capturing raw HTTP POST/GET requests, constructed SQL strings vs. bound prepared parameters, HTML entity encoding, and defense triggers.
- **📄 Side-by-Side Code Inspector**: Interactive modal presenting vulnerable PHP/MySQL implementations alongside secure parameterized queries, `htmlspecialchars()` encoders, and `FILTER_VALIDATE_IP` filters.
- **🎓 College Viva Flashcard Hub**: Question bank with flip-to-reveal answers covering OWASP Top 10 concepts expected during lab evaluations.
- **📱 Real-World Target App & Mobile Test Bench**: Integrated enterprise web portal ("OmniCorp Enterprise") equipped with an interactive 1-tap attack payload workbench designed for mobile screens and quick presentation testing.

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

### Step 1: SQL Injection (Module 1)
1. Ensure **🔴 Vulnerable Mode** is enabled at the top right.
2. Under **1. SQL Injection**, click the preset button **"Classic Bypass (' OR '1'='1)"**.
3. Click **Submit Authentication Request**.
4. Observe that authentication succeeds and grants **Admin Privileges**, unlocking the decrypted credit card vault.
5. Click **Code Inspector** in the header to show the examiner the unsafe dynamic query (`$sql = "SELECT ... WHERE username='$user'"`) vs. Prepared Statement (`$stmt->bind_param("ss", $user, $pass)`).
6. Switch to **🟢 Secure Mode** and resubmit. Note that prepared statement parameter binding treats the payload as a literal string value, blocking the bypass.

### Step 2: Cross-Site Scripting (XSS) (Module 2)
1. Select **2. Cross-Site Scripting (XSS)**.
2. Select the payload preset `<script>alert("Hacked! Session Cookie: " + document.cookie)</script>`.
3. Click **Submit Feedback Comment**.
4. In **Vulnerable Mode 🔴**, observe the sandboxed alert popup displaying stolen session cookies (`sess_id=abc991823_stolen_token`).
5. Switch to **Secure Mode 🟢** and submit again. Observe that characters like `<` and `>` are encoded as `&lt;` and `&gt;`, rendering safe plain text.

### Step 3: Parameter Tampering & IDOR (Module 3)
1. Select **3. Parameter Tampering**.
2. **Scenario A (IDOR)**: Change URL parameter `?id=1` to `?id=10`. In Vulnerable Mode, notice that the unlisted VIP Admin Gift Voucher (₹50,000) is accessed. In Secure Mode, the server returns `403 Forbidden`.
3. **Scenario B (Price Tampering)**: On the Alienware Laptop (listed ₹85,000), change the price input box to `10`. In Vulnerable Mode, the laptop is purchased for ₹10! In Secure Mode, the server recalculates the price using backend database records.

### Step 4: Password Guessing (Module 4)
1. Select **4. Password Guessing**.
2. Click **Start Dictionary Attack**.
3. In **Vulnerable Mode 🔴**, watch the runner rapidly try common passwords until `Attempt #4 ("welcome")` succeeds.
4. Switch to **Secure Mode 🟢** and run the attack. Observe that after 3 failed attempts, a **CAPTCHA Challenge** is triggered, a **1.5s artificial rate-limiting delay** throttles requests, and **Account Lockout** triggers after 5 failed attempts.

### Step 5: Full Unified Application & Command Injection (Module 5)
1. Select **5. Full Unified App 🚀**.
2. Expand the **Interactive Attack Test Bench** at the top.
3. Test **OS Command Injection**: Click `8.8.8.8; cat /etc/passwd` in the test bench and submit. In Vulnerable Mode, observe the server terminal output reading Linux system user files (`/etc/passwd`). In Secure Mode, IP validation filters block the command injection.

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
│   │   └── VivaFlashcardsModal.tsx
│   ├── modules/
│   │   ├── sqli/
│   │   │   ├── SqliModule.tsx
│   │   │   ├── BankingLogin.tsx
│   │   │   ├── CustomerSearch.tsx
│   │   │   └── AdminPanel.tsx
│   │   ├── xss/
│   │   │   ├── XssModule.tsx
│   │   │   ├── FeedbackForm.tsx
│   │   │   └── FeedbackSearch.tsx
│   │   ├── parameter-tampering/
│   │   │   ├── ParameterTamperingModule.tsx
│   │   │   ├── IdorShop.tsx
│   │   │   └── PriceTamperingCheckout.tsx
│   │   ├── password-guessing/
│   │   │   ├── PasswordGuessingModule.tsx
│   │   │   ├── DictionaryAttackSimulator.tsx
│   │   │   └── CaptchaModal.tsx
│   │   └── full-app/
│   │       └── FullAppModule.tsx
│   └── data/
│       └── mockData.ts
```

---

## 📝 License

This project is created for educational and laboratory evaluation purposes under the **MIT License**.
