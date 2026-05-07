import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Zap, ArrowRight, Briefcase } from 'lucide-react';
import { getScenarios } from '../services/TaxEngine';

export default function StrategyLab({ simulations, taxData, onSync, scenarioParams, onParamsChange }) {
  const [isApplied, setIsApplied] = useState(false);

  const handleApplySimulation = (sim) => {
    if (!onSync) return;
    onSync({
        income: sim.newIncome || taxData?.income,
        investments: sim.newInvestments || taxData?.investments,
        nps: sim.newNPS || taxData?.nps,
        activeRegime: sim.newRegime || taxData?.activeRegime
    });
    
    setIsApplied(true);
    setTimeout(() => setIsApplied(false), 3000);
  };

  if (!simulations || simulations.length === 0) return null;

  return (
    <div className="space-y-10">
      {/* Visual Context Badge for Applied State */}
      <AnimatePresence>
        {isApplied && (
            <motion.div 
               initial={{ opacity: 0, y: -20, scale: 0.9 }} 
               animate={{ opacity: 1, y: 0, scale: 1 }} 
               exit={{ opacity: 0, y: -20, scale: 0.9 }}
               className="fixed top-24 right-10 z-[100] bg-indigo-600 text-white px-8 py-5 rounded-[32px] shadow-2xl flex items-center gap-4 border border-white/20 backdrop-blur-xl"
            >
                <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Zap size={20} fill="currentColor" />
                </div>
                <div>
                    <p className="font-black text-sm uppercase tracking-widest">Strategy Locked</p>
                    <p className="text-xs opacity-70">Your main dashboard has been synced with this scenario.</p>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Real-Time Scenario Delta Lab */}
      <section className="bg-white p-8 rounded-[40px] border border-outline-variant/10 shadow-sm relative overflow-hidden">
        <div className="flex justify-between items-center mb-8 relative z-10">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center">
                    <Zap className="text-primary" size={20} />
                </div>
                <h2 className="text-2xl font-bold font-display">Killer Scenarios</h2>
            </div>
            <div className="flex items-center gap-4">
               <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-40">Interactive Lab</span>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            {simulations.map((sim, i) => (
                <motion.div 
                    key={sim.id}
                    whileHover={{ scale: 1.01, y: -4 }}
                    className="p-8 rounded-[38px] border border-slate-100 bg-slate-50/40 flex flex-col justify-between group transition-all hover:bg-white hover:shadow-xl hover:shadow-primary/5"
                >
                    <div className="space-y-4">
                        <div className="flex justify-between items-start">
                            <div className="w-14 h-14 bg-white rounded-[20px] flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                {sim.id === 'INCREMENT' ? <TrendingUp size={28} className="text-primary" /> : <Briefcase size={28} className="text-indigo-500" />}
                            </div>
                            <div className="text-right">
                                <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${sim.impact >= 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                    {sim.impact >= 0 ? `+ ₹${sim.impact.toLocaleString()}` : `- ₹${Math.abs(sim.impact).toLocaleString()}`} Tax Impact
                                </span>
                            </div>
                        </div>
                        
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                {sim.id === 'INCREMENT' || sim.id === 'JOB_SWITCH' ? (
                                    <div className="flex items-center bg-white/60 rounded-xl px-2 py-1 border border-outline-variant/10 focus-within:border-primary/30 transition-all">
                                        <input 
                                            type="number"
                                            value={(sim.id === 'INCREMENT' ? scenarioParams.incrementPct : scenarioParams.jobHikePct) || ''}
                                            placeholder="0"
                                            onChange={(e) => {
                                                const val = e.target.value === '' ? 0 : parseInt(e.target.value);
                                                onParamsChange(prev => ({
                                                    ...prev,
                                                    [sim.id === 'INCREMENT' ? 'incrementPct' : 'jobHikePct']: val
                                                }));
                                            }}
                                            className="w-10 bg-transparent text-lg font-black text-on-surface outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-center"
                                        />
                                        <span className="text-lg font-black text-on-surface">%</span>
                                    </div>
                                ) : null}
                                <h4 className="text-2xl font-black tracking-tight">
                                    {sim.id === 'INCREMENT' ? 'Salary Increment' : sim.id === 'JOB_SWITCH' ? 'Job Switch' : sim.name}
                                </h4>
                            </div>
                            <p className="text-sm text-on-surface-variant leading-relaxed font-medium">{sim.description}</p>
                        </div>
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-slate-200/50 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black text-on-surface-variant uppercase opacity-40">Predicted Tax</p>
                            <p className="text-2xl font-black tracking-tight text-on-surface">₹{sim.newTax.toLocaleString()}</p>
                        </div>
                        <button 
                            onClick={() => handleApplySimulation(sim)}
                            className="bg-primary text-white text-[11px] font-black uppercase px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-slate-900 transition-all shadow-lg shadow-primary/20"
                        >
                            Apply Plan <ArrowRight size={16} />
                        </button>
                    </div>
                </motion.div>
            ))}
        </div>
      </section>
    </div>
  );
}

function CheckCircle2({ size }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
}
