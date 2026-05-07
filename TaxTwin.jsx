import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, AlertTriangle, TrendingUp, ChevronRight, Zap } from 'lucide-react';
import axios from 'axios';

const TaxTwin = ({ data }) => {
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    if (data) {
      const timer = setTimeout(() => {
        analyzeTwinData(data);
      }, 500); 
      return () => clearTimeout(timer);
    } else {
      fetchTwinInsights();
    }
  }, [data]);

  // Typing effect
  useEffect(() => {
    if (analysis?.aiSummary) {
      setDisplayedText("");
      let i = 0;
      const text = analysis.aiSummary;
      const interval = setInterval(() => {
        setDisplayedText((prev) => prev + text.charAt(i));
        i++;
        if (i >= text.length) clearInterval(interval);
      }, 30);
      return () => clearInterval(interval);
    }
  }, [analysis]);

  const analyzeTwinData = async (payload) => {
    try {
      const token = user.token;
      const response = await axios.post('/api/twin/analyze', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnalysis(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to analyze twin data:', err);
      setLoading(false);
    }
  };

  const fetchTwinInsights = async () => {
    try {
      setLoading(true);
      const token = user.token;
      const response = await axios.get('/api/twin/insights', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnalysis(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch twin insights:', err);
      setError('Your Twin is resting. Try again later.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-10 rounded-[40px] bg-white border border-outline-variant/20 flex flex-col items-center justify-center min-h-[400px] shadow-sm">
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 360] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="w-20 h-20 bg-primary/5 rounded-3xl flex items-center justify-center mb-6 border border-primary/20"
        >
          <Brain className="text-primary w-10 h-10" />
        </motion.div>
        <p className="text-on-surface-variant font-bold tracking-tight">Syncing with your financial DNA...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 rounded-[40px] bg-white border border-red-100 text-center">
        <AlertTriangle className="mx-auto text-red-500 mb-4 w-10 h-10" />
        <p className="text-on-surface font-bold">{error}</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden p-1 bg-gradient-to-br from-primary via-indigo-400 to-secondary rounded-[42px] shadow-2xl shadow-primary/10"
    >
      <div className="bg-white/95 backdrop-blur-3xl p-8 md:p-10 rounded-[40px] flex flex-col md:flex-row gap-10 items-start">
        
        {/* Left Side: Pulse Avatar */}
        <div className="flex-shrink-0 flex flex-col items-center">
          <div className="relative">
            {/* Pulsing glow under avatar */}
            <motion.div
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-0 bg-primary/20 rounded-full blur-2xl"
            />
            
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="w-28 h-28 rounded-[36px] bg-gradient-primary flex items-center justify-center border-4 border-white shadow-2xl relative z-10"
            >
              <Brain className="text-white w-14 h-14" />
            </motion.div>
            
            <div className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full border-4 border-white z-20" />
          </div>
          
          <div className="mt-6 text-center">
             <h3 className="text-xl font-black text-on-surface uppercase tracking-tighter">
                {analysis.userType}
             </h3>
             <span className="inline-flex items-center gap-1.5 text-[10px] text-primary font-black px-3 py-1 bg-primary/5 rounded-full mt-2 border border-primary/10 uppercase tracking-widest">
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                Active Analysis
             </span>
          </div>
        </div>

        {/* Right Side: AI Interaction */}
        <div className="flex-grow space-y-8">
          <div className="relative">
            <Sparkles className="absolute -top-6 -left-6 text-amber-400 w-8 h-8 opacity-40 animate-pulse" />
            <div className="bg-surface-container-low/50 rounded-[32px] p-8 border border-outline-variant/20 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
               <p className="text-xl md:text-2xl text-on-surface font-display font-bold leading-snug italic relative z-10 antialiased">
                "{displayedText}"
               </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-3xl border border-outline-variant/10 shadow-sm transition-transform hover:scale-[1.02]">
              <span className="text-on-surface-variant text-xs font-bold uppercase tracking-widest block mb-2">Predicted Tax</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-on-surface">₹{analysis.predictedTax?.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-outline-variant/10 shadow-sm transition-transform hover:scale-[1.02]">
              <span className="text-on-surface-variant text-xs font-bold uppercase tracking-widest block mb-2">Accuracy Trust</span>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-black text-indigo-600 block">{analysis.confidence === 'high' ? '98%' : '85%'}</span>
                <div className="flex-grow h-2 bg-surface-container rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: analysis.confidence === 'high' ? '98%' : '85%' }}
                        className="h-full bg-primary"
                    />
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Observations */}
          <div className="space-y-4">
             <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-primary rounded-full" />
                <h4 className="text-sm font-black text-on-surface-variant uppercase tracking-widest">Real-time Observations</h4>
             </div>
             
             <div className="grid gap-3">
               {analysis.insights.map((insight, idx) => (
                 <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-4 text-on-surface font-semibold bg-surface-container-low/30 p-4 rounded-2xl border border-outline-variant/10"
                 >
                   <div className="w-2 h-2 bg-primary rounded-full shrink-0" />
                   {insight}
                 </motion.div>
               ))}
               {analysis.events?.map((event, idx) => (
                 <motion.div 
                    key={`event-${idx}`}
                    className="flex items-center gap-4 text-amber-600 font-bold bg-amber-50/50 p-4 rounded-2xl border border-amber-100"
                 >
                   <Zap className="w-5 h-5 shrink-0 fill-amber-500/20" />
                   {event.message}
                 </motion.div>
               ))}
             </div>
          </div>

          {/* Quick Action */}
          <div className="pt-2">
            <motion.button 
                whileHover={{ gap: '1rem' }}
                className="w-full flex justify-between items-center bg-indigo-50 border border-indigo-100 p-5 rounded-3xl group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                   <TrendingUp className="text-primary w-5 h-5" />
                </div>
                <div className="text-left">
                  <span className="text-[10px] text-primary font-black uppercase tracking-widest">Intelligence Suggestion</span>
                  <p className="text-on-surface font-extrabold text-sm">Invest ₹40,000 in Top ELSS Funds</p>
                </div>
              </div>
              <ChevronRight className="text-primary group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TaxTwin;
