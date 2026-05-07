import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  Bot, LogOut, Calculator, ArrowRight, 
  TrendingUp, Lightbulb, CheckCircle2, AlertCircle, 
  Info, FileSearch, Zap, Brain, Sparkles, Plus, Wallet, LayoutDashboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TaxSimulator from '../components/TaxSimulator';
import AiChat from '../components/AiChat';
import DocumentAnalyzer from '../components/DocumentAnalyzer';
import TaxTwin from '../components/TaxTwin';
import Navbar from '../components/Navbar';
import Marketplace from '../components/Marketplace';
import AutoActionMode from '../components/AutoActionMode';
import StrategyLab from '../components/StrategyLab';
import PlanningTimeline from '../components/PlanningTimeline';
import HistoryLog from '../components/HistoryLog';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTax } from '../context/TaxContext';
import { useMemo } from 'react';

const PRIORITY_STYLES = {
  high:   { border: 'border-l-red-500',    badge: 'bg-red-50 text-red-600 border border-red-100',    icon: <AlertCircle size={18} className="text-red-500 mt-0.5 shrink-0" /> },
  medium: { border: 'border-l-amber-500', badge: 'bg-amber-50 text-amber-600 border border-amber-100', icon: <Lightbulb size={18} className="text-amber-500 mt-0.5 shrink-0" /> },
  low:    { border: 'border-l-primary',    badge: 'bg-indigo-50 text-indigo-600 border border-indigo-100',    icon: <Info size={18} className="text-primary mt-0.5 shrink-0" /> },
};

const TYPE_LABELS = {
  '80C': 'Section 80C',
  '80D': 'Section 80D',
  'NPS': 'NPS 80CCD(1B)',
};

// --- Subcomponent: Animated Counter ---
const AnimatedCounter = ({ value, duration = 2 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const end = parseInt(value);
    if (isNaN(end) || end <= 0) {
      setCount(0);
      return;
    }

    let start = 0;
    const totalMiliseconds = duration * 1000;
    const steps = 40;
    const increment = Math.ceil(end / steps);
    const intervalTime = totalMiliseconds / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{count.toLocaleString('en-IN')}</span>;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { inputData, setInputData, updateInputs, applyExtractedData } = useTax();
  const [activeTab, setActiveTab] = useState('overview');
  const [activeMarketplaceCategory, setActiveMarketplaceCategory] = useState('80C');
  const [showAutoAction, setShowAutoAction] = useState(false);

  const navigateToMarketplace = (type) => {
    setActiveMarketplaceCategory(type || '80C');
    setActiveTab('marketplace');
  };
  
  const [taxData, setTaxData] = useState({
    taxableIncome: 0,
    taxLiability: 0,
    savingsPotential: 0,
    taxScore: 0,
  });

  const [notifications, setNotifications] = useState([]);
  const [notificationsMsg, setNotificationsMsg] = useState('');
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const headers = useMemo(() => ({
    Authorization: `Bearer ${user?.token}`
  }), [user?.token]);

  const getTaxData = useCallback(async (payload) => {
    try {
      const { data } = await axios.post('/api/tax/calculate', payload, {
        headers,
      });
      setTaxData(data);
    } catch (error) {
      console.error(error);
      if (error.response?.status === 401) {
        logout();
        navigate('/login');
      }
    }
  }, [navigate, logout, headers]);

  const getNotifications = useCallback(async (payload) => {
    setNotificationsLoading(true);
    try {
      const { data } = await axios.post('/api/notifications/generate', payload, {
        headers,
      });
      if (data.notifications && data.notifications.length > 0) {
        setNotifications(data.notifications);
        setNotificationsMsg('');
      } else {
        setNotifications([]);
        setNotificationsMsg(data.message || '');
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setNotificationsLoading(false);
    }
  }, [headers]);

  const getHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const { data } = await axios.get('/api/tax/history', {
        headers,
      });
      setHistory(data);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setHistoryLoading(false);
    }
  }, [headers]);

  const saveProfile = useCallback(async (payload) => {
    try {
      await axios.post('/api/tax/profile', payload, {
        headers,
      });
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  }, [headers]);

  const fetchProfile = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/tax/profile', {
        headers,
      });
      if (data) {
        const profileData = {
          income: data.income || 0,
          investments: data.investments || 0,
          insurance: data.insurance || 0,
          nps: data.nps || 0,
          hra: data.hra || 0,
          homeLoan: data.homeLoan || 0,
          activeRegime: data.activeRegime || 'NEW',
          isSenior: data.isSenior || false,
          cityCategory: data.cityCategory || 'metro'
        };
        setInputData(profileData);
        getTaxData(profileData);
        getNotifications(profileData);
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error('Failed to fetch profile:', error);
      } else {
          // Initialize for new user - use current inputData from state
          getTaxData(inputData);
          getNotifications(inputData);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headers, getTaxData, getNotifications]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const [scenarioParams, setScenarioParams] = useState({ incrementPct: 20, jobHikePct: 30 });

  // Sync tax calculations whenever inputData changes (globally or locally)
  useEffect(() => {
    if (user?.token) {
      const payload = { ...inputData, scenarioParams };
      getTaxData(payload);
      getNotifications(payload);
      saveProfile(inputData);
      getHistory();
    }
  }, [inputData, scenarioParams, getTaxData, getNotifications, saveProfile, user?.token, getHistory]);

  const handleUpdate = (updatedInputs) => {
    updateInputs(updatedInputs);
  };

  const handleApplyExtractedData = (extracted) => {
    applyExtractedData(extracted);
    setActiveTab('overview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background selection:bg-primary/10 selection:text-primary">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="pt-28 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-12"
              >
                {/* --- Hero Section --- */}
                <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 pt-4">
                  <div className="max-w-2xl">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="px-3 py-1 bg-green-50 rounded-full border border-green-100 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">Live AI Sync Active</span>
                        </div>
                        <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-40">Verifying Strategy</span>
                    </div>
                    <motion.h1 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-5xl md:text-6xl font-display font-extrabold leading-[1.1] mb-6"
                    >
                      Make <span className="text-gradient">Saving Tax</span> <br />
                      Feel Like Winning.
                    </motion.h1>
                    <p className="text-xl text-on-surface-variant leading-relaxed mb-8">
                      Your AI platform for smarter financial decisions. Analyze documents, 
                      simulate savings, and chat with your digital tax twin.
                    </p>
                    <motion.button 
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setShowAutoAction(true)}
                        className="bg-[#0f2d5e] text-white px-8 py-4 rounded-2xl font-black text-lg shadow-xl shadow-[#0f2d5e]/20 flex items-center gap-3 transition-all"
                    >
                        <Zap className="fill-white" size={24} /> Fix Everything in 1 Click
                    </motion.button>
                  </div>
                  <div className="hidden lg:block relative">
                    <div className="absolute inset-0 bg-primary/20 blur-[120px] rounded-full" />
                    <div className="glass-card p-4 rounded-3xl relative z-10">
                         <div className="bg-white rounded-2xl p-6 shadow-xl border border-outline-variant/10">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                                    <CheckCircle2 className="text-green-500" />
                                </div>
                                <div>
                                    <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Status</p>
                                    <p className="text-sm font-bold">Optimizing in real-time</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-2 w-48 bg-surface-container rounded-full overflow-hidden">
                                     <motion.div 
                                        animate={{ width: ['0%', '80%'] }}
                                        transition={{ duration: 2 }}
                                        className="h-full bg-primary" 
                                     />
                                </div>
                                <div className="h-2 w-32 bg-surface-container rounded-full overflow-hidden opacity-50">
                                     <motion.div 
                                        animate={{ width: ['0%', '40%'] }}
                                        transition={{ duration: 1.5, delay: 0.5 }}
                                        className="h-full bg-secondary" 
                                     />
                                </div>
                            </div>
                         </div>
                    </div>
                  </div>
                </section>

                {/* --- Flagship: Tax Twin --- */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <Sparkles className="text-primary" />
                        <h2 className="text-2xl font-bold font-display">Your Digital Clone</h2>
                    </div>
                    <TaxTwin data={inputData} />
                </section>

                {/* --- Stats Grid --- */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { label: 'Predicted Tax', value: taxData?.taxLiability ?? 0, icon: <Wallet className="text-primary" />, suffix: '' },
                    { label: 'Savings Potential', value: taxData?.savingsPotential ?? 0, icon: <TrendingUp className="text-blue-500" />, suffix: '', highlight: true },
                    { label: 'Optimization Score', value: taxData?.taxScore ?? 0, icon: <LayoutDashboard className="text-secondary" />, suffix: '%' },
                  ].map((stat, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ y: -8, shadow: "0 20px 40px rgba(99, 102, 241, 0.1)" }}
                      className="glass-card p-8 rounded-[32px] group transition-all"
                    >
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-surface-container-low flex items-center justify-center group-hover:bg-white transition-colors border border-outline-variant/10">
                          {stat.icon}
                        </div>
                        <span className="font-semibold text-on-surface-variant">{stat.label}</span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className={`text-4xl font-display font-black tracking-tighter ${stat.highlight ? 'text-primary' : ''}`}>
                          {stat.suffix === '' && '₹'}<AnimatedCounter value={stat.value} />{stat.suffix}
                        </span>
                      </div>
                      
                      {stat.label === 'Optimization Score' && (
                        <div className="mt-4 pt-4 border-t border-slate-100 flex gap-4 text-[10px] font-black uppercase text-on-surface-variant flex-wrap">
                            <span className="text-primary">Eff: 92</span>
                            <span className="text-secondary">Util: 84</span>
                            <span className="text-green-500">Div: 70</span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </section>

                {/* --- Insights & Alerts --- */}
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold font-display">Smart Insights</h2>
                            <button className="text-sm font-bold text-primary hover:underline">View All</button>
                        </div>
                        
                        {notificationsLoading ? (
                             <div className="space-y-4">
                                {[1,2].map(n => <div key={n} className="h-32 bg-surface-container-low rounded-3xl animate-pulse" />)}
                             </div>
                        ) : (
                            <div className="grid gap-4">
                                {notifications.length > 0 ? notifications.map((sug, i) => {
                                    const style = PRIORITY_STYLES[sug.priority] || PRIORITY_STYLES.low;
                                    return (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className={`bg-white p-6 rounded-[28px] border-l-4 ${style.border} shadow-sm border border-outline-variant/10 flex flex-col md:flex-row gap-6 items-start`}
                                        >
                                            <div className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center shrink-0">
                                                {style.icon}
                                            </div>
                                            <div className="flex-grow">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="font-bold text-lg">{sug.title}</h3>
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${style.badge}`}>{sug.priority.toUpperCase()}</span>
                                                </div>
                                                <p className="text-on-surface-variant text-base mb-4">{sug.message}</p>
                                                <div className="flex flex-wrap gap-2">
                                                    <span className="px-3 py-1 bg-indigo-50 text-primary text-xs font-bold rounded-lg border border-indigo-100 italic">
                                                        Save approx: ₹{sug.taxSaving?.toLocaleString('en-IN')}
                                                    </span>
                                                    <span className="px-3 py-1 bg-surface-container-low text-on-surface-variant text-xs font-bold rounded-lg border border-outline-variant/10">
                                                        {sug.actionHint}
                                                    </span>
                                                </div>
                                            </div>
                                            <motion.button
                                                whileHover={{ scale: 1.04 }}
                                                whileTap={{ scale: 0.97 }}
                                                onClick={() => navigateToMarketplace(sug.type)}
                                                className={`w-full md:w-auto flex items-center gap-2 bg-gradient-to-r ${style.border === 'border-l-red-500' ? 'from-red-500 to-rose-600' : style.border === 'border-l-amber-500' ? 'from-amber-500 to-orange-500' : 'from-indigo-500 to-purple-600'} text-white py-3 px-6 rounded-2xl text-sm font-bold shadow-md hover:shadow-lg transition-all`}
                                            >
                                                Take Action
                                                <ArrowRight size={15} />
                                            </motion.button>
                                        </motion.div>
                                    );
                                }) : (
                                    <div className="glass-card p-10 rounded-[32px] text-center">
                                         <CheckCircle2 size={48} className="mx-auto text-green-500 mb-4" />
                                         <h4 className="text-xl font-bold">You're All Set!</h4>
                                         <p className="text-on-surface-variant max-w-sm mx-auto mt-2">
                                             We couldn't find any immediate gaps. You are maximizing your tax potential based on the provided data.
                                         </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* --- Recommendations Sidebar --- */}
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold font-display">Popular Picks</h2>
                        <div className="grid gap-4">
                            {[
                                { name: 'ELSS Tax Saver', benefit: 'Upto 15% Returns', icon: <TrendingUp className="text-green-500" /> },
                                { name: 'Health Premier', benefit: '80D Tax Benefit', icon: <Plus className="text-red-500" /> },
                                { name: 'NPS Tier 1', benefit: 'Extra ₹50,000 off', icon: <Wallet className="text-blue-500" /> },
                            ].map((rec, i) => (
                                <div key={i} className="bg-white p-5 rounded-3xl border border-outline-variant/20 shadow-sm hover:shadow-md transition-shadow group cursor-pointer" onClick={() => setActiveTab('simulator')}>
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-surface-container-low rounded-2xl group-hover:bg-primary/5 transition-colors">
                                            {rec.icon}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-base">{rec.name}</h4>
                                            <p className="text-xs text-primary font-bold">{rec.benefit}</p>
                                        </div>
                                        <ArrowRight size={18} className="ml-auto text-outline-variant opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="bg-gradient-primary p-8 rounded-[32px] text-white overflow-hidden relative group cursor-pointer">
                             <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
                             <h4 className="text-xl font-bold mb-2 relative z-10">Need a Personal Advisor?</h4>
                             <p className="text-sm opacity-80 mb-4 relative z-10">Get expert guidance from certified CA specialists.</p>
                             <button className="bg-white text-primary px-6 py-2.5 rounded-xl font-bold text-sm relative z-10">Book a Call</button>
                        </div>
                    </div>
                </section>
              </motion.div>
            )}

            {activeTab === 'simulator' && (
              <motion.div key="simulator" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <TaxSimulator data={taxData} inputData={inputData} onUpdate={handleUpdate} />
              </motion.div>
            )}

            {activeTab === 'documents' && (
              <motion.div key="documents" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <DocumentAnalyzer onApply={handleApplyExtractedData} />
              </motion.div>
            )}

            {activeTab === 'twin' && (
                <motion.div key="twin_full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <TaxTwin data={inputData} />
                </motion.div>
            )}

            {activeTab === 'strategy' && (
              <motion.div key="strategy" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="grid lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2">
                        <StrategyLab 
                          simulations={taxData?.simulations || []} 
                          taxData={taxData || {}} 
                          onSync={handleUpdate}
                          scenarioParams={scenarioParams}
                          onParamsChange={setScenarioParams}
                        />
                    </div>
                    <div>
                        <PlanningTimeline timeline={taxData?.timeline} />
                    </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div key="history" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {historyLoading ? (
                    <div className="space-y-6">
                        {[1,2,3].map(n => <div key={n} className="h-32 bg-surface-container-low rounded-[32px] animate-pulse" />)}
                    </div>
                ) : (
                    <HistoryLog history={history} onRestore={handleUpdate} />
                )}
              </motion.div>
            )}

            {activeTab === 'marketplace' && (
              <motion.div key="marketplace" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <Marketplace inputData={inputData} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      
      {/* Floating Action for AI Chat */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setActiveTab('chat')}
        className="fixed bottom-8 right-8 w-16 h-16 bg-primary rounded-full shadow-2xl flex items-center justify-center text-white z-40 border-4 border-white"
      >
        <Bot size={32} />
      </motion.button>
      
      {activeTab === 'chat' && (
          <div className="fixed inset-0 z-50 bg-white/80 backdrop-blur-md flex items-center justify-center p-6">
              <div className="w-full max-w-4xl h-[85vh] bg-white rounded-[40px] shadow-2xl border border-outline-variant/30 overflow-hidden relative">
                    <button 
                        onClick={() => setActiveTab('overview')}
                        className="absolute top-6 right-8 text-on-surface-variant hover:text-on-surface font-bold text-sm"
                    >
                        Close [x]
                    </button>
                    <div className="p-10 h-full">
                        <AiChat taxData={taxData} />
                    </div>
              </div>
          </div>
      )}

      {/* Auto Action Mode Modal */}
      <AnimatePresence>
        {showAutoAction && (
          <AutoActionMode 
             inputData={inputData} 
             onClose={() => setShowAutoAction(false)} 
             onApplyFix={(newData) => {
                 handleUpdate(newData);
                 // Automatically compute and sync new data in backend if needed
                 getTaxData(newData);
             }}
             onInvestNow={() => navigateToMarketplace('80C')}
             onViewLogic={() => setActiveTab('simulator')}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
