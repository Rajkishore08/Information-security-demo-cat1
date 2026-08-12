# 📊 CYBERMART: SECURITY VULNERABILITY DEMONSTRATION & MITIGATION PLATFORM
> **10-Slide PowerPoint Presentation Deck & Viva Demonstration Guide**  
> **Course**: CS401 - Information Security Laboratory (CAT 1)  
> **Department**: Department of Computer Science & Engineering  
> **GitHub Repository**: [https://github.com/Rajkishore08/Information-security-demo-cat1.git](https://github.com/Rajkishore08/Information-security-demo-cat1.git)

---

## 🎬 SLIDE 1: TITLE SLIDE

### Title
**CYBERMART: SECURITY VULNERABILITY DEMONSTRATION & MITIGATION PLATFORM**

### Subtitle
*An Interactive Educational Web Laboratory & Security Control Evaluation Suite*

### Presenter & Project Information
- **Course**: Information Security Laboratory (CAT 1)
- **Department**: Department of Computer Science & Engineering
- **Student Name**: [Your Name]
- **Register Number**: [Your Roll / Reg No]
- **Target Application**: CyberMart E-Commerce Security Laboratory
- **Database Engine**: Persistent In-Memory SQLite `lab.db`
- **GitHub Code Repository**: `https://github.com/Rajkishore08/Information-security-demo-cat1.git`

---

## 📄 SLIDE 2: INTRODUCTION & PROJECT OVERVIEW

### Core Objective
To provide a hands-on, real-time web application security laboratory that contrasts vulnerable dynamic logic with industry-standard secure coding controls across 6 major OWASP Top 10 vulnerabilities.

### Key Innovations
- **Dual Execution Engine**: Instant toggling between **Vulnerable Mode 🔴** and **Patched Mode 🟢**.
- **Central Security Center**: Live **Security Scorecard (0% → 100%)** and timestamped `events` audit table logging.
- **7 Modular Labs**: Dedicated test benches for SQLi, XSS, Parameter Tampering, Brute-Force, IDOR, IDN Homograph Phishing, and Full Application Sandbox.
- **Persistent Local JSON DB (`lab_db.json`)**: Automatic saving of app state, logs, orders, and security events with 1-click JSON export.

---

## 🎯 SLIDE 3: PROBLEM DEFINITION & THREAT LANDSCAPE

### The Academic & Industrial Challenge
Traditional web security instruction relies heavily on abstract textbook theory. Students lack empirical experience seeing how exploits manipulate memory/database syntax or how specific code patches neutralize attacks.

### 6 Primary Web Application Threat Vectors
1. **SQL Injection (SQLi)**: Raw user input concatenated into dynamic SQL strings (`SELECT * FROM users WHERE username='$user'`).
2. **Brute-Force Attacks**: Unthrottled authentication endpoints vulnerable to automated credential stuffing.
3. **Parameter Tampering**: Client-side price modifications trusted by insecure backend checkout engines.
4. **URL Interpretation (IDOR)**: Direct Object References (`?secret_id=999`) accessible without server authorization.
5. **IDN Homograph Phishing**: Mixed-script Cyrillic domain spoofing (`cybеrmart.com`) deceiving users.
6. **Stored XSS & LFI**: Unsanitized DOM rendering (`<script>`) and unsafe path inclusion (`../../etc/passwd`).

---

## 🏗️ SLIDE 4: SYSTEM ARCHITECTURE & DATA FLOW

### Architectural Framework

```
                  ┌─────────────────────────────────────────┐
                  │           USER INTERFACE (BROWSER)        │
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

### Technology Stack
- **Frontend Core**: React 19, TypeScript 6.0, Vite 8
- **UI & Styling**: Tailwind CSS v4, Glassmorphic Cyber Theme, Lucide React Icons
- **Database Engine**: In-Memory Persistent SQLite3 (`lab.db`) & Local JSON Storage (`lab_db.json`)

---

## ⚡ SLIDE 5: EXPERIMENTS 1 & 2: SQL INJECTION & BRUTE FORCE

### Experiment 1: SQL Injection (SQLi)
- **Vulnerable Code**: `$sql = "SELECT * FROM users WHERE username = '$user' AND password = '$pass'";`
- **Exploit Payload**: `' OR '1'='1` (Evaluates query `WHERE` condition to `TRUE`, bypassing auth as Admin).
- **Patched Defense**: Parameterized Prepared Statements `$stmt->bind_param("ss", $user, $pass);` treating input strictly as scalar data.

### Experiment 2: Brute Force & Rate Limiting
- **Vulnerable Code**: Unlimited authentication attempts without throttling or lockouts.
- **Patched Defense**: 3-failed-attempt threshold triggering a mandatory **30-second Account Lockout cooldown**.

---

## 🛒 SLIDE 6: EXPERIMENTS 3 & 4: PARAMETER TAMPERING & IDOR

### Experiment 3: Parameter Tampering & Price Integrity
- **Vulnerable Code**: `$total = $_POST['price'] * $_POST['quantity'];` (Accepts client-edited input ₹1 for ₹3,499 item).
- **Patched Defense**: Server retrieves authoritative price from SQLite `products` table (`$db_price = $stmt->get_result()['price']`).

### Experiment 4: URL Interpretation (IDOR - Insecure Direct Object Reference)
- **Vulnerable Code**: `SELECT * FROM secrets WHERE id = $_GET['secret_id'];` (No session role check).
- **Patched Defense**: `if ($secret['is_confidential'] && $_SESSION['role'] !== 'CTO Admin') die("403 Forbidden");`

---

## 🎣 SLIDE 7: EXPERIMENTS 5 & 6: IDN HOMOGRAPH & STORED XSS

### Experiment 5: IDN Homograph Phishing
- **Spoofed Domain**: `http://cybеrmart.com` (Using Cyrillic 'е' U+0435 visually identical to Latin 'e').
- **Patched Defense**: Mixed-script domain inspection displaying **⚠ SECURITY WARNING** and ASCII Punycode (`xn--cybmart-9ya.com`).

### Experiment 6: Stored Cross-Site Scripting (XSS)
- **Vulnerable Code**: `<div><?php echo $_POST['review']; ?></div>` (Payload: `<script>alert(document.cookie)</script>`).
- **Patched Defense**: Context-aware `htmlspecialchars($_POST['review'], ENT_QUOTES, 'UTF-8')` HTML entity encoding.

---

## 🛡️ SLIDE 8: CENTRAL SECURITY CENTER & EVENT LOG AUDIT

### Security Control Matrix
Demonstrators can independently toggle each of the 6 security controls between **VULNERABLE 🔴** and **PATCHED 🟢**:
1. SQL Injection (Prepared Statements)
2. Brute Force Protection (30s Lockout)
3. Parameter Tampering (SQLite Validation)
4. IDN Homograph Phishing (Punycode Alert)
5. Stored XSS (Entity Encoding)
6. LFI & RCE Filtering (`basename()`)

### Security Features
- **Dynamic Security Scorecard**: Live percentage counter tracking system security posture (0% → 100%).
- **Real-Time `events` Audit Table**: Timestamped log recording event type, status, and payload details.
- **Standalone Window Sandbox ↗️**: Full-screen pop-out simulation window with 100% feature parity.

---

## 🧪 SLIDE 9: DEMONSTRATION FLOW & TEST RESULTS MATRIX

### Test Case Execution Matrix

| Test ID | Feature Tested | Input Payload / Action | Vulnerable Mode Result 🔴 | Patched Mode Result 🟢 | Status |
|---|---|---|---|---|---|
| **TC-01** | SQL Injection | `' OR '1'='1` | Authenticates as Admin (Bypass) | Authentication Rejected | PASS ✅ |
| **TC-02** | Brute Force | 3 invalid logins | Unlimited retries accepted | 30s Lockout triggered | PASS ✅ |
| **TC-03** | Parameter Tampering | Submit `price = 1` | Billed ₹1 (Client price accepted) | Billed ₹3,499 (DB price enforced) | PASS ✅ |
| **TC-04** | IDOR | `?secret_id=999` | Restricted secret exposed | 403 Forbidden blocked | PASS ✅ |
| **TC-05** | IDN Homograph | Click `cybеrmart.com` | No warning displayed | ⚠ Punycode warning shown | PASS ✅ |
| **TC-06** | Stored XSS | `<script>alert(cookie)</script>` | Script executes in DOM | Encoded as text (`&lt;script&gt;`) | PASS ✅ |

### Viva Lab Report Generator
Automated printable PDF lab report complete with Student Registration Details, Experiment Matrix, and Faculty Examiner Signature block.

---

## 📝 SLIDE 10: CONCLUSION & FUTURE ENHANCEMENTS

### Key Achievements
- Built a full-scale, interactive web security laboratory application for viva demonstrations.
- Successfully demonstrated exploitation and mitigation for 6 OWASP Top 10 vulnerability categories.
- Implemented persistent local JSON storage (`lab_db.json`), live request logging terminal, and interactive Burp proxy simulator.

### Future Roadmap
1. Integrating WebAuthn / FIDO2 hardware USB security key authentication.
2. Adding static application security testing (SAST) automated vulnerability scanners.
3. Containerizing the environment with Docker for remote cloud hosting.

---

## 🎤 PRESENTER TALKING POINTS (VIVA DEMO SCRIPT)

1. **Slide 1**: *"Good morning respected faculty. Today I present CyberMart, an interactive web security laboratory built for demonstrating OWASP Top 10 vulnerabilities and secure mitigations."*
2. **Slide 5 (SQLi)**: *"Observe how in Vulnerable Mode, entering `' OR '1'='1` modifies the SQL syntax tree. When we switch to Patched Mode, prepared statements bind input out-of-band as literal string data."*
3. **Slide 6 (Parameter Tampering)**: *"In Vulnerable Mode, changing the price parameter to ₹1 allows purchasing a ₹3,499 item for ₹1. In Patched Mode, the server ignores client input and queries SQLite lab.db for the authoritative price."*
4. **Slide 8 (Security Center)**: *"The Security Center dynamically calculates our security score from 0% to 100% and logs every event with timestamps into our audit table."*
