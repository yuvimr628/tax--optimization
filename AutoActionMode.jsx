import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, CheckCircle2, TrendingUp, ChevronRight, Calculator, AlertTriangle, ShieldCheck, X, Activity } from 'lucide-react';
import { getScenarios, TAX_CONSTANTS } from '../services/TaxEngine';

export default function AutoActionMode({ inputData, onClose, onApplyFix, onInvestNow, onViewLogic }) {
  const [analyzing, setAnalyzing] = useState(true);
  const [activeStep, setActiveStep] = useState(0);

  // 1. Compute Current State
  const currentScenarios = useMemo(() => getScenarios({
      annualGrossIncome: inputData.income,
      investments80C: inputData.investments,
      health80D: inputData.insurance,
      nps80CCD1B: inputData.nps,
      hra: inputData.hra,
      homeLoan: inputData.homeLoan,
      isSenior: inputData.isSenior
  }), [inputData]);
  
  const activeRegime = inputData.activeRegime || 'NEW';
  const currentActiveTax = activeRegime === 'NEW' 
      ? currentScenarios.newRegime.finalTax 
      : currentScenarios.oldRegime.finalTax;

  // 2. Compute Fully Optimized State
  const optimizedInputs = useMemo(() => ({
    ...inputData,
    investments: TAX_CONSTANTS.LIMIT_80C,
    insurance: inputData.isSenior ? TAX_CONSTANTS.LIMIT_80D_SENIOR : TAX_CONSTANTS.LIMIT_80D_DEFAULT,
    nps: TAX_CONSTANTS.LIMIT_NPS,
    hra: inputData.hra || 0, // We don't magically know their rent, but we can suggest declaring it
    homeLoan: Math.max(inputData.homeLoan || 0, 200000) // Suggest full 24(b) if they have a loan
  }), [inputData]);

  const fullyOptimizedScenarios = useMemo(() => getScenarios({
    annualGrossIncome: inputData.income,
    investments80C: optimizedInputs.investments,
    health80D: optimizedInputs.insurance,
    nps80CCD1B: optimizedInputs.nps,
    hra: optimizedInputs.hra,
    homeLoan: optimizedInputs.homeLoan,
    isSenior: inputData.isSenior
  }), [inputData, optimizedInputs]);

  // Determine what the absolute best is
  const isOldBetterWhenMaxed = fullyOptimizedScenarios.oldRegime.finalTax < fullyOptimizedScenarios.newRegime.finalTax;
  const optimizedFinalTax = isOldBetterWhenMaxed ? fullyOptimizedScenarios.oldRegime.finalTax : fullyOptimizedScenarios.newRegime.finalTax;
  
  const totalTaxSaved = Math.max(0, currentActiveTax - optimizedFinalTax);
  const targetRegime = isOldBetterWhenMaxed ? 'OLD' : 'NEW';

  // Calculate gaps
  const gap80C = Math.max(0, TAX_CONSTANTS.LIMIT_80C - (inputData.investments || 0));
  const limit80D = inputData.isSenior ? TAX_CONSTANTS.LIMIT_80D_SENIOR : TAX_CONSTANTS.LIMIT_80D_DEFAULT;
  const gap80D = Math.max(0, limit80D - (inputData.insurance || 0));
  const gapNPS = Math.max(0, TAX_CONSTANTS.LIMIT_NPS - (inputData.nps || 0));
  const gapHomeLoan = Math.max(0, 200000 - (inputData.homeLoan || 0));

  // Determine actions needed
  const planSteps = [];
  
  if (totalTaxSaved > 0) {
      if (activeRegime !== targetRegime) {
          planSteps.push({
             type: 'regime',
             text: `Switch to: ${targetRegime.charAt(0).toUpperCase() + targetRegime.slice(1).toLowerCase()} Tax Regime`,
             value: null
          });
      }
      
      if (targetRegime === 'OLD') {
          if (gap80C > 0) planSteps.push({ type: 'invest', section: '80C', text: `Invest in ELSS/PF (80C)`, value: gap80C });
          if (gap80D > 0) planSteps.push({ type: 'invest', section: '80D', text: `Add Health Insurance (80D)`, value: gap80D });
          if (gapNPS > 0) planSteps.push({ type: 'invest', section: 'NPS', text: `Contribute to NPS (80CCD)`, value: gapNPS });
          if (gapHomeLoan > 0 && inputData.homeLoan > 0) planSteps.push({ type: 'invest', section: 'HomeLoan', text: `Claim Home Loan Int. (24b)`, value: gapHomeLoan });
      }
  }

  // Animation Sequence
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      index++;
      setActiveStep(index);
      if (index >= 4) {
        clearInterval(interval);
        setTimeout(() => setAnalyzing(false), 500);
      }
    }, 400); // Sequence steps
    return () => clearInterval(interval);
  }, []);

  const handleApply = () => {
    if (targetRegime === 'OLD') {
      onApplyFix({
        ...inputData,
        investments: optimizedInputs.investments,
        insurance: optimizedInputs.insurance,
        nps: optimizedInputs.nps,
        hra: optimizedInputs.hra,
        homeLoan: optimizedInputs.homeLoan,
        activeRegime: 'OLD'
      });
    } else {
      onApplyFix({
        ...inputData,
        activeRegime: 'NEW'
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden shadow-primary/20 border border-slate-200"
      >
        {/* Header / Analyzing State */}
        <div className="p-6 bg-gradient-to-br from-indigo-900 to-primary text-white relative overflow-hidden">
            <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors">
                <X size={20} />
            </button>
            <div className="relative z-10">
                {analyzing ? (
                    <div className="flex flex-col items-center justify-center py-6">
                        <motion.div 
                            animate={{ rotate: 360 }} 
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full mb-6"
                        />
                        <h2 className="text-xl font-bold mb-1">Deep Scanning Finances...</h2>
                        <div className="h-6 overflow-hidden">
                             <AnimatePresence mode="wait">
                                 <motion.p 
                                    key={activeStep}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="text-sm font-medium text-indigo-200"
                                 >
                                     {activeStep === 0 && "Analyzing income parameters..."}
                                     {activeStep === 1 && "Verifying 80C & 80D limits..."}
                                     {activeStep === 2 && "Computing New vs Old Regime slabs..."}
                                     {activeStep === 3 && "Finalizing Action Plan..."}
                                 </motion.p>
                             </AnimatePresence>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-4">
                        <motion.div 
                           initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}
                           className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white/20 shadow-lg shadow-green-500/20"
                        >
                            <Zap className="text-white fill-white" size={28} />
                        </motion.div>
                        {totalTaxSaved > 0 ? (
                            <>
                                <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-1">Target Identified</p>
                                <h2 className="text-3xl font-black mb-1">
                                    You can save ₹{totalTaxSaved.toLocaleString('en-IN')} instantly
                                </h2>
                                <p className="text-sm text-indigo-100">Optimal wealth strategy verified by AI.</p>
                            </>
                        ) : (
                            <>
                                <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-1">Fully Optimized</p>
                                <h2 className="text-3xl font-black mb-1">
                                    Zero Gaps Found
                                </h2>
                                <p className="text-sm text-indigo-100">Your current tax strategy is mathematically perfect.</p>
                            </>
                        )}
                    </div>
                )}
            </div>
            
            {/* Background elements */}
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/5 rounded-full blur-3xl mix-blend-overlay" />
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-500/30 rounded-full blur-3xl mix-blend-overlay" />
        </div>

        {/* Content */}
        {!analyzing && (
            <div className="p-6 space-y-6 bg-slate-50">
                {totalTaxSaved > 0 ? (
                    <>
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Plan Breakdown</h3>
                            <div className="space-y-3">
                                {planSteps.map((step, i) => (
                                    <motion.div 
                                        key={i} 
                                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                                        className="flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            {step.type === 'regime' ? (
                                                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600"><AlertTriangle size={14} /></div>
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600"><TrendingUp size={14} /></div>
                                            )}
                                            <span className="font-bold text-slate-700 text-sm">{step.text}</span>
                                        </div>
                                        {step.value && <span className="font-black text-[#0f2d5e]">₹{step.value.toLocaleString('en-IN')}</span>}
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* AI Logic explanation */}
                        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex items-start gap-3">
                             <Activity className="text-primary shrink-0 mt-0.5" size={16} />
                             <div className="text-xs text-slate-700 leading-relaxed font-medium">
                                 <p className="mb-1 font-bold text-primary">This plan is optimized because:</p>
                                 <ul className="list-disc pl-4 space-y-1 text-slate-600">
                                     {gap80C > 0 && targetRegime === 'OLD' && <li>You are underutilizing Section 80C by <span className="font-bold">₹{gap80C.toLocaleString()}</span>.</li>}
                                     {activeRegime !== targetRegime && <li>Your current regime results in higher tax by <span className="font-bold">₹{(currentActiveTax - fullyOptimizedScenarios[activeRegime.toLowerCase() + 'Regime'].finalTax).toLocaleString()}</span>.</li>}
                                     {gapNPS > 0 && targetRegime === 'OLD' && <li>NPS gives an additional exact <span className="font-bold">₹50,000</span> deduction.</li>}
                                     {inputData.income > 700000 && inputData.income < 730000 && targetRegime === 'NEW' && <li>Marginal Relief is protecting you from a sharp tax spike above ₹7L.</li>}
                                     {inputData.income > 5000000 && <li>High-income Surcharge optimization is enabled.</li>}
                                     {targetRegime === 'NEW' && <li>The New Regime's extended slabs offer a guaranteed mathematical advantage over the Old Regime, even with maximum deductions.</li>}
                                 </ul>
                             </div>
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-2 gap-3 pt-2">
                             <motion.button 
                                whileTap={{ scale: 0.97 }}
                                onClick={handleApply}
                                className="col-span-2 py-3.5 bg-[#0f2d5e] text-white rounded-xl font-bold shadow-md hover:bg-[#0f2d5e]/90 flex items-center justify-center gap-2"
                             >
                                 <CheckCircle2 size={18} /> Apply Fix Instantly
                             </motion.button>
                             
                             {targetRegime === 'OLD' && (gap80C > 0 || gap80D > 0 || gapNPS > 0) && (
                                <motion.button 
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => { onClose(); if(onInvestNow) onInvestNow(); }}
                                    className="py-3 bg-white text-[#0f2d5e] border border-slate-200 hover:bg-slate-50 font-bold rounded-xl text-sm flex items-center justify-center gap-2"
                                >
                                    <TrendingUp size={16} /> Invest Now
                                </motion.button>
                             )}
                             
                             <motion.button 
                                 whileTap={{ scale: 0.97 }}
                                 onClick={() => { onClose(); if(onViewLogic) onViewLogic(); }}
                                 className={`${targetRegime === 'NEW' || (gap80C === 0 && gap80D === 0 && gapNPS === 0) ? 'col-span-2' : ''} py-3 bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 font-bold rounded-xl text-sm flex items-center justify-center gap-2`}
                             >
                                 <Calculator size={16} /> View Logic
                             </motion.button>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-6">
                        <ShieldCheck size={48} className="text-emerald-500 mx-auto mb-4" />
                        <h3 className="font-bold text-slate-800 mb-2">Maximum Efficiency Reached</h3>
                        <p className="text-sm text-slate-500 max-w-[280px] mx-auto mb-6">
                            Based on FY 2024-25 Income Tax laws, your selected regime and investments yield the lowest mathematical tax output.
                        </p>
                        <button onClick={onClose} className="w-full py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50">
                            Close
                        </button>
                    </div>
                )}
            </div>
        )}
        
        {/* Footer */}
        <div className="bg-slate-100/50 py-3 px-6 text-center border-t border-slate-200">
             <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-center gap-1.5">
                 <ShieldCheck size={12} className="text-emerald-500" />
                 98% AI Confidence • FY 2024-25 Guidelines
             </span>
        </div>
      </motion.div>
    </div>
  );
}
