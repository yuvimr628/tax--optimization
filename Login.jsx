import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, TrendingUp, Sparkles, ArrowRight, ShieldCheck, Globe } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login, socialLogin } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    
    setIsLoading(true);
    try {
      const { data } = await axios.post(endpoint, formData);
      login(data);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      if (!err.response) {
        setError('Server is currently unreachable. Please check your connection.');
      } else {
        setError(err.response.data?.message || 'Action failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialAction = (platform) => {
    setIsLoading(true);
    setTimeout(() => {
      socialLogin(platform);
      setIsLoading(false);
      navigate('/dashboard');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 lg:p-8 font-sans overflow-hidden relative">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 bg-white/5 backdrop-blur-2xl rounded-[48px] border border-white/10 shadow-2xl overflow-hidden relative z-10"
      >
        {/* Left Side: Premium Branding */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#0f172a] to-[#1e293b] p-10 lg:p-16 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_30%,rgba(99,102,241,0.15),transparent)] pointer-events-none" />
          
          <div className="relative z-10 flex items-center gap-3 mb-16 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
              <TrendingUp className="text-white w-7 h-7" />
            </div>
            <span className="text-3xl font-black tracking-tighter text-white">Your <span className="text-primary italic">Money</span></span>
          </div>

          <div className="relative z-10 space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10"
            >
              <Sparkles size={14} className="text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200">AI Intelligence Suite</span>
            </motion.div>

            <h1 className="text-5xl lg:text-6xl font-black text-white leading-tight tracking-tighter">
              The future of <br />
              <span className="text-primary italic">personal wealth.</span>
            </h1>

            <p className="text-indigo-100/60 text-lg font-medium leading-relaxed max-w-md">
              Securely access your Tax Twin and real-time optimization hub. Your financial DNA is waiting.
            </p>
          </div>

          <div className="relative z-10 pt-12">
            <div className="flex -space-x-3 mb-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-[#0f172a] bg-slate-800 overflow-hidden">
                   <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" className="w-full h-full object-cover" />
                </div>
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-[#0f172a] bg-primary flex items-center justify-center text-[10px] font-bold text-white uppercase">+15k</div>
            </div>
            <p className="text-xs font-bold text-indigo-200/50">Joined by highly efficient taxpayers worldwide.</p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="lg:col-span-7 bg-white p-10 lg:p-20 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <div className="mb-10 text-center lg:text-left">
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">
                {isLogin ? 'Welcome back' : 'Create account'}
              </h2>
              <p className="text-slate-500 font-medium">
                {isLogin ? 'Enter your details to track your savings.' : 'Start your journey to tax optimization today.'}
              </p>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-100 text-red-500 p-4 rounded-2xl mb-8 text-sm font-bold flex items-center gap-3"
              >
                <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <AnimatePresence mode='wait'>
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-2 overflow-hidden"
                  >
                    <div className="relative group">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                      <input 
                        type="text" 
                        placeholder="Your full name"
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-14 pr-5 text-slate-900 outline-none focus:border-primary focus:bg-white transition-all text-sm font-bold placeholder:text-slate-400"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input 
                  type="email" 
                  required
                  placeholder="name@company.com"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-14 pr-5 text-slate-900 outline-none focus:border-primary focus:bg-white transition-all text-sm font-bold placeholder:text-slate-400"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input 
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter password"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-14 pr-14 text-slate-900 outline-none focus:border-primary focus:bg-white transition-all text-sm font-bold placeholder:text-slate-400"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <div className="flex items-center justify-between px-2 text-xs font-bold pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-600 transition-colors">
                  <input type="checkbox" className="w-4 h-4 rounded-lg accent-primary" />
                  Remember me
                </label>
                <button type="button" className="text-primary hover:underline">Forgot password?</button>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="group relative w-full bg-slate-900 hover:bg-black text-white font-black py-4 rounded-2xl mt-4 shadow-xl shadow-slate-200 transition-all active:scale-[0.98] disabled:opacity-50 overflow-hidden"
              >
                <div className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <div className="relative z-10 flex items-center justify-center gap-3">
                   {isLoading ? (
                     <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                   ) : (
                     <>
                        <span>{isLogin ? 'Sign In to Dashboard' : 'Explore Free Account'}</span>
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                     </>
                   )}
                </div>
              </button>
            </form>

            <div className="mt-12">
              <div className="relative flex items-center mb-10">
                <div className="flex-grow border-t border-slate-100"></div>
                <span className="flex-shrink mx-4 text-[10px] font-black uppercase tracking-widest text-slate-300">Fast Access via Socials</span>
                <div className="flex-grow border-t border-slate-100"></div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: 'Google', icon: <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg> },
                  { id: 'Apple', icon: <Globe className="w-5 h-5" /> },
                  { id: 'Vault', icon: <ShieldCheck className="w-5 h-5" /> }
                ].map((app) => (
                  <button 
                    key={app.id}
                    type="button"
                    onClick={() => handleSocialAction(app.id)}
                    className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:border-primary hover:shadow-xl hover:shadow-primary/5 transition-all group"
                  >
                    <div className="text-slate-600 group-hover:text-primary transition-colors mb-2">
                       {app.icon}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900">{app.id}</span>
                  </button>
                ))}
              </div>

              <p className="mt-12 text-center text-sm font-bold text-slate-400">
                {isLogin ? "No account yet? " : "Already optimized? "}
                <button 
                  onClick={() => setIsLogin(!isLogin)} 
                  className="text-primary hover:text-indigo-700 transition-colors"
                >
                  {isLogin ? 'Create one now' : 'Sign in here'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
