import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Mode, ModuleId, LogEntry, BankCustomer, FeedbackItem, Order } from '../types/security';
import { INITIAL_CUSTOMERS, INITIAL_FEEDBACKS } from '../data/mockData';

interface SecurityContextType {
  mode: Mode;
  setMode: (mode: Mode) => void;
  toggleMode: () => void;
  activeModule: ModuleId;
  setActiveModule: (module: ModuleId) => void;
  logs: LogEntry[];
  addLog: (level: LogEntry['level'], category: string, message: string, codeSnippet?: string, details?: Record<string, unknown>) => void;
  clearLogs: () => void;

  // Banking State
  customers: BankCustomer[];
  currentUser: BankCustomer | null;
  setCurrentUser: (user: BankCustomer | null) => void;
  resetCustomers: () => void;

  // Feedback State
  feedbacks: FeedbackItem[];
  addFeedback: (item: Omit<FeedbackItem, 'id' | 'createdAt'>) => FeedbackItem;
  
  // E-commerce State
  orders: Order[];
  addOrder: (order: Order) => void;

  // Password Guessing State
  failedAttempts: number;
  incrementFailedAttempts: () => void;
  resetFailedAttempts: () => void;
  isAccountLocked: boolean;
  lockoutTimeRemaining: number;
  captchaRequired: boolean;
  setCaptchaRequired: (req: boolean) => void;

  // Modals
  isCodeModalOpen: boolean;
  setIsCodeModalOpen: (open: boolean) => void;
  isVivaModalOpen: boolean;
  setIsVivaModalOpen: (open: boolean) => void;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<Mode>('vulnerable');
  const [activeModule, setActiveModule] = useState<ModuleId>('sqli');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  const [customers, setCustomers] = useState<BankCustomer[]>(INITIAL_CUSTOMERS);
  const [currentUser, setCurrentUser] = useState<BankCustomer | null>(null);

  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>(INITIAL_FEEDBACKS);
  const [orders, setOrders] = useState<Order[]>([]);

  // Password Guessing state
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [isAccountLocked, setIsAccountLocked] = useState<boolean>(false);
  const [lockoutTimeRemaining, setLockoutTimeRemaining] = useState<number>(0);
  const [captchaRequired, setCaptchaRequired] = useState<boolean>(false);

  // Modals
  const [isCodeModalOpen, setIsCodeModalOpen] = useState<boolean>(false);
  const [isVivaModalOpen, setIsVivaModalOpen] = useState<boolean>(false);

  const setMode = (newMode: Mode) => {
    setModeState(newMode);
    addLog(
      'info',
      'SYSTEM',
      `Switched to ${newMode.toUpperCase()} MODE ${newMode === 'vulnerable' ? '🔴' : '🟢'}`,
      `// Environment configuration updated\n$SECURITY_MODE = "${newMode.toUpperCase()}";`
    );
  };

  const toggleMode = () => {
    setMode(mode === 'vulnerable' ? 'secure' : 'vulnerable');
  };

  const addLog = (
    level: LogEntry['level'],
    category: string,
    message: string,
    codeSnippet?: string,
    details?: Record<string, unknown>
  ) => {
    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 });
    const newLog: LogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: timeStr,
      level,
      category,
      message,
      codeSnippet,
      details
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const resetCustomers = () => {
    setCustomers(INITIAL_CUSTOMERS);
    setCurrentUser(null);
  };

  const addFeedback = (item: Omit<FeedbackItem, 'id' | 'createdAt'>) => {
    const newItem: FeedbackItem = {
      ...item,
      id: `fb-${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
    };
    setFeedbacks((prev) => [newItem, ...prev]);
    return newItem;
  };

  const addOrder = (order: Order) => {
    setOrders((prev) => [order, ...prev]);
  };

  const incrementFailedAttempts = () => {
    setFailedAttempts((prev) => {
      const next = prev + 1;
      if (next >= 3) {
        setCaptchaRequired(true);
      }
      if (mode === 'secure' && next >= 5) {
        setIsAccountLocked(true);
        setLockoutTimeRemaining(30);
        addLog(
          'secure',
          'AUTH DEFENSE',
          '🔒 SECURITY ALERT: Account locked for 30 seconds due to 5 consecutive failed password attempts!',
          `$locked_until = time() + 30;\n$db->query("UPDATE users SET is_locked=1 WHERE email='$target'");`
        );
      }
      return next;
    });
  };

  const resetFailedAttempts = () => {
    setFailedAttempts(0);
    setIsAccountLocked(false);
    setLockoutTimeRemaining(0);
    setCaptchaRequired(false);
  };

  // Lockout timer effect
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isAccountLocked && lockoutTimeRemaining > 0) {
      timer = setInterval(() => {
        setLockoutTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsAccountLocked(false);
            setFailedAttempts(0);
            setCaptchaRequired(false);
            addLog('info', 'AUTH DEFENSE', 'Account lockout expired. Login attempts reset.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isAccountLocked, lockoutTimeRemaining]);

  // Initial welcome log
  useEffect(() => {
    addLog(
      'info',
      'SYSTEM',
      'Cybersecurity Lab initialized. Select a vulnerability module to demonstrate.',
      '// Information Security Lab - CAT 1 Demo\n$system_status = "READY";'
    );
  }, []);

  return (
    <SecurityContext.Provider
      value={{
        mode,
        setMode,
        toggleMode,
        activeModule,
        setActiveModule,
        logs,
        addLog,
        clearLogs,
        customers,
        currentUser,
        setCurrentUser,
        resetCustomers,
        feedbacks,
        addFeedback,
        orders,
        addOrder,
        failedAttempts,
        incrementFailedAttempts,
        resetFailedAttempts,
        isAccountLocked,
        lockoutTimeRemaining,
        captchaRequired,
        setCaptchaRequired,
        isCodeModalOpen,
        setIsCodeModalOpen,
        isVivaModalOpen,
        setIsVivaModalOpen
      }}
    >
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};
