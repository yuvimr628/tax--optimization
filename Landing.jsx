import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, Zap, Shield, TrendingUp, Sparkles, Brain, 
  FileText, PieChart, MessageSquare, CheckCircle, 
  ChevronRight, ArrowUpRight, Lock, Users, BarChart3
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-[#fcfdff] text-[#0f172a] selection:bg-primary/20 overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 bg-gradient-mesh opacity-60 pointer-events-none -z-10" />
      
      {/* Navbar Minimal */}
      <nav className="fixed top-0 left-0 right-0 z-50 py-8 px-6 md:px-12 flex justify-between items-center bg-white/60 backdrop-blur-2xl border-b border-white/30">
         <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <motion.div 
              whileHover={{ rotate: 180 }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
              className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20"
            >
                <TrendingUp className="text-white w-7 h-7" />
            </motion.div>
            <span className="text-3xl font-display font-black tracking-tighter">Your <span className="text-primary italic">Money</span></span>
         </div>
         <div className="hidden lg:flex items-center gap-12">
            {['Process', 'Solutions', 'Trust'].map((item) => (
              <motion.a 
                key={item} 
                href={`#${item.toLowerCase()}`}
                whileHover={{ y: -2 }}
                className="text-xs font-black text-on-surface-variant hover:text-primary transition-colors uppercase tracking-[0.2em]"
              >
                {item}
              </motion.a>
            ))}
         </div>
         <button 
            onClick={() => navigate('/login')}
            className="group relative bg-on-surface text-white px-8 py-3 rounded-full text-sm font-black overflow-hidden hover:shadow-2xl hover:shadow-on-surface/20 transition-all active:scale-95"
         >
            <span className="relative z-10">Launch App</span>
            <div className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
         </button>
      </nav>

      <main className="relative z-10">
        <HeroSection />
        
        <section id="process" className="section-padding relative">
           <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
           <HowItWorks />
        </section>

        <section id="solutions" className="section-padding bg-slate-50 relative overflow-hidden">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(99,102,241,0.05),transparent)]" />
           <FeaturesSection />
        </section>

        <section id="demo" className="section-padding">
           <LiveDemo />
        </section>

        <section className="section-padding bg-[#020617] text-white relative overflow-hidden">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
           <DocShowcase />
        </section>

        <section className="section-padding bg-white">
           <AICopilotShowcase />
        </section>

        <section id="trust" className="section-padding bg-slate-50/50">
           <TrustStats />
        </section>

        <FinalCTA />
      </main>

      {/* Footer */}
      <footer className="px-12 py-24 border-t border-slate-200/50 flex flex-col lg:flex-row justify-between items-start gap-12 bg-white/60">
          <div className="flex flex-col gap-6 max-w-md">
            <div className="flex items-center gap-3">
              <TrendingUp className="text-primary w-8 h-8" />
              <span className="text-3xl font-display font-black tracking-tighter">Your <span className="text-primary">Money</span></span>
            </div>
            <p className="text-lg text-on-surface-variant font-medium leading-relaxed">
              We're building the operating system for personal wealth. Proactive, intelligent, and designed for the modern era.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-2 gap-24">
            <div className="flex flex-col gap-6">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Platform</span>
              <ul className="space-y-4 text-sm font-bold text-on-surface-variant">
                <li className="hover:text-primary transition-colors cursor-pointer">Tax Predictions</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Optimization Hub</li>
                <li className="hover:text-primary transition-colors cursor-pointer">AI Scan Engine</li>
              </ul>
            </div>
            <div className="flex flex-col gap-6">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Legal</span>
              <ul className="space-y-4 text-sm font-bold text-on-surface-variant">
                <li className="hover:text-primary transition-colors cursor-pointer">Privacy First</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Security Core</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Terms</li>
              </ul>
            </div>
          </div>
      </footer>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function HeroSection() {
  const navigate = useNavigate();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const rotateX = useSpring(useTransform(mouseY, [-300, 300], [5, -5]), { stiffness: 100, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-300, 300], [-5, 5]), { stiffness: 100, damping: 30 });

  function handleMouseMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  return (
    <section 
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="pt-64 pb-32 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 md:gap-32 perspective-1000"
    >
      <motion.div 
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="lg:w-3/5 space-y-12 text-center lg:text-left"
      >
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
            className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white shadow-2xl shadow-indigo-100/30 border border-indigo-50"
          >
              <Sparkles size={18} className="text-primary glow-primary" />
              <span className="text-[11px] font-black uppercase tracking-[0.3em] text-primary">AI Tax Intelligence 3.0</span>
          </motion.div>

          <h1 className="text-7xl md:text-9xl font-display font-black tracking-tighter leading-[0.85] text-on-surface">
             Don't just file. <br />
             <span className="text-gradient italic">Find your money.</span>
          </h1>

          <p className="text-xl md:text-2xl text-on-surface-variant font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0">
            Meet the first proactive AI Tax Copilot that clones your financial DNA to predict, simulate, and capture every hidden saving.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start pt-4">
             <button 
                onClick={() => navigate('/signup')}
                className="w-full sm:w-auto bg-primary text-white px-12 py-6 rounded-[32px] font-black text-xl shadow-2xl shadow-primary/40 hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-3 group"
             >
                Start Saving Now <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
             </button>
          </div>

          <div className="flex items-center gap-8 justify-center lg:justify-start pt-8">
             <div className="flex -space-x-4">
               {[1,2,3].map(i => (
                 <div key={i} className="w-12 h-12 rounded-full border-4 border-[#fcfdff] bg-slate-200 overflow-hidden shadow-lg">
                    <img src={`https://i.pravatar.cc/100?img=${i+20}`} alt="user" className="w-full h-full object-cover" />
                 </div>
               ))}
             </div>
             <p className="text-sm font-bold text-on-surface-variant">
               <span className="text-on-surface font-black">15,000+</span> individuals saving <br />
               an average of <span className="text-primary italic font-black">₹42,000</span> yearly.
             </p>
          </div>
      </motion.div>

      <motion.div 
        style={{ rotateX, rotateY }}
        initial={{ opacity: 0, scale: 0.8, rotateY: 20 }}
        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="lg:w-2/5 relative"
      >
          <div className="relative glass-card-premium p-4 md:p-8 rounded-[48px] depth-3 overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              <div className="relative bg-white/90 backdrop-blur-xl rounded-[40px] p-10 shadow-inner border border-white">
                    <div className="flex justify-between items-start mb-12">
                       <div className="flex items-center gap-4">
                           <div className="w-14 h-14 bg-on-surface rounded-2xl flex items-center justify-center text-white shadow-xl">
                              <Brain size={28} />
                           </div>
                           <div>
                               <h3 className="text-xl font-black font-display tracking-tight">Tax Twin Intelligence</h3>
                               <p className="text-xs text-primary font-bold uppercase tracking-widest mt-0.5">Live Strategy Active</p>
                           </div>
                       </div>
                       <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                          <div className="w-2.5 h-2.5 bg-success rounded-full animate-ping" />
                       </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex justify-between items-end">
                           <div>
                             <p className="text-[10px] font-black text-on-surface-variant uppercase mb-1">Current Savings Potential</p>
                             <p className="text-5xl font-black text-on-surface tracking-tighter">₹58,400</p>
                           </div>
                           <div className="text-right">
                             <p className="text-xs font-black text-success uppercase">+12% Optimized</p>
                           </div>
                        </div>
                        <div className="h-4 bg-surface-container-low rounded-full overflow-hidden">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: "82%" }}
                             transition={{ duration: 1.5, delay: 1 }}
                             className="h-full bg-gradient-primary rounded-full shadow-lg shadow-primary/20" 
                           />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5 pt-4">
                       <div className="p-6 rounded-[32px] bg-indigo-50/50 border border-indigo-100/50">
                         <BarChart3 className="text-primary mb-3" size={24} />
                         <p className="text-[10px] font-black text-primary uppercase mb-1">Deductions Spot</p>
                         <p className="text-2xl font-black capitalize tracking-tight">8 Found</p>
                       </div>
                       <div className="p-6 rounded-[32px] bg-amber-50/50 border border-amber-100/50">
                         <Zap className="text-amber-600 mb-3" size={24} />
                         <p className="text-[10px] font-black text-amber-600 uppercase mb-1">Effort Score</p>
                         <p className="text-2xl font-black tracking-tight">Min. (12m)</p>
                       </div>
                    </div>
              </div>
          </div>

          {/* Floating Elements */}
          <motion.div 
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-10 -right-10 glass-card p-6 rounded-[32px] shadow-2xl z-20"
          >
             <div className="flex items-center gap-3">
               <Shield className="text-success" size={20} />
               <span className="text-sm font-black text-on-surface">Data Secure</span>
             </div>
          </motion.div>

          <motion.div 
            animate={{ y: [0, 15, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-6 -left-12 glass-card p-6 rounded-[32px] shadow-2xl z-20 bg-white/80"
          >
             <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                 <Sparkles className="text-primary" size={20} />
               </div>
               <div>
                  <p className="text-[10px] font-black uppercase text-on-surface-variant mb-0.5">AI Suggestion</p>
                  <p className="text-sm font-black">Move ₹12k to 80C</p>
               </div>
             </div>
          </motion.div>
      </motion.div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { title: "Connect", desc: "Upload docs or connect accounts. Our AI reads everything in seconds.", icon: <FileText size={40} /> },
    { title: "Clone", desc: "Our engine builds your 'Tax Twin'—a perfect financial digital clone.", icon: <Brain size={40} /> },
    { title: "Simulate", desc: "We run 10,000+ scenarios to find every possible legal tax deduction.", icon: <PieChart size={40} /> },
    { title: "Deploy", desc: "Get a clear strategy and file with one click. Simple, smart, secure.", icon: <CheckCircle size={40} /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-center space-y-4 mb-20">
        <h2 className="text-sm font-black uppercase tracking-[0.3em] text-primary">The Process</h2>
        <h3 className="text-5xl md:text-7xl font-display font-black tracking-tighter">How the Magic Happens</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {steps.map((step, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="relative p-10 rounded-[48px] bg-white border border-outline-variant/10 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all group"
          >
            <div className="w-20 h-20 rounded-3xl bg-surface-container-low flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors mb-8">
              {step.icon}
            </div>
            <h4 className="text-2xl font-black mb-4">{step.title}</h4>
            <p className="text-on-surface-variant font-medium leading-relaxed">{step.desc}</p>
            <div className="absolute top-10 right-10 text-6xl font-display font-black opacity-5 group-hover:opacity-10 transition-opacity">
              0{idx + 1}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function FeaturesSection() {
  const features = [
    { title: "Real-time Tax Prediction", desc: "Know your exact liability as you earn, not just in March.", icon: <TrendingUp /> },
    { title: "HRA & Rent Optimizer", desc: "Mathematical optimization of your CTC structure.", icon: <Sparkles /> },
    { title: "Smart Doc Audit", desc: "Automatic audit of all your bills and investment proofs.", icon: <FileText /> },
    { title: "Contextual Chat", desc: "Ask 'Can I save more?' and get instant, legal answers.", icon: <MessageSquare /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6">
       <div className="grid lg:grid-cols-2 gap-24 items-center">
          <div className="space-y-12">
             <div className="space-y-6">
                <h2 className="text-sm font-black uppercase tracking-[0.3em] text-primary">Key Solutions</h2>
                <h3 className="text-6xl md:text-8xl font-display font-black tracking-tighter leading-[0.85]">
                   Smarter Tools for <br />
                   <span className="text-primary italic">Smarter People.</span>
                </h3>
                <p className="text-xl text-on-surface-variant font-medium leading-relaxed max-w-xl">
                   We've modernized the entire tax filing stack. No more spreadsheets. No more guesswork. Just pure data-driven savings.
                </p>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                {features.map((f, i) => (
                  <div key={i} className="space-y-4">
                     <div className="w-12 h-12 rounded-2xl bg-white shadow-lg flex items-center justify-center text-primary">
                        {f.icon}
                     </div>
                     <h4 className="text-xl font-black">{f.title}</h4>
                     <p className="text-sm text-on-surface-variant font-medium">{f.desc}</p>
                  </div>
                ))}
             </div>
          </div>
          <div className="relative">
             <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full translate-x-20" />
             <div className="relative glass-card-premium p-10 rounded-[64px] shadow-2xl border border-white">
                <div className="bg-on-surface rounded-[40px] p-8 text-white min-h-[500px] flex flex-col justify-between overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px]" />
                    <div className="space-y-8 relative z-10">
                       <div className="flex items-center gap-4">
                          <BotLogo />
                          <h4 className="text-xl font-bold">Copilot Core</h4>
                       </div>
                       <div className="space-y-4">
                          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} className="p-4 bg-white/10 rounded-2xl backdrop-blur-md max-w-[80%]">
                             Analyzing your FY 24-25 data...
                          </motion.div>
                          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="p-4 bg-primary text-white rounded-2xl shadow-xl max-w-[80%] self-end">
                             I've found 3 new optimization paths for Section 10(13A).
                          </motion.div>
                       </div>
                    </div>
                    <div className="relative z-10 p-6 bg-white/10 rounded-3xl border border-white/10">
                       <div className="flex items-center gap-6">
                          <div className="flex-1 space-y-2">
                             <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} whileInView={{ width: "70%" }} className="h-full bg-white" />
                             </div>
                             <p className="text-[10px] font-black uppercase opacity-60">Accuracy Depth</p>
                          </div>
                          <p className="text-2xl font-black tracking-tighter">99.8%</p>
                       </div>
                    </div>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
}

function BotLogo() {
  return (
    <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
       <Sparkles className="text-white" size={20} />
    </div>
  );
}

function LiveDemo() {
  const [salary, setSalary] = useState(1200000);
  
  return (
    <div className="max-w-5xl mx-auto px-6">
       <div className="glass-card-premium p-12 md:p-24 rounded-[64px] relative overflow-hidden text-center space-y-16">
          <div className="absolute top-0 right-0 p-8">
             <div className="px-4 py-2 bg-on-surface text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl">Live Engine</div>
          </div>

          <div className="space-y-6">
             <h3 className="text-5xl md:text-7xl font-display font-black tracking-tighter">See the magic live.</h3>
             <p className="text-xl text-on-surface-variant font-medium">Select your annual income to see your savings potential.</p>
          </div>

          <div className="space-y-8 max-w-2xl mx-auto">
             <div className="flex justify-between items-baseline mb-4">
                <span className="text-sm font-black uppercase tracking-widest text-on-surface-variant">Annual Gross Income</span>
                <span className="text-4xl font-black text-primary tracking-tighter">₹{salary.toLocaleString('en-IN')}</span>
             </div>
             <input 
               type="range" 
               min="500000" 
               max="5000000" 
               step="50000" 
               value={salary} 
               onChange={(e) => setSalary(Number(e.target.value))}
               className="w-full h-4 bg-surface-container rounded-full appearance-none cursor-pointer accent-primary"
             />
             <div className="flex justify-between text-[10px] items-center font-black uppercase tracking-widest opacity-40">
                <span>₹5L</span>
                <span>₹50L</span>
             </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 pt-8">
             <div className="p-10 rounded-[48px] bg-slate-50 border border-outline-variant/10 text-left">
                <p className="text-[10px] font-black uppercase text-on-surface-variant mb-2">Estimated Saving</p>
                <p className="text-6xl font-black text-on-surface tracking-tighter">₹{Math.round(salary * 0.045).toLocaleString('en-IN')}</p>
                <div className="mt-6 flex items-center gap-2 text-primary font-black text-sm">
                   <Zap size={18} /> Optimized by your Twin
                </div>
             </div>
             <div className="p-10 rounded-[48px] bg-primary text-white text-left relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:scale-125 transition-transform duration-500">
                   <TrendingUp size={80} />
                </div>
                <p className="text-[10px] font-black uppercase opacity-60 mb-2">Tax Liability Score</p>
                <p className="text-6xl font-black tracking-tighter">Top 5%</p>
                <p className="mt-6 text-sm font-black opacity-80">You are more efficient than 95% <br />of similar taxpayers.</p>
             </div>
          </div>
       </div>
    </div>
  );
}

function DocShowcase() {
  return (
    <div className="max-w-7xl mx-auto px-6">
       <div className="flex flex-col lg:flex-row items-center gap-24">
          <div className="lg:w-1/2 space-y-12">
             <div className="space-y-6">
                <h2 className="text-sm font-black uppercase tracking-[0.3em] text-primary">Ultra Scan</h2>
                <h3 className="text-6xl md:text-8xl font-display font-black tracking-tighter leading-[0.85]">
                   AI Extraction. <br />
                   <span className="text-primary italic">Pixel Perfect.</span>
                </h3>
                <p className="text-xl opacity-80 font-medium leading-relaxed">
                   Upload your Form-16, Rent Receipts, or HL interest certificates. Our vision engine extracts the data and maps it to the IT sections with 100% precision.
                </p>
             </div>
             <ul className="space-y-6">
                {['Automatic Section Mapping', 'Encryption at Rest & Transit', 'OCR with 99.9% Success Rate'].map((item, i) => (
                   <li key={i} className="flex items-center gap-4 text-xl font-bold">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                         <CheckCircle size={18} />
                      </div>
                      {item}
                   </li>
                ))}
             </ul>
          </div>
          <div className="lg:w-1/2 w-full">
             <div className="relative aspect-square glass-card-dark rounded-[64px] overflow-hidden p-8 flex items-center justify-center border border-white/5">
                <motion.div 
                   animate={{ 
                      y: [0, 400, 0],
                      opacity: [0.2, 0.8, 0.2]
                   }}
                   transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                   className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-primary to-transparent z-20 shadow-[0_0_30px_rgba(99,102,241,1)]"
                />
                <div className="w-full h-full bg-slate-900 rounded-[48px] border border-white/10 p-10 flex flex-col justify-between relative">
                   <div className="flex justify-between items-start">
                      <FileText size={48} className="text-primary" />
                      <div className="text-right">
                         <p className="text-[10px] font-black opacity-40 uppercase">File Status</p>
                         <p className="text-sm font-black text-success">Processing...</p>
                      </div>
                   </div>
                   <div className="space-y-6">
                      {[1,2,3].map(i => (
                         <div key={i} className="space-y-2">
                            <div className="h-2 w-1/4 bg-white/10 rounded-full" />
                            <div className="h-4 w-full bg-white/5 rounded-2xl flex items-center px-4">
                               <motion.div initial={{ width: 0 }} whileInView={{ width: "60%" }} className="h-1 bg-primary/40 rounded-full" />
                            </div>
                         </div>
                      ))}
                   </div>
                   <div className="flex gap-4">
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex-1">
                         <p className="text-[10px] font-black opacity-30">BASIC SALARY</p>
                         <p className="text-xl font-black">₹420,000</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex-1">
                         <p className="text-[10px] font-black opacity-30">SECTION 80C</p>
                         <p className="text-xl font-black text-primary">₹150,000</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
}

function AICopilotShowcase() {
   return (
     <div className="max-w-7xl mx-auto px-6">
        <div className="glass-card-premium p-12 md:p-32 rounded-[64px] border border-white overflow-hidden relative group">
           <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px]" />
           <div className="relative flex flex-col items-center text-center space-y-12">
              <div className="w-24 h-24 bg-on-surface rounded-[32px] flex items-center justify-center text-white shadow-2xl relative">
                 <BotLogo />
                 <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} className="absolute -bottom-2 -right-2 w-8 h-8 bg-success rounded-full border-4 border-white flex items-center justify-center text-[10px] font-black">AI</motion.div>
              </div>
              <div className="space-y-6 max-w-3xl">
                 <h3 className="text-5xl md:text-8xl font-display font-black tracking-tighter leading-none">
                    Meet the Twin <br />
                    <span className="text-primary italic">Built for You.</span>
                 </h3>
                 <p className="text-xl text-on-surface-variant font-medium leading-relaxed">
                    Tax Twin observes thousands of data points—from your monthly rents to your insurance premiums—creating a digital mirror of your tax profile that tests savings scenarios 24/7.
                 </p>
              </div>
              <div className="flex flex-wrap justify-center gap-6">
                 {['Behavioral Analysis', 'Proactive Warnings', '1-Click Optimization'].map((tag, i) => (
                    <div key={i} className="px-8 py-4 rounded-3xl bg-indigo-50 border border-indigo-100 text-primary font-black text-sm">{tag}</div>
                 ))}
              </div>
           </div>
        </div>
     </div>
   );
}

function TrustStats() {
  return (
    <div className="max-w-7xl mx-auto px-6">
       <div className="text-center space-y-4 mb-20">
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-primary">The Standard</h2>
          <h3 className="text-5xl md:text-7xl font-display font-black tracking-tighter">Trusted by the best.</h3>
       </div>

       <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-20">
          {[
            { label: "Bank-Grade Encryption", icon: <Lock size={32} />, value: "256-bit" },
            { label: "Registered Users", icon: <Users size={32} />, value: "15,200+" },
            { label: "Tax Saved to date", icon: <PieChart size={32} />, value: "₹42Cr+" },
            { label: "Platform Uptime", icon: <CheckCircle size={32} />, value: "99.9%" },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center text-center space-y-4 group">
               <div className="w-20 h-20 rounded-full border border-outline-variant/30 flex items-center justify-center group-hover:border-primary group-hover:bg-primary/5 transition-all text-on-surface-variant group-hover:text-primary">
                  {item.icon}
               </div>
               <div className="space-y-1">
                  <p className="text-3xl font-black">{item.value}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-60">{item.label}</p>
               </div>
            </div>
          ))}
       </div>
    </div>
  );
}

function FinalCTA() {
  const navigate = useNavigate();
  return (
    <section className="section-padding overflow-hidden relative">
       <div className="absolute top-0 left-0 w-full h-full bg-gradient-primary opacity-[0.03] -z-10" />
       
       <motion.div 
         initial={{ opacity: 0, scale: 0.9 }}
         whileInView={{ opacity: 1, scale: 1 }}
         className="max-w-5xl mx-auto px-6 text-center space-y-12"
       >
          <div className="space-y-6">
             <h2 className="text-6xl md:text-8xl font-display font-black tracking-tighter leading-[0.85]">
                Ready to find <br />
                <span className="text-gradient">Your Money?</span>
             </h2>
             <p className="text-xl md:text-2xl text-on-surface-variant font-medium leading-relaxed max-w-2xl mx-auto">
                Join 15,000+ taxpayers who are saving more than ever with their personal AI Tax Twin.
             </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
             <button 
                onClick={() => navigate('/login')}
                className="bg-on-surface text-white px-16 py-8 rounded-[40px] font-black text-2xl hover:shadow-2xl hover:shadow-on-surface/30 transition-all flex items-center justify-center gap-4 group hover:-translate-y-1"
             >
                Start Saving Now <ArrowRight size={28} />
             </button>
             <div className="flex items-center gap-4">
                <div className="flex -space-x-4">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-surface-container shadow-sm overflow-hidden">
                       <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <div className="text-left">
                   <p className="text-sm font-black text-on-surface">Join 15k+ users</p>
                   <p className="text-[10px] uppercase font-black tracking-widest text-on-surface-variant">4.9/5 Average Rating</p>
                </div>
             </div>
          </div>
       </motion.div>
    </section>
  );
}
