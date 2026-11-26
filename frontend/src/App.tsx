import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { LanguageThemeProvider } from './context/LanguageThemeContext';
import { Menu, X } from 'lucide-react';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { Dashboard } from './pages/Dashboard';
import { ScanPage } from './pages/ScanPage';
import { ResultPage } from './pages/ResultPage';
import { ReportsHistory } from './pages/ReportsHistory';
import { SettingsPage } from './pages/SettingsPage';
import { HelpCenter } from './pages/HelpCenter';

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-clinical-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-600">Restoring clinical session...</p>
        </div>
      </div>
    );
  }
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Layout for Protected Pages
const ProtectedLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  
  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
        {/* Desktop Sidebar (hidden on mobile) */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* Mobile Sidebar overlay drawer */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            {/* Sidebar drawer content */}
            <div className="relative flex w-64 max-w-xs flex-1 flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 animate-slide-in">
              {/* Close Button inside drawer */}
              <div className="absolute right-4 top-4">
                <button 
                  onClick={() => setSidebarOpen(false)}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <Sidebar onClose={() => setSidebarOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Mobile Top Header (hidden on desktop) */}
          <header className="flex md:hidden items-center justify-between h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-1.5 ml-2">
                <span className="font-extrabold text-slate-800 dark:text-slate-100 text-base tracking-tight">ScalpDiagnostix</span>
                <span className="text-[9px] bg-clinical-100 dark:bg-clinical-950 text-clinical-700 dark:text-clinical-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">AI</span>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <Routes>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="scan" element={<ScanPage />} />
              <Route path="result/:scanId" element={<ResultPage />} />
              <Route path="history" element={<ReportsHistory />} />
              <Route path="help" element={<HelpCenter />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <LanguageThemeProvider>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected Routes Sub-Router */}
            <Route path="/*" element={<ProtectedLayout />} />
          </Routes>
        </AuthProvider>
      </LanguageThemeProvider>
    </Router>
  );
};

export default App;
