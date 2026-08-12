import type { LogEntry, SecurityEvent, Order, Mode } from '../types/security';
import { INITIAL_SECURITY_EVENTS } from '../data/mockData';

export interface LocalLabDB {
  version: string;
  lastUpdated: string;
  mode: Mode;
  securityControls: Record<string, boolean>;
  logs: LogEntry[];
  events: SecurityEvent[];
  orders: Order[];
}

const DB_KEY = 'lab_db_json_store';

const DEFAULT_DB: LocalLabDB = {
  version: '1.0.0',
  lastUpdated: new Date().toISOString(),
  mode: 'vulnerable',
  securityControls: {
    sqli: false,
    brute_force: false,
    parameter_tampering: false,
    idn_homograph: false,
    xss: false,
    lfi: false
  },
  logs: [],
  events: INITIAL_SECURITY_EVENTS,
  orders: []
};

// Load persistent lab_db.json from localStorage
export const loadLocalDB = (): LocalLabDB => {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) {
      saveLocalDB(DEFAULT_DB);
      return DEFAULT_DB;
    }
    const parsed = JSON.parse(raw) as LocalLabDB;
    return { ...DEFAULT_DB, ...parsed };
  } catch (err) {
    console.error('Failed to parse lab_db.json from local storage', err);
    return DEFAULT_DB;
  }
};

// Save updated lab_db.json state
export const saveLocalDB = (dbState: Partial<LocalLabDB>): LocalLabDB => {
  try {
    const current = loadLocalDB();
    const updated: LocalLabDB = {
      ...current,
      ...dbState,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(DB_KEY, JSON.stringify(updated, null, 2));
    return updated;
  } catch (err) {
    console.error('Failed to save lab_db.json to local storage', err);
    return DEFAULT_DB;
  }
};

// Export lab_db.json file for download
export const exportLabDBAsJSONFile = () => {
  const dbData = loadLocalDB();
  const jsonStr = JSON.stringify(dbData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `lab_db_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Reset lab_db.json to initial defaults
export const resetLocalDB = (): LocalLabDB => {
  localStorage.removeItem(DB_KEY);
  return saveLocalDB(DEFAULT_DB);
};
