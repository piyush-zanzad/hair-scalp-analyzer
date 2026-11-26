import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  History, 
  Search, 
  Filter, 
  FileDown, 
  Trash2, 
  Eye, 
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { useLanguageTheme } from '../context/LanguageThemeContext';
import api from '../services/api';

interface Prediction {
  prediction_type: string;
  label: string;
  confidence: number;
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

export const ReportsHistory: React.FC = () => {
  const { t } = useLanguageTheme();
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [hairLossFilter, setHairLossFilter] = useState('all');
  const [diseaseFilter, setDiseaseFilter] = useState('all');

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/scans/history');
      setScans(res.data);
    } catch (err) {
      console.error("Error retrieving historical records:", err);
      setError("Failed to sync historical databases.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const getPredictionLabel = (scan: ScanRecord, type: 'hair_loss' | 'scalp_disease') => {
    const p = scan.predictions.find(pred => pred.prediction_type === type);
    return p ? p.label : 'N/A';
  };

  const getAvgConfidence = (scan: ScanRecord) => {
    if (scan.predictions.length === 0) return 0;
    const sum = scan.predictions.reduce((acc, curr) => acc + curr.confidence, 0);
    return Math.round((sum / scan.predictions.length) * 100);
  };

  const handleDelete = async (scanId: string) => {
    if (!confirm("Are you sure you want to permanently delete this diagnostic scan and all compiled reports?")) {
      return;
    }
    
    try {
      await api.delete(`/scans/${scanId}`);
      // Remove from state list
      setScans(scans.filter(s => s.id !== scanId));
    } catch (err) {
      console.error("Failed to delete record:", err);
      alert("Failed to delete the scan record. Please try again.");
    }
  };

  // Export CSV Helper
  const handleExportCSV = () => {
    if (scans.length === 0) return;
    
    const headers = ["Scan ID", "Timestamp", "Hair Loss Class", "Scalp Disease Class", "Average Confidence (%)"];
    const rows = filteredScans.map(s => [
      s.id,
      new Date(s.created_at).toISOString(),
      getPredictionLabel(s, 'hair_loss'),
      getPredictionLabel(s, 'scalp_disease'),
      getAvgConfidence(s)
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `scalp_diagnostix_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Apply filters in memory
  const filteredScans = scans.filter((scan) => {
    const hairLabel = getPredictionLabel(scan, 'hair_loss').toLowerCase();
    const diseaseLabel = getPredictionLabel(scan, 'scalp_disease').toLowerCase();
    const dateStr = new Date(scan.created_at).toLocaleDateString().toLowerCase();
    
    // Search query match
    const matchesSearch = 
      hairLabel.includes(searchQuery.toLowerCase()) || 
      diseaseLabel.includes(searchQuery.toLowerCase()) ||
      dateStr.includes(searchQuery.toLowerCase());
      
    // Category filters match
    const matchesHairFilter = 
      hairLossFilter === 'all' || 
      (hairLossFilter === 'norwood' && hairLabel.includes('norwood')) ||
      (hairLossFilter === 'ludwig' && hairLabel.includes('ludwig')) ||
      (hairLossFilter === 'healthy' && hairLabel.includes('healthy'));
      
    const matchesDiseaseFilter =
      diseaseFilter === 'all' ||
      (diseaseFilter === 'healthy' && diseaseLabel.includes('healthy')) ||
      (diseaseFilter === 'alopecia' && diseaseLabel.includes('alopecia')) ||
      (diseaseFilter === 'folliculitis' && (diseaseLabel.includes('folliculitis') || diseaseLabel.includes('keloidalis'))) ||
      (diseaseFilter === 'other' && !diseaseLabel.includes('healthy') && !diseaseLabel.includes('alopecia') && !diseaseLabel.includes('folliculitis') && !diseaseLabel.includes('keloidalis'));

    return matchesSearch && matchesHairFilter && matchesDiseaseFilter;
  });

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-4 border-clinical-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-500">Querying scan archives...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <History className="h-6 w-6 text-clinical-600" /> Diagnostic Scan Archives
          </h1>
          <p className="text-sm text-slate-500 mt-1">Review, search, filter, and export patient scans.</p>
        </div>
        
        <button
          onClick={handleExportCSV}
          disabled={filteredScans.length === 0}
          className="bg-white border border-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow hover:bg-slate-50 flex items-center gap-1.5 disabled:opacity-50"
        >
          <FileDown className="h-4 w-4" /> Export CSV Spreadsheet
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs px-4 py-3 rounded-xl flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter toolbar */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 items-center">
        {/* Search */}
        <div className="relative w-full md:flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Search by diagnosis, stage, or date..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-clinical-500/10 focus:border-clinical-500 transition-all"
          />
        </div>

        {/* Filter Hair Loss */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-bold text-slate-500 shrink-0">{t("Hair Loss Prediction")}:</span>
          <select 
            value={hairLossFilter}
            onChange={(e) => setHairLossFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 text-slate-700 outline-none font-semibold w-full md:w-44"
          >
            <option value="all">{t("All Conditions")}</option>
            <option value="norwood">{t("Norwood Scale (Male)")}</option>
            <option value="ludwig">{t("Ludwig Scale (Female)")}</option>
            <option value="healthy">{t("Healthy Hair")}</option>
          </select>
        </div>

        {/* Filter Scalp Disease */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-bold text-slate-500 shrink-0">{t("Scalp Condition")}:</span>
            <select 
              value={diseaseFilter}
              onChange={(e) => setDiseaseFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 text-slate-700 outline-none font-semibold w-full md:w-44"
            >
              <option value="all">{t("All Diseases")}</option>
              <option value="healthy">{t("Healthy Scalp")}</option>
              <option value="alopecia">{t("Alopecia Areata")}</option>
              <option value="folliculitis">{t("Folliculitis / Keloidalis")}</option>
              <option value="other">{t("Other Conditions")}</option>
            </select>
        </div>
      </div>

      {/* Main Table view */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {filteredScans.length === 0 ? (
          <div className="p-16 text-center">
            <p className="text-sm text-slate-400 font-semibold">No records match your active query filters.</p>
            <button onClick={() => { setSearchQuery(''); setHairLossFilter('all'); setDiseaseFilter('all'); }} className="text-xs text-clinical-600 hover:underline mt-2 font-bold">
              Reset filter settings
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="p-4 pl-6">{t("Scan Date")}</th>
                  <th className="p-4">{t("Visual Thumbnail")}</th>
                  <th className="p-4">{t("Hair Loss Prediction")}</th>
                  <th className="p-4">{t("Scalp Condition")}</th>
                  <th className="p-4">{t("Avg Confidence")}</th>
                  <th className="p-4 pr-6 text-right">{t("Actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredScans.map((scan) => (
                  <tr key={scan.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 pl-6 text-xs text-slate-500 font-bold">
                      {new Date(scan.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td className="p-4">
                      <div className="h-10 w-14 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                        <img src={scan.image_path} alt="Thumb" className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td className="p-4 text-slate-800 font-bold">{t(getPredictionLabel(scan, 'hair_loss'))}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        getPredictionLabel(scan, 'scalp_disease') === 'Healthy Scalp'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {t(getPredictionLabel(scan, 'scalp_disease'))}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 text-xs font-bold">{getAvgConfidence(scan)}%</td>
                    <td className="p-4 pr-6 text-right space-x-3">
                      <Link 
                        to={`/result/${scan.id}`} 
                        className="text-xs font-bold text-clinical-600 hover:text-clinical-700 hover:underline inline-flex items-center gap-0.5"
                      >
                        <Eye className="h-3.5 w-3.5" /> View
                      </Link>
                      <button 
                        onClick={() => handleDelete(scan.id)}
                        className="text-xs font-bold text-rose-500 hover:text-rose-700 inline-flex items-center gap-0.5 hover:underline"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
