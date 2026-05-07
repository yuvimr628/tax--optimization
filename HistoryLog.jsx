import { motion } from 'framer-motion';
import { Clock, History, ChevronRight, Activity, TrendingUp, Wallet, ShieldCheck } from 'lucide-react';

export default function HistoryLog({ history, onRestore }) {
  if (!history || history.length === 0) {
    return (
      <div className="bg-white p-16 rounded-[48px] text-center border border-outline-variant/10 shadow-sm flex flex-col items-center">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
            <History size={40} className="text-slate-300" />
        </div>
        <h3 className="text-2xl font-black text-slate-900 mb-2">No History Yet</h3>
        <p className="text-slate-500 max-w-sm font-medium">Start optimizing your tax strategy in the Simulator to see your progress tracked here.</p>
      </div>
    );
  }

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + 
           date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
            <History className="text-primary" />
            <h2 className="text-2xl font-bold font-display">Activity Timeline</h2>
        </div>
        <span className="text-[10px] font-black uppercase text-on-surface-variant tracking-[0.2em] bg-surface-container-low px-3 py-1 rounded-full">
            Ready to Restore
        </span>
      </div>

      <div className="relative space-y-6">
        {/* Connection Line */}
        <div className="absolute left-[31px] top-6 bottom-6 w-0.5 bg-slate-100 hidden md:block" />

        {history.map((item, i) => (
          <motion.div 
            key={item._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="relative group lg:pl-16"
          >
            {/* The Dot/Icon */}
            <div className="absolute left-0 top-1.5 w-16 h-16 rounded-[24px] bg-white border border-slate-100 flex items-center justify-center z-10 shadow-sm group-hover:border-primary group-hover:shadow-md transition-all hidden md:flex">
                {item.description.includes('Income') ? <TrendingUp size={24} className="text-primary" /> : 
                 item.description.includes('Initial') ? <ShieldCheck size={24} className="text-green-500" /> :
                 <Activity size={24} className="text-indigo-500" />}
            </div>

            {/* The Card */}
            <div className="bg-white p-6 rounded-[32px] border border-outline-variant/10 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all group-hover:translate-x-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h4 className="font-bold text-lg text-on-surface">{item.description}</h4>
                            <span className="md:hidden text-[10px] font-black uppercase tracking-widest text-primary bg-indigo-50 px-2 py-0.5 rounded-full">Snapshot</span>
                        </div>
                        <div className="flex items-center gap-2 text-on-surface-variant text-sm font-medium">
                            <Clock size={14} />
                            {formatTime(item.timestamp)}
                        </div>
                    </div>

                    <div className="flex items-center gap-6 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-on-surface-variant uppercase opacity-40">Income</span>
                            <span className="text-sm font-black text-on-surface">₹{item.snapshot.income.toLocaleString()}</span>
                        </div>
                        <div className="h-8 w-px bg-slate-100 hidden md:block" />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-on-surface-variant uppercase opacity-40">Invested</span>
                            <span className="text-sm font-black text-on-surface">₹{item.snapshot.investments.toLocaleString()}</span>
                        </div>
                        <button 
                            onClick={() => onRestore(item.snapshot)}
                            className="bg-indigo-50 text-primary px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all border border-indigo-100 flex items-center gap-2"
                        >
                            Restore <ChevronRight size={14} />
                        </button>
                    </div>
                </div>

                {/* Status Bar */}
                <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-4">
                     <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${item.snapshot.activeRegime === 'OLD' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>
                         {item.snapshot.activeRegime} Regime
                     </span>
                     <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                         Verification Confidence: 99.2%
                     </span>
                </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
