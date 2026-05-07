import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTax } from '../context/TaxContext';
import { 
  FileUp, FileText, CheckCircle2, AlertCircle, 
  Loader2, Trash2, ArrowRight, ShieldCheck, Sparkles, Zap,
  Scale, Lightbulb, Target, Award,
  ChevronDown, ChevronUp, Building2, IndianRupee, PiggyBank,
  TrendingDown, Info, Brain
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ──── Formatting Helpers ─────────────────────────────────────────────────────
const fmt = (v) => (v || 0).toLocaleString('en-IN');
const fmtCurrency = (v) => `₹${fmt(v)}`;

// ──── Reusable Sub-Components ────────────────────────────────────────────────
const StatCard = ({ label, value, subtitle, accent = false, icon }) => (
  <div className={`p-5 rounded-3xl border ${accent ? 'bg-primary/5 border-primary/20' : 'bg-surface-container-low border-outline-variant/10'}`}>
    <div className="flex items-center gap-2 mb-1">
      {icon && <span className="text-primary">{icon}</span>}
      <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">{label}</p>
    </div>
    <p className={`text-2xl font-black ${accent ? 'text-primary' : 'text-on-surface'}`}>{value}</p>
    {subtitle && <p className="text-xs text-on-surface-variant mt-1">{subtitle}</p>}
  </div>
);

const SlabRow = ({ slab, idx }) => (
  <div className={`flex justify-between items-center px-4 py-2.5 rounded-xl text-sm ${idx % 2 === 0 ? 'bg-surface-container-low/40' : ''}`}>
    <span className="text-on-surface-variant font-medium w-[45%] truncate">{slab.range}</span>
    <span className="font-bold text-on-surface-variant w-[15%] text-center">{slab.rate}</span>
    <span className="font-bold text-on-surface w-[20%] text-right">{fmtCurrency(slab.taxableAmount)}</span>
    <span className="font-black text-on-surface w-[20%] text-right">{fmtCurrency(slab.tax)}</span>
  </div>
);

const ExpandableSection = ({ title, icon, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-outline-variant/15 rounded-3xl overflow-hidden bg-white mb-6">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 hover:bg-surface-container-low/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon}
          <h3 className="font-bold text-base text-on-surface uppercase tracking-wider">{title}</h3>
        </div>
        {open ? <ChevronUp size={18} className="text-on-surface-variant" /> : <ChevronDown size={18} className="text-on-surface-variant" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ──── Main Component ─────────────────────────────────────────────────────────
const DocumentAnalyzer = ({ onApply }) => {
  const { user } = useAuth();
  const { applyExtractedData } = useTax(); // Inject context for automated sync
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [password, setPassword] = useState('');
  const [requiresPassword, setRequiresPassword] = useState(false);


  const onFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && (selected.type === 'application/pdf' || selected.type.startsWith('image/'))) {
       setFile(selected);
       setError(null);
    } else {
       setError("Please upload a valid PDF or image document.");
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('document', file);
    if (password) {
        formData.append('password', password);
    }

    try {
      const response = await axios.post('/api/tax/analyze-document', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${user?.token}`
        }
      });
      // Handle actual response format
      setResult(response.data);
      setRequiresPassword(false);
      setPassword('');
      
      // --- AUTOMATED FLOW: Trigger Extraction Sync ---
      if (response.data?.extraction && typeof applyExtractedData === 'function') {
        const normalized = {
          ...response.data.extraction,
          cityCategory: (response.data.extraction.cityCategory || 'metro').toLowerCase().includes('metro') ? 'metro' : 'non-metro'
        };
        applyExtractedData(normalized);
      }
      
    } catch (err) {
      console.error('Analysis error:', err);
      const apiError = err.response?.data?.error;
      if (apiError === "PASSWORD_REQUIRED") {
        setRequiresPassword(true);
        setError("This file is password protected. Please enter the password.");
      } else if (apiError === "INCORRECT_PASSWORD") {
        setRequiresPassword(true);
        setError("Incorrect password. Please try again.");
      } else {
        setError(err.response?.data?.message || "Failed to analyze document. Please try again.");
      }
    } finally {
      setLoading(false);
    }

  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0];
      if (selected.type === 'application/pdf' || selected.type.startsWith('image/')) {
        setFile(selected);
        setError(null);
      } else {
        setError("Only PDF and image files are supported.");
      }
    }
  };

  const [isApplied, setIsApplied] = useState(false);

  const handleApply = () => {
    if (!result?.extraction || !onApply) return;
    onApply(result.extraction);
    setIsApplied(true);
    setTimeout(() => setIsApplied(false), 3000);
  };

  const extraction = result?.extraction;
  const report = result?.report;

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 rounded-full border border-indigo-100 mb-2">
              <FileUp size={14} className="text-primary" />
              <span className="text-[10px] font-black text-primary uppercase tracking-widest">AI Tax Optimization Engine</span>
           </div>
           <h1 className="text-4xl font-display font-black tracking-tight">Smart Extraction</h1>
           <p className="text-on-surface-variant max-w-lg">
             Upload your Form 16 or Salary Slip. Our AI extracts financial data and computes a full Old vs New Regime tax optimization report.
           </p>
        </div>
        <div className="flex bg-white p-2 rounded-2xl border border-outline-variant/30 shadow-sm">
           <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-xl text-primary font-bold text-xs border border-indigo-100">
              <ShieldCheck size={14} />
              Bank-Grade Security
           </div>
        </div>
      </header>

      {/* ── Upload Area ─────────────────────────────────────────────────── */}
      {!result && (
        <section className="max-w-2xl mx-auto space-y-6">
           <div 
             onDragEnter={handleDrag}
             onDragLeave={handleDrag}
             onDragOver={handleDrag}
             onDrop={handleDrop}
             className={`relative h-[360px] rounded-[40px] border-4 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-10 text-center ${
               isDragging 
                 ? 'border-primary bg-primary/5 scale-[0.98]' 
                 : 'border-outline-variant/20 bg-white hover:border-primary/30'
             }`}
           >
             {!file ? (
               <motion.div 
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                 className="space-y-6"
               >
                  <div className="w-24 h-24 bg-surface-container-low rounded-[32px] flex items-center justify-center mx-auto shadow-sm">
                     <FileText className="text-on-surface-variant w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black font-display mb-2">Select a Document</h3>
                    <p className="text-on-surface-variant max-w-xs mx-auto text-sm">
                      Drag & Drop your tax documents here, or click to browse
                    </p>
                  </div>
                  <label className="inline-flex bg-primary text-white px-8 py-3.5 rounded-2xl font-black text-sm cursor-pointer hover:shadow-lg hover:shadow-primary/25 transition-all">
                    Choose File
                    <input type="file" className="hidden" accept=".pdf,image/*" onChange={onFileChange} />
                  </label>
               </motion.div>
             ) : (
               <motion.div 
                 initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                 className="space-y-6 w-full max-w-sm"
               >
                  <div className="bg-indigo-50 border border-indigo-100 p-8 rounded-[36px] relative group overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                        <FileText size={80} className="text-primary" />
                    </div>
                    <FileText className="text-primary w-12 h-12 mb-4" />
                    <h4 className="font-black text-on-surface truncate pr-6">{file.name}</h4>
                    <p className="text-xs text-on-surface-variant font-bold">{(file.size / 1024 / 1024).toFixed(2)} MB • Ready</p>
                    <button 
                        onClick={() => setFile(null)}
                        className="absolute top-4 right-4 p-2 text-on-surface-variant hover:text-red-500 transition-colors"
                    >
                        <Trash2 size={16} />
                    </button>
                  </div>

                  <button 
                    onClick={handleUpload}
                    disabled={loading}
                    className="w-full bg-on-surface text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-on-surface/90 transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" />
                        <span>Analyzing with Engine...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={20} />
                        <span>{requiresPassword ? 'Unlock & Analyze' : 'Start Optimization Engine'}</span>
                      </>
                    )}
                  </button>

                  {requiresPassword && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="space-y-3 pt-2"
                    >
                        <div className="relative group">
                            <input 
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter document password"
                                className="w-full bg-white border-2 border-primary/20 rounded-2xl px-5 py-4 outline-none focus:border-primary transition-all text-sm font-bold"
                                autoFocus
                            />
                        </div>
                        <p className="text-[10px] text-on-surface-variant font-medium flex items-center gap-1 px-1">
                            <ShieldCheck size={12} /> Passwords are used in-memory and never stored.
                        </p>
                    </motion.div>
                  )}

               </motion.div>
             )}
           </div>

           {error && (
              <div className="flex items-center gap-3 bg-red-50 p-5 rounded-3xl border border-red-100 text-red-600">
                <AlertCircle />
                <p className="text-sm font-bold">{error}</p>
              </div>
           )}
        </section>
      )}

      {/* ── Results ─────────────────────────────────────────────────────── */}
      {result && (
        <motion.div
           initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
           className="bg-surface-container-low p-8 rounded-[40px] space-y-6"
        >
          {/* Header Action */}
          <div className="flex justify-between items-center mb-4">
             <h2 className="text-2xl font-black text-on-surface">
                 {result.isBankStatement ? 'Financial Intelligence Report' : 'Optimization Engine Results'}
             </h2>
             <button
               onClick={() => { setResult(null); setFile(null); setRequiresPassword(false); setPassword(''); }}
               className="px-5 py-2.5 bg-white rounded-2xl text-sm font-bold hover:bg-outline-variant/20 transition-colors border border-outline-variant/10 shadow-sm"
             >
               Start Over
             </button>
          </div>

          {/* 0. BANK STATEMENT INSIGHTS (IF APPLICABLE) */}
          {(result.insights?.length > 0 || result.recommendations?.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-indigo-600 p-6 rounded-3xl text-white shadow-xl">
                      <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-4 flex items-center gap-2">
                          <Brain size={14} /> AI Insights
                      </h4>
                      <div className="space-y-3">
                          {result.insights.map((insight, i) => (
                              <div key={i} className="flex gap-3 items-start">
                                  <div className="w-1.5 h-1.5 bg-indigo-300 rounded-full mt-2 shrink-0" />
                                  <p className="text-sm font-bold leading-relaxed">{insight}</p>
                              </div>
                          ))}
                      </div>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-outline-variant/20 shadow-sm">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-4 flex items-center gap-2">
                          <Zap size={14} className="text-primary" /> Recommended Actions
                      </h4>
                      <div className="space-y-3">
                          {result.recommendations.map((rec, i) => (
                              <div key={i} className="flex gap-3 items-start">
                                  <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                                  <p className="text-sm font-medium text-on-surface-variant">{rec}</p>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          )}

          {/* 1. SALARY BREAKDOWN CARD (SKIP IF BANK STATEMENT ONLY) */}
          {extraction && report ? (
            <div className="space-y-6">


              <div className="bg-white p-6 rounded-3xl shadow-sm border border-outline-variant/10">


            <h3 className="font-black text-lg text-on-surface mb-4 uppercase tracking-widest flex items-center gap-2">
              <Building2 size={24} className="text-primary"/> 1. Salary Breakdown
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Earnings side */}
              <div className="space-y-3">
                <h4 className="font-black text-sm text-green-600 uppercase tracking-widest mb-2 border-b border-outline-variant/10 pb-2">Earnings</h4>
                <div className="flex justify-between text-sm"><span className="text-on-surface-variant font-bold">Gross Salary</span><span className="font-black">{fmtCurrency(extraction?.grossSalary)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-on-surface-variant">Basic</span><span className="font-bold">{fmtCurrency(extraction?.basic)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-on-surface-variant">HRA</span><span className="font-bold">{fmtCurrency(extraction?.hra)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-on-surface-variant">DA</span><span className="font-bold">{fmtCurrency(extraction?.da)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-on-surface-variant">Special Allowance</span><span className="font-bold">{fmtCurrency(extraction?.specialAllowance)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-on-surface-variant">LTA</span><span className="font-bold">{fmtCurrency(extraction?.lta)}</span></div>
              </div>
              
              {/* Deductions side */}
              <div className="space-y-3">
                <h4 className="font-black text-sm text-red-600 uppercase tracking-widest mb-2 border-b border-outline-variant/10 pb-2">Deductions & Invest.</h4>
                <div className="flex justify-between text-sm"><span className="text-on-surface-variant font-bold">TDS Deducted</span><span className="font-black">{fmtCurrency(extraction?.tds)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-on-surface-variant">Employee PF</span><span className="font-bold">{fmtCurrency(extraction?.employeePF)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-on-surface-variant">Professional Tax</span><span className="font-bold">{fmtCurrency(extraction?.professionalTax)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-on-surface-variant">80C Investments</span><span className="font-bold">{fmtCurrency(extraction?.investments80C)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-on-surface-variant">80D Health</span><span className="font-bold">{fmtCurrency(extraction?.healthInsurance80D)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-on-surface-variant">Home Loan (24b)</span><span className="font-bold">{fmtCurrency(extraction?.homeLoanInterest)}</span></div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-outline-variant/10 flex gap-2 flex-wrap">
               <span className="text-xs bg-surface-container-low px-3 py-1 rounded-full font-bold">Employer: {extraction?.employerName || 'N/A'}</span>
               <span className="text-xs bg-surface-container-low px-3 py-1 rounded-full font-bold">PAN: {extraction?.employeePAN || 'N/A'}</span>
               <span className="text-xs bg-surface-container-low px-3 py-1 rounded-full font-bold">City: {extraction?.cityCategory || 'Unknown'}</span>
            </div>
          </div>

          {/* 2. DUAL REGIME CARDS */}
          <div>
            <h3 className="font-black text-lg text-on-surface mb-4 uppercase tracking-widest flex items-center gap-2 px-2">
              <Scale size={24} className="text-primary"/> 2. Regime Comparison
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Old Regime Card */}
              <div className={`bg-white rounded-3xl p-6 shadow-sm border-2 ${report.comparison.recommendedRegime === 'OLD' ? 'border-primary shadow-primary/20 shadow-xl' : 'border-outline-variant/20'}`}>
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-2xl font-black">Old Regime</h4>
                  {report.comparison.recommendedRegime === 'OLD' && (
                    <span className="bg-primary text-white text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-widest">Recommended</span>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center"><span className="text-sm font-bold text-on-surface-variant">Gross Salary</span><span className="font-bold">{fmtCurrency(report.oldRegime.grossSalary)}</span></div>
                  
                  {/* Deductions Itemized list */}
                  <div className="bg-surface-container-low/50 rounded-2xl p-4 space-y-2">
                    <p className="text-[10px] font-black uppercase text-on-surface-variant mb-2">Itemized Deductions</p>
                    {report.oldRegime.deductions.map((ded, i) => (
                      <div key={i} className="flex justify-between text-xs">
                        <span className="text-on-surface-variant"><span className="font-bold text-primary mr-1">{ded.section}</span> {ded.name}</span>
                        <span className="font-bold text-green-700">-{fmtCurrency(ded.amount)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center py-2 border-y border-outline-variant/10"><span className="text-sm font-black uppercase text-on-surface-variant">Taxable Income</span><span className="font-black text-lg">{fmtCurrency(report.oldRegime.taxableIncome)}</span></div>
                  
                  {/* Slab Breakdown */}
                  <div className="bg-surface-container-low/50 rounded-2xl p-4">
                     <p className="text-[10px] font-black uppercase text-on-surface-variant mb-2">Slabs Calculation</p>
                     <div className="space-y-1">
                       {report.oldRegime.slabBreakdown.map((slab, i) => (
                         <div key={i} className="flex justify-between text-xs"><span className="text-on-surface-variant w-1/2">{slab.range} @ {slab.rate}</span><span className="font-medium text-right w-1/4">{fmtCurrency(slab.taxableAmount)}</span><span className="font-black text-right w-1/4">{fmtCurrency(slab.tax)}</span></div>
                       ))}
                     </div>
                  </div>

                  <div className="flex justify-between items-center"><span className="text-sm text-on-surface-variant">Tax before Cess</span><span className="font-bold">{fmtCurrency(report.oldRegime.taxBeforeCess)}</span></div>
                  <div className="flex justify-between items-center"><span className="text-sm text-on-surface-variant">Cess (4%)</span><span className="font-bold">{fmtCurrency(report.oldRegime.cess)}</span></div>
                  
                  <div className="pt-4 border-t border-outline-variant/10 bg-indigo-50/50 -mx-6 -mb-6 p-6 rounded-b-3xl">
                     <div className="flex justify-between items-end mb-1">
                        <span className="uppercase text-xs font-black tracking-widest text-on-surface-variant">Total Tax</span>
                        <span className="text-4xl font-black text-primary">{fmtCurrency(report.oldRegime.totalTax)}</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-xs text-on-surface-variant font-medium mt-1">Monthly TDS Impact</span>
                        <span className="text-sm font-black text-on-surface">{fmtCurrency(report.oldRegime.monthlyTDS)} / mo</span>
                     </div>
                  </div>
                </div>
              </div>

              {/* New Regime Card */}
              <div className={`bg-white rounded-3xl p-6 shadow-sm border-2 ${report.comparison.recommendedRegime === 'NEW' ? 'border-primary shadow-primary/20 shadow-xl' : 'border-outline-variant/20'}`}>
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-2xl font-black">New Regime</h4>
                  {report.comparison.recommendedRegime === 'NEW' && (
                    <span className="bg-primary text-white text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-widest">Recommended</span>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center"><span className="text-sm font-bold text-on-surface-variant">Gross Salary</span><span className="font-bold">{fmtCurrency(report.newRegime.grossSalary)}</span></div>
                  
                  {/* Deductions Itemized list */}
                  <div className="bg-surface-container-low/50 rounded-2xl p-4 space-y-2">
                    <p className="text-[10px] font-black uppercase text-on-surface-variant mb-2">Itemized Deductions</p>
                    {report.newRegime.deductions.map((ded, i) => (
                      <div key={i} className="flex justify-between text-xs">
                        <span className="text-on-surface-variant"><span className="font-bold text-primary mr-1">{ded.section}</span> {ded.name}</span>
                        <span className="font-bold text-green-700">-{fmtCurrency(ded.amount)}</span>
                      </div>
                    ))}
                    <div className="text-[10px] italic text-on-surface-variant pt-1 border-t border-outline-variant/10">All other deductions are disallowed in New Regime.</div>
                  </div>

                  <div className="flex justify-between items-center py-2 border-y border-outline-variant/10"><span className="text-sm font-black uppercase text-on-surface-variant">Taxable Income</span><span className="font-black text-lg">{fmtCurrency(report.newRegime.taxableIncome)}</span></div>
                  
                  {/* Slab Breakdown */}
                  <div className="bg-surface-container-low/50 rounded-2xl p-4">
                     <p className="text-[10px] font-black uppercase text-on-surface-variant mb-2">Slabs Calculation</p>
                     <div className="space-y-1">
                       {report.newRegime.slabBreakdown.map((slab, i) => (
                         <div key={i} className="flex justify-between text-xs"><span className="text-on-surface-variant w-1/2">{slab.range} @ {slab.rate}</span><span className="font-medium text-right w-1/4">{fmtCurrency(slab.taxableAmount)}</span><span className="font-black text-right w-1/4">{fmtCurrency(slab.tax)}</span></div>
                       ))}
                     </div>
                  </div>

                  <div className="flex justify-between items-center"><span className="text-sm text-on-surface-variant">Tax before Cess</span><span className="font-bold">{fmtCurrency(report.newRegime.taxBeforeCess)}</span></div>
                  <div className="flex justify-between items-center"><span className="text-sm text-on-surface-variant">Cess (4%)</span><span className="font-bold">{fmtCurrency(report.newRegime.cess)}</span></div>
                  
                  <div className="pt-4 border-t border-outline-variant/10 bg-indigo-50/50 -mx-6 -mb-6 p-6 rounded-b-3xl">
                     <div className="flex justify-between items-end mb-1">
                        <span className="uppercase text-xs font-black tracking-widest text-on-surface-variant">Total Tax</span>
                        <span className="text-4xl font-black text-primary">{fmtCurrency(report.newRegime.totalTax)}</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-xs text-on-surface-variant font-medium mt-1">Monthly TDS Impact</span>
                        <span className="text-sm font-black text-on-surface">{fmtCurrency(report.newRegime.monthlyTDS)} / mo</span>
                     </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* 3. VERDICT BANNER */}
          <div className={`p-8 rounded-3xl ${report.comparison.annualSavings > 10000 ? 'bg-green-500 text-white shadow-xl shadow-green-500/20' : 'bg-amber-500 text-white shadow-xl shadow-amber-500/20'} flex flex-col md:flex-row justify-between items-center gap-6`}>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <PiggyBank size={24} />
                <span className="font-black uppercase tracking-widest text-xs opacity-90">Optimal Choice: {report.comparison.recommendedRegime}</span>
              </div>
              <h3 className="text-3xl font-black">You Save {fmtCurrency(report.comparison.annualSavings)} / year</h3>
              <p className="font-medium mt-1 opacity-90">by switching to the recommended regime.</p>
            </div>
            <div className="bg-white/20 px-6 py-4 rounded-2xl backdrop-blur-sm self-stretch flex flex-col justify-center items-center backdrop-saturate-200">
               <span className="text-sm font-black uppercase tracking-widest">Monthly Savings</span>
               <span className="text-3xl font-black">{fmtCurrency(report.comparison.monthlySavings)} <span className="text-sm font-normal">/mo</span></span>
            </div>
          </div>

          {/* 4. SALARY RESTRUCTURING SECTION */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-outline-variant/10">
            <h3 className="font-black text-lg text-on-surface mb-2 uppercase tracking-widest flex items-center gap-2">
              <Lightbulb size={24} className="text-amber-500"/> 4. Salary Restructuring Advice
            </h3>
            <p className="text-sm text-on-surface-variant mb-6 ml-8">Optimize your CTC breakdown to minimize tax impact. This does not change your gross salary, just how it's structured.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-8">
              <div className="space-y-4">
                 <div className="p-4 bg-surface-container-low rounded-2xl relative overflow-hidden">
                    <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-3">Basic Component</p>
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-on-surface text-sm">Current Basic</span>
                      <span className="font-black bg-white px-3 py-1 rounded-full text-xs shadow-sm">{fmtCurrency(extraction.basic)}</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-primary font-bold text-sm">Suggested Basic</span>
                      <span className="font-black text-primary bg-indigo-50 px-3 py-1 rounded-full text-xs border border-indigo-100">{fmtCurrency(report.restructuring.suggestedBasic)}</span>
                    </div>
                 </div>
                 <div className="p-4 bg-surface-container-low rounded-2xl relative overflow-hidden">
                    <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-3">HRA Component</p>
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-on-surface text-sm">Current HRA</span>
                      <span className="font-black bg-white px-3 py-1 rounded-full text-xs shadow-sm">{fmtCurrency(extraction.hra)}</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-primary font-bold text-sm">Suggested HRA</span>
                      <span className="font-black text-primary bg-indigo-50 px-3 py-1 rounded-full text-xs border border-indigo-100">{fmtCurrency(report.restructuring.suggestedHRA)}</span>
                    </div>
                 </div>
              </div>
              <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 flex flex-col justify-center">
                 <div className="flex items-center gap-2 mb-2">
                   <Target size={20} className="text-amber-600" />
                   <span className="font-black text-amber-700 text-sm">Optimization Target: {report.restructuring.itActSection}</span>
                 </div>
                 <p className="text-sm text-amber-900 leading-relaxed font-medium mb-4">
                   {report.restructuring.advice}
                 </p>
                 <div className="mt-auto flex justify-between items-end">
                   <span className="text-xs font-bold text-amber-700 uppercase tracking-widest">Projected Monthly Savings</span>
                   <span className="text-2xl font-black text-amber-600">~{fmtCurrency(report.restructuring.projectedMonthlySaving)}</span>
                 </div>
              </div>
            </div>
            
            <div className="mt-6 ml-8 bg-surface-container-low p-4 rounded-xl flex items-start gap-3">
              <Info size={18} className="text-on-surface-variant shrink-0 mt-0.5" />
              <p className="text-xs text-on-surface-variant font-medium">To apply this, share this advice directly with your HR/Payroll team. Under Indian tax law, you are permitted to ask your employer to restructure components to legally optimize your tax liability as long as total CTC remains unaffected.</p>
            </div>
          </div>

          {/* 5. INVESTMENT ACTIONS */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-outline-variant/10">
            <h3 className="font-black text-lg text-on-surface mb-6 uppercase tracking-widest flex items-center gap-2">
              <TrendingDown size={24} className="text-green-500"/> 5. Investment Action Plan
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {report.investmentActions.map((action, i) => (
                <div key={i} className="bg-surface-container-low/50 p-5 rounded-2xl border border-outline-variant/10 flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <span className="px-3 py-1 bg-white shadow-sm border border-outline-variant/10 rounded-full text-xs font-black uppercase text-on-surface">{action.section}</span>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-xs font-bold text-on-surface-variant mb-1.5">
                      <span>Used: {fmtCurrency(action.currentInvestment || action.currentPremium || action.currentNPS)}</span>
                      <span>Limit: {fmtCurrency(action.limit)}</span>
                    </div>
                    <div className="h-2.5 bg-outline-variant/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all"
                        style={{ width: `${Math.min(100, ((action.currentInvestment || action.currentPremium || action.currentNPS) / action.limit) * 100)}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-auto bg-green-50 border border-green-100 p-4 rounded-xl flex-1">
                    <span className="text-[10px] font-black uppercase text-green-700 tracking-widest block mb-1">Gap: {fmtCurrency(action.gap)}</span>
                    <p className="text-sm font-medium text-green-900 leading-snug">{action.suggestion}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 6. PLAIN ENGLISH VERDICT */}
          <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] p-8 rounded-[32px] text-white shadow-lg overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10 blur-2xl">
              <Award size={120} className="text-primary font-black" fill="currentColor"/>
            </div>
            
            <div className="relative z-10">
              <h3 className="font-black text-sm text-primary mb-4 uppercase tracking-widest flex items-center gap-2">
                <Award size={18} /> 6. AI Engine Verdict
              </h3>
              <div className="space-y-3">
                {report.verdict.split('\n').map((line, i) => (
                  <p key={i} className="text-2xl font-black leading-tight max-w-4xl opacity-90">
                    {line}
                  </p>
                ))}
              </div>
            </div>
            </div>
            </div>
          ) : null}

          {/* 7. APPLY TO DASHBOARD */}
          <motion.div 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleApply}
            className={`p-6 rounded-3xl border flex items-center justify-between group cursor-pointer transition-all shadow-sm ${
                isApplied ? 'bg-green-500 border-green-400 text-white' : 'bg-indigo-50 border-indigo-100 hover:bg-indigo-100/50'
            }`}
          >
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${isApplied ? 'bg-white/20' : 'bg-white'}`}>
                    {isApplied ? <CheckCircle2 size={22} className="text-white" /> : <Zap size={22} className="text-primary" />}
                </div>
                <div>
                   <p className={`text-lg font-black ${isApplied ? 'text-white' : 'text-on-surface'}`}>
                       {isApplied ? 'Extracted Data Synced!' : 'Apply Extracted Data to Dashboard'}
                   </p>
                   <p className={`text-sm font-medium ${isApplied ? 'text-white/80' : 'text-on-surface-variant'}`}>
                       {isApplied ? 'Your tax inputs have been updated across the platform.' : 'Use these numbers immediately in the interactive simulator.'}
                   </p>
                </div>
            </div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-transform ${isApplied ? 'bg-white text-green-500 rotate-0' : 'bg-primary text-white shadow-primary/30 group-hover:translate-x-2'}`}>
               {isApplied ? <CheckCircle2 size={18} /> : <ArrowRight size={18} />}
            </div>
          </motion.div>

        </motion.div>
      )}
    </div>
  );
};

export default DocumentAnalyzer;
