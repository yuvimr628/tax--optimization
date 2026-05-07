import { useState, useEffect, useMemo } from 'react';
import { 
  TrendingDown, Zap, Target, ShieldCheck, 
  ChevronDown, ChevronUp, Calculator, AlertCircle,
  HelpCircle, Lock, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getScenarios } from '../services/TaxEngine';

export default function TaxSimulator({ data: initialData, inputData, onUpdate }) {
  const [localData, setLocalData] = useState({
    income:      inputData?.income || 0,
    investments: inputData?.investments || 0,
    insurance:   inputData?.insurance || 0,
    nps:         inputData?.nps || 0,
    hra:         inputData?.hra || 0,
    homeLoan:    inputData?.homeLoan || 0,
    isSenior:    inputData?.isSenior || false,
    activeRegime: inputData?.activeRegime || 'NEW'
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const [showBreakdown, setShowBreakdown] = useState(true);
  const [showWhyTax, setShowWhyTax] = useState(false);

  // Real-time calculation using the shared TaxEngine
  const results = useMemo(() => {
    return getScenarios({
      annualGrossIncome: localData.income,
      investments80C:    localData.investments,
      health80D:         localData.insurance,
      nps80CCD1B:        localData.nps,
      hra:               localData.hra,
      homeLoan:          localData.homeLoan,
      isSenior:          localData.isSenior
    });
  }, [localData.income, localData.investments, localData.insurance, localData.nps, localData.hra, localData.homeLoan, localData.isSenior]);

  const activeResult = localData.activeRegime === 'NEW' ? results?.newRegime : results?.oldRegime;

  // 1. Sync Context -> Local (Only on mount or external changes)
  useEffect(() => {
    if (inputData) {
      setLocalData(prev => {
        const hasChanged = 
          prev.income !== inputData.income ||
          prev.investments !== inputData.investments ||
          prev.insurance !== inputData.insurance ||
          prev.nps !== inputData.nps ||
          prev.hra !== inputData.hra ||
          prev.homeLoan !== inputData.homeLoan ||
          prev.isSenior !== inputData.isSenior ||
          prev.activeRegime !== inputData.activeRegime;

        if (hasChanged) {
          return {
            income:      inputData.income ?? prev.income,
            investments: inputData.investments ?? prev.investments,
            insurance:   inputData.insurance ?? prev.insurance,
            nps:         inputData.nps ?? prev.nps,
            hra:         inputData.hra ?? prev.hra,
            homeLoan:    inputData.homeLoan ?? prev.homeLoan,
            isSenior:    inputData.isSenior ?? prev.isSenior,
            activeRegime:inputData.activeRegime ?? prev.activeRegime
          };
        }
        return prev;
      });
    }
  }, [inputData]);

  // 2. Sync Local -> Context (Debounced to prevent fluttering)
  useEffect(() => {
    if (!onUpdate || !inputData) return;

    // Check if local is actually different from context to avoid redundant triggers
    const isDifferent = 
      localData.income !== inputData?.income ||
      localData.investments !== inputData?.investments ||
      localData.insurance !== inputData?.insurance ||
      localData.nps !== inputData?.nps ||
      localData.hra !== inputData?.hra ||
      localData.homeLoan !== inputData?.homeLoan ||
      localData.isSenior !== inputData?.isSenior ||
      localData.activeRegime !== inputData?.activeRegime;

    if (!isDifferent) return;

    const handler = setTimeout(() => {
      onUpdate(localData);
    }, 400); // 400ms debounce for smoothness

    return () => clearTimeout(handler);
  }, [localData, onUpdate]);

  const handleRegimeChange = (regime) => {
    setLocalData(prev => ({ ...prev, activeRegime: regime }));
  };

  const handleSliderChange = (field, value) => {
    setLocalData(prev => ({ ...prev, [field]: value }));
  };

  if (!results || !activeResult) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center animate-pulse">
          <Calculator className="mx-auto text-primary/20 mb-4" size={48} />
          <p className="text-on-surface-variant font-medium text-sm">Initializing Tax Engine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 rounded-full border border-indigo-100 mb-2">
              <Zap size={14} className="text-primary" />
              <span className="text-[10px] font-black text-primary uppercase tracking-widest">Production Engine v3.0</span>
           </div>
           <h1 className="text-4xl font-display font-black tracking-tight">Tax Optimiser</h1>
           <p className="text-on-surface-variant max-w-md">
             Deterministic FY 2024-25 Indian Income Tax calculator. Strictly separated New vs Old Regimes.
           </p>
        </div>
        
        <div className="flex flex-col items-end gap-3">
          <div className="bg-surface-container rounded-2xl p-1 flex items-center gap-1 border border-outline-variant/10">
              <button 
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${!localData.isSenior ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant'}`}
                onClick={() => setLocalData(d => ({...d, isSenior: false}))}
              >
                Non-Senior
              </button>
              <button 
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${localData.isSenior ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant'}`}
                onClick={() => setLocalData(d => ({...d, isSenior: true}))}
              >
                Senior Citizen (60+)
              </button>
          </div>
          
          <div className="bg-indigo-50 rounded-2xl p-1 flex items-center gap-1 border border-indigo-100">
              <button 
                className={`px-6 py-2 rounded-xl text-sm font-black transition-all ${localData.activeRegime === 'NEW' ? 'bg-primary text-white shadow-md' : 'text-primary/70 hover:bg-white/50'}`}
                onClick={() => handleRegimeChange('NEW')}
              >
                New Regime
              </button>
              <button 
                className={`px-6 py-2 rounded-xl text-sm font-black transition-all ${localData.activeRegime === 'OLD' ? 'bg-primary text-white shadow-md' : 'text-primary/70 hover:bg-white/50'}`}
                onClick={() => handleRegimeChange('OLD')}
              >
                Old Regime
              </button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* --- Left: Sliders (7 cols) --- */}
        <div className="lg:col-span-7 space-y-8">
           <section className="bg-white p-8 rounded-[40px] border border-outline-variant/30 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-8 border-b border-outline-variant/10 pb-6">
                 <div className="flex items-center gap-3">
                    <ShieldCheck className="text-primary" />
                    <h3 className="text-xl font-bold font-display">Optimization Inputs ({localData.activeRegime} REGIME)</h3>
                 </div>
                 <div className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-100">
                    <AlertCircle size={12} />
                    <span className="text-[10px] font-bold uppercase">Limits Enforced</span>
                 </div>
              </div>

              <div className="space-y-10">
                <SliderControl
                  label="Annual Gross Income"
                  value={localData.income}
                  max={5000000}
                  step={50000}
                  onChange={(v) => handleSliderChange('income', v)}
                  disabled={false}
                />
                
                <div className="h-px bg-outline-variant/10" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 relative">
                  
                    {/* Disabler overlay for New Regime */}
                    {localData.activeRegime === 'NEW' && (
                      <div className="absolute inset-x-0 -top-4 rounded-3xl bottom-0 bg-surface-container-low/70 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center border border-dashed border-outline-variant/50">
                          <Lock className="text-on-surface-variant mb-2 opacity-50" size={32} />
                          <p className="text-sm font-bold text-on-surface-variant">Deductions Disabled</p>
                          <p className="text-xs text-on-surface-variant/70 max-w-[200px] text-center mt-1">Not applicable under New Tax Regime. Switch to Old Regime to claim.</p>
                      </div>
                    )}

                    <SliderControl
                      label="Section 80C"
                      subLabel="ELSS, PPF, Insurance"
                      value={localData.investments}
                      max={150000}
                      step={5000}
                      onChange={(v) => handleSliderChange('investments', v)}
                      color="primary"
                      disabled={localData.activeRegime === 'NEW'}
                    />
                    
                    <SliderControl
                      label="Section 80D"
                      subLabel={localData.isSenior ? "Max ₹50,000 (Senior)" : "Max ₹25,000"}
                      value={localData.insurance}
                      max={localData.isSenior ? 50000 : 25000}
                      step={1000}
                      onChange={(v) => handleSliderChange('insurance', v)}
                      color="primary"
                      disabled={localData.activeRegime === 'NEW'}
                    />
                    
                    <SliderControl
                      label="Section 80CCD NPS"
                      subLabel="Additional ₹50K limit"
                      value={localData.nps}
                      max={50000}
                      step={5000}
                      onChange={(v) => handleSliderChange('nps', v)}
                      color="primary"
                      disabled={localData.activeRegime === 'NEW'}
                    />
                </div>
                
                <div className="mt-4">
                    <button 
                       onClick={() => setShowAdvanced(!showAdvanced)} 
                       className="flex items-center gap-2 text-sm font-bold text-primary px-4 py-2 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors"
                    >
                       Advanced Config (HRA/Home Loan) {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    
                    <AnimatePresence>
                        {showAdvanced && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 pt-6 relative border-t border-dashed border-outline-variant/30 mt-6">
                                     {localData.activeRegime === 'NEW' && (
                                       <div className="absolute inset-0 bg-surface-container-low/70 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center rounded-3xl" />
                                     )}
                                     <SliderControl
                                          label="HRA Exemption"
                                          subLabel="Based on Rent Receipts"
                                          value={localData.hra}
                                          max={300000}
                                          step={10000}
                                          onChange={(v) => handleSliderChange('hra', v)}
                                          color="primary"
                                          disabled={localData.activeRegime === 'NEW'}
                                     />
                                     <SliderControl
                                          label="Section 24(b)"
                                          subLabel="Home Loan Interest"
                                          value={localData.homeLoan}
                                          max={200000}
                                          step={10000}
                                          onChange={(v) => handleSliderChange('homeLoan', v)}
                                          color="primary"
                                          disabled={localData.activeRegime === 'NEW'}
                                     />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                
                <div className="p-6 bg-surface-container-low rounded-3xl border border-outline-variant/10 flex flex-col justify-center mt-6">
                    <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1">Standard Deduction</p>
                    <p className="text-2xl font-black text-on-surface opacity-80">₹{localData.activeRegime === 'NEW' ? '75,000' : '50,000'} <span className="text-xs font-medium text-primary ml-2 bg-indigo-50 px-2 py-1 rounded-md">Auto-applied in both Regimes</span></p>
                </div>

              </div>
           </section>

           {/* Detailed Breakdown Accordion */}
           <section className="bg-white rounded-[40px] border border-outline-variant/30 shadow-sm overflow-hidden mt-6">
                <button 
                    onClick={() => setShowBreakdown(!showBreakdown)}
                    className="w-full p-8 flex items-center justify-between hover:bg-surface-container-low transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <Calculator className="text-primary" />
                        <h3 className="text-xl font-bold font-display">Tax Calculation Breakdown</h3>
                    </div>
                    {showBreakdown ? <ChevronUp /> : <ChevronDown />}
                </button>

                <AnimatePresence>
                    {showBreakdown && (
                        <motion.div 
                            initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                            className="overflow-hidden border-t border-outline-variant/10"
                        >
                            <div className="p-8 space-y-6">
                                {/* Step 1: Taxable Income */}
                                <div className="space-y-4">
                                    <h4 className="text-xs font-black text-primary uppercase tracking-widest">Step 1: Compute Taxable Income</h4>
                                    <div className="bg-surface-container-low p-6 rounded-3xl space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-on-surface-variant">Gross Income</span>
                                            <span className="font-bold">₹{activeResult?.gross?.toLocaleString('en-IN') || 0}</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-red-600">
                                            <span className="">– Total Deductions</span>
                                            <span className="font-bold">₹{activeResult?.deductions?.total?.toLocaleString('en-IN') || 0}</span>
                                        </div>
                                        <div className="flex flex-col gap-1 pl-4 text-xs text-on-surface-variant/60">
                                            <span>• Standard Deduction: ₹{localData.activeRegime === 'NEW' ? '75,000' : '50,000'}</span>
                                            {activeResult.deductions.section80C > 0 && <span>• 80C: ₹{activeResult.deductions.section80C.toLocaleString()}</span>}
                                            {activeResult.deductions.section80D > 0 && <span>• 80D: ₹{activeResult.deductions.section80D.toLocaleString()}</span>}
                                            {activeResult.deductions.nps80CCD > 0 && <span>• 80CCD: ₹{activeResult.deductions.nps80CCD.toLocaleString()}</span>}
                                            {activeResult.deductions.hra > 0 && <span>• HRA Exemption: ₹{activeResult.deductions.hra.toLocaleString()}</span>}
                                            {activeResult.deductions.homeLoan > 0 && <span>• Home Loan Sec 24(b): ₹{activeResult.deductions.homeLoan.toLocaleString()}</span>}
                                        </div>
                                        <div className="pt-3 border-t border-outline-variant/10 flex justify-between">
                                            <span className="font-bold text-on-surface">Taxable Income</span>
                                            <span className="font-black text-primary">₹{activeResult.taxableIncome.toLocaleString('en-IN')}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Step 2: Slab Wise */}
                                <div className="space-y-4">
                                    <h4 className="text-xs font-black text-primary uppercase tracking-widest">Step 2: Apply {localData.activeRegime} Regime Slabs</h4>
                                    <div className="border border-outline-variant/10 rounded-3xl overflow-hidden">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-surface-container-low">
                                                <tr>
                                                    <th className="px-6 py-4 font-bold text-on-surface-variant">Slab Range</th>
                                                    <th className="px-6 py-4 font-bold text-on-surface-variant">Rate</th>
                                                    <th className="px-6 py-4 font-bold text-on-surface-variant text-right">Tax Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-outline-variant/10">
                                                {activeResult.slabBreakdown.map((s, i) => (
                                                    <tr key={i}>
                                                        <td className="px-6 py-4">{s.range}</td>
                                                        <td className="px-6 py-4 text-primary font-bold">{s.rate}</td>
                                                        <td className="px-6 py-4 text-right font-bold">₹{s.tax.toLocaleString('en-IN')}</td>
                                                    </tr>
                                                ))}
                                                {activeResult.slabBreakdown.length === 0 && (
                                                    <tr>
                                                        <td colSpan={3} className="px-6 py-8 text-center text-on-surface-variant italic">
                                                            Taxable income below basic exemption limit.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Step 3: Cess & Final */}
                                <div className="space-y-4">
                                    <h4 className="text-xs font-black text-primary uppercase tracking-widest">Step 3: Rebate & Cess (4%)</h4>
                                    <div className="bg-surface-container-low p-6 rounded-3xl space-y-4 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-on-surface-variant">Base Tax</span>
                                            <span className="font-bold">₹{activeResult.baseTax.toLocaleString('en-IN')}</span>
                                        </div>
                                        {activeResult.rebate87A > 0 && (
                                            <div className="flex justify-between text-green-600">
                                                <span>– 87A Rebate</span>
                                                <span className="font-bold">₹{activeResult.rebate87A.toLocaleString('en-IN')}</span>
                                            </div>
                                        )}
                                        {activeResult.surcharge > 0 && (
                                            <div className="flex justify-between text-amber-700">
                                                <span>+ High Income Surcharge</span>
                                                <span className="font-bold">₹{activeResult.surcharge.toLocaleString('en-IN')}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between">
                                            <span>+ Health & Education Cess (4%)</span>
                                            <span className="font-bold">₹{activeResult.cess.toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className="pt-4 border-t border-primary/20 flex justify-between items-center">
                                            <span className="text-base font-black text-on-surface uppercase pr-4">Final Payable Tax <br/><span className="text-[10px] text-on-surface-variant normal-case">under {localData.activeRegime} Regime</span></span>
                                            <span className="text-2xl font-black text-primary whitespace-nowrap">₹{activeResult.finalTax.toLocaleString('en-IN')}</span>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
           </section>
        </div>

        {/* --- Right: Savings Analysis (5 cols) --- */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-32">
          
          {/* Real-time Summary Card */}
          <div className="bg-indigo-600 p-8 rounded-[40px] shadow-2xl relative overflow-hidden text-white">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <Target size={140} />
             </div>
             
             <p className="text-indigo-200 font-bold text-[10px] uppercase tracking-[0.2em] mb-3">Total Tax Liability ({localData.activeRegime})</p>
             <h2 className="text-6xl font-display font-black leading-tight">
                ₹{activeResult?.finalTax?.toLocaleString('en-IN') || 0}
             </h2>
          </div>

          {/* Auto Recommendation Engine */}
          <div className="bg-white p-8 rounded-[40px] border border-outline-variant/30 shadow-sm space-y-6">
             <div className="flex items-center gap-2 mb-2">
                <h3 className="font-black text-sm uppercase tracking-widest text-on-surface-variant">Optimization Engine</h3>
             </div>

             {results.recommended === 'EITHER' ? (
                <div className="p-5 bg-surface-container-low rounded-3xl border border-outline-variant/20">
                    <p className="text-xs font-bold mb-1">Taxes are equal</p>
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                        Both Regimes result in ₹{activeResult.finalTax.toLocaleString('en-IN')} tax.
                    </p>
                </div>
             ) : (
                <div className={`p-6 rounded-3xl border ${
                  results.recommended.regime === localData.activeRegime 
                  ? 'bg-green-50 border-green-200 text-green-900' 
                  : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}>
                    <div className="flex gap-4">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                           results.recommended.regime === localData.activeRegime ? 'bg-green-200' : 'bg-amber-200'
                        }`}>
                            <TrendingDown size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-black mb-1">
                                {results.recommended.regime} Regime is better!
                            </p>
                            <p className="text-xs leading-relaxed opacity-80 font-medium">
                                You save <span className="font-bold">₹{results.difference.toLocaleString('en-IN')}</span> more with the {results.recommended.regime} Regime compared to the alternative.
                            </p>
                            {results.recommended.regime !== localData.activeRegime && (
                                <button 
                                  onClick={() => handleRegimeChange(results.recommended.regime)}
                                  className="mt-3 px-4 py-2 bg-amber-900 text-white rounded-xl text-xs font-bold hover:bg-amber-800 transition-colors"
                                >
                                  Switch to {results.recommended.regime} Regime
                                </button>
                            )}
                        </div>
                    </div>
                </div>
             )}

             <div className="space-y-4 mt-6">
                <ScenarioRow 
                    label="New Tax Regime" 
                    tax={results.newRegime.finalTax} 
                    isActive={localData.activeRegime === 'NEW'} 
                    isBest={results.recommended.regime === 'NEW'}
                />
                <ScenarioRow 
                    label="Old Tax Regime" 
                    tax={results.oldRegime.finalTax} 
                    isActive={localData.activeRegime === 'OLD'} 
                    isBest={results.recommended.regime === 'OLD'}
                />
             </div>

             {/* Why This Tax Explanation */}
             <div className="mt-4 border-t border-outline-variant/10 pt-4">
                <button 
                  onClick={() => setShowWhyTax(!showWhyTax)}
                  className="flex items-center gap-2 text-xs font-bold text-primary hover:opacity-80 transition-opacity"
                >
                  <Info size={14} />
                  Why am I paying this tax?
                </button>
                <AnimatePresence>
                  {showWhyTax && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                      <p className="text-[11px] text-on-surface-variant leading-relaxed mt-3 p-4 bg-surface-container-low rounded-2xl">
                         {localData.activeRegime === 'NEW' ? 
                           "Under the New Regime (FY 24-25), you get wider tax slabs (0-3L: 0%, 3-6L: 5%, 6-9L: 10%, etc.). You are standardly deducted ₹75,000. Exemptions like 80C, 80D, HRA are forfeited. If your taxable income falls under ₹7 Lakhs, you receive a Section 87A rebate and pay 0 base tax. Finally, a 4% Cess is added on the tax computed." :
                           "Under the Old Regime, slabs are tighter (0-2.5L: 0%, 2.5-5L: 5%, etc). However, you get a ₹50,000 standard deduction AND can claim up to ₹1.5L in 80C, ₹50k in 80CCD, and 80D medical insurances. Section 87A rebate applies if taxable income is ≤ ₹5 Lakhs."
                         }
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScenarioRow({ label, tax, isActive, isBest }) {
    return (
        <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${isActive ? 'bg-indigo-50 border-indigo-200 scale-[1.02] shadow-sm' : 'bg-surface-container-low border-outline-variant/10 opacity-70'}`}>
            <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${isBest ? 'bg-green-500' : (isActive ? 'bg-indigo-500' : 'bg-on-surface-variant')}`} />
                <span className={`text-xs font-bold ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}>
                  {label} {isBest && <span className="ml-1 text-[9px] bg-green-100 text-green-800 px-1 py-0.5 rounded uppercase tracking-wider">Best</span>}
                </span>
            </div>
            <span className={`font-black ${isActive ? 'text-primary' : 'text-on-surface'}`}>₹{tax.toLocaleString('en-IN')}</span>
        </div>
    );
}

function SliderControl({ label, subLabel, value, max, step, onChange, color = 'primary', disabled = false }) {
  // Use a local state for the input text to prevent cursor jumping and better 0 handling
  const [inputValue, setInputValue] = useState(value === 0 ? '' : value.toString());

  // Sync local input value with prop value
  useEffect(() => {
    if (value === 0) {
      if (inputValue !== '') setInputValue('');
    } else {
      if (inputValue !== value.toString()) setInputValue(value.toString());
    }
  }, [value]);

  const handleInputChange = (e) => {
    let rawVal = e.target.value;
    
    // Remove leading zeros if any
    if (rawVal.length > 1 && rawVal.startsWith('0')) {
      rawVal = rawVal.replace(/^0+/, '');
    }
    
    setInputValue(rawVal);

    if (rawVal === '') {
      onChange(0);
    } else {
      const numVal = parseInt(rawVal, 10);
      if (!isNaN(numVal)) {
        onChange(Math.min(max, Math.max(0, numVal)));
      }
    }
  };

  const displayValue = disabled ? 0 : value;

  return (
    <div className={`group transition-opacity ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
            <label className="text-on-surface font-black text-[13px] block">{label}</label>
            {subLabel && <span className="text-[10px] text-on-surface-variant font-medium leading-none">{subLabel}</span>}
        </div>
        <div className="flex items-center bg-surface-container-low px-3 py-1.5 rounded-xl border border-outline-variant/10 focus-within:border-primary/50 transition-all">
            <span className="text-on-surface-variant font-black text-sm mr-1">₹</span>
            <input 
                type="text"
                inputMode="numeric"
                value={inputValue}
                onChange={handleInputChange}
                onBlur={() => {
                   setInputValue(value === 0 ? '' : value.toString());
                }}
                className="bg-transparent text-lg font-display font-black text-on-surface w-24 outline-none"
                placeholder="0"
                disabled={disabled}
            />
        </div>
      </div>
      
      <div className="relative h-6 flex items-center">
          <input
            type="range"
            min={0}
            max={max}
            step={step}
            value={displayValue || 0}
            onChange={(e) => !disabled && onChange(Number(e.target.value))}
            disabled={disabled}
            className="w-full h-1.5 bg-surface-container rounded-full appearance-none cursor-pointer accent-primary"
            style={{ 
                background: `linear-gradient(to right, #6366f1 ${Math.round((displayValue/max)*100)}%, #e2e8f0 ${Math.round((displayValue/max)*100)}%)` 
            }}
          />
      </div>
      
      <div className="flex justify-between mt-2">
          <span className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest">MIN</span>
          <span className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest">LIMIT ₹{(max).toLocaleString()}</span>
      </div>
    </div>
  );
}
