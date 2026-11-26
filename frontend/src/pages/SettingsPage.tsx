import React, { useState } from 'react';
import { Settings, Save, Moon, Sun, Globe, Bell, ShieldCheck, Database } from 'lucide-react';
import { useLanguageTheme, Language } from '../context/LanguageThemeContext';
import api from '../services/api';

export const SettingsPage: React.FC = () => {
  const { language, setLanguage, theme, setTheme, t } = useLanguageTheme();
  
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('diagnostix_notifications');
    return saved ? JSON.parse(saved) : {
      qualityAlerts: true,
      backupUpdates: false
    };
  });
  
  const [showSaved, setShowSaved] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleSave = () => {
    localStorage.setItem('diagnostix_notifications', JSON.stringify(notifications));
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const response = await api.get('/scans/export/dump', { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `scalp_diagnostix_backup_${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed to download system dump:", err);
      alert("Failed to export database dump. Please check your network connection and try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
          <Settings className="h-6 w-6 text-clinical-600" /> {t("System Settings")}
        </h1>
        <p className="text-sm text-slate-500 mt-1">{t("Configure diagnostic hardware interfaces and UI preferences.")}</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden divide-y divide-slate-100">
        {/* Section 1: Themes & Styling */}
        <div className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Sun className="h-4.5 w-4.5 text-clinical-600" /> {t("User Interface Customization")}
          </h3>
          <div className="flex justify-between items-center text-xs">
            <div>
              <p className="font-semibold text-slate-700">{t("Interface Display Theme")}</p>
              <p className="text-slate-400 mt-0.5">{t("Toggle between standard medical light and high contrast dark modes.")}</p>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button 
                onClick={() => setTheme('light')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${theme === 'light' ? 'bg-white shadow text-clinical-600' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <Sun className="h-3.5 w-3.5" /> {t("Light Mode")}
              </button>
              <button 
                onClick={() => setTheme('dark')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${theme === 'dark' ? 'bg-white shadow text-clinical-600' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <Moon className="h-3.5 w-3.5" /> {t("Dark Mode")}
              </button>
            </div>
          </div>
        </div>

        {/* Section 2: Localization */}
        <div className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Globe className="h-4.5 w-4.5 text-clinical-600" /> {t("Language & Regional Localization")}
          </h3>
          <div className="flex justify-between items-center text-xs">
            <div>
              <p className="font-semibold text-slate-700">{t("Display Language")}</p>
              <p className="text-slate-400 mt-0.5">{t("Select preferred localized vocabulary translations.")}</p>
            </div>
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="border border-slate-200 bg-white rounded-lg px-3 py-2 text-slate-700 outline-none font-semibold"
            >
              <option value="en">English (US/UK)</option>
              <option value="es">Español (ES)</option>
              <option value="de">Deutsch (DE)</option>
              <option value="fr">Français (FR)</option>
            </select>
          </div>
        </div>

        {/* Section 3: Notification Alerts */}
        <div className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Bell className="h-4.5 w-4.5 text-clinical-600" /> {t("Alerts & Notifications")}
          </h3>
          
          <div className="space-y-4 text-xs font-semibold">
            {/* Toggle: Real-Time Quality HUD alerts */}
            <div className="flex justify-between items-center">
              <div>
                <p className="text-slate-700">{t("Real-Time Lighting & Blur Cautions")}</p>
                <p className="text-slate-400 font-medium mt-0.5">Show active caution notifications on the webcam HUD when quality values fall.</p>
              </div>
              <input 
                type="checkbox" 
                checked={notifications.qualityAlerts} 
                onChange={(e) => setNotifications({ ...notifications, qualityAlerts: e.target.checked })}
                className="h-4.5 w-4.5 text-clinical-600 focus:ring-clinical-500 rounded border-slate-300"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Data export backup */}
        <div className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Database className="h-4.5 w-4.5 text-clinical-600" /> {t("Database Administration")}
          </h3>
          <div className="flex justify-between items-center text-xs">
            <div>
              <p className="font-semibold text-slate-700">{t("System Clinical Backup")}</p>
              <p className="text-slate-400 mt-0.5">{t("Export structured diagnosis records, histories, and doctor comments to backup.")}</p>
            </div>
            <button 
              onClick={handleExport}
              disabled={exporting}
              className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold transition-all disabled:opacity-50"
            >
              {exporting ? t("Exporting...") : t("Export System Dump")}
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3">
        {showSaved && (
          <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
            <ShieldCheck className="h-4 w-4" /> {t("System configs updated.")}
          </span>
        )}
        <button
          onClick={handleSave}
          className="bg-clinical-600 hover:bg-clinical-700 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow flex items-center gap-1.5"
        >
          <Save className="h-4.5 w-4.5" /> {t("Save Configuration")}
        </button>
      </div>
    </div>
  );
};
