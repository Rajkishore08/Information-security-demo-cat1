# 🛒 CYBERMART: SECURITY VULNERABILITY DEMONSTRATION & MITIGATION PLATFORM
> **CS401 - Information Security Laboratory (CAT 1) Master Documentation**  
> **Department**: Department of Computer Science & Engineering  
> **GitHub Repository**: [https://github.com/Rajkishore08/Information-security-demo-cat1.git](https://github.com/Rajkishore08/Information-security-demo-cat1.git)  
> **Presentation Deck**: [PPT_PRESENTATION_SLIDES.md](file:///Users/rajkishores/Sem%209/Information%20Security%20Lab/CAT%201/PPT_PRESENTATION_SLIDES.md) | **Academic Master Report**: [PROJECT_DOCUMENTATION.md](file:///Users/rajkishores/Sem%209/Information%20Security%20Lab/CAT%201/PROJECT_DOCUMENTATION.md)

---

## 📑 TABLE OF CONTENTS
1. [Abstract & Project Overview](#-1-abstract--project-overview)
2. [Dual Security Execution Framework](#-2-dual-security-execution-framework)
3. [System Architecture & Database Schema](#-3-system-architecture--database-schema)
4. [Vulnerability & Mitigation Deep-Dive](#-4-vulnerability--mitigation-deep-dive)
   - [Vulnerability 1: SQL Injection (SQLi)](#1-sql-injection-sqli)
   - [Vulnerability 2: Cross-Site Scripting (Stored & Reflected XSS)](#2-cross-site-scripting-stored--reflected-xss)
   - [Vulnerability 3: Parameter Tampering & Price Integrity](#3-parameter-tampering--price-integrity)
   - [Vulnerability 4: Password Guessing & Brute-Force Rate Limiting](#4-password-guessing--brute-force-rate-limiting)
   - [Vulnerability 5: URL Interpretation (IDOR)](#5-url-interpretation-idor)
   - [Vulnerability 6: IDN Homograph Phishing & Domain Spoofing](#6-idn-homograph-phishing--domain-spoofing)
   - [Vulnerability 7: OS Command Injection (RCE) & LFI Traversal](#7-os-command-injection-rce--lfi-traversal)
5. [Central Security Center & Audit Database](#-5-central-security-center--audit-database)
6. [Persistent Local JSON DB & SQLite Exporters](#-6-persistent-local-json-db--sqlite-exporters)
7. [Installation, Setup & Viva Execution Guide](#-7-installation-setup--viva-execution-guide)

---

## 📄 1. ABSTRACT & PROJECT OVERVIEW

**CyberMart** is an interactive, web-based e-commerce security laboratory application built to bridge the gap between theoretical cybersecurity concepts and practical vulnerability exploitation and defense. The application simulates a real-world online shopping platform while intentionally incorporating seven major web application security vulnerabilities.

The primary objective of CyberMart is to provide a controlled environment where students, researchers, and faculty examiners can evaluate:
- How common web application vulnerabilities occur due to improper coding practices.
- How malicious payloads exploit raw SQL queries, DOM structures, client parameters, and OS commands.
- How industry-standard security mitigations (prepared statements, HTML entity encoding, server-side database verification, rate limiting, and role-based access control) neutralize attacks.
- How security events and user actions are monitored, logged, and exported into persistent audit databases.

---

## 🔴 2. DUAL SECURITY EXECUTION FRAMEWORK

CyberMart features a dynamic **Dual Security Execution Engine**:

| Execution Mode | Behavior & Architecture | Visual Badge |
|---|---|---|
| **Vulnerable Mode 🔴** | Executes intentionally insecure logic (raw string concatenation, unvalidated client parameters, unthrottled authentication, unescaped DOM rendering, and direct OS command calls). | `Vulnerable Mode 🔴` |
| **Patched Mode 🟢** | Applies industry-standard security controls (parameterized prepared statements, server-side database price lookup, 30-second lockout timeouts, context-aware `htmlspecialchars()`, and input validation filters). | `Secure Mode 🟢` |

Users can instantly switch between Vulnerable Mode and Patched Mode globally via the header toggle or individually per security control in the **Central Security Center Dashboard (`/admin`)**.

---

## 🏗️ 3. SYSTEM ARCHITECTURE & DATABASE SCHEMA

### System Block Diagram

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
                  │  - actions_audit (id, payload, mode)    │
                  └─────────────────────────────────────────┘
```

### Database Tables Schema (`lab.db` / `lab_db.json`)

#### 1. `users` Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'Customer',
  balance REAL NOT NULL DEFAULT 0.00
);
```

#### 2. `products` Table
```sql
CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price REAL NOT NULL,
  stock INTEGER NOT NULL DEFAULT 100,
  image_url TEXT
);
```

#### 3. `events` Table
```sql
CREATE TABLE events (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  category TEXT NOT NULL,
  level TEXT NOT NULL,
  message TEXT NOT NULL,
  code_snippet TEXT
);
```

#### 4. `actions_audit` Table
```sql
CREATE TABLE actions_audit (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  module TEXT NOT NULL,
  action_type TEXT NOT NULL,
  payload TEXT,
  execution_mode TEXT NOT NULL,
  status TEXT NOT NULL,
  details TEXT
);
```

---

## 🧪 4. VULNERABILITY & MITIGATION DEEP-DIVE

### 1. SQL Injection (SQLi)

- **OWASP Category**: OWASP A03:2021 – Injection
- **Attack Mechanism**: Occurs when unvalidated user input is directly concatenated into a dynamic SQL query string. The attacker injects SQL syntax fragments (e.g., `' OR '1'='1`) to alter the query logic tree and bypass authentication.
- **Attack Payload**: `' OR '1'='1`
- **Security Impact**: Unauthorized authentication bypass, exposure of full database tables (`users`, `credit_cards`), data alteration, or total administrative takeover.

#### Vulnerable Implementation (PHP/MySQL)
```php
// ❌ VULNERABLE: Direct string concatenation of raw user input
$username = $_POST['username'];
$password = $_POST['password'];

// Malicious input: ' OR '1'='1
// Resulting Query: SELECT * FROM users WHERE username = '' OR '1'='1' AND password = ''
$sql = "SELECT * FROM users WHERE username = '$username' AND password = '$password'";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $_SESSION['user'] = $result->fetch_assoc()['username']; // Bypasses auth as Admin!
}
```

#### Patched Security Control (Parameterized Prepared Statements)
```php
// 🟢 SECURE: Prepared statement separates SQL code logic from data
$stmt = $conn->prepare("SELECT id, username, role, balance FROM users WHERE username = ? AND password = ?");

// Input parameters bound strictly as literal string scalars (type 's')
$stmt->bind_param("ss", $username, $password);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    $_SESSION['user'] = $row['username'];
} else {
    die("Invalid credentials!");
}
```

---

### 2. Cross-Site Scripting (Stored & Reflected XSS)

- **OWASP Category**: OWASP A03:2021 – Injection (Cross-Site Scripting)
- **Attack Mechanism**: Occurs when user input (such as customer reviews or search parameters) is stored in the database or reflected directly into the HTML document object model (DOM) without sanitization or escaping.
- **Attack Payload**: `<script>alert("Cookie Stealer: " + document.cookie)</script>` or `<img src=x onerror="alert('XSS Executed!')">`
- **Security Impact**: Session hijacking via stolen HTTP cookies, DOM defacement, phishing redirects, or unauthorized actions performed on behalf of victim users.

#### Vulnerable Implementation (PHP/HTML)
```php
// ❌ VULNERABLE: Outputting unsanitized database content directly into HTML DOM
$review = $_POST['review_comment'];

// Direct DB insert without sanitization
$conn->query("INSERT INTO reviews (comment) VALUES ('$review')");

// Rendering in web browser DOM:
echo "<div className='comment'>" . $row['comment'] . "</div>"; // Executes injected <script>!
```

#### Patched Security Control (Context-Aware HTML Entity Encoding)
```php
// 🟢 SECURE: Context-aware HTML entity encoding converts special characters to harmless text
$review = $_POST['review_comment'];

// Convert < > ' " & to HTML entities (&lt;, &gt;, &quot;, &#039;, &amp;)
$sanitized_review = htmlspecialchars($review, ENT_QUOTES, 'UTF-8');

// Insert sanitized string into database
$stmt = $conn->prepare("INSERT INTO reviews (comment) VALUES (?)");
$stmt->bind_param("s", $sanitized_review);
$stmt->execute();

// Safe DOM echo
echo "<div className='comment'>" . htmlspecialchars($row['comment'], ENT_QUOTES, 'UTF-8') . "</div>";
```

---

### 3. Parameter Tampering & Price Integrity

- **OWASP Category**: OWASP A04:2021 – Insecure Design / Parameter Tampering
- **Attack Mechanism**: The application relies on client-side HTML input values (or hidden form fields) to calculate total order billing prices during checkout. Attackers modify the `price` parameter in the browser DOM (e.g., changing ₹3,499 → ₹1).
- **Attack Payload**: Client-side form modification: `<input name="price" value="1">` (Tampering ₹85,000 Alienware Laptop → ₹0)
- **Security Impact**: Financial fraud, purchasing items at arbitrary low prices, and loss of e-commerce revenue.

#### Vulnerable Implementation (PHP)
```php
// ❌ VULNERABLE: Blindly trusting price submitted from client POST body
$product_id = $_POST['product_id'];
$price = floatval($_POST['price']); // Trusting client input ₹1 instead of DB price!
$quantity = intval($_POST['quantity']);

$total_charge = $price * $quantity;
process_credit_card_payment($total_charge); // Billed ₹1 for ₹3,499 Smartphone!
```

#### Patched Security Control (Server-Side Database Price Validation)
```php
// 🟢 SECURE: Server ignores client price and fetches authoritative price from SQLite lab.db
$product_id = intval($_POST['product_id']);
$quantity = intval($_POST['quantity']);

// Query authoritative product record from DB
$stmt = $conn->prepare("SELECT price, stock FROM products WHERE id = ?");
$stmt->bind_param("i", $product_id);
$stmt->execute();
$db_product = $stmt->get_result()->fetch_assoc();

// Calculate total using server-verified DB price
$authoritative_price = $db_product['price'];
$total_charge = $authoritative_price * $quantity;

process_credit_card_payment($total_charge); // Correctly billed ₹3,499
```

---

### 4. Password Guessing & Brute-Force Rate Limiting

- **OWASP Category**: OWASP A07:2021 – Identification & Authentication Failures
- **Attack Mechanism**: Automated bot scripts attempt dictionary wordlists against authentication endpoints without rate limiting or lockout controls.
- **Attack Payload Sequence**:
  - Attempt #1: `'admin123'` → ❌ Fail
  - Attempt #2: `'password'` → ❌ Fail
  - Attempt #3: `'123456'` → ❌ Fail (Triggers CAPTCHA prompt)
  - Attempt #4: `'qwerty'` → ❌ Fail
  - Attempt #5: `'letmein'` → ❌ Fail (**Triggers 30-Second Account Lockout Cooldown Timeout!**)
  - *30-Second Cooldown Timeout*: All attempts blocked (`30s` → `0s` countdown timer)
  - Attempt #6: **`'welcome'`** → ✅ **AUTHENTICATED!**
- **Security Impact**: Account takeover via automated dictionary guessing.

#### Vulnerable Implementation (PHP)
```php
// ❌ VULNERABLE: No login attempt tracking, rate limits, or lockout rules
$username = $_POST['username'];
$password = $_POST['password'];

if (check_login($username, $password)) {
    login_user($username);
} else {
    echo "Invalid password"; // Allows infinite automated retries!
}
```

#### Patched Security Control (Rate Limiting, CAPTCHA & 30s Lockout Cooldown)
```php
// 🟢 SECURE: Multi-layered authentication throttling & 30-second lockout timer
$username = $_POST['username'];
$password = $_POST['password'];

// 1. Check if account is locked out
$user_stmt = $conn->prepare("SELECT failed_attempts, lockout_until FROM users WHERE username = ?");
$user_stmt->bind_param("s", $username);
$user_stmt->execute();
$user_data = $user_stmt->get_result()->fetch_assoc();

if ($user_data['lockout_until'] > time()) {
    $remaining_seconds = $user_data['lockout_until'] - time();
    http_response_code(429);
    die("🔒 429 TOO MANY REQUESTS: Account locked for 30s. Try again in $remaining_seconds seconds.");
}

// 2. Process login
if (!check_login($username, $password)) {
    $new_failed = $user_data['failed_attempts'] + 1;
    if ($new_failed >= 5) {
        $lockout_until = time() + 30; // 30-second lockout timer!
        $conn->query("UPDATE users SET failed_attempts = $new_failed, lockout_until = $lockout_until WHERE username = '$username'");
        die("🔒 ACCOUNT LOCKED OUT for 30 seconds!");
    } else {
        $conn->query("UPDATE users SET failed_attempts = $new_failed WHERE username = '$username'");
    }
} else {
    // Reset counter on successful login
    $conn->query("UPDATE users SET failed_attempts = 0, lockout_until = 0 WHERE username = '$username'");
    login_user($username);
}
```

---

### 5. URL Interpretation (IDOR)

- **OWASP Category**: OWASP A01:2021 – Broken Access Control (Insecure Direct Object Reference)
- **Attack Mechanism**: Occurs when an application exposes direct database object identifiers in URL parameters (e.g., `?secret_id=999` or `?role=Developer`) without server-side authorization checks verifying user session privileges.
- **Attack Payload**: Manipulating URL parameters: `http://localhost:5173/api/secrets?secret_id=999&role=Developer`
- **Security Impact**: Exposure of confidential records, administrative vouchers, customer PII, and financial data to unauthorized lower-privileged users.

#### Vulnerable Implementation (PHP)
```php
// ❌ VULNERABLE: Direct DB lookup using GET parameter without session role verification
$secret_id = $_GET['secret_id']; // Parameter manipulated by attacker

// Fetches secret record directly from DB without checking user session role!
$result = $conn->query("SELECT * FROM secrets WHERE id = $secret_id");
echo json_encode($result->fetch_assoc()); // Exposes restricted secret #999!
```

#### Patched Security Control (Server-Side Session & Role Authorization Filter)
```php
// 🟢 SECURE: Enforcing server-side session authentication & role checks
session_start();

$secret_id = intval($_GET['secret_id']);
$user_role = $_SESSION['user_role'] ?? 'Guest';

$stmt = $conn->prepare("SELECT id, title, content, is_confidential FROM secrets WHERE id = ?");
$stmt->bind_param("i", $secret_id);
$stmt->execute();
$secret = $stmt->get_result()->fetch_assoc();

if ($secret['is_confidential'] && $user_role !== 'CTO Admin') {
    http_response_code(403);
    die("🔒 403 FORBIDDEN: User role '$user_role' is not authorized to access confidential secret #$secret_id.");
}

echo json_encode($secret);
```

---

### 6. IDN Homograph Phishing & Domain Spoofing

- **OWASP Category**: OWASP A07:2021 – Identification & Authentication Failures (Social Engineering)
- **Attack Mechanism**: Attackers register domain names containing internationalized non-Latin characters (such as Cyrillic 'е' U+0435) that look visually identical to ASCII Latin letters in common web browser fonts.
- **Spoofed URL**: `http://cybеrmart.com/verify` (Cyrillic 'е') vs Genuine `http://cybermart.com/verify`
- **ASCII Punycode Representation**: `http://xn--cybmart-9ya.com/verify`
- **Security Impact**: Users are tricked into visiting spoofed phishing domains where their account credentials (emails, passwords) are harvested.

#### Vulnerable Implementation (PHP)
```php
// ❌ VULNERABLE: Direct HTTP redirect without checking domain script origin
$redirect_url = $_GET['redirect_url'];

// Redirects user directly to spoofed Cyrillic domain link without inspection!
header("Location: " . $redirect_url);
```

#### Patched Security Control (Mixed-Script Cyrillic Detection & Punycode Warning)
```php
// 🟢 SECURE: Detecting internationalized mixed-script domain names & Punycode conversion
$domain = parse_url($_GET['redirect_url'], PHP_URL_HOST);

// Convert IDN domain to ASCII Punycode
$punycode_domain = idn_to_ascii($domain, IDNA_DEFAULT, INTL_IDNA_VARIANT_UTS46);

if (mb_detect_mixed_scripts($domain) || str_starts_with($punycode_domain, 'xn--')) {
    // Show security warning banner and display Punycode domain to user
    render_phishing_warning_screen($domain, $punycode_domain);
    exit();
}
```

---

### 7. OS Command Injection (RCE) & LFI Traversal

- **OWASP Category**: OWASP A03:2021 – Injection (OS Command Injection & Path Traversal)
- **Attack Mechanism**: System diagnostic tools concatenate unvalidated input directly into OS shell commands (e.g., `shell_exec("ping -c 2 " . $ip)`).
- **Attack Payload**: `8.8.8.8; cat /etc/passwd` or LFI parameter `../../../../../../etc/passwd`
- **Security Impact**: Remote Code Execution (RCE), full system compromise, reading sensitive OS configuration files.

#### Vulnerable Implementation (PHP)
```php
// ❌ VULNERABLE: Direct OS shell execution
$ip = $_POST['ip']; // Input: 8.8.8.8; cat /etc/passwd
$output = shell_exec("ping -c 2 " . $ip);
echo "<pre>$output</pre>";
```

#### Patched Security Control (IP Validation & Path Sanitization)
```php
// 🟢 SECURE: Validate input format using filter_var() and escapeshellarg()
$ip = $_POST['ip'];

if (!filter_var($ip, FILTER_VALIDATE_IP)) {
    die("Invalid IP address format!");
}

$safe_ip = escapeshellarg($ip);
$output = shell_exec("ping -c 2 " . $safe_ip);
echo "<pre>" . htmlspecialchars($output, ENT_QUOTES, 'UTF-8') . "</pre>";
```

---

## 🛡️ 5. CENTRAL SECURITY CENTER & AUDIT DATABASE

The **Central Security Center Dashboard (`/admin`)** provides an active command & control interface:

### 1. Dynamic Security Controls Matrix
Demonstrators can independently toggle each security control between **VULNERABLE 🔴** and **PATCHED 🟢**:
- Prepared Statements (SQLi)
- Account Lockout (30s Cooldown)
- Server Price Integrity Validation
- IDN Homograph Punycode Detector
- Context-Aware HTML Entity Encoding (XSS)
- Input Filter Validation (RCE / LFI)

### 2. Live Security Scorecard
Tracks application security posture in real time from **0% (All Controls Vulnerable)** to **100% (All Controls Patched)**.

### 3. Real-Time `events` Audit Table
Logs every security event with full metadata:
- **Timestamp**: `YYYY-MM-DD HH:MM:SS.ms`
- **Category**: `SQLi`, `XSS`, `PRICE_TAMPERING`, `AUTH_DEFENSE`, `IDOR`, `IDN_HOMOGRAPH`
- **Level**: `VULN 🔴`, `SECURE 🟢`, `EXPLOIT ⚡`, `WARN ⚠️`
- **Code Snippet**: PHP/MySQL query trace or DOM payload string.

---

## 💾 6. PERSISTENT LOCAL JSON DB & SQLITE EXPORTERS

CyberMart features persistent storage via `src/services/dbStorage.ts`:

- **Automatic Persistence**: All app settings, security mode toggles, request logs, orders, and action logs are saved to `localStorage` key `'lab_db_json_store'`.
- **Export `lab_db.json` 📥**: One-click download button in the bottom terminal header to download the complete JSON database file.
- **Export SQLite `lab.db` (`lab_actions_audit.sql`) 🗄️**: Downloads a standard `.sql` database script containing full DDL schemas (`CREATE TABLE actions_audit`) and `INSERT INTO` statements for SQLite3 / MySQL databases.

---

## ⚙️ 7. INSTALLATION, SETUP & VIVA EXECUTION GUIDE

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)

### Setup Commands
```bash
# 1. Clone the repository
git clone https://github.com/Rajkishore08/Information-security-demo-cat1.git

# 2. Navigate to project directory
cd Information-security-demo-cat1

# 3. Install dependencies
npm install

# 4. Start local development server
npm run dev
```

Open your browser and navigate to `http://localhost:5173/`.

### Step-by-Step Viva Execution Workflow
1. Navigate to **Tab 1 (SQL Injection)**: Enter payload `' OR '1'='1` in Vulnerable Mode 🔴 to bypass authentication. Switch to Secure Mode 🟢 to observe prepared statements blocking the attack.
2. Navigate to **Tab 3 (Parameter Tampering)**: Select Smartphone (₹3,499), change the price parameter input box to `1`, and click Checkout. Observe billing ₹1 in Vulnerable Mode vs ₹3,499 in Secure Mode.
3. Navigate to **Tab 4 (Password Guessing)**: Click **Start Dictionary Attack**. Attempts #1 through #5 fail. On the 5th failed attempt in Secure Mode, observe the **30-Second Account Lockout Cooldown Timeout** (`30s` countdown timer). Once expired, Attempt #6 (`'welcome'`) succeeds!
4. Navigate to **Tab 5 (URL Interpretation / IDOR)**: Test `?secret_id=999` with role `Developer`. Observe exposed confidential record in Vulnerable Mode vs `403 Forbidden` in Secure Mode.
5. Navigate to **Tab 6 (Phishing & IDN Homograph)**: Click `http://cybеrmart.com/verify`. Observe redirect in Vulnerable Mode vs `⚠ SECURITY WARNING` and Punycode (`xn--cybmart-9ya.com`) in Secure Mode.
6. Open **Terminal Drawer**: Click **Export SQLite lab.db 🗄️** or **Export lab_db.json 📥** to download the complete action audit database file.
7. Click **Viva Report**: Enter Student Name and Registration Number, then click **Print / Save as PDF** to generate an official laboratory evaluation record.
