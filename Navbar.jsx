import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, User, LayoutDashboard, Calculator, 
  FileSearch, Sparkles, ShoppingBag, LogOut, History,
  Settings, Bell, ChevronDown, Activity, CreditCard
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTax } from '../context/TaxContext';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ activeTab, onTabChange }) => {
  const [scrolled, setScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { user, logout } = useAuth();
  const { inputData } = useTax();
  const navigate = useNavigate();
  const menuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { key: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
    { key: 'documents', label: 'Documents', icon: <FileSearch size={18} /> },
    { key: 'simulator', label: 'Optimize', icon: <Calculator size={18} /> },
    { key: 'strategy', label: 'Strategy Lab', icon: <Activity size={18} /> },
    { key: 'marketplace', label: 'Marketplace', icon: <ShoppingBag size={18} /> },
    { key: 'report', label: 'Download Report', icon: <CreditCard size={18} />, action: true },
  ];

  const [downloading, setDownloading] = useState(false);

  const handleDownloadReport = async () => {
    setDownloading(true);
    try {
      const response = await axios.post('/api/report/generate', inputData, {
        headers: {
          Authorization: `Bearer ${user?.token}`
        },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Tax_Optimization_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to download report:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/80 backdrop-blur-lg shadow-sm py-3' : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
            <TrendingUp className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-display font-extrabold tracking-tight text-on-surface">
            Your <span className="text-primary">Money</span>
          </span>
        </div>

        {/* Links */}
        <div className="hidden md:flex items-center gap-1.5 bg-white/40 backdrop-blur-xl p-1.5 rounded-[22px] border border-white/40 shadow-sm transition-all duration-500 hover:shadow-md">
          {navItems.map((item) => (
            <button
              key={item.key}
              disabled={item.key === 'report' && downloading}
              onClick={() => {
                if (item.action) {
                  if (item.key === 'report') handleDownloadReport();
                } else {
                  onTabChange(item.key);
                }
              }}
              className={`relative flex items-center gap-2.5 px-4 py-2 rounded-[18px] text-[13px] font-bold transition-all duration-300 ${
                activeTab === item.key 
                  ? 'text-primary' 
                  : (item.key === 'report' && downloading ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:text-slate-900 active:scale-95')
              }`}
            >
              {activeTab === item.key && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 bg-white shadow-xl shadow-primary/5 border border-primary/10 rounded-[18px]"
                  transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                />
              )}
              <span className={`relative z-10 transition-transform duration-300 ${activeTab === item.key ? 'scale-110' : 'group-hover:scale-110'}`}>
                {item.key === 'report' && downloading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                    <Activity size={18} className="text-primary" />
                  </motion.div>
                ) : item.icon}
              </span>
              <span className="relative z-10 tracking-tight">{item.key === 'report' && downloading ? 'Generating...' : item.label}</span>
            </button>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4 relative" ref={menuRef}>
          {user ? (
            <>
               <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-3 p-1 pr-3 rounded-full hover:bg-surface-container-low transition-colors group"
               >
                  <div className="w-9 h-9 bg-gradient-to-br from-primary to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:shadow-primary/20 transition-all">
                    {user.name?.charAt(0) || 'U'}
                  </div>
                  <div className="hidden lg:block text-left">
                     <p className="text-xs font-black text-on-surface leading-none mb-0.5">{user.name}</p>
                     <p className="text-[10px] text-primary font-bold uppercase tracking-wider leading-none">Pro Plan</p>
                  </div>
                  <ChevronDown size={14} className={`text-on-surface-variant transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''}`} />
               </button>

               <AnimatePresence>
                 {showProfileMenu && (
                   <motion.div 
                     initial={{ opacity: 0, y: 10, scale: 0.95 }}
                     animate={{ opacity: 1, y: 0, scale: 1 }}
                     exit={{ opacity: 0, y: 10, scale: 0.95 }}
                     className="absolute top-full right-0 mt-3 w-80 bg-white rounded-3xl shadow-2xl border border-outline-variant/20 overflow-hidden z-[60]"
                   >
                     {/* Menu Header */}
                     <div className="p-6 bg-gradient-to-br from-surface-container-low to-white border-b border-outline-variant/10">
                        <div className="flex items-center gap-4 mb-4">
                           <div className="w-14 h-14 bg-gradient-primary rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg">
                              {user.name?.charAt(0) || 'U'}
                           </div>
                           <div>
                              <h4 className="font-black text-lg text-on-surface">{user.name}</h4>
                              <p className="text-sm text-on-surface-variant font-medium">{user.email}</p>
                           </div>
                        </div>
                        <div className="flex gap-2">
                           <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-green-100 flex items-center gap-1">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                              Active Session
                           </span>
                           <span className="px-3 py-1 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest rounded-lg border border-primary/10">
                              Premium
                           </span>
                        </div>
                     </div>

                     {/* Activity Preview */}
                     <div className="p-4 border-b border-outline-variant/10">
                        <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-3 px-2">Recent Activity</p>
                        <div className="space-y-1">
                           <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface-container-low transition-colors cursor-pointer group">
                              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-primary group-hover:bg-white transition-colors">
                                 <Activity size={16} />
                              </div>
                              <div className="flex-grow">
                                 <p className="text-xs font-bold">Tax Optimization Run</p>
                                 <p className="text-[10px] text-on-surface-variant font-medium">Completed 2 hours ago</p>
                              </div>
                           </div>
                           <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface-container-low transition-colors cursor-pointer group">
                              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 group-hover:bg-white transition-colors">
                                 <Bell size={16} />
                              </div>
                              <div className="flex-grow">
                                 <p className="text-xs font-bold">New Tax Rule Alert</p>
                                 <p className="text-[10px] text-on-surface-variant font-medium">Section 80C update</p>
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* Menu Actions */}
                     <div className="p-2">
                        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-container-low transition-all text-sm font-bold text-on-surface group">
                           <Settings size={18} className="text-on-surface-variant group-hover:text-primary transition-colors" />
                           Account Settings
                        </button>
                        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-container-low transition-all text-sm font-bold text-on-surface group">
                           <CreditCard size={18} className="text-on-surface-variant group-hover:text-primary transition-colors" />
                           Billing & Plans
                        </button>
                        <div className="h-px bg-outline-variant/10 my-1 mx-2" />
                        <button 
                           onClick={handleLogout}
                           className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 transition-all text-sm font-bold text-red-500 group"
                        >
                           <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
                           Sign Out
                        </button>
                     </div>
                   </motion.div>
                 )}
               </AnimatePresence>
            </>
          ) : (
            <button 
               onClick={() => navigate('/login')}
               className="bg-on-surface text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:shadow-on-surface/20 transition-all"
            >
               Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
