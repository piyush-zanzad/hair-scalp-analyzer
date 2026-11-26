import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ScanFace, 
  History, 
  HelpCircle, 
  Settings, 
  LogOut, 
  Activity,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguageTheme } from '../context/LanguageThemeContext';

export const Sidebar: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const { user, logout } = useAuth();
  const { t } = useLanguageTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    if (onClose) onClose();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'New Scan', path: '/scan', icon: ScanFace },
    { name: 'Scan History', path: '/history', icon: History },
    { name: 'Help Center', path: '/help', icon: HelpCircle },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-white border-r border-slate-200 h-screen flex flex-col justify-between sticky top-0">
      <div>
        {/* Brand/Header */}
        <div className="h-16 border-b border-slate-100 flex items-center px-6 gap-2">
          <Activity className="h-6 w-6 text-clinical-600" />
          <span className="font-extrabold text-slate-800 text-lg tracking-tight">ScalpDiagnostix</span>
          <span className="text-[10px] bg-clinical-100 text-clinical-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">AI</span>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-clinical-50 text-clinical-700 border-l-4 border-clinical-600 pl-3' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              {t(item.name)}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* User profile segment */}
      <div className="p-4 border-t border-slate-100 space-y-3">
        {user && (
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="h-9 w-9 rounded-full bg-clinical-100 border border-clinical-200 flex items-center justify-center text-clinical-700 font-semibold text-sm">
              {user.full_name ? user.full_name.charAt(0) : user.email.charAt(0).toUpperCase()}
            </div>
            <div className="truncate flex-1">
              <p className="text-xs font-semibold text-slate-800 truncate">{user.full_name || 'Clinician'}</p>
              <p className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                <UserCheck className="h-3 w-3 text-emerald-500" /> {user.email}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg text-sm font-medium transition-all"
        >
          <LogOut className="h-5 w-5" />
          {t("Log Out")}
        </button>
      </div>
    </div>
  );
};
