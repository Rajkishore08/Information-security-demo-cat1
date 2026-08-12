# 🛡️ CYBERMART: SECURITY VULNERABILITY DEMONSTRATION & MITIGATION PLATFORM
> **Course**: CS401 - Information Security Laboratory (CAT 1)  
> **Department**: Department of Computer Science & Engineering  
> **Target Application**: CyberMart E-Commerce & Software Firm Security Laboratory  
> **Repository**: [https://github.com/Rajkishore08/Information-security-demo-cat1.git](https://github.com/Rajkishore08/Information-security-demo-cat1.git)

---

## 📄 1. ABSTRACT

**CyberMart** is an interactive, web-based e-commerce security laboratory application designed to bridge the gap between theoretical cybersecurity concepts and practical vulnerability exploitation and defense. The application simulates a real-world online shopping platform while intentionally incorporating major web application security vulnerabilities. 

CyberMart features a dual-mode security execution engine:
- **Vulnerable Mode 🔴**: Demonstrates flawed coding practices such as dynamic SQL string concatenation, unvalidated client-side prices, unlimited login attempts, unescaped DOM rendering, and unverified internationalized domain names.
- **Patched Mode 🟢**: Implements industry-standard security controls including parameterized prepared statements, server-side SQLite database price validation, 3-attempt account lockout cooldowns, context-aware `htmlspecialchars()` entity encoding, and Punycode homograph domain detection.

A centralized **Security Center Dashboard** allows administrators and laboratory examiners to dynamically toggle security controls, monitor live timestamped event logs in an `events` audit table, inspect side-by-side PHP/MySQL code diffs, and track a real-time **Security Scorecard (0% to 100%)**.

---

## 🎯 2. PROBLEM DEFINITION

Modern web application development frequently suffers from critical security oversights due to reliance on insecure client-side parameters, lack of input sanitization, and improper database query construction. Traditional academic security courses often present these concepts purely in theory, leaving students with limited practical insight into how vulnerabilities are actively exploited or mitigated.

Specifically, web applications face four major technical challenges:
1. **Dynamic Database Construction**: Developers concatenate raw user input directly into database queries, exposing systems to Authentication Bypass and Data Exfiltration via SQL Injection (SQLi).
2. **Unrestricted Authentication Endpoints**: Applications fail to enforce attempt thresholds or rate limiting, enabling automated botnets to perform brute-force credential-guessing attacks.
3. **Over-Trusting Client State**: E-commerce platforms trust HTTP request parameters (such as product prices or user roles) sent from the browser, allowing clients to tamper with transaction totals using browser inspector tools or HTTP proxies.
4. **Visual Domain Deception**: Users fall victim to Internationalized Domain Name (IDN) Homograph phishing attacks where visually identical Cyrillic characters trick victims into surrendering session credentials.

CyberMart directly addresses this problem by providing a safe, self-contained educational simulator where these security flaws can be exploited, analyzed, and mitigated in real time.

---

## 🚀 3. PROBLEM OBJECTIVE

The primary objectives of the CyberMart Security Laboratory project are:

1. **Demonstrate Exploitation & Defense**: To provide a practical, interactive web application demonstrating the mechanics of 6 major OWASP Top 10 vulnerabilities.
2. **Dual-State Security Comparison**: To enable side-by-side comparison between vulnerable dynamic logic and secure patched implementations.
3. **Demonstrate SQL Injection Mitigation**: To illustrate how parameterized queries (prepared statements) treat user input strictly as literal scalar data out-of-band.
4. **Implement Rate Limiting & Account Lockout**: To enforce a 3-attempt failure threshold triggering a mandatory 30-second account lockout cooldown.
5. **Enforce Server-Side Price Integrity**: To demonstrate server-side validation against authoritative SQLite `lab.db` prices, rejecting client-submitted price overrides.
6. **Detect IDN Homograph Phishing**: To implement mixed-script character inspection and display ASCII Punycode warnings (`xn--cybmart-9ya.com`) prior to credential entry.
7. **Maintain Centralized Security Audit Center**: To log all security events with timestamps into an `events` audit table and present a real-time Security Scorecard (0% to 100%).

---

## 🔬 4. PROBLEM SCOPE

The scope of CyberMart encompasses 6 core security vulnerability categories implemented inside a simulated e-commerce and software firm ecosystem:

| # | Security Vulnerability | Vulnerable Implementation | Patched Security Control | Target Module |
|---|---|---|---|---|
| **1** | **SQL Injection (SQLi)** | Dynamic query string concatenation (`SELECT * FROM users WHERE username='$user' AND password='$pass'`) | Parameterized Queries (Prepared Statements `$stmt->bind_param("ss", ...)`) | Auth Gateway (`/login`) |
| **2** | **Brute Force Attack** | Unlimited login authentication attempts without throttling | Rate limiting & 30-second Account Lockout after 3 failed tries | Auth Gateway (`/login`) |
| **3** | **Parameter Tampering** | Trusting client-supplied price parameter input box (Tampering ₹3,499 → ₹1) | Server-side validation against authoritative SQLite `lab.db` prices | Shop Store & Checkout (`/checkout`) |
| **4** | **IDN Homograph Phishing** | No warning on spoofed Cyrillic link (`cybеrmart.com`) | Mixed-script Cyrillic domain detection & Punycode warning (`xn--cybmart-9ya.com`) | User Inbox (`/inbox`) |
| **5** | **Stored Cross-Site Scripting (XSS)** | Unescaped DOM echo (`<?php echo $_POST['comment']; ?>`) | Context-aware HTML Entity Encoding (`htmlspecialchars()`) | Customer Reviews (`/reviews`) |
| **6** | **LFI & OS Command Injection** | Unsafe `include()` path traversal & `shell_exec()` | `basename()` whitelist & `FILTER_VALIDATE_IP` escaping | System Diagnostics (`/diagnostics`) |

---

## 🏗️ 5. SYSTEM ARCHITECTURE

CyberMart is built on a modular web architecture consisting of a React + TypeScript frontend, an in-memory SQLite `lab.db` database engine, a live HTTP proxy request interceptor, and a central security state manager.

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
         │                             │                             │
         └─────────────────────────────┼─────────────────────────────┘
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │       PERSISTENT DATABASE (lab.db)      │
                  │  - users (id, username, password, role) │
                  │  - products (id, name, price, image)    │
                  │  - events (id, timestamp, type, status) │
                  └─────────────────────────────────────────┘
```

### Database Schema Design (`lab.db` SQLite)

#### 1. Table: `users`
| Attribute | Data Type | Constraint | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY | Unique user identifier |
| `username` | TEXT | UNIQUE | User login handle |
| `password` | TEXT | NOT NULL | User authentication password hash |
| `role` | TEXT | NOT NULL | Privilege level (`admin`, `customer`) |

#### 2. Table: `products`
| Attribute | Data Type | Constraint | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY | Product identifier |
| `name` | TEXT | NOT NULL | Item title |
| `price` | INTEGER | NOT NULL | Authoritative server price |
| `image_url` | TEXT | NOT NULL | Image asset URL |

#### 3. Table: `events`
| Attribute | Data Type | Constraint | Description |
|---|---|---|---|
| `id` | TEXT | PRIMARY KEY | Unique event token |
| `timestamp` | DATETIME | NOT NULL | Occurrence timestamp |
| `event_type` | TEXT | NOT NULL | Security event classification |
| `status` | TEXT | NOT NULL | `VULNERABLE` or `PATCHED` |
| `details` | TEXT | NOT NULL | Event details and execution payload |

---

## 🛠️ 6. TOOLS & TECHNOLOGIES USED

| Category | Technology | Usage Description |
|---|---|---|
| **Frontend Core** | React 19 + TypeScript | Modular component state rendering and type safety |
| **Build Tooling** | Vite 8 | High-speed HMR development server and production bundler |
| **Styling Engine** | Tailwind CSS v4 | Custom cyber glassmorphism design system |
| **Icon System** | Lucide React | Clean, intuitive user interface icons |
| **Visual Effects** | Canvas Confetti | Exploit confirmation celebration effects |
| **Proxy Inspector** | CyberProxy (Burp Simulator) | Intercepts raw HTTP POST/GET request packets inline |
| **Report Generator** | Printable PDF Engine | Formats laboratory experiment record with examiner sign-off |
| **Database Engine** | SQLite3 (`lab.db`) | Persistent relational database storing users, products, and events |

---

## ⚡ 7. ATTACKS & DEFENSES DEMONSTRATED

### Attack 1: SQL Injection (SQLi)
- **Vulnerable Code**:
  ```php
  $sql = "SELECT * FROM users WHERE username = '$username' AND password = '$password'";
  $result = mysqli_query($conn, $sql);
  ```
- **Payload**: `' OR '1'='1`
- **Exploit Effect**: Changes SQL boolean logic so `WHERE` evaluates to `TRUE`, granting instant Admin authentication bypass.
- **Patched Defense**:
  ```php
  $stmt = $conn->prepare("SELECT id, username, role FROM users WHERE username = ? AND password = ?");
  $stmt->bind_param("ss", $username, $password);
  $stmt->execute();
  ```

---

### Attack 2: Brute Force & Rate Limiting
- **Vulnerable Code**: Unlimited loop allowing 1,000 requests/minute without lockout.
- **Patched Defense**:
  ```php
  if ($failed_attempts >= 3) {
      $locked_until = time() + 30;
      die("ACCOUNT LOCKED: 3 failed attempts exceeded. Cooldown 30s.");
  }
  ```

---

### Attack 3: Parameter Tampering & Price Override
- **Vulnerable Code**:
  ```php
  $charged_total = $_POST['price'] * $_POST['quantity']; // Accepts client input ₹1!
  ```
- **Patched Defense**:
  ```php
  $stmt = $db->prepare("SELECT price FROM products WHERE id = ?");
  $stmt->bind_param("i", $product_id);
  $stmt->execute();
  $db_price = $stmt->get_result()->fetch_assoc()['price'];
  $charged_total = $db_price * $quantity; // Uses DB price ₹3,499
  ```

---

### Attack 4: IDN Homograph Phishing & Domain Validation
- **Spoofed Domain**: `http://cybеrmart.com` (Cyrillic 'е' U+0435)
- **Patched Defense**:
  ```php
  if (is_mixed_script($domain)) {
      $punycode = idn_to_ascii($domain);
      echo "⚠ SECURITY WARNING: Mixed-script Cyrillic domain detected! Punycode: $punycode";
  }
  ```

---

### Attack 5: Stored Cross-Site Scripting (XSS)
- **Vulnerable Code**: `<div><?php echo $_POST['review']; ?></div>`
- **Payload**: `<script>alert("Cookie: " + document.cookie)</script>`
- **Patched Defense**: `<div><?php echo htmlspecialchars($_POST['review'], ENT_QUOTES, 'UTF-8'); ?></div>`

---

### Attack 6: Local File Inclusion (LFI) & OS Command Injection (RCE)
- **Vulnerable Code**: `include("/var/www/logs/" . $_GET['file']);`
- **Payload**: `../../../../etc/passwd`
- **Patched Defense**:
  ```php
  $safe_file = basename($_GET['file']);
  if (strpos($_GET['file'], '..') !== false) {
      die("403 Forbidden: Path traversal attempt.");
  }
  ```

---

## 📝 8. CONCLUSION

The **CyberMart Security Laboratory** application provides a comprehensive, interactive academic platform for demonstrating common web application vulnerabilities alongside their secure mitigations. By contrasting Vulnerable and Patched implementations in real time, students and faculty gain immediate empirical insight into secure coding standards, parameterized database queries, client parameter verification, and security event auditing.
