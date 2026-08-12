export type Mode = 'vulnerable' | 'secure';

export type ModuleId = 'sqli' | 'xss' | 'parameter-tampering' | 'password-guessing' | 'full-app';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'vuln' | 'secure' | 'exploit';
  category: string;
  message: string;
  codeSnippet?: string;
  details?: Record<string, unknown>;
}

export interface BankCustomer {
  id: number;
  username: string;
  role: 'Customer' | 'VIP' | 'Admin';
  accountNo: string;
  balance: number;
  email: string;
  ssn: string;
  creditCard: string;
}

export interface FeedbackItem {
  id: string;
  studentName: string;
  course: string;
  rating: number;
  comment: string;
  createdAt: string;
  isSandboxedScriptExecuted?: boolean;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  image: string;
  description: string;
  isRestricted: boolean; // Hidden product for IDOR demo
}

export interface Order {
  orderId: string;
  productName: string;
  quantity: number;
  unitPriceSubmitted: number;
  unitPriceVerified: number;
  totalPaid: number;
  status: 'SUCCESS' | 'PRICE_TAMPERED' | 'REJECTED';
  timestamp: string;
}

export interface DictionaryAttempt {
  attemptNum: number;
  password: string;
  status: 'PENDING' | 'FAIL' | 'SUCCESS' | 'LOCKED';
  timestamp: string;
  delayMs: number;
}

export interface CodeComparison {
  title: string;
  description: string;
  owaspCategory: string;
  vulnerableCode: string;
  secureCode: string;
  vulnerableLang: string;
  secureLang: string;
  explanation: string[];
}

export interface VivaQA {
  question: string;
  answer: string;
  category: string;
}

export interface FirmSecret {
  id: number;
  title: string;
  category: string;
  secretKey: string;
  environment: string;
  accessRole: 'Developer' | 'DevOps' | 'CTO Admin';
  isConfidential: boolean;
}

export interface FirmNote {
  id: string;
  author: string;
  topic: string;
  content: string;
  createdAt: string;
}

export interface SoftwareLicense {
  id: number;
  softwareName: string;
  licenseTier: string;
  tierPrice: number;
  allowedSeats: number;
}

export interface SecurityEvent {
  id: string;
  timestamp: string;
  eventType: 'SQL Injection Bypass' | 'Brute Force Lockout' | 'Parameter Tampering Attempt' | 'IDN Phishing Warning' | 'Stored XSS Executed' | 'LFI Path Traversal';
  status: 'VULNERABLE' | 'PATCHED';
  details: string;
}

export interface SecurityControlStatus {
  id: 'sqli' | 'brute_force' | 'parameter_tampering' | 'idn_homograph' | 'xss' | 'lfi';
  name: string;
  vulnerableImpl: string;
  securityControl: string;
  isPatched: boolean;
}
