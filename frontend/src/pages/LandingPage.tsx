import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Activity, 
  BrainCircuit, 
  Camera, 
  FileCheck, 
  ShieldCheck, 
  ArrowRight,
  TrendingUp,
  Microscope
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { token } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: 'easeOut' }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Navigation Top Bar */}
      <header className="h-20 bg-white/70 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 px-6 lg:px-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-clinical-600 animate-pulse" />
          <span className="font-extrabold text-slate-800 text-lg tracking-tight">ScalpDiagnostix</span>
          <span className="text-[10px] bg-clinical-100 text-clinical-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">AI</span>
        </div>
        <div className="flex items-center gap-4">
          {token ? (
            <Link 
              to="/dashboard" 
              className="bg-clinical-600 text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-clinical-700 hover:shadow-md transition-all flex items-center gap-1"
            >
              Go to Workspace <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-slate-600 hover:text-slate-900 font-semibold text-sm transition-all">
                Login
              </Link>
              <Link 
                to="/register" 
                className="bg-clinical-600 text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-clinical-700 hover:shadow-md transition-all"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-6 py-16 lg:py-24 grid lg:grid-cols-12 gap-12 items-center">
          {/* Hero Left Info */}
          <motion.div 
            className="lg:col-span-7 space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div 
              variants={itemVariants} 
              className="inline-flex items-center gap-1.5 bg-clinical-50 text-clinical-700 border border-clinical-100 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
            >
              <BrainCircuit className="h-3.5 w-3.5" /> Next-Generation Medical AI
            </motion.div>
            
            <motion.h1 
              variants={itemVariants}
              className="text-4xl lg:text-5xl font-black text-slate-900 leading-[1.15] tracking-tight"
            >
              AI-Powered Hair Loss & <span className="text-clinical-600 bg-gradient-to-r from-clinical-600 to-clinical-800 bg-clip-text text-transparent">Scalp Diagnostics</span>
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="text-slate-600 text-base lg:text-lg leading-relaxed max-w-xl"
            >
              Perform real-time clinical assessment of Norwood/Ludwig hair fall stages, dandruff, and psoriasis using your laptop webcam and deep feature activation heatmaps (Grad-CAM).
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-wrap gap-4 pt-2">
              <Link 
                to={token ? "/scan" : "/login"} 
                className="bg-clinical-600 text-white font-bold px-7 py-3.5 rounded-xl hover:bg-clinical-700 shadow-lg shadow-clinical-500/20 hover:shadow-xl hover:shadow-clinical-500/30 transition-all flex items-center gap-2 text-sm"
              >
                Start Scalp Scan <ArrowRight className="h-4.5 w-4.5" />
              </Link>
              <Link 
                to={token ? "/help" : "/login"}
                className="bg-white border border-slate-200 text-slate-700 font-bold px-7 py-3.5 rounded-xl hover:bg-slate-50 transition-all text-sm"
              >
                Learn More
              </Link>
            </motion.div>
          </motion.div>

          {/* Hero Right Image Mockup */}
          <motion.div 
            className="lg:col-span-5 relative"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 overflow-hidden">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4">
                <span className="text-xs font-bold text-slate-400 tracking-wider">LIVE DIAGNOSIS PREVIEW</span>
                <span className="h-2.5 w-2.5 bg-emerald-500 rounded-full animate-ping" />
              </div>
              <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden relative flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
                <img 
                  src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=60" 
                  alt="Scalp Scan Demo"
                  className="w-full h-full object-cover opacity-70 filter saturate-[0.85]"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                  <ellipse cx="50%" cy="50%" rx="30%" ry="42%" fill="none" stroke="#0e8ce2" strokeWidth="2.5" strokeDasharray="5 4" />
                </div>
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-[10px] text-white px-2 py-1 rounded font-bold uppercase tracking-wider z-20 flex items-center gap-1">
                  <Microscope className="h-3 w-3 text-clinical-400" /> Patient Scalp Region
                </div>
              </div>

              {/* Mock prediction HUD */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Norwood Stage</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">Stage III-Vertex</p>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-clinical-500 h-full rounded-full" style={{ width: '85%' }} />
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1 block">Confidence: 85%</span>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Scalp Condition</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">Dandruff Detected</p>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: '92%' }} />
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1 block">Confidence: 92%</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Feature Cards Grid Section */}
        <section className="bg-white border-y border-slate-200 py-16">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center max-w-xl mx-auto mb-12">
              <h2 className="text-2xl font-bold text-slate-800">Advanced Diagnostic Features</h2>
              <p className="text-sm text-slate-500 mt-2">Engineered using transfer learning models to match commercial healthcare software standards.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 hover:shadow-md transition-all">
                <div className="p-3 bg-clinical-100 text-clinical-700 rounded-lg w-fit mb-4">
                  <Camera className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Webcam Preprocessing</h3>
                <p className="text-sm text-slate-500 mt-2">Real-time light and blur analysis. Ensures input images meet resolution, exposure, and focus standards before running inference.</p>
              </div>

              {/* Feature 2 */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 hover:shadow-md transition-all">
                <div className="p-3 bg-clinical-100 text-clinical-700 rounded-lg w-fit mb-4">
                  <BrainCircuit className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">ResNet50 / Grad-CAM</h3>
                <p className="text-sm text-slate-500 mt-2">Advanced feature extraction maps visual indicators (redness, scaling, thinning) directly onto overlays, justifying the AI's diagnosis.</p>
              </div>

              {/* Feature 3 */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 hover:shadow-md transition-all">
                <div className="p-3 bg-clinical-100 text-clinical-700 rounded-lg w-fit mb-4">
                  <FileCheck className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Clinical PDF Reports</h3>
                <p className="text-sm text-slate-500 mt-2">Automatically compiles diagnostic metrics, comparative scan history, and custom treatment suggestions into print-ready PDF reports.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-6 lg:px-16 border-t border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-clinical-500" />
            <span className="font-extrabold text-white text-base tracking-tight">ScalpDiagnostix</span>
          </div>
          <p className="text-xs">
            © {new Date().getFullYear()} ScalpDiagnostix Inc. Clinical Diagnostic AI System. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs font-semibold">
            <Link to={token ? "/help" : "/login"} className="hover:text-white transition-all">Documentation</Link>
            <span className="text-slate-700">|</span>
            <Link to={token ? "/settings" : "/login"} className="hover:text-white transition-all">Settings</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
