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

export interface EnterpriseAnnouncement {
  id: string;
  author: string;
  title: string;
  content: string;
  createdAt: string;
  isXssExecuted?: boolean;
}

export interface EnterpriseEmployee {
  empId: number;
  name: string;
  department: string;
  salary: number;
  performanceReview: string;
  isConfidential: boolean;
}

export interface ProjectUseCase {
  id: 'airline' | 'securebank' | 'saas' | 'cloudvault';
  projectTitle: string;
  studentName: string;
  rollNo: string;
  conceptsUsed: string[];
  themeColor: string;
  description: string;
}
