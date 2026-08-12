# 🛡️ CYBERMART: SECURITY VULNERABILITY DEMONSTRATION & MITIGATION PLATFORM
> **Course**: CS401 - Information Security Laboratory (CAT 1)  
> **Department**: Department of Computer Science & Engineering  
> **Target Application**: CyberMart E-Commerce & Software Firm Security Laboratory  
> **Database File**: `lab.db` (SQLite Persistent In-Memory Engine)  
> **GitHub Repository**: [https://github.com/Rajkishore08/Information-security-demo-cat1.git](https://github.com/Rajkishore08/Information-security-demo-cat1.git)

---

## 📑 TABLE OF CONTENTS
1. [Abstract](#1-abstract)
2. [Problem Definition](#2-problem-definition)
3. [Problem Objective](#3-problem-objective)
4. [Problem Scope & System Boundaries](#4-problem-scope--system-boundaries)
5. [System Architecture & Design](#5-system-architecture--design)
6. [Tools & Technologies Used](#6-tools--technologies-used)
7. [Detailed Algorithms & Attack/Defense Mechanics](#7-detailed-algorithms--attackdefense-mechanics)
8. [Functional & Non-Functional Requirements](#8-functional--non-functional-requirements)
9. [Testing Strategy & Test Cases Matrix](#9-testing-strategy--test-cases-matrix)
10. [Demonstration Procedure & Viva Walkthrough Guide](#10-demonstration-procedure--viva-walkthrough-guide)
11. [Conclusion & Future Enhancements](#11-conclusion--future-enhancements)

---

## 📄 1. ABSTRACT

**CyberMart** is an interactive, web-based e-commerce security laboratory application developed as a comprehensive educational and demonstration platform. The primary objective of CyberMart is to bridge the gap between theoretical cybersecurity principles and practical, real-world vulnerability exploitation and defense. The application simulates a full-featured online shopping platform incorporating user authentication, product catalog browsing, checkout processing, user inbox communications, customer feedback boards, and system diagnostics, while deliberately embedding six major web application security vulnerabilities.

CyberMart introduces a dual-mode execution framework:
- **Vulnerable Mode 🔴**: Intentionally implements insecure logic such as dynamic SQL query concatenation, unvalidated client-side price parameters, unlimited authentication attempts, unescaped DOM rendering, unverified path inclusions, and unflagged internationalized domain names.
- **Patched Mode 🟢**: Enforces industry-standard security controls including parameterized prepared statements, server-side SQLite database price validation, 3-attempt account lockout cooldowns, context-aware `htmlspecialchars()` entity encoding, `basename()` path sanitization, and Punycode homograph domain detection.

A central **Security Center Dashboard** (`/admin`) serves as the administrative command hub, allowing demonstrators and viva examiners to independently toggle individual security controls, track real-time security events in an `events` audit table, inspect side-by-side PHP/MySQL code diffs, and monitor a dynamic **Security Scorecard (0% to 100%)**.

---

## 🎯 2. PROBLEM DEFINITION

Modern web application development frequently suffers from critical security oversights caused by reliance on untrusted client-supplied parameters, lack of input sanitization, dynamic query construction, and poor authorization logic. Traditional academic security instruction often presents these vulnerabilities purely in abstract theory, leaving students without empirical insight into how exploits operate or how specific code patches mitigate attacks.

Specifically, production web applications face six primary technical failure modes:

1. **Dynamic SQL Query Construction (SQL Injection)**: Applications build SQL queries by directly concatenating raw user inputs into command strings (`SELECT * FROM users WHERE username = '$user'`). Attackers manipulate input parameters to alter query syntax, resulting in Authentication Bypass and unauthorized data exfiltration.
2. **Unrestricted Authentication Endpoints (Brute-Force Attacks)**: Login gateways fail to enforce attempt thresholds or rate limits, permitting automated credential-guessing scripts (e.g., Hydra, Burp Intruder) to submit thousands of common password combinations per minute.
3. **Over-Trusting Client State (Parameter Tampering & Price Override)**: E-commerce checkout engines rely on prices or item IDs submitted directly from browser form fields or HTTP request bodies. Attackers tamper with request parameters using browser developer tools or HTTP proxies (e.g., changing ₹3,499 to ₹1) to purchase goods fraudulently.
4. **Visual Domain Deception (IDN Homograph Phishing)**: Applications fail to inspect internationalized domain names for mixed writing scripts. Attackers register domains containing visually identical Cyrillic characters (e.g., `cybеrmart.com` using Cyrillic 'е' U+0435) to deceive users into surrendering session credentials.
5. **Unsanitized DOM Rendering (Stored Cross-Site Scripting / XSS)**: User-generated content (such as product reviews or comments) is output directly into the HTML DOM without escaping. Attackers inject malicious JavaScript payloads (`<script>alert(document.cookie)</script>`), hijacking victim sessions.
6. **Unsafe File & Shell Execution (LFI & Command Injection)**: File viewer utilities pass unsanitized file paths to `include()` functions, allowing path traversal (`../../../../etc/passwd`), while diagnostic ping utilities pass raw IP strings to `shell_exec()`, granting arbitrary Remote Code Execution (RCE).

CyberMart solves this problem by providing a self-contained, interactive web security laboratory where all six attack vectors can be safely executed, analyzed, and mitigated in real time.

---

## 🚀 3. PROBLEM OBJECTIVE

The primary and secondary objectives of the CyberMart Security Laboratory project are:

### Primary Objectives
1. **Interactive Vulnerability Demonstration**: To construct a full-scale web application showcasing the exact operational mechanics of 6 major OWASP Top 10 security vulnerabilities.
2. **Dual-State Security Controls**: To implement independent **Vulnerable 🔴** and **Patched 🟢** mode execution toggles for every security feature.
3. **Demonstrate Prepared Statement Parameterization**: To prove empirically how parameterized queries treat user input strictly as literal scalar data out-of-band, rendering SQL syntax manipulation impossible.
4. **Enforce Rate Limiting & Account Cooldown**: To implement a failed-attempt counter enforcing a 3-attempt lockout threshold and a mandatory 30-second cooldown period.
5. **Ensure Server-Side Transaction Integrity**: To demonstrate that server-side validation against authoritative SQLite `lab.db` database prices completely neutralizes client-side price tampering.
6. **Implement IDN Mixed-Script Detection**: To parse requested domain labels for incompatible character scripts and generate prominent **⚠ SECURITY WARNING** alerts displaying ASCII Punycode representations (`xn--cybmart-9ya.com`).

### Secondary Objectives
7. **Real-Time Event Audit Logging**: To maintain a persistent `events` audit table capturing timestamps, event types, vulnerability states, and execution details.
8. **Provide Centralized Security Dashboard**: To calculate a dynamic Security Scorecard (0% to 100%) reflecting the application's real-time security posture.
9. **Academic Presentation Readiness**: To include side-by-side PHP/MySQL code diff inspectors, viva flashcard question banks, and an automated printable PDF lab report generator for faculty evaluation.

---

## 🔬 4. PROBLEM SCOPE & SYSTEM BOUNDARIES

### In-Scope Vulnerabilities & Security Controls

| # | Vulnerability Category | OWASP Mapping | Vulnerable Implementation | Patched Security Control | Target Endpoint |
|---|---|---|---|---|---|
| **1** | **SQL Injection (SQLi)** | A03:2021 - Injection | Dynamic string concatenation (`SELECT * FROM users WHERE username='$user' AND password='$pass'`) | Parameterized Queries (Prepared Statements `$stmt->bind_param("ss", ...)`) | Auth Gateway (`/login`) |
| **2** | **Brute Force Attack** | A07:2021 - Auth Failures | Unlimited login authentication attempts without throttling | Rate limiting & 30-second Account Lockout after 3 failed tries | Auth Gateway (`/login`) |
| **3** | **Parameter Tampering** | A01:2021 - Broken Access Control | Trusting client-supplied price parameter input box (Tampering ₹3,499 → ₹1) | Server-side validation against authoritative SQLite `lab.db` prices | Shop Store (`/checkout`) |
| **4** | **IDN Homograph Phishing** | A07:2021 - Social Eng | No warning on spoofed Cyrillic link (`cybеrmart.com`) | Mixed-script Cyrillic domain detection & Punycode warning (`xn--cybmart-9ya.com`) | User Inbox (`/inbox`) |
| **5** | **Stored Cross-Site Scripting (XSS)** | A03:2021 - Injection (XSS) | Unescaped DOM echo (`<?php echo $_POST['comment']; ?>`) | Context-aware HTML Entity Encoding (`htmlspecialchars()`) | Reviews (`/reviews`) |
| **6** | **LFI & OS Command Injection** | A03:2021 - Command Injection | Unsafe `include()` path traversal & `shell_exec()` | `basename()` whitelist & `FILTER_VALIDATE_IP` escaping | Diagnostics (`/diagnostics`) |

### Out-of-Scope System Boundaries
- Actual production exploitation of external network infrastructure or third-party web servers.
- Complex cryptographic hardware security module (HSM) physical tampering.
- Distributing real-world malware payloads outside the local simulated laboratory environment.

---

## 🏗️ 5. SYSTEM ARCHITECTURE & DESIGN

CyberMart is architected as a modular single-page web application (SPA) with a simulated backend server engine, persistent in-memory SQLite database layer (`lab.db`), and live request interception proxy.

### System Architecture Block Diagram

```
                              ┌──────────────────────────────────────────────┐
                              │           USER BROWSER / DEMONSTRATOR        │
                              └──────────────────────┬───────────────────────┘
                                                     │
                                                     ▼
                              ┌──────────────────────────────────────────────┐
                              │         GLOBAL SECURITY CONTEXT STATE        │
                              │     [Mode: Vulnerable 🔴 vs Patched 🟢]     │
                              └──────────────────────┬───────────────────────┘
                                                     │
         ┌───────────────────────────────────────────┼───────────────────────────────────────────┐
         ▼                                           ▼                                           ▼
┌──────────────────┐                       ┌──────────────────┐                       ┌──────────────────┐
│   SHOP STORE &   │                       │  AUTHENTICATION  │                       │  SECURITY CENTER │
│ PRICE CHECKOUT   │                       │ & BRUTE-FORCE    │                       │   ADMIN DASH     │
│ (Parameter Lamp) │                       │ (SQLi & Lockout) │                       │ (Events Audit)   │
└────────┬─────────┘                       └────────┬─────────┘                       └────────┬─────────┘
         │                                          │                                          │
         └──────────────────────────────────────────┼──────────────────────────────────────────┘
                                                    │
                                                    ▼
                              ┌──────────────────────────────────────────────┐
                              │         PERSISTENT DATABASE (lab.db)         │
                              │  - users (id, username, password, role)      │
                              │  - products (id, name, price, image_url)     │
                              │  - events (id, timestamp, type, status)      │
                              └──────────────────────────────────────────────┘
```

### Database Schema Design (`lab.db` SQLite)

#### 1. Table: `users`
| Attribute | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique user identifier |
| `username` | TEXT | UNIQUE NOT NULL | User login username handle |
| `password` | TEXT | NOT NULL | Password hash / authentication token |
| `role` | TEXT | NOT NULL | User privilege level (`admin`, `customer`) |

#### 2. Table: `products`
| Attribute | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY | Unique product catalog ID |
| `name` | TEXT | NOT NULL | Product title |
| `price` | INTEGER | NOT NULL | Authoritative server-side price |
| `image_url` | TEXT | NOT NULL | Image asset location |

#### 3. Table: `events`
| Attribute | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | TEXT | PRIMARY KEY | Unique event token |
| `timestamp` | DATETIME | NOT NULL | Occurrence timestamp |
| `event_type` | TEXT | NOT NULL | Security event classification |
| `status` | TEXT | NOT NULL | `VULNERABLE` or `PATCHED` |
| `details` | TEXT | NOT NULL | Event details and execution payload |

---

## 🛠️ 6. TOOLS & TECHNOLOGIES USED

| Component | Technology / Tool | Specifications & Version | Purpose in Project |
|---|---|---|---|
| **Frontend Core** | React | v19.0.0 | Component-based UI rendering and state management |
| **Language** | TypeScript | v6.0.0 | Strict type definitions and compile-time error checking |
| **Build Engine** | Vite | v8.2.1 | High-performance development server and bundle optimization |
| **Styling Framework** | Tailwind CSS | v4.0.0 | Utility-first glassmorphic dark cyber design system |
| **Icon Library** | Lucide React | v0.475.0 | High-contrast security and interface icons |
| **Visual Effects** | Canvas Confetti | v1.9.4 | Visual feedback for successful exploits and mitigations |
| **Database Engine** | SQLite3 (`lab.db`) | In-Memory / Persistent | Storage for users, products, and real-time security events |
| **HTTP Interceptor** | CyberProxy | Custom Component | Intercepts raw HTTP POST/GET request headers and bodies |
| **Report Engine** | LabReportModal | Custom Component | Automated printable PDF laboratory report generator |

---

## ⚡ 7. DETAILED ALGORITHMS & ATTACK/DEFENSE MECHANICS

### Algorithm 1: SQL Injection Exploitation & Prepared Statement Mitigation
```
INPUT: username_input, password_input
OUTPUT: Authentication status (SUCCESS / REJECTED)

1. START
2. Read username_input and password_input from form.
3. IF sqli_control_state = VULNERABLE THEN
     a. Construct dynamic SQL query:
        query_string = "SELECT * FROM users WHERE username = '" + username_input + "' AND password = '" + password_input + "'"
     b. Execute query_string against lab.db.
     c. IF matching user record returned THEN
          Grant administrator authentication session.
          Record Security Event ("SQL Injection Bypass", "VULNERABLE").
        ELSE
          Reject authentication.
        END IF
4. ELSE (sqli_control_state = PATCHED)
     a. Create parameterized statement:
        stmt = db.prepare("SELECT id, username, role FROM users WHERE username = ? AND password = ?")
     b. Bind username_input and password_input as literal parameters.
     c. Execute prepared statement.
     d. IF exact string match found THEN
          Grant authentication session.
          Record Security Event ("SQL Injection Bypass", "PATCHED").
        ELSE
          Reject authentication.
        END IF
5. END IF
6. STOP
```

### Algorithm 2: Rate Limiting & Account Cooldown Lockout
```
INPUT: username, password
OUTPUT: Auth result OR Lockout Notice

1. START
2. IF brute_force_control_state = PATCHED AND account_lock_remaining > 0 THEN
     Return "ACCOUNT LOCKED: Cooldown active (30s remaining)".
     STOP
   END IF
3. Verify supplied username and password.
4. IF credentials match THEN
     Reset failed_attempts_counter = 0.
     Return "Authentication Successful".
   ELSE
     Increment failed_attempts_counter = failed_attempts_counter + 1.
     IF brute_force_control_state = PATCHED AND failed_attempts_counter >= 3 THEN
       Set account_lock_remaining = 30 seconds.
       Record Security Event ("Brute Force Lockout", "PATCHED", "30s Lockout Triggered").
       Return "ACCOUNT LOCKED: Maximum 3 attempts exceeded".
     ELSE
       Return "Invalid Credentials. Failed attempts: " + failed_attempts_counter.
     END IF
   END IF
5. STOP
```

### Algorithm 3: Server-Side Price Validation
```
INPUT: product_id, client_supplied_price, quantity
OUTPUT: Transaction receipt total

1. START
2. Read product_id, client_supplied_price, quantity.
3. IF parameter_tampering_control_state = VULNERABLE THEN
     unit_price = client_supplied_price
     Record Security Event ("Parameter Tampering Attempt", "VULNERABLE").
   ELSE (PATCHED)
     Retrieve authoritative price from lab.db:
     db_price = SELECT price FROM products WHERE id = product_id
     unit_price = db_price
     Record Security Event ("Parameter Tampering Attempt", "PATCHED").
   END IF
4. Calculate total_charged = unit_price * quantity.
5. Generate transaction receipt with total_charged.
6. STOP
```

### Algorithm 4: IDN Homograph Cyrillic Domain Detection
```
INPUT: requested_domain_url
OUTPUT: Display Normal Page OR Display Security Warning

1. START
2. Parse character scripts in requested_domain_url label.
3. IF idn_homograph_control_state = PATCHED AND ContainsMixedScripts(requested_domain_url) THEN
     Convert domain to ASCII Punycode: punycode_str = idn_to_ascii(requested_domain_url).
     Display ⚠ SECURITY WARNING banner.
     Display Punycode representation: punycode_str.
     Record Security Event ("IDN Phishing Warning", "PATCHED").
   ELSE
     Display page without warning banner.
     Record Security Event ("IDN Phishing Warning", "VULNERABLE").
   END IF
4. STOP
```

---

## 8. FUNCTIONAL & NON-FUNCTIONAL REQUIREMENTS

### Functional Requirements (FR)
- **FR1 - User Authentication**: The system shall authenticate users using username and password credentials.
- **FR2 - Product Browsing**: The system shall display products with authoritative database prices.
- **FR3 - Checkout Processing**: The system shall calculate transaction totals during purchase initiation.
- **FR4 - Independent Security Toggles**: Demonstrators shall be able to toggle individual security controls between Vulnerable and Patched states.
- **FR5 - SQL Injection Demonstration**: The system shall demonstrate dynamic string concatenation vs prepared statements.
- **FR6 - Brute Force Protection**: The system shall enforce a 3-failed-attempt threshold triggering a 30-second lockout.
- **FR7 - Parameter Validation**: The system shall validate client prices against SQLite `lab.db`.
- **FR8 - IDN Phishing Detection**: The system shall detect Cyrillic homograph domains and display Punycode warnings.
- **FR9 - Event Logging**: The system shall record timestamped security events into an `events` audit table.
- **FR10 - Standalone Sandbox**: The system shall support launching the target app in a standalone window pop-out.

### Non-Functional Requirements (NFR)
- **NFR1 - Security Integrity**: Patched implementations must completely neutralize demonstrated exploit payloads.
- **NFR2 - Usability**: The Security Center must render clear visual indicators for vulnerability states.
- **NFR3 - Performance**: Page transformations and database queries must execute under 200ms.
- **NFR4 - Maintainability**: Codebase must be strictly organized into modular components.
- **NFR5 - Portability**: The application must run locally on any Node.js 18+ environment without external database installation.

---

## 🧪 9. TESTING STRATEGY & TEST CASES MATRIX

| Test Case ID | Feature Tested | Input Payload / Action | Vulnerable Mode Result 🔴 | Patched Mode Result 🟢 | Pass/Fail Status |
|---|---|---|---|---|---|
| **TC-01** | SQL Injection | `username = "' OR '1'='1"` | Authenticates as Admin (SQL Bypass) | Authentication Rejected | PASS ✅ |
| **TC-02** | Brute Force | 3 consecutive invalid logins | Unlimited retries accepted | 30s Account Lockout triggered | PASS ✅ |
| **TC-03** | Parameter Tampering | Submit `price = 1` for ₹3,499 item | Charged ₹1 (Client price accepted) | Charged ₹3,499 (DB price enforced) | PASS ✅ |
| **TC-04** | IDN Homograph | Click `http://cybеrmart.com` (Cyrillic) | No warning displayed | ⚠ SECURITY WARNING & Punycode shown | PASS ✅ |
| **TC-05** | Stored XSS | `<script>alert(document.cookie)</script>` | Script executes in DOM | HTML entity encoded (`&lt;script&gt;`) | PASS ✅ |
| **TC-06** | LFI Traversal | `?file=../../../../etc/passwd` | Displays `/etc/passwd` system file | 403 Forbidden: Path traversal blocked | PASS ✅ |

---

## 🎓 10. DEMONSTRATION PROCEDURE & VIVA WALKTHROUGH GUIDE

### Step 1: Initialize System & Open Security Center
1. Start development server: `npm run dev`. Open `http://localhost:5173/`.
2. Navigate to **Module 5: Full Application (CyberMart)**.
3. Observe the initial **Security Scorecard (0% in Vulnerable Mode 🔴)**.

### Step 2: Demonstrate SQL Injection (Vulnerability 1)
1. Go to **Login & Brute-Force** tab. Select preset `' OR '1'='1`.
2. Submit authentication. Observe successful login as System Administrator.
3. Click **Code Inspector** in top navigation to display dynamic string PHP code vs Prepared Statement diff.
4. Toggle to **Patched Mode 🟢** and resubmit. Observe prepared statement rejecting input as literal scalar data.

### Step 3: Demonstrate Brute Force Protection (Vulnerability 2)
1. Under **Patched Mode 🟢**, enter invalid password 3 times.
2. Observe **30-Second Account Lockout** banner throttling further attempts.

### Step 4: Demonstrate Parameter Tampering (Vulnerability 3)
1. Go to **Shop Store & Checkout**. Select Smartphone Pro Max (₹3,499).
2. Under **Vulnerable Mode 🔴**, edit price input box to `1`. Submit purchase. Observe item bought for ₹1.
3. Switch to **Patched Mode 🟢** and submit again. Observe server overriding input with SQLite `lab.db` price (₹3,499).

### Step 5: Demonstrate IDN Homograph Phishing (Vulnerability 4)
1. Go to **Inbox & IDN Phishing**. Open security email.
2. Under **Patched Mode 🟢**, click the Cyrillic homograph link.
3. Observe the **⚠ SECURITY WARNING** alert displaying Punycode representation (`xn--cybmart-9ya.com`).

### Step 6: Generate Printable Lab Evaluation Report
1. Click **Viva Report** in the top navigation bar.
2. Enter Student Name and Registration Number.
3. Click **Print / Save as PDF** to generate an official laboratory evaluation record complete with Faculty Sign-Off block.

---

## 📝 11. CONCLUSION & FUTURE ENHANCEMENTS

The **CyberMart Security Laboratory** application provides a state-of-the-art, interactive academic platform for evaluating web application vulnerabilities and their secure mitigations. By providing real-time side-by-side execution comparison between Vulnerable and Patched implementations, CyberMart offers students and examiners an invaluable tool for understanding secure coding standards, prepared database statements, parameter validation, and security event auditing.

### Future Enhancements
- Integrating WebAuthn / FIDO2 hardware USB key authentication simulations.
- Adding automated SAST (Static Application Security Testing) code scanners.
- Extending containerized Docker deployment options for remote laboratory cloud hosting.
