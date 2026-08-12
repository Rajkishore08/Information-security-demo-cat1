# 🛒 CYBERMART: SECURITY VULNERABILITY DEMONSTRATION & MITIGATION PLATFORM
> **CS401 - Information Security Laboratory (CAT 1) Project**  
> Department of Computer Science & Engineering  
> **GitHub Repository**: [https://github.com/Rajkishore08/Information-security-demo-cat1.git](https://github.com/Rajkishore08/Information-security-demo-cat1.git)

---

## 📊 10-SLIDE POWERPOINT PRESENTATION DECK

For college viva presentation slides and talking points, view:

👉 **[PPT_PRESENTATION_SLIDES.md](file:///Users/rajkishores/Sem%209/Information%20Security%20Lab/CAT%201/PPT_PRESENTATION_SLIDES.md)**

---

## 📚 FULL ACADEMIC DOCUMENTATION

For full, detailed technical specifications, system architecture diagrams, database schemas, algorithms, and viva walkthrough guides, please refer to:

👉 **[PROJECT_DOCUMENTATION.md](file:///Users/rajkishores/Sem%209/Information%20Security%20Lab/CAT%201/PROJECT_DOCUMENTATION.md)**

---

## 📄 ABSTRACT

**CyberMart** is an interactive, web-based e-commerce security laboratory application designed to bridge the gap between theoretical cybersecurity concepts and practical vulnerability exploitation and defense. The application simulates a real-world online shopping platform while intentionally incorporating major web application security vulnerabilities.

CyberMart features a dual-mode security execution engine:
- **Vulnerable Mode 🔴**: Demonstrates flawed coding practices such as dynamic SQL string concatenation, unvalidated client-side prices, unlimited login attempts, unescaped DOM rendering, and unverified internationalized domain names.
- **Patched Mode 🟢**: Implements industry-standard security controls including parameterized prepared statements, server-side SQLite database price validation, 3-attempt account lockout cooldowns, context-aware `htmlspecialchars()` entity encoding, and Punycode homograph domain detection.

A centralized **Security Center Dashboard** (`/admin`) allows administrators and laboratory examiners to dynamically toggle security controls, monitor live timestamped event logs in an `events` audit table, inspect side-by-side PHP/MySQL code diffs, and track a real-time **Security Scorecard (0% to 100%)**.

---

## 🔬 PROBLEM SCOPE & DEDICATED MODULES

| # | Dedicated Module Tab | Security Concept | Vulnerable Implementation | Patched Security Control |
|---|---|---|---|---|
| **1** | **1. SQL Injection** | SQL Injection (SQLi) | Dynamic query string concatenation (`SELECT * FROM users WHERE username='$user'`) | Parameterized Queries (Prepared Statements `$stmt->bind_param()`) |
| **2** | **2. Cross-Site Scripting (XSS)** | Stored XSS | Unescaped DOM echo (`<?php echo $_POST['comment']; ?>`) | Context-aware HTML Entity Encoding (`htmlspecialchars()`) |
| **3** | **3. Parameter Tampering** | Price Override | Trusting client-supplied price parameter input box (Tampering ₹3,499 → ₹1) | Server-side validation against authoritative SQLite `lab.db` prices |
| **4** | **4. Password Guessing** | Brute-Force | Unlimited login authentication attempts without throttling | Rate limiting & 30-second Account Lockout after 3 failed tries |
| **5** | **5. URL Interpretation (IDOR)** | Broken Access Control | Direct Object Reference (`?secret_id=999`) without role check | Server-side Session & Role Authorization Filter |
| **6** | **6. Phishing & IDN Homograph** | IDN Homograph | No warning on spoofed Cyrillic link (`cybеrmart.com`) | Mixed-script Cyrillic domain detection & Punycode warning (`xn--cybmart-9ya.com`) |
| **7** | **7. Full Unified App 🚀** | Full E-Commerce CyberMart | Integrated Security Laboratory & Central Admin Dashboard | Interactive Security Control Matrix & Real-time Scorecard |

---

## ⚙️ INSTALLATION & RUN INSTRUCTIONS

```bash
git clone https://github.com/Rajkishore08/Information-security-demo-cat1.git
cd Information-security-demo-cat1
npm install
npm run dev
```

Open your browser and navigate to `http://localhost:5173/`.
