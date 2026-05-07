import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, TrendingUp, Brain, Zap, CheckCircle2, X,
  ArrowRight, ExternalLink, RefreshCw, AlertTriangle,
  BarChart3, Users, Star, Clock, ChevronRight, Sparkles, PiggyBank
} from 'lucide-react';
import axios from 'axios';

// ─────────────────────────────────────────────────────────
// DESIGN TOKENS (Premium Deep Navy Fintech)
// ─────────────────────────────────────────────────────────
// Background: #f8fafc (soft white from tailwind bg-slate-50)
// Primary: #0f2d5e (deep navy) mapped via inline css variables
// Accent green: #059669 (emerald-600) — only for gains/savings
// All text is slate-900 / slate-600 — no unnecessary colors

// ─────────────────────────────────────────────────────────
// SKELETON COMPONENTS
// ─────────────────────────────────────────────────────────
const SkeletonPulse = ({ className }) => (
  <div className={`animate-pulse bg-slate-200 rounded-lg ${className}`} />
);

const CardSkeleton = () => (
  <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
    <div className="flex items-start justify-between">
      <div className="space-y-2 flex-1">
        <SkeletonPulse className="h-3 w-20" />
        <SkeletonPulse className="h-5 w-3/4" />
        <SkeletonPulse className="h-3 w-2/4" />
      </div>
      <SkeletonPulse className="h-8 w-16 rounded-full" />
    </div>
    <SkeletonPulse className="h-14 w-full rounded-xl" />
    <div className="grid grid-cols-3 gap-3">
      <SkeletonPulse className="h-10 rounded-xl" />
      <SkeletonPulse className="h-10 rounded-xl" />
      <SkeletonPulse className="h-10 rounded-xl" />
    </div>
    <SkeletonPulse className="h-10 w-full rounded-xl" />
  </div>
);

const LoadingState = () => (
  <div className="space-y-4">
    <div className="flex items-center gap-3 px-1 mb-2">
      <motion.div
        animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
      >
        <RefreshCw size={14} className="text-[#0f2d5e]" />
      </motion.div>
      <span className="text-xs font-semibold text-slate-500">
        Fetching live market data & running AI analysis...
      </span>
    </div>
    {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
  </div>
);

// ─────────────────────────────────────────────────────────
// CONFIDENCE BADGE
// ─────────────────────────────────────────────────────────
const ConfidenceBadge = ({ score }) => {
  const color = score >= 80 ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
    : score >= 60 ? 'text-amber-700 bg-amber-50 border-amber-200'
    : 'text-slate-600 bg-slate-100 border-slate-200';

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${color}`}>
      <Brain size={10} /> AI {score}%
    </span>
  );
};

// ─────────────────────────────────────────────────────────
// CATEGORY CHIP
// ─────────────────────────────────────────────────────────
const CategoryChip = ({ category }) => {
  const map = {
    ELSS: { label: 'ELSS · 80C', icon: <TrendingUp size={10} /> },
    Insurance: { label: 'Insurance · 80D', icon: <ShieldCheck size={10} /> },
    NPS: { label: 'NPS · 80CCD', icon: <PiggyBank size={10} /> },
  };
  const { label, icon } = map[category] || { label: category, icon: null };
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#0f2d5e] uppercase tracking-wider">
      {icon} {label}
    </span>
  );
};

// ─────────────────────────────────────────────────────────
// PRODUCT CARD — Premium Navy Look
// ─────────────────────────────────────────────────────────
const ProductCard = ({ rec, index, onInvest }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-slate-300 hover:shadow-md transition-all duration-200 group"
    >
      {/* TOP BAR */}
      <div className="bg-[#0f2d5e]/[0.03] border-b border-slate-100 px-6 py-3 flex items-center justify-between">
        <CategoryChip category={rec.category} />
        <ConfidenceBadge score={rec.confidenceScore} />
      </div>

      {/* MAIN CONTENT */}
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base leading-snug mb-1">{rec.productName}</h3>
            {rec.fundHouse && <p className="text-xs text-slate-500 font-medium">{rec.fundHouse}</p>}
            {rec.features && <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{rec.features}</p>}
          </div>
          {rec.nav && rec.nav !== 'N/A' && (
            <div className="text-right shrink-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live NAV</p>
              <p className="text-lg font-bold text-[#0f2d5e]">{rec.nav}</p>
              {rec.navDate && <p className="text-[10px] text-slate-400">{rec.navDate}</p>}
            </div>
          )}
        </div>

        {/* STATS ROW */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-slate-50 rounded-xl p-3 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Risk</p>
            <p className={`text-xs font-bold ${rec.riskLevel === 'High' ? 'text-rose-600' : rec.riskLevel === 'Medium' ? 'text-amber-600' : 'text-emerald-600'}`}>
              {rec.riskLevel}
            </p>
          </div>
          {rec.expectedCagr && (
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Exp. CAGR</p>
              <p className="text-xs font-bold text-emerald-600">{rec.expectedCagr}</p>
            </div>
          )}
          {rec.claimRatio && (
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Claim Ratio</p>
              <p className="text-xs font-bold text-emerald-600">{rec.claimRatio}</p>
            </div>
          )}
          {rec.premiumPerYear && (
            <div className="bg-slate-50 rounded-xl p-3 text-center col-span-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Premium /yr</p>
              <p className="text-xs font-bold text-slate-700">₹{rec.premiumPerYear.toLocaleString('en-IN')}</p>
            </div>
          )}
          {rec.aum && (
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">AUM</p>
              <p className="text-xs font-bold text-slate-700">{rec.aum}</p>
            </div>
          )}
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center col-start-3">
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Benefit</p>
            <p className="text-[10px] font-semibold text-emerald-700 line-clamp-2">{rec.expectedBenefit}</p>
          </div>
        </div>

        {/* AI REASONING — COLLAPSIBLE */}
        <div className="mb-5">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 text-[10px] font-bold text-[#0f2d5e] uppercase tracking-widest hover:opacity-75 transition-opacity"
          >
            <Brain size={10} />
            AI Reasoning
            <ChevronRight size={10} className={`transition-transform ${expanded ? 'rotate-90' : ''}`} />
          </button>
          <AnimatePresence>
            {expanded && (
              <motion.p
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="text-xs text-slate-600 leading-relaxed mt-2 overflow-hidden"
              >
                {rec.reasoning}
              </motion.p>
            )}
          </AnimatePresence>
          {!expanded && (
            <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">{rec.reasoning}</p>
          )}
        </div>

        {/* CTA */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => onInvest(rec)}
          className="w-full py-3 bg-[#0f2d5e] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#0f2d5e]/90 transition-colors"
        >
          {rec.category === 'Insurance' ? 'Get Quote' : 'Invest Now'}
          <ArrowRight size={16} />
        </motion.button>
      </div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────
// INVEST / QUOTE MODAL
// ─────────────────────────────────────────────────────────
const ActionModal = ({ rec, onClose }) => {
  const partnerUrl = rec.category === 'ELSS' ? 'https://groww.in'
    : rec.category === 'Insurance' ? 'https://policybazaar.com'
    : 'https://enps.nsdl.com';

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 15 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 15 }}
        className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-slate-200 relative"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-5 right-5 w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors">
          <X size={16} />
        </button>

        <div className="mb-6">
          <CategoryChip category={rec.category} />
          <h3 className="text-xl font-bold text-slate-900 mt-2 mb-1">{rec.productName}</h3>
          <p className="text-sm text-slate-500">You will be redirected to the partner platform for execution.</p>
        </div>

        {/* Details */}
        <div className="bg-slate-50 rounded-xl p-4 mb-6 space-y-2 text-sm">
          {rec.nav && rec.nav !== 'N/A' && (
            <div className="flex justify-between">
              <span className="text-slate-500">Current NAV</span>
              <span className="font-bold text-[#0f2d5e]">{rec.nav}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-slate-500">Risk Level</span>
            <span className="font-bold text-slate-800">{rec.riskLevel}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">AI Confidence</span>
            <span className="font-bold text-emerald-600">{rec.confidenceScore}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Expected Benefit</span>
            <span className="font-bold text-slate-800 text-right max-w-[60%]">{rec.expectedBenefit}</span>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-6 flex items-start gap-2">
          <AlertTriangle size={14} className="text-amber-500 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-700">Mutual fund investments are subject to market risks. Please read all scheme-related documents before investing.</p>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 text-slate-600 font-semibold text-sm hover:bg-slate-100 rounded-xl transition-colors border border-slate-200">
            Cancel
          </button>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => { window.open(partnerUrl, '_blank'); onClose(); }}
            className="flex-1 py-2.5 bg-[#0f2d5e] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 hover:bg-[#0f2d5e]/90 transition-colors"
          >
            {rec.category === 'Insurance' ? 'Get Quote' : 'Invest Now'}
            <ExternalLink size={14} />
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────
// ERROR STATE
// ─────────────────────────────────────────────────────────
const ErrorState = ({ message, onRetry }) => (
  <div className="bg-white border border-rose-200 rounded-2xl p-8 text-center">
    <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center mx-auto mb-4">
      <AlertTriangle size={24} className="text-rose-500" />
    </div>
    <h3 className="font-bold text-slate-900 mb-2">Analysis Engine Unavailable</h3>
    <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">{message}</p>
    <button
      onClick={onRetry}
      className="px-6 py-2.5 bg-[#0f2d5e] text-white text-sm font-bold rounded-xl hover:bg-[#0f2d5e]/90 transition-colors flex items-center gap-2 mx-auto"
    >
      <RefreshCw size={14} /> Retry Analysis
    </button>
  </div>
);

// ─────────────────────────────────────────────────────────
// META STATS BAR
// ─────────────────────────────────────────────────────────
const MetaBar = ({ meta }) => {
  if (!meta) return null;
  const total = meta.gap80C + meta.gap80D + meta.gapNPS;
  const saving = Math.round(total * 0.312);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[
        { label: '80C Gap', val: `₹${meta.gap80C.toLocaleString('en-IN')}` },
        { label: '80D Gap', val: `₹${meta.gap80D.toLocaleString('en-IN')}` },
        { label: 'NPS Gap', val: `₹${meta.gapNPS.toLocaleString('en-IN')}` },
        { label: 'Max Tax Saving', val: `~₹${saving.toLocaleString('en-IN')}`, accent: true },
      ].map(({ label, val, accent }) => (
        <div key={label} className={`rounded-xl p-4 border ${accent ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-slate-200'}`}>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
          <p className={`text-base font-bold ${accent ? 'text-emerald-700' : 'text-[#0f2d5e]'}`}>{val}</p>
        </div>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// MAIN MARKETPLACE COMPONENT
// ─────────────────────────────────────────────────────────
export default function Marketplace({ inputData = null }) {
  const [recommendations, setRecommendations] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRec, setSelectedRec] = useState(null);
  // Stable serialized ref to prevent re-fetches on every parent re-render
  const lastFetchedDataRef = useRef(null);

  // Stable fetch — compares inputData BY VALUE to avoid infinite loops
  const doFetch = useCallback(async (normalizedData, isManual = false) => {
    const key = JSON.stringify(normalizedData);
    if (!isManual && lastFetchedDataRef.current === key) return; // Same data, skip
    lastFetchedDataRef.current = key;

    setLoading(true);
    setError(null);
    setRecommendations([]);

    try {
      const userInfo = JSON.parse(localStorage.getItem('taxUserInfo') || '{}');
      const token = userInfo.token || localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/marketplace/recommendations',
        { taxData: normalizedData },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setRecommendations(response.data.recommendations);
        setMeta(response.data.meta);
      } else {
        setError(response.data.error || 'Unable to generate recommendations.');
      }
    } catch (err) {
      const msg = err.response?.data?.details || err.response?.data?.error || err.message;
      setError(msg || 'Connection error. Please check your network and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const normalize = (data) => {
    if (!data) return null;
    // Map regime: TaxSimulator sends 'NEW' or 'OLD', backend expects 'new' or 'old'
    const rawRegime = data.regime || data.activeRegime || 'old';
    const regime = rawRegime.toLowerCase();
    return {
      annualIncome: data.annualIncome || data.income || 0,
      age: data.age || null,
      regime,
      riskProfile: data.riskProfile || null,
      // Under New Regime, deductions are 0 — but gaps vs limits are still real
      investments80C: regime === 'new' ? 0 : (data.investments80C || data.investments || 0),
      healthInsurance80D: regime === 'new' ? 0 : (data.healthInsurance80D || data.insurance || 0),
      nps80CCD: regime === 'new' ? 0 : (data.nps80CCD || data.nps || 0),
    };
  };

  const fetchRecommendations = useCallback(() => {
    const rawData = inputData || {};
    const normalizedData = normalize(rawData);
    if (!normalizedData || !normalizedData.annualIncome) {
      setError('Optimizer data required to generate personalized insights.');
      return;
    }
    doFetch(normalizedData, true);
  }, [inputData, doFetch]);

  // Auto-fetch ONLY when inputData values change (not reference)
  if (!inputData || !(inputData.annualIncome || inputData.income)) {
    return (
      <div className="flex items-center justify-center min-h-[500px] bg-slate-50">
        <div className="text-center p-12 bg-white rounded-[40px] shadow-sm border border-slate-200/60 max-w-sm">
          <PiggyBank className="mx-auto text-primary/10 mb-6" size={64} />
          <h3 className="text-xl font-bold text-slate-900 mb-2">Optimizer Data Required</h3>
          <p className="text-sm text-slate-500 mb-8 leading-relaxed">
            Please run the Tax Optimizer first. We need your profile details to rank financial products by tax saving potential.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">

        {/* HEADER */}
        <div className="border-b border-slate-200 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#0f2d5e]/5 border border-[#0f2d5e]/10 rounded-full text-[10px] font-bold text-[#0f2d5e] uppercase tracking-widest">
                  <Sparkles size={10} /> AI-Driven · Live Market Data
                </span>
              </div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Personal Investment Hub</h1>
              <p className="text-slate-500 text-sm mt-1">Recommendations engineered from your tax profile using live market intelligence.</p>
            </div>
            <button
              onClick={fetchRecommendations}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-white hover:border-slate-300 transition-all disabled:opacity-40"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Refresh Analysis
            </button>
          </div>
        </div>

        {/* OPTIMIZER DATA CONTEXT */}
        {inputData && (
          <div className="bg-[#0f2d5e]/[0.03] border border-[#0f2d5e]/10 rounded-2xl px-5 py-4 flex flex-wrap gap-x-8 gap-y-2 items-center">
            <span className="text-[10px] font-bold text-[#0f2d5e] uppercase tracking-widest">Optimizer Profile Active</span>
            {[
              { label: 'Income', val: `₹${parseInt(inputData.annualIncome || inputData.income || 0).toLocaleString('en-IN')}` },
              { label: 'Age', val: inputData.age ? `${inputData.age} yrs` : 'N/A' },
              { label: 'Regime', val: inputData.regime || 'Old' },
              { label: 'Risk', val: meta?.riskProfile || 'Computing...' },
            ].map(({ label, val }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 font-medium">{label}:</span>
                <span className="text-xs font-bold text-[#0f2d5e]">{val}</span>
              </div>
            ))}
          </div>
        )}

        {/* DEDUCTION GAPS */}
        {meta && <MetaBar meta={meta} />}

        {/* MAIN CONTENT AREA */}
        <div>
          <div className="flex items-center justify-between mb-4 px-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {loading ? 'Computing...' : recommendations.length > 0 ? `${recommendations.length} AI-Ranked Recommendations` : 'No Recommendations'}
            </p>
            {!loading && recommendations.length > 0 && (
              <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
                <Clock size={10} /> Updated just now
              </div>
            )}
          </div>

          <AnimatePresence mode="wait">
            {loading && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <LoadingState />
              </motion.div>
            )}

            {!loading && error && (
              <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <ErrorState message={error} onRetry={fetchRecommendations} />
              </motion.div>
            )}

            {!loading && !error && recommendations.length === 0 && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-white border border-slate-200 rounded-2xl p-10 text-center"
              >
                <CheckCircle2 size={32} className="mx-auto mb-3 text-emerald-500" />
                <h3 className="font-bold text-slate-900 mb-1">All Deductions Maximized</h3>
                <p className="text-sm text-slate-500">Your tax profile shows all eligible deduction limits are fully utilized. No further action required.</p>
              </motion.div>
            )}

            {!loading && !error && recommendations.length > 0 && (
              <motion.div key="recs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                {recommendations.map((rec, i) => (
                  <ProductCard key={`${rec.productName}-${i}`} rec={rec} index={i} onInvest={setSelectedRec} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* FOOTER DISCLAIMER */}
        <div className="border-t border-slate-200 pt-6 flex items-start gap-3">
          <ShieldCheck size={14} className="text-slate-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Recommendations are generated by AI using live data from MFAPI and are intended for informational purposes only.
            This is not financial advice. Always consult a SEBI-registered advisor before investing. Mutual fund investments are
            subject to market risks.
          </p>
        </div>
      </div>

      {/* ACTION MODAL */}
      <AnimatePresence>
        {selectedRec && (
          <ActionModal rec={selectedRec} onClose={() => setSelectedRec(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
