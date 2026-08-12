import type { LogEntry, SecurityEvent, Order, Mode, UserActionLog } from '../types/security';
import { INITIAL_SECURITY_EVENTS } from '../data/mockData';

export interface LocalLabDB {
  version: string;
  lastUpdated: string;
  mode: Mode;
  securityControls: Record<string, boolean>;
  logs: LogEntry[];
  events: SecurityEvent[];
  orders: Order[];
  actions: UserActionLog[];
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
  orders: [],
  actions: []
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
    return { ...DEFAULT_DB, ...parsed, actions: parsed.actions || [] };
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

// Record an action into lab_db.json
export const recordUserAction = (
  module: string,
  actionType: string,
  payload: string,
  mode: Mode,
  status: 'EXPLOITED' | 'BLOCKED' | 'EXECUTED' | 'FAILED',
  details?: string
) => {
  const currentDB = loadLocalDB();
  const newAction: UserActionLog = {
    id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
    module,
    actionType,
    payload,
    mode,
    status,
    details
  };

  const updatedActions = [newAction, ...currentDB.actions];
  saveLocalDB({ actions: updatedActions });
  return newAction;
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

// Export SQLite SQL Dump file (lab.db SQL script)
export const exportSQLiteDBDump = () => {
  const dbData = loadLocalDB();
  let sql = `-- ==========================================================\n`;
  sql += `-- CYBERMART SECURITY LAB - SQLITE DATABASE EXPORT (lab.db)\n`;
  sql += `-- Generated: ${new Date().toISOString()}\n`;
  sql += `-- System Mode: ${dbData.mode.toUpperCase()}\n`;
  sql += `-- ==========================================================\n\n`;

  sql += `CREATE TABLE IF NOT EXISTS users (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  username TEXT NOT NULL,\n  email TEXT UNIQUE,\n  role TEXT NOT NULL\n);\n\n`;
  sql += `CREATE TABLE IF NOT EXISTS actions_audit (\n  id TEXT PRIMARY KEY,\n  timestamp TEXT NOT NULL,\n  module TEXT NOT NULL,\n  action_type TEXT NOT NULL,\n  payload TEXT,\n  execution_mode TEXT NOT NULL,\n  status TEXT NOT NULL,\n  details TEXT\n);\n\n`;

  sql += `BEGIN TRANSACTION;\n`;
  dbData.actions.forEach((act) => {
    const cleanPayload = (act.payload || '').replace(/'/g, "''");
    const cleanDetails = (act.details || '').replace(/'/g, "''");
    sql += `INSERT INTO actions_audit (id, timestamp, module, action_type, payload, execution_mode, status, details) VALUES ('${act.id}', '${act.timestamp}', '${act.module}', '${act.actionType}', '${cleanPayload}', '${act.mode}', '${act.status}', '${cleanDetails}');\n`;
  });
  sql += `COMMIT;\n`;

  const blob = new Blob([sql], { type: 'application/sql' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lab_actions_audit_${new Date().toISOString().slice(0, 10)}.sql`;
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
