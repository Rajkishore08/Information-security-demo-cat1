# 📊 CYBERMART: SECURITY VULNERABILITY DEMONSTRATION & MITIGATION PLATFORM
> **10 PowerPoint Presentation Slides Deck**  
> **Course**: CS401 - Information Security Laboratory (CAT 1)  
> **Department**: Department of Computer Science & Engineering  
> **GitHub Repository**: [https://github.com/Rajkishore08/Information-security-demo-cat1.git](https://github.com/Rajkishore08/Information-security-demo-cat1.git)

---

## 🎬 SLIDE 1: TITLE SLIDE

### Title
**CYBERMART: SECURITY VULNERABILITY DEMONSTRATION & MITIGATION PLATFORM**

### Subtitle
*An Interactive Educational Web Security Laboratory & Mitigation Platform*

### Project Details
- **Course**: CS401 - Information Security Laboratory (CAT 1)
- **Department**: Department of Computer Science & Engineering
- **Target Application**: CyberMart E-Commerce Security Laboratory
- **Database Engine**: Persistent In-Memory SQLite `lab.db` & Local JSON DB (`lab_db.json`)
- **GitHub Repository**: `https://github.com/Rajkishore08/Information-security-demo-cat1.git`

---

## 📄 SLIDE 2: INTRODUCTION & PROJECT OVERVIEW

### Project Concept
An interactive, web-based security laboratory simulating a real-world online shopping platform while embedding six major web application security vulnerabilities.

### Key Features
- **Dual Execution Engine**: Instant switching between **Vulnerable Mode 🔴** and **Patched Mode 🟢**.
- **Central Security Center**: Live **Security Scorecard (0% → 100%)** and real-time `events` audit log table.
- **7 Dedicated Experiment Tabs**: SQLi, XSS, Parameter Tampering, Brute-Force, IDOR, IDN Homograph Phishing, and Full Application Sandbox.
- **Local JSON DB (`lab_db.json`)**: Persistent storage for logs, orders, and events with 1-click JSON export.

---

## 🎯 SLIDE 3: PROBLEM DEFINITION & THREAT LANDSCAPE

### Threat Landscape
Modern web applications suffer from security oversights due to reliance on insecure client-side parameters, dynamic query concatenation, and missing authorization checks.

### 6 Primary Threat Vectors Demonstrated
1. **SQL Injection (SQLi)**: Dynamic string query concatenation (`SELECT * FROM users WHERE username='$user'`).
2. **Brute-Force Attacks**: Unrestricted authentication endpoints allowing automated login guessing.
3. **Parameter Tampering**: Client-side price modifications trusted by backend checkout engines.
4. **URL Interpretation (IDOR)**: Insecure Direct Object References (`?secret_id=999`) accessible without authorization.
5. **IDN Homograph Phishing**: Mixed-script Cyrillic domain spoofing (`cybеrmart.com`) deceiving users.
6. **Stored XSS & LFI**: Unsanitized DOM rendering (`<script>`) and unsafe path inclusion (`../../etc/passwd`).

---

## 🏗️ SLIDE 4: SYSTEM ARCHITECTURE & DATA FLOW

### System Architecture Diagram

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
- **Frontend**: React 19, TypeScript 6.0, Vite 8, Tailwind CSS v4, Lucide Icons
- **Database Engine**: In-Memory SQLite3 (`lab.db`) & Local JSON Storage (`lab_db.json`)

---

## ⚡ SLIDE 5: EXPERIMENTS 1 & 2: SQL INJECTION & BRUTE FORCE

### Experiment 1: SQL Injection (SQLi)
- **Vulnerable Implementation**:
  ```php
  $sql = "SELECT * FROM users WHERE username = '$username' AND password = '$password'";
  ```
- **Exploit Payload**: `' OR '1'='1` (Bypasses authentication as System Administrator).
- **Patched Security Control**:
  ```php
  $stmt = $conn->prepare("SELECT id, username, role FROM users WHERE username = ? AND password = ?");
  $stmt->bind_param("ss", $username, $password);
  ```

### Experiment 2: Brute Force & Rate Limiting
- **Vulnerable Implementation**: Unlimited authentication attempts without throttling.
- **Patched Security Control**: 3-failed-attempt threshold triggering a mandatory **30-second Account Lockout cooldown**.

---

## 🛒 SLIDE 6: EXPERIMENTS 3 & 4: PARAMETER TAMPERING & IDOR

### Experiment 3: Parameter Tampering & Price Validation
- **Vulnerable Implementation**: `$total = $_POST['price'] * $_POST['quantity'];` (Accepts client-submitted price ₹1 for ₹3,499 item).
- **Patched Security Control**: Server retrieves authoritative price from SQLite `products` table (`$db_price = $stmt->get_result()['price']`).

### Experiment 4: URL Interpretation (IDOR - Insecure Direct Object Reference)
- **Vulnerable Implementation**: `SELECT * FROM secrets WHERE id = $_GET['secret_id'];` (No session role check).
- **Patched Security Control**: `if ($secret['is_confidential'] && $_SESSION['role'] !== 'CTO Admin') die("403 Forbidden");`

---

## 🎣 SLIDE 7: EXPERIMENTS 5 & 6: IDN HOMOGRAPH & STORED XSS

### Experiment 5: IDN Homograph Phishing
- **Spoofed Domain**: `http://cybеrmart.com` (Using Cyrillic 'е' U+0435 visually identical to Latin 'e').
- **Patched Security Control**: Mixed-script domain inspection displaying **⚠ SECURITY WARNING** and ASCII Punycode (`xn--cybmart-9ya.com`).

### Experiment 6: Stored Cross-Site Scripting (XSS)
- **Vulnerable Implementation**: `<div><?php echo $_POST['review']; ?></div>` (Payload: `<script>alert(document.cookie)</script>`).
- **Patched Security Control**: Context-aware `htmlspecialchars($_POST['review'], ENT_QUOTES, 'UTF-8')` HTML entity encoding.

---

## 🛡️ SLIDE 8: CENTRAL SECURITY CENTER & EVENT LOG AUDIT

### Security Control Matrix
Independent **VULNERABLE 🔴** and **PATCHED 🟢** toggles for all 6 security controls:
1. SQL Injection (Prepared Statements)
2. Brute Force Protection (30s Lockout)
3. Parameter Tampering (SQLite Validation)
4. IDN Homograph Phishing (Punycode Alert)
5. Stored XSS (Entity Encoding)
6. LFI & RCE Filtering (`basename()`)

### Dashboard Metrics
- **Dynamic Security Scorecard**: Live percentage counter tracking system posture (0% → 100%).
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

### Viva Lab Evaluation Report
Automated printable PDF lab report complete with Student Registration Details, Experiment Matrix, and Faculty Examiner Signature block.

---

## 📝 SLIDE 10: CONCLUSION & FUTURE ENHANCEMENTS

### Key Achievements
- Constructed a full-scale, interactive web security laboratory application for viva demonstrations.
- Successfully demonstrated exploitation and mitigation for 6 OWASP Top 10 vulnerability categories.
- Implemented persistent local JSON storage (`lab_db.json`), live request logging terminal, and interactive Burp proxy simulator.

### Future Roadmap
1. Integrating WebAuthn / FIDO2 hardware USB security key authentication.
2. Adding static application security testing (SAST) automated vulnerability scanners.
3. Containerizing the environment with Docker for remote cloud hosting.
