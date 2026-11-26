import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, 
  Users, 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  ArrowRight,
  TrendingUp,
  FileDown,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguageTheme } from '../context/LanguageThemeContext';
import api from '../services/api';

import { StatsCard } from '../components/StatsCard';
import { TimelineChart, MonthlyScansChart, DiseaseDistributionChart } from '../components/LineChart';

interface ScanRecord {
  id: string;
  image_path: string;
  heatmap_path: string | null;
  lighting_score: number;
  blur_score: number;
  quality_passed: boolean;
  created_at: string;
  predictions: {
    prediction_type: string;
    label: string;
    confidence: number;
    severity: string;
  }[];
}

interface DashboardStats {
  total_scans: number;
  healthy_scans: number;
  diseased_scans: number;
  total_scans_trend: string;
  healthy_scans_trend: string;
  diseased_scans_trend: string;
  latest_prediction: ScanRecord | null;
  confidence_trend: { date: string; confidence: number }[];
  monthly_progress: { month: string; scans: number }[];
  disease_frequency: { disease: string; count: number }[];
  hair_loss_distribution: { stage: string; count: number }[];
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguageTheme();
  
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentScans, setRecentScans] = useState<ScanRecord[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch stats
        const statsRes = await api.get('/stats/dashboard');
        setStats(statsRes.data);
        
        // Fetch history for list
        const historyRes = await api.get('/scans/history');
        // Slice first 4 for dashboard preview
        setRecentScans(historyRes.data.slice(0, 4));
      } catch (err: any) {
        console.error("Error loading dashboard metrics:", err);
        setError("Database connectivity error. Seed or capture scans to initialize charts.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
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

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-4 border-clinical-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-500">Compiling clinician workspace...</p>
        </div>
      </div>
    );
  }

  // Fallback defaults in case backend returned empty stats
  const totalScans = stats?.total_scans ?? 0;
  const healthyScans = stats?.healthy_scans ?? 0;
  const diseasedScans = stats?.diseased_scans ?? 0;
  const latestScan = stats?.latest_prediction ?? null;

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">{t("Clinical Dashboard")}</h1>
          <p className="text-sm text-slate-500 mt-1">
            {t("Welcome back")}, {user?.full_name || 'Clinician'}.
          </p>
        </div>
        <Link 
          to="/scan" 
          className="bg-clinical-600 hover:bg-clinical-700 text-white text-sm font-bold px-5 py-3 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-1.5"
        >
          {t("Conduct New Scan")} <ArrowRight className="h-4.5 w-4.5" />
        </Link>
      </div>

      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs px-4 py-3 rounded-xl flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid md:grid-cols-4 gap-6">
        <StatsCard 
          title={t("Total Scans Conducted")} 
          value={totalScans} 
          icon={FileText} 
          trendText={stats?.total_scans_trend ?? "+0% this month"} 
          trendType={(stats?.total_scans_trend ?? "").startsWith('-') ? "down" : "up"} 
          colorTheme="blue" 
        />
        <StatsCard 
          title={t("Healthy Diagnoses")} 
          value={healthyScans} 
          icon={CheckCircle} 
          trendText={stats?.healthy_scans_trend ?? "+0% this month"} 
          trendType={(stats?.healthy_scans_trend ?? "").startsWith('-') ? "down" : "up"} 
          colorTheme="green" 
        />
        <StatsCard 
          title={t("Detected Scalp Diseases")} 
          value={diseasedScans} 
          icon={AlertTriangle} 
          trendText={stats?.diseased_scans_trend ?? "+0% this month"} 
          trendType={(stats?.diseased_scans_trend ?? "").startsWith('-') ? "down" : "up"} 
          colorTheme="red" 
        />
        
        {/* Latest Prediction Micro Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t("Latest Diagnosis")}</span>
            <span className="text-[10px] text-slate-400 font-semibold">
              {latestScan ? new Date(latestScan.created_at).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          {latestScan ? (
            <div className="mt-3">
              <h4 className="font-bold text-slate-800 truncate">{getPredictionLabel(latestScan, 'hair_loss')}</h4>
              <p className="text-xs text-slate-500 mt-1 truncate">{getPredictionLabel(latestScan, 'scalp_disease')}</p>
              <div className="mt-3 flex items-center justify-between text-xs font-bold text-clinical-600">
                <Link to={`/result/${latestScan.id}`} className="flex items-center gap-0.5 hover:underline">
                  View Results <ChevronRight className="h-4 w-4" />
                </Link>
                <span className="bg-clinical-50 text-clinical-700 px-2 py-0.5 rounded text-[10px]">
                  {getAvgConfidence(latestScan)}% Conf.
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-xs text-slate-400 font-medium">No scans recorded</p>
            </div>
          )}
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Monthly volume */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-slate-800">Monthly Scan Activity</h3>
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Volume</span>
          </div>
          <MonthlyScansChart data={stats?.monthly_progress ?? []} />
        </div>

        {/* Confidence Progress over time */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-slate-800">Prediction Confidence Trend</h3>
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Consistency</span>
          </div>
          <TimelineChart data={stats?.confidence_trend ?? []} />
        </div>

        {/* Scalp Disease Distribution */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-slate-800">Scalp Disease Frequency</h3>
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Ratio</span>
          </div>
          <DiseaseDistributionChart data={stats?.disease_frequency ?? []} />
        </div>
      </div>

      {/* Recent Diagnostics Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-extrabold text-slate-800 text-sm tracking-tight">{t("Recent Scan Reports")}</h3>
          <Link to="/history" className="text-xs font-bold text-clinical-600 hover:text-clinical-700 flex items-center gap-0.5">
            {t("View All Reports")} <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        
        {recentScans.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm text-slate-400 font-medium">{t("No scan logs captured yet.")}</p>
            <Link to="/scan" className="text-xs text-clinical-600 hover:underline mt-2 inline-block font-semibold">
              {t("Scan patient now")}
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="p-4 pl-6">{t("Scan Date")}</th>
                  <th className="p-4">{t("Hair Loss Prediction")}</th>
                  <th className="p-4">{t("Scalp Condition")}</th>
                  <th className="p-4">{t("Avg Confidence")}</th>
                  <th className="p-4 pr-6 text-right">{t("Actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {recentScans.map((scan) => (
                  <tr key={scan.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 pl-6 text-slate-500 font-semibold text-xs">
                      {new Date(scan.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td className="p-4 text-slate-800 font-bold">{getPredictionLabel(scan, 'hair_loss')}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        getPredictionLabel(scan, 'scalp_disease') === 'Healthy Scalp'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {getPredictionLabel(scan, 'scalp_disease')}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 text-xs font-bold">{getAvgConfidence(scan)}%</td>
                    <td className="p-4 pr-6 text-right space-x-3">
                      <Link 
                        to={`/result/${scan.id}`} 
                        className="text-xs font-bold text-clinical-600 hover:text-clinical-700 hover:underline"
                      >
                        {t("Diagnosis")}
                      </Link>
                      <a 
                        href={`/static/reports/${scan.id}_report.pdf`}
                        download
                        className="text-xs font-bold text-slate-500 hover:text-slate-700 inline-flex items-center gap-0.5 hover:underline"
                        onClick={(e) => {
                          // Prevent default link action if report was not generated
                          if (!scan.heatmap_path) e.preventDefault();
                        }}
                      >
                        <FileDown className="h-3.5 w-3.5" /> PDF
                      </a>
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
