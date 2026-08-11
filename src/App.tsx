import React, { useState } from 'react';
import { SecurityProvider, useSecurity } from './context/SecurityContext';
import { Navbar } from './components/Navbar';
import { TerminalLogs } from './components/TerminalLogs';
import { CodeInspectorModal } from './components/CodeInspectorModal';
import { VivaFlashcardsModal } from './components/VivaFlashcardsModal';
import { LabReportModal } from './components/LabReportModal';
import { BurpProxyModal } from './components/BurpProxyModal';
import { PayloadLibraryModal } from './components/PayloadLibraryModal';
import { SecurityHeadersAuditor } from './components/SecurityHeadersAuditor';

import { SqliModule } from './modules/sqli/SqliModule';
import { XssModule } from './modules/xss/XssModule';
import { ParameterTamperingModule } from './modules/parameter-tampering/ParameterTamperingModule';
import { PasswordGuessingModule } from './modules/password-guessing/PasswordGuessingModule';
import { FullAppModule } from './modules/full-app/FullAppModule';
import { BookOpen, FileCode2, Award } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeModule, setIsCodeModalOpen, setIsVivaModalOpen } = useSecurity();
  const [isTerminalOpen, setIsTerminalOpen] = useState<boolean>(true);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Header & Navigation */}
      <Navbar isTerminalOpen={isTerminalOpen} setIsTerminalOpen={setIsTerminalOpen} />

      {/* Main Content Viewport */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 mb-20">
        {activeModule === 'sqli' && <SqliModule />}
        {activeModule === 'xss' && <XssModule />}
        {activeModule === 'parameter-tampering' && <ParameterTamperingModule />}
        {activeModule === 'password-guessing' && <PasswordGuessingModule />}
        {activeModule === 'full-app' && <FullAppModule />}
      </main>

      {/* Footer Banner */}
      <footer className="border-t border-gray-800/80 bg-gray-950/80 py-4 px-4 text-center text-xs text-gray-400 print:hidden">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-indigo-400" />
            <span className="font-semibold text-gray-300">Information Security Lab Project (CAT 1)</span>
            <span>•</span>
            <span className="text-gray-400 font-mono">College Viva Simulation Suite</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={() => setIsCodeModalOpen(true)}
              className="hover:text-purple-300 flex items-center gap-1 transition"
            >
              <FileCode2 className="h-3.5 w-3.5" />
              <span>PHP/MySQL Code Diffs</span>
            </button>
            <button
              onClick={() => setIsVivaModalOpen(true)}
              className="hover:text-amber-300 flex items-center gap-1 transition"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Viva Flashcards</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Modals & Terminal Log Drawer */}
      <TerminalLogs isOpen={isTerminalOpen} onClose={() => setIsTerminalOpen(false)} />
      <CodeInspectorModal />
      <VivaFlashcardsModal />
      <LabReportModal />
      <BurpProxyModal />
      <PayloadLibraryModal />
      <SecurityHeadersAuditor />
    </div>
  );
};

export function App() {
  return (
    <SecurityProvider>
      <AppContent />
    </SecurityProvider>
  );
}

export default App;
