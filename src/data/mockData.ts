import type { BankCustomer, FeedbackItem, Product, CodeComparison, VivaQA, FirmSecret, FirmNote, SoftwareLicense } from '../types/security';

export const INITIAL_FIRM_SECRETS: FirmSecret[] = [
  {
    id: 101,
    title: 'Stripe Payment Gateway API Key (Production)',
    category: 'API Credentials',
    secretKey: 'sk_live_51M099xXXXXXX_secret_prod_key_991823',
    environment: 'Production',
    accessRole: 'Developer',
    isConfidential: false
  },
  {
    id: 102,
    title: 'PostgreSQL Core Database Master Password',
    category: 'Database Credentials',
    secretKey: 'pg_db_master_P@ssw0rd_2026_super_secure',
    environment: 'Production',
    accessRole: 'DevOps',
    isConfidential: false
  },
  {
    id: 103,
    title: 'AWS Root IAM Access Key ID & Secret',
    category: 'Cloud Credentials',
    secretKey: 'AKIAIOSFODNN7EXAMPLE:wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
    environment: 'Production',
    accessRole: 'DevOps',
    isConfidential: false
  },
  {
    id: 999,
    title: 'RESTRICTED: Root Software Firm Master Key & Hardware HSM Vault Token',
    category: 'Root Master Keys',
    secretKey: 'HSM_MASTER_KEY_0x99182377_CTO_PRIVATE_SIGNING_KEY',
    environment: 'Core Firm Vault',
    accessRole: 'CTO Admin',
    isConfidential: true
  }
];

export const INITIAL_FIRM_NOTES: FirmNote[] = [
  {
    id: 'note-1',
    author: 'Lead Architect',
    topic: 'Database Migration Security',
    content: 'All API keys must be rotated prior to the upcoming audit on Friday.',
    createdAt: '2026-08-10 11:30'
  },
  {
    id: 'note-2',
    author: 'DevOps Engineer',
    topic: 'Kubernetes Cluster Access',
    content: 'Kubeconfig updated for Staging environment cluster node 04.',
    createdAt: '2026-08-11 08:15'
  }
];

export const SOFTWARE_LICENSES: SoftwareLicense[] = [
  {
    id: 1,
    softwareName: 'ApexSoft Enterprise IDE License (1-Year)',
    licenseTier: 'Developer Seat',
    tierPrice: 15000,
    allowedSeats: 10
  },
  {
    id: 2,
    softwareName: 'ApexSoft Security Audit & SAST Suite',
    licenseTier: 'Enterprise Suite',
    tierPrice: 120000,
    allowedSeats: 50
  }
];

export const INITIAL_CUSTOMERS: BankCustomer[] = [
  {
    id: 1,
    username: 'admin',
    role: 'Admin',
    accountNo: 'ACC-9901-7782',
    balance: 2450000.00,
    email: 'system.administrator@securebank.com',
    ssn: '***-**-9912',
    creditCard: '4532-****-****-8819'
  },
  {
    id: 2,
    username: 'alex_johnson',
    role: 'Customer',
    accountNo: 'ACC-1044-8821',
    balance: 45200.50,
    email: 'alex.j@gmail.com',
    ssn: '***-**-4421',
    creditCard: '4111-****-****-1029'
  },
  {
    id: 3,
    username: 'sarah_tech',
    role: 'VIP',
    accountNo: 'ACC-2299-1145',
    balance: 189000.75,
    email: 'sarah.engineer@outlook.com',
    ssn: '***-**-3310',
    creditCard: '5424-****-****-7712'
  },
  {
    id: 4,
    username: 'rahul_sharma',
    role: 'Customer',
    accountNo: 'ACC-5521-0099',
    balance: 12500.00,
    email: 'rahul.s@yahoo.com',
    ssn: '***-**-7890',
    creditCard: '4222-****-****-5544'
  }
];

export const INITIAL_FEEDBACKS: FeedbackItem[] = [
  {
    id: 'fb-1',
    studentName: 'Priya Verma',
    course: 'Information Security CS401',
    rating: 5,
    comment: 'Great lecture on cryptography and public key infrastructure! Very clear presentation.',
    createdAt: '2026-08-10 14:30'
  },
  {
    id: 'fb-2',
    studentName: 'Rohan Gupta',
    course: 'Network Security CS402',
    rating: 4,
    comment: 'Practical firewall labs were really informative. Looking forward to the next session on IDS/IPS.',
    createdAt: '2026-08-11 09:15'
  }
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'CyberSec Shield Pro (1-Yr)',
    category: 'Software',
    price: 4999,
    originalPrice: 4999,
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=400&q=80',
    description: 'Enterprise grade firewall and security audit suite.',
    isRestricted: false
  },
  {
    id: 2,
    name: 'Wireless ANC Headphones',
    category: 'Hardware',
    price: 12499,
    originalPrice: 12499,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80',
    description: 'Active noise cancellation headphones with 40-hour battery life.',
    isRestricted: false
  },
  {
    id: 3,
    name: 'Tactical Hardware Key Fob (YubiKey)',
    category: 'Security Hardware',
    price: 3500,
    originalPrice: 3500,
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
    description: 'FIDO2 / U2F Multi-Factor Authentication Hardware USB Token.',
    isRestricted: false
  },
  {
    id: 4,
    name: 'Alienware Core-i9 Cyber Laptop',
    category: 'Hardware',
    price: 85000,
    originalPrice: 85000,
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=400&q=80',
    description: 'High performance laptop with RTX 4080 GPU for ethical hacking and AI workloads.',
    isRestricted: false
  },
  {
    id: 10,
    name: 'RESTRICTED: VIP Admin Gift Voucher (₹50,000)',
    category: 'Internal / Admin Voucher',
    price: 0,
    originalPrice: 50000,
    image: 'https://images.unsplash.com/photo-1556742049-0a6754095b54?auto=format&fit=crop&w=400&q=80',
    description: 'Internal testing voucher intended exclusively for administrative staff testing checkout APIs.',
    isRestricted: true
  }
];

export const DICTIONARY_PASSWORDS: string[] = [
  'admin123',
  'password',
  '123456',
  'welcome',
  'qwerty',
  'letmein',
  'admin2026',
  'superman',
  'monkey',
  'Secr3tP@ss'
];

export const CODE_COMPARISONS: Record<string, CodeComparison> = {
  sqli: {
    title: 'SQL Injection (SQLi) Defense',
    description: 'Dynamic string concatenation vs. Parameterized Prepared Statements',
    owaspCategory: 'A03:2021 - Injection',
    vulnerableLang: 'php',
    vulnerableCode: `// ❌ VULNERABLE: Direct string concatenation
$username = $_POST['username'];
$password = $_POST['password'];

// Malicious input: ' OR '1'='1
$sql = "SELECT * FROM users WHERE username = '$username' AND password = '$password'";
$result = mysqli_query($conn, $sql);

if (mysqli_num_rows($result) > 0) {
    // ⚠️ Auth Bypass Triggered! $sql evaluates to TRUE
    $user = mysqli_fetch_assoc($result);
    $_SESSION['user_id'] = $user['id'];
}`,
    secureLang: 'php',
    secureCode: `// 🟢 SECURE: Parameterized Query (Prepared Statement)
$username = $_POST['username'];
$password = $_POST['password'];

// SQL structure is pre-compiled separately from data inputs
$stmt = $conn->prepare("SELECT id, username, role FROM users WHERE username = ? AND password = ?");
$stmt->bind_param("ss", $username, $password);
$stmt->execute();

$result = $stmt->get_result();
if ($result->num_rows > 0) {
    // Authenticated safely
    $user = $result->fetch_assoc();
}`,
    explanation: [
      'In the vulnerable version, the database parser treats user input as executable SQL code syntax.',
      'Entering "\' OR \'1\'=\'1" changes the boolean logic of the WHERE clause so it always evaluates to TRUE.',
      'In the secure version, prepared statements pre-compile the SQL query structure.',
      'User input parameters are sent out-of-band and bound strictly as literal text values, rendering SQL syntax manipulation impossible.'
    ]
  },
  xss: {
    title: 'Cross-Site Scripting (XSS) Defense',
    description: 'Unescaped DOM Output vs. HTML Entity Encoding / Input Sanitization',
    owaspCategory: 'A03:2021 - Injection (XSS)',
    vulnerableLang: 'php',
    vulnerableCode: `<!-- ❌ VULNERABLE: Direct echo without escaping -->
<div class="feedback-comment">
    <?php echo $_POST['comment']; ?>
</div>

<!-- Malicious Input Payload: -->
<!-- <script>alert("Cookie Stolen: " + document.cookie);</script> -->
<!-- The browser parses <script> tags and executes JavaScript in user context! -->`,
    secureLang: 'php',
    secureCode: `<!-- 🟢 SECURE: htmlspecialchars() / Context-aware sanitization -->
<div class="feedback-comment">
    <?php echo htmlspecialchars($_POST['comment'], ENT_QUOTES, 'UTF-8'); ?>
</div>

<!-- Output sent to browser: -->
<!-- &lt;script&gt;alert("Cookie Stolen: "&lt;/script&gt; -->
<!-- Browser treats characters as plain text glyphs instead of executable HTML tags! -->`,
    explanation: [
      'In the vulnerable version, unescaped user input is rendered directly into the DOM tree.',
      'If an attacker submits JavaScript tags or image onerror handlers, the victim’s browser executes the script in their session context.',
      'In the secure version, functions like htmlspecialchars() convert special characters (<, >, ", \') into harmless HTML entity equivalents (&lt;, &gt;).',
      'Additionally, implementing strong Content-Security-Policy (CSP) headers blocks inline script execution.'
    ]
  },
  'parameter-tampering': {
    title: 'Parameter Tampering & IDOR Defense',
    description: 'Trusting Client-Sent Parameters vs. Server-Side Validation & State Verification',
    owaspCategory: 'A01:2021 - Broken Access Control',
    vulnerableLang: 'php',
    vulnerableCode: `// ❌ VULNERABLE: Blindly trusting client price & product access
$product_id = $_GET['id']; // e.g. id=10 (hidden product)
$submitted_price = $_POST['price']; // e.g. price=10 instead of ₹85,000

// Vulnerable IDOR access check:
$sql = "SELECT * FROM products WHERE id = $product_id"; // No authorization check!

// Vulnerable Checkout:
$sql_order = "INSERT INTO orders (user_id, price) VALUES ($user_id, $submitted_price)";
mysqli_query($conn, $sql_order); // Processed item at ₹10!`,
    secureLang: 'php',
    secureCode: `// 🟢 SECURE: Server-side validation against authoritative database
$product_id = intval($_GET['id']);

// 1. Verify user authorization & product visibility
$stmt = $conn->prepare("SELECT name, price, is_restricted FROM products WHERE id = ?");
$stmt->bind_param("i", $product_id);
$stmt->execute();
$product = $stmt->get_result()->fetch_assoc();

if ($product['is_restricted'] && !$_SESSION['is_admin']) {
    http_response_code(403);
    die("Access Denied: Restricted item.");
}

// 2. Ignore client-submitted price! Fetch authoritative price from DB
$verified_total = $product['price'] * $quantity;
$stmt_order = $conn->prepare("INSERT INTO orders (user_id, total) VALUES (?, ?)");
$stmt_order->bind_param("id", $user_id, $verified_total);
$stmt_order->execute();`,
    explanation: [
      'In the vulnerable version, the server relies on parameters sent by the client (URL parameters or HTTP POST request body).',
      'Attackers use browser inspect tools, Proxies (Burp Suite), or manual URL manipulation to alter prices or access hidden objects.',
      'In the secure version, the server ALWAYS treats client inputs as untrusted inputs.',
      'Prices and object authorization rights are validated on the backend against trusted database records.'
    ]
  },
  'password-guessing': {
    title: 'Password Guessing & Brute-Force Defenses',
    description: 'Unlimited Login Attempts vs. Rate Limiting, Account Lockout & CAPTCHA',
    owaspCategory: 'A07:2021 - Identification and Authentication Failures',
    vulnerableLang: 'php',
    vulnerableCode: `// ❌ VULNERABLE: No attempt counting or rate limiting
$user = $_POST['user'];
$pass = $_POST['pass'];

// Allows automated scripts to send 1,000 requests/minute until password matches
if (password_verify($pass, $user_hash)) {
    login_user($user);
} else {
    echo "Invalid password"; // Allows infinite automated retries!
}`,
    secureLang: 'php',
    secureCode: `// 🟢 SECURE: Multi-layered authentication defense
$user = $_POST['user'];
$ip = $_SERVER['REMOTE_ADDR'];

// 1. Rate Limiting Check (Redis / DB)
if (is_ip_throttled($ip)) {
    sleep(2); // Artificial delay to slow down automated scripts
}

// 2. Check Account Lockout State
if (get_failed_attempts($user) >= 5) {
    die("Account locked due to 5 consecutive failed attempts. Try again in 30 seconds.");
}

// 3. CAPTCHA verification required after 3 failed attempts
if (get_failed_attempts($user) >= 3 && !verify_captcha($_POST['captcha_response'])) {
    die("CAPTCHA verification failed.");
}

if (!password_verify($pass, $user_hash)) {
    increment_failed_attempts($user);
    echo "Invalid credentials.";
}`,
    explanation: [
      'Automated dictionary tools (Hydra, Burp Intruder) try thousands of common passwords per minute.',
      'Without limits, short or weak passwords like "admin123" or "password" are guessed within seconds.',
      'Secure defenses combine: (1) Account Lockout after N failed tries, (2) Server Artificial Delays / Rate Limiting, and (3) CAPTCHA verification to block automated bots.'
    ]
  },
  'command-injection': {
    title: 'OS Command Injection & Full Attack Chain',
    description: 'Unsanitized shell_exec() vs. Input Whitelisting & Escaping',
    owaspCategory: 'A03:2021 - Injection (Command Injection)',
    vulnerableLang: 'php',
    vulnerableCode: `// ❌ VULNERABLE: Direct shell command concatenation
$target_ip = $_POST['ip']; // e.g. 8.8.8.8; cat /etc/passwd

// Executes raw OS shell command!
$output = shell_exec("ping -c 2 " . $target_ip);
echo "<pre>$output</pre>";`,
    secureLang: 'php',
    secureCode: `// 🟢 SECURE: Input validation & filter_var() IP validation
$target_ip = $_POST['ip'];

if (!filter_var($target_ip, FILTER_VALIDATE_IP)) {
    die("Invalid IP address format!");
}

// Escaping shell arguments cleanly:
$safe_ip = escapeshellarg($target_ip);
$output = shell_exec("ping -c 2 " . $safe_ip);`,
    explanation: [
      'Command Injection allows attackers to execute arbitrary system shell commands on the server host.',
      'Semicolons (;), pipes (|), or ampersands (&) append secondary OS commands (e.g. cat /etc/passwd or whoami).',
      'Secure applications validate input against strict whitelists (e.g. FILTER_VALIDATE_IP) and escape shell arguments using escapeshellarg().'
    ]
  }
};

export const VIVA_QUESTIONS: VivaQA[] = [
  {
    category: 'SQL Injection',
    question: 'What is SQL Injection and why does it occur?',
    answer: 'SQL Injection happens when untrusted user input is directly concatenated into dynamic SQL queries without validation or parameterization. The database interpreter mistakes user-supplied string data for executable SQL code structure.'
  },
  {
    category: 'SQL Injection',
    question: 'How do Parameterized Queries (Prepared Statements) prevent SQL Injection?',
    answer: 'Prepared statements separate the query structure from the data parameters. The SQL command is pre-compiled by the database engine first. User inputs are bound out-of-band as literal scalar data, so even if input contains SQL syntax like "\' OR 1=1 --", it is treated strictly as plain text values.'
  },
  {
    category: 'Cross-Site Scripting (XSS)',
    question: 'What is the main difference between Stored XSS and Reflected XSS?',
    answer: 'Stored XSS occurs when malicious input is permanently stored in a database/server (e.g. feedback comments) and executed whenever victims view that page. Reflected XSS occurs when malicious script in an HTTP request parameter (e.g. search string) is immediately reflected back in the server response without being stored.'
  },
  {
    category: 'Cross-Site Scripting (XSS)',
    question: 'How do Context-Aware HTML Encoding and Content Security Policy (CSP) work together?',
    answer: 'HTML encoding (e.g., htmlspecialchars) converts hazardous characters like "<" and ">" into harmless entities ("&lt;" and "&gt;"), preventing the browser from parsing them as script tags. Content Security Policy (CSP) acts as a secondary defense layer by restricting which domain scripts can execute from and blocking inline script execution.'
  },
  {
    category: 'Parameter Tampering',
    question: 'What is Parameter Tampering and what is an IDOR vulnerability?',
    answer: 'Parameter Tampering involves altering client-controlled request parameters (like prices, item IDs, or user roles) sent via URLs, forms, or HTTP headers. Insecure Direct Object Reference (IDOR) is a specific type of parameter tampering where changing an identifier (e.g., ?id=10) grants unauthorized access to internal resources without server authorization checks.'
  },
  {
    category: 'Parameter Tampering',
    question: 'Why should price calculations never rely on client-side form values?',
    answer: 'Clients have full control over HTML code, JavaScript, and HTTP traffic. Any price value submitted from the browser can easily be intercepted and changed (e.g., altering ₹85,000 to ₹10 via devtools or proxy). Price logic must ALWAYS be calculated authoritatively on the backend using database product prices.'
  },
  {
    category: 'Password Guessing',
    question: 'What measures effectively defend an application against automated Dictionary & Brute-Force attacks?',
    answer: 'Defense-in-depth requires: (1) Account Lockout policies after 5 failed attempts, (2) IP Rate Limiting & exponential backoff delays, (3) Mandatory CAPTCHA challenges after consecutive failures, and (4) Enforcing Multi-Factor Authentication (MFA) and strong password rules.'
  },
  {
    category: 'Command Injection & Full Attack Chains',
    question: 'What is Command Injection and how do multi-stage attack chains work?',
    answer: 'Command Injection occurs when shell commands (e.g., system(), shell_exec()) incorporate unsanitized user input, allowing attackers to execute OS commands. In real-world attack chains, hackers start with low-severity flaws (like weak passwords or XSS) to gain initial access, then exploit IDOR, SQLi, and Command Injection to escalate to full Server Remote Code Execution (RCE).'
  }
];
