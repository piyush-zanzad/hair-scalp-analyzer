import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileDown, 
  CheckCircle, 
  AlertCircle, 
  MessageSquare, 
  RefreshCw,
  TrendingUp,
  Image as ImageIcon,
  Flame,
  ArrowRightLeft
} from 'lucide-react';
import { useLanguageTheme } from '../context/LanguageThemeContext';
import api from '../services/api';

interface Prediction {
  id: string;
  prediction_type: string;
  label: string;
  confidence: number;
  severity: string;
  explanation: string;
  recommendations: string[];
}

interface ScanRecord {
  id: string;
  image_path: string;
  heatmap_path: string | null;
  lighting_score: number;
  blur_score: number;
  quality_passed: boolean;
  created_at: string;
  predictions: Prediction[];
}

export const ResultPage: React.FC = () => {
  const { scanId } = useParams<{ scanId: string }>();
  const navigate = useNavigate();
  const { t } = useLanguageTheme();

  const [scan, setScan] = useState<ScanRecord | null>(null);
  const [history, setHistory] = useState<ScanRecord[]>([]);
  const [compareScanId, setCompareScanId] = useState<string>('');
  const [compareScan, setCompareScan] = useState<ScanRecord | null>(null);
  
  const [doctorNotes, setDoctorNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [notesSuccess, setNotesSuccess] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchScanDetails = async () => {
      if (!scanId) return;
      try {
        setLoading(true);
        // Fetch current scan
        const res = await api.get(`/scans/${scanId}`);
        setScan(res.data);
        
        // Fetch doctor notes
        try {
          const reportRes = await api.get(`/reports/${scanId}`);
          setDoctorNotes(reportRes.data.doctor_notes || '');
        } catch {
          // Report might not exist or be generated yet, ignore
        }

        // Fetch history to enable comparative analysis
        const historyRes = await api.get('/scans/history');
        const filteredHistory = historyRes.data.filter((s: ScanRecord) => s.id !== scanId);
        setHistory(filteredHistory);
        
        // Auto-select the most recent past scan for comparison if available
        if (filteredHistory.length > 0) {
          setCompareScanId(filteredHistory[0].id);
        }
      } catch (err) {
        console.error("Error loading scan details:", err);
        setError("Failed to retrieve diagnostics data. The record may not exist.");
      } finally {
        setLoading(false);
      }
    };

    fetchScanDetails();
  }, [scanId]);

  // Handle previous scan comparison selection change
  useEffect(() => {
    if (!compareScanId) {
      setCompareScan(null);
      return;
    }
    const loadCompareScan = async () => {
      try {
        const res = await api.get(`/scans/${compareScanId}`);
        setCompareScan(res.data);
      } catch (err) {
        console.error("Error loading comparison scan:", err);
      }
    };
    loadCompareScan();
  }, [compareScanId]);

  const handleSaveNotes = async () => {
    if (!scanId) return;
    setIsSavingNotes(true);
    setNotesSuccess(false);
    try {
      await api.put(`/reports/${scanId}/notes`, { doctor_notes: doctorNotes });
      setNotesSuccess(true);
      setTimeout(() => setNotesSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save doctor comments:", err);
      alert("Failed to save clinical comments. Please check database connection.");
    } finally {
      setIsSavingNotes(false);
    }
  };

  const getPrediction = (targetScan: ScanRecord | null, type: 'hair_loss' | 'scalp_disease') => {
    if (!targetScan) return null;
    return targetScan.predictions.find(p => p.prediction_type === type) || null;
  };

  const getSeverityBadgeColor = (severity: string = 'Normal') => {
    const s = severity.toLowerCase();
    if (s.includes('normal') || s.includes('healthy')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (s.includes('mild')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (s.includes('moderate')) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-rose-50 text-rose-700 border-rose-200';
  };

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-4 border-clinical-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-500">Generating Grad-CAM overlays...</p>
        </div>
      </div>
    );
  }

  if (error || !scan) {
    return (
      <div className="max-w-xl mx-auto text-center py-12 space-y-4">
        <AlertCircle className="h-12 w-12 text-rose-500 mx-auto" />
        <h3 className="text-lg font-bold text-slate-800">Diagnostics Data Error</h3>
        <p className="text-sm text-slate-500">{error || 'An unexpected error occurred.'}</p>
        <button onClick={() => navigate('/dashboard')} className="text-xs bg-slate-200 hover:bg-slate-300 font-bold px-4 py-2 rounded-lg text-slate-700 transition-all">
          Return to Dashboard
        </button>
      </div>
    );
  }

  const hairLoss = getPrediction(scan, 'hair_loss');
  const scalpDisease = getPrediction(scan, 'scalp_disease');

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Toolbar */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-2 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-all"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">{t("Diagnostics Output")}</h1>
            <p className="text-xs text-slate-500">Scan ID: {scan.id} • Completed {new Date(scan.created_at).toLocaleString()}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={`/static/reports/${scan.id}_report.pdf`}
            download
            className="bg-clinical-600 hover:bg-clinical-700 text-white text-xs font-bold px-5 py-3 rounded-xl transition-all shadow-md flex items-center gap-1.5"
          >
            <FileDown className="h-4.5 w-4.5" /> {t("Download PDF Report")}
          </a>
        </div>
      </div>

      {/* Visual Section: Original vs Heatmap */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <ImageIcon className="h-4.5 w-4.5 text-slate-400" /> {t("Visual Thumbnail")}
          </div>
          <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden">
            <img src={scan.image_path} alt="Original Scan" className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <Flame className="h-4.5 w-4.5 text-rose-500 animate-pulse" /> Grad-CAM Activation Heatmap
          </div>
          <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden">
            {scan.heatmap_path ? (
              <img src={scan.heatmap_path} alt="Grad-CAM Heatmap" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm font-semibold">
                Grad-CAM rendering unavailable.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Diagnostics Cards Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Hair Loss Diagnosis */}
        {hairLoss && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Analysis Category</span>
                  <h3 className="font-extrabold text-slate-800 text-base mt-0.5">{t("Hair Loss Prediction")}</h3>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getSeverityBadgeColor(hairLoss.severity)}`}>
                  {hairLoss.severity || 'Mild'}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <h4 className="text-xl font-black text-slate-900">{t(hairLoss.label)}</h4>
                  <span className="text-xs font-bold text-clinical-600">{Math.round(hairLoss.confidence * 100)}% Confidence</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">{hairLoss.explanation}</p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
              <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">{t("Clinical Recommendations")}</h5>
              <ul className="text-xs text-slate-600 space-y-2 font-medium">
                {hairLoss.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="h-4.5 w-4.5 text-clinical-500 shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Scalp Disease Diagnosis */}
        {scalpDisease && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Analysis Category</span>
                  <h3 className="font-extrabold text-slate-800 text-base mt-0.5">{t("Scalp Condition")}</h3>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getSeverityBadgeColor(scalpDisease.severity)}`}>
                  {scalpDisease.severity || 'Normal'}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <h4 className="text-xl font-black text-slate-900">{t(scalpDisease.label)}</h4>
                  <span className="text-xs font-bold text-clinical-600">{Math.round(scalpDisease.confidence * 100)}% Confidence</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">{scalpDisease.explanation}</p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
              <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">{t("Clinical Recommendations")}</h5>
              <ul className="text-xs text-slate-600 space-y-2 font-medium">
                {scalpDisease.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="h-4.5 w-4.5 text-clinical-500 shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Comparative Scan Section */}
      {history.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5 text-clinical-600" />
              <h3 className="font-extrabold text-slate-800 text-sm tracking-tight">{t("Compare with Historical Scans")}</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold">{t("Select Past Scan:")}</span>
              <select 
                value={compareScanId} 
                onChange={(e) => setCompareScanId(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 font-semibold outline-none"
              >
                <option value="">-- Choose scan to compare --</option>
                {history.map(s => (
                  <option key={s.id} value={s.id}>
                    {new Date(s.created_at).toLocaleDateString()} - {t(getPrediction(s, 'hair_loss')?.label || '')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {compareScan && (
            <div className="grid md:grid-cols-2 gap-8 bg-slate-50 border border-slate-100 p-6 rounded-xl">
              {/* Previous Scan Panel */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest text-center border-b border-slate-200 pb-2">
                  {t("Historical Record")} ({new Date(compareScan.created_at).toLocaleDateString()})
                </h4>
                <div className="aspect-video bg-slate-200 rounded-lg overflow-hidden">
                  <img src={compareScan.image_path} alt="Past Scan" className="w-full h-full object-cover" />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white border border-slate-100 p-2.5 rounded-lg">
                    <span className="text-[9px] font-bold text-slate-400 block uppercase">{t("Hair Loss Prediction")}</span>
                    <span className="font-bold text-slate-800">{t(getPrediction(compareScan, 'hair_loss')?.label || '')}</span>
                  </div>
                  <div className="bg-white border border-slate-100 p-2.5 rounded-lg">
                    <span className="text-[9px] font-bold text-slate-400 block uppercase">{t("Scalp Condition")}</span>
                    <span className="font-bold text-slate-800">{t(getPrediction(compareScan, 'scalp_disease')?.label || '')}</span>
                  </div>
                </div>
              </div>

              {/* Active Current Scan Panel */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-clinical-600 uppercase tracking-widest text-center border-b border-slate-200 pb-2">
                  {t("Active Scan")} ({new Date(scan.created_at).toLocaleDateString()})
                </h4>
                <div className="aspect-video bg-slate-200 rounded-lg overflow-hidden">
                  <img src={scan.image_path} alt="Active Scan" className="w-full h-full object-cover" />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white border border-slate-100 p-2.5 rounded-lg border-l-4 border-l-clinical-500">
                    <span className="text-[9px] font-bold text-slate-400 block uppercase">{t("Hair Loss Prediction")}</span>
                    <span className="font-bold text-slate-800">{t(getPrediction(scan, 'hair_loss')?.label || '')}</span>
                  </div>
                  <div className="bg-white border border-slate-100 p-2.5 rounded-lg border-l-4 border-l-clinical-500">
                    <span className="text-[9px] font-bold text-slate-400 block uppercase">{t("Scalp Condition")}</span>
                    <span className="font-bold text-slate-800">{t(getPrediction(scan, 'scalp_disease')?.label || '')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Practitioner Notes Area */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <MessageSquare className="h-5 w-5 text-clinical-600" />
          <h3 className="font-extrabold text-slate-800 text-sm tracking-tight">{t("Clinical Practitioner / Doctor Notes")}</h3>
        </div>
        <textarea
          rows={4}
          value={doctorNotes}
          onChange={(e) => setDoctorNotes(e.target.value)}
          placeholder="Enter clinical assessment notes, progression commentary, or bespoke treatment timelines. Saving will automatically update the patient PDF report file."
          className="w-full border border-slate-200 rounded-xl p-4 bg-slate-50 text-slate-800 outline-none text-sm font-medium focus:bg-white focus:ring-2 focus:ring-clinical-500/20 focus:border-clinical-500 transition-all leading-relaxed"
        />
        <div className="flex justify-end items-center gap-3">
          {notesSuccess && (
            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle className="h-4.5 w-4.5" /> Comments Saved & PDF Updated!
            </span>
          )}
          <button
            onClick={handleSaveNotes}
            disabled={isSavingNotes}
            className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all shadow disabled:opacity-50"
          >
            {isSavingNotes ? 'Updating files...' : t("Save Practitioner Comments")}
          </button>
        </div>
      </div>
    </div>
  );
};
