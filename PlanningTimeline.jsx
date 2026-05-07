import { motion } from 'framer-motion';
import { Calendar, CheckCircle2, Circle, Clock } from 'lucide-react';

export default function PlanningTimeline({ timeline }) {
  if (!timeline || timeline.length === 0) return null;

  return (
    <div className="bg-white p-8 rounded-[40px] border border-outline-variant/10 shadow-sm">
      <div className="flex items-center gap-3 mb-10">
        <Calendar className="text-primary" />
        <h2 className="text-2xl font-bold font-display">Strategic Tax Roadmap</h2>
      </div>

      <div className="relative max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
        <div className="relative space-y-8 pb-4">
          {/* The connecting line */}
          <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-slate-100" />

          {timeline.map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="relative pl-10 group"
            >
              {/* The bullet */}
              <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-white border-4 border-slate-50 flex items-center justify-center z-10 group-hover:border-primary transition-colors">
                {new Date().getMonth() > i + 3 ? (
                  <CheckCircle2 className="text-green-500 w-4 h-4" />
                ) : (
                  <Circle className="text-slate-300 w-3 h-3" />
                )}
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                  {item.month}
                </span>
                <div>
                  <h4 className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">{item.action}</h4>
                  <p className="text-on-surface-variant text-[11px] leading-relaxed mt-0.5">{item.detail}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mt-12 p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100 flex items-center gap-4">
        <Clock className="text-primary shrink-0" />
        <p className="text-xs font-semibold text-indigo-900 leading-relaxed">
          Pro Tip: Most users start in January and panic. By following this AI roadmap, you spread your investments across the year, preserving your cash flow.
        </p>
      </div>
    </div>
  );
}
