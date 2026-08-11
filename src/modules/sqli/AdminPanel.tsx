import React from 'react';
import type { BankCustomer } from '../../types/security';
import { ShieldCheck, ShieldAlert, LogOut, Key, DollarSign, Database, Server } from 'lucide-react';

interface AdminPanelProps {
  user: BankCustomer;
  onLogout: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ user, onLogout }) => {
  return (
    <div className="space-y-6">
      {/* Admin Header Banner */}
      <div className="rounded-2xl border border-purple-800/80 bg-purple-950/40 p-6 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-900 border border-purple-700 text-purple-300 shadow-lg">
            <ShieldCheck className="h-6 w-6 text-purple-300" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              SecureBank Central Core Administration Panel
              <span className="rounded bg-red-950 px-2 py-0.5 text-xs text-red-400 border border-red-800 font-mono font-bold">
                ROOT PRIVILEGES
              </span>
            </h2>
            <p className="text-xs text-purple-200">
              Authenticated Session: <span className="font-bold text-white">{user.username}</span> ({user.role} Role) • Account: {user.accountNo}
            </p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="flex items-center gap-2 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-700 px-4 py-2 text-xs font-bold text-gray-200 transition"
        >
          <LogOut className="h-4 w-4" />
          <span>Exit Session</span>
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-4">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
            <span>Total Core Bank Vault Assets</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400">₹2,696,701.25</p>
          <span className="text-[10px] text-gray-500">Includes customer reserves and system vault</span>
        </div>

        <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-4">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
            <span>Customer SSN Records Unlocked</span>
            <Key className="h-4 w-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400">4 Accounts</p>
          <span className="text-[10px] text-amber-400/80">Full decryption keys accessible</span>
        </div>

        <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-4">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
            <span>Database Connection Health</span>
            <Server className="h-4 w-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-black text-indigo-400">Active (3306)</p>
          <span className="text-[10px] text-gray-500">MySQL InnoDB Engine v8.0.32</span>
        </div>
      </div>

      {/* System Vault Database Viewer */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Database className="h-4 w-4 text-purple-400" />
            Decrypted Customer Vault & Credit Card Database (`securebank_core.users`)
          </h3>
          <span className="text-xs text-red-400 font-bold flex items-center gap-1">
            <ShieldAlert className="h-4 w-4" /> Confidential Financial Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="border-b border-gray-800 text-gray-400 uppercase">
              <tr>
                <th className="py-3 px-4">User ID</th>
                <th className="py-3 px-4">Account Name</th>
                <th className="py-3 px-4">Account Number</th>
                <th className="py-3 px-4">Balance</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">SSN (Encrypted Vault)</th>
                <th className="py-3 px-4">Decrypted Credit Card</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              <tr className="hover:bg-gray-800/40">
                <td className="py-3 px-4 text-gray-400">#1</td>
                <td className="py-3 px-4 text-white font-bold">admin</td>
                <td className="py-3 px-4 text-indigo-300">ACC-9901-7782</td>
                <td className="py-3 px-4 text-emerald-400">₹2,450,000.00</td>
                <td className="py-3 px-4 text-gray-300">system.administrator@securebank.com</td>
                <td className="py-3 px-4 text-amber-300">***-**-9912</td>
                <td className="py-3 px-4 text-red-400 font-bold">4532-8899-7711-9922</td>
              </tr>
              <tr className="hover:bg-gray-800/40">
                <td className="py-3 px-4 text-gray-400">#2</td>
                <td className="py-3 px-4 text-white font-bold">alex_johnson</td>
                <td className="py-3 px-4 text-indigo-300">ACC-1044-8821</td>
                <td className="py-3 px-4 text-emerald-400">₹45,200.50</td>
                <td className="py-3 px-4 text-gray-300">alex.j@gmail.com</td>
                <td className="py-3 px-4 text-amber-300">***-**-4421</td>
                <td className="py-3 px-4 text-red-400 font-bold">4111-9922-3344-1029</td>
              </tr>
              <tr className="hover:bg-gray-800/40">
                <td className="py-3 px-4 text-gray-400">#3</td>
                <td className="py-3 px-4 text-white font-bold">sarah_tech</td>
                <td className="py-3 px-4 text-indigo-300">ACC-2299-1145</td>
                <td className="py-3 px-4 text-emerald-400">₹189,000.75</td>
                <td className="py-3 px-4 text-gray-300">sarah.engineer@outlook.com</td>
                <td className="py-3 px-4 text-amber-300">***-**-3310</td>
                <td className="py-3 px-4 text-red-400 font-bold">5424-7711-2233-7712</td>
              </tr>
              <tr className="hover:bg-gray-800/40">
                <td className="py-3 px-4 text-gray-400">#4</td>
                <td className="py-3 px-4 text-white font-bold">rahul_sharma</td>
                <td className="py-3 px-4 text-indigo-300">ACC-5521-0099</td>
                <td className="py-3 px-4 text-emerald-400">₹12,500.00</td>
                <td className="py-3 px-4 text-gray-300">rahul.s@yahoo.com</td>
                <td className="py-3 px-4 text-amber-300">***-**-7890</td>
                <td className="py-3 px-4 text-red-400 font-bold">4222-1100-3344-5544</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
