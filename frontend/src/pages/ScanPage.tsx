import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CameraFeed } from '../components/CameraFeed';
import { Activity, AlertTriangle, ShieldCheck, Microscope, ArrowLeft } from 'lucide-react';
import { useLanguageTheme } from '../context/LanguageThemeContext';
import api from '../services/api';

export const ScanPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguageTheme();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gender, setGender] = useState<'male' | 'female'>('male');

  const handleCapture = async (imageBlob: Blob) => {
    setIsProcessing(true);
    setError(null);
    
    // Create form data payload
    const formData = new FormData();
    formData.append('file', imageBlob, 'scalp_capture.jpg');
    formData.append('gender', gender);
    
    try {
      const res = await api.post('/scans/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      // Redirect to result screen
      navigate(`/result/${res.data.id}`);
    } catch (err: any) {
      console.error("Diagnostic upload failed:", err);
      setError(
        err.response?.data?.detail || 
        "AI Diagnostic Pipeline offline or image quality rejected by backend validation check. Please recapture."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header toolbar */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => navigate('/dashboard')}
          className="p-2 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-all"
        >
          <ArrowLeft className="h-5 w-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">{t("Conduct Hair & Scalp Scan")}</h1>
          <p className="text-xs text-slate-500">{t("Specify patient gender profile to select Norwood (Male) vs Ludwig (Female) classification model.")}</p>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-sm px-4 py-3.5 rounded-xl flex items-start gap-2.5">
          <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Main capture interface */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Webcam view */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="pb-4 border-b border-slate-100 mb-6 flex justify-between items-center flex-wrap gap-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Microscope className="h-4 w-4 text-clinical-500" /> {t("Conduct Hair & Scalp Scan")}
            </span>

            {/* Gender Selection Selector */}
            <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase px-1">Patient:</span>
              <button
                type="button"
                onClick={() => setGender('male')}
                className={`text-[9px] font-extrabold px-2.5 py-1 rounded transition-all ${gender === 'male' ? 'bg-clinical-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}
              >
                {t("MALE (NORWOOD)")}
              </button>
              <button
                type="button"
                onClick={() => setGender('female')}
                className={`text-[9px] font-extrabold px-2.5 py-1 rounded transition-all ${gender === 'female' ? 'bg-clinical-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}
              >
                {t("FEMALE (LUDWIG)")}
              </button>
            </div>
            
            {isProcessing && (
              <span className="text-xs font-bold text-clinical-600 animate-pulse">{t("Running AI pipeline...")}</span>
            )}
          </div>
          <CameraFeed onCapture={handleCapture} isProcessing={isProcessing} />
        </div>

        {/* Right Column: Instructions Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2 uppercase tracking-wide">
              {t("Clinical Guidelines")}
            </h3>
            <ol className="list-decimal list-inside text-xs text-slate-600 space-y-2.5 font-medium leading-relaxed font-semibold">
              <li>{t("Expose target area (part hair if necessary to view scalp surface).")}</li>
              <li>{t("Position scalp inside the central oval boundary guide.")}</li>
              <li>{t("Ensure the Lighting HUD indicator turns")} <b>{t("Optimal")}</b>.</li>
              <li>{t("Remain completely still during the 3-second capture timer.")}</li>
              <li>{t("The image will upload and process automatically.")}</li>
            </ol>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm text-slate-400 space-y-4">
            <h3 className="font-bold text-white text-sm border-b border-slate-800 pb-2 uppercase tracking-wide">
              {t("Neural Processing HUD")}
            </h3>
            <div className="space-y-3 text-[11px] font-semibold uppercase">
              <div className="flex justify-between">
                <span>{t("Model Pipeline:")}</span>
                <span className="text-clinical-400">
                  {gender === 'male' ? 'EfficientNet-B0 (Norwood)' : 'EfficientNet-B0 (Ludwig)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{t("Preprocessing:")}</span>
                <span className="text-emerald-500">{t("Adaptive CLAHE")}</span>
              </div>
              <div className="flex justify-between">
                <span>{t("Blur Threshold:")}</span>
                <span className="text-slate-200">{t("Laplacian (Var > 75)")}</span>
              </div>
              <div className="flex justify-between">
                <span>{t("Network Latency:")}</span>
                <span className="text-slate-200">{t("Local Async")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
