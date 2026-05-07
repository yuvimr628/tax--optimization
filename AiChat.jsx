import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Send, Bot, User, Sparkles, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AiChat({ taxData }) {
  const { user } = useAuth();
  const userName = user?.name?.split(' ')[0] || 'there';

    const [messages, setMessages] = useState([
    { role: 'ai', content: `Hi ${userName}! 👋 I am your Your Money AI assistant. I've analyzed your current tax profile. How can I help you maximize your savings today?` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() && !voiceMode) return;

    const userMsg = input.trim() || "Analyze my tax saving potential";
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await axios.post('/api/ai/chat', {
        message: userMsg,
        taxData
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      setMessages(prev => [...prev, { role: 'ai', content: data.reply }]);
    } catch (error) {
      console.error(error);
      const errorMessage = error.response?.data?.reply || error.response?.data?.message || 'Oops, I encountered an error connecting to my brain. Please try again.';
      setMessages(prev => [...prev, { role: 'ai', content: errorMessage }]);
    } finally {
      setLoading(false);
      if (voiceMode) setVoiceMode(false);
    }
  };

  const renderContent = (content) => {
    if (!content.includes('Reason:')) return <p className="whitespace-pre-wrap font-medium">{content}</p>;

    // Simple parsing for structured AI response
    const parts = content.split('\n');
    return (
        <div className="space-y-4">
            {parts.map((line, idx) => {
                if (line.startsWith('Reason:')) return <div key={idx} className="bg-white/50 p-3 rounded-xl border border-indigo-100 text-xs font-bold text-indigo-900"><span className="text-primary mr-2">🧠 REASONING:</span> {line.replace('Reason:', '')}</div>;
                if (line.startsWith('Rule:')) return <div key={idx} className="text-[10px] font-black uppercase text-on-surface-variant tracking-widest bg-slate-100 px-3 py-1 rounded-full inline-block">{line}</div>;
                if (line.startsWith('Confidence:')) return <div key={idx} className="flex items-center gap-2 mt-2"><div className="flex-grow h-1 bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-green-500" style={{width: line.match(/\d+/)?.[0] + '%'}} /></div><span className="text-[10px] font-black text-green-600">{line}</span></div>;
                return <p key={idx} className="text-base font-medium">{line}</p>;
            })}
        </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-[40px] overflow-hidden border border-outline-variant/30 relative">
      <header className="px-8 py-6 border-b border-outline-variant/10 bg-white flex justify-between items-center relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center border border-indigo-100 relative group overflow-hidden">
            {voiceMode ? (
                <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute inset-0 bg-primary/20 rounded-full" />
            ) : null}
            <Bot size={24} className="text-primary relative z-10" />
          </div>
          <div>
            <h2 className="font-black text-xl font-display tracking-tight">Your Money Assistant</h2>
            <p className="text-[10px] text-primary font-black uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
               <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
               {voiceMode ? 'Listening to your request...' : 'Ready to analyze'}
            </p>
          </div>
        </div>
        <button 
            onClick={() => setVoiceMode(!voiceMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${voiceMode ? 'bg-primary text-white shadow-lg' : 'bg-surface-container-low text-on-surface-variant'}`}
        >
             <div className={`w-2 h-2 rounded-full ${voiceMode ? 'bg-white animate-ping' : 'bg-slate-300'}`} />
             Voice Mode
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide" ref={scrollRef}>
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
                <div className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center border ${
                        msg.role === 'user' 
                        ? 'bg-on-surface text-white border-on-surface shadow-md' 
                        : 'bg-indigo-50 text-primary border-indigo-100'
                    }`}>
                        {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                    </div>
                    <div className={`p-5 rounded-[28px] text-base leading-relaxed ${
                        msg.role === 'user' 
                        ? 'bg-on-surface text-white rounded-tr-none shadow-xl shadow-on-surface/5' 
                        : 'bg-indigo-50/50 border border-indigo-100 rounded-tl-none text-on-surface'
                    }`}>
                        {renderContent(msg.content)}
                    </div>
                </div>
            </motion.div>
          ))}
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="flex gap-4 max-w-[80%]">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-200 flex items-center justify-center border border-indigo-100">
                        <Bot size={18} />
                    </div>
                    <div className="p-5 rounded-[28px] rounded-tl-none bg-indigo-50/50 border border-indigo-100">
                        <div className="flex gap-1.5">
                            {[1, 2, 3].map(n => (
                                <motion.div 
                                    key={n}
                                    animate={{ y: [0, -5, 0] }}
                                    transition={{ repeat: Infinity, duration: 1, delay: n * 0.2 }}
                                    className="w-2 h-2 bg-primary rounded-full"
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-8 bg-white border-t border-outline-variant/10 relative z-10">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input 
            type="text" 
            placeholder={voiceMode ? "Listening..." : "How can I save more in Sec 80C?"}
            disabled={voiceMode}
            className="w-full bg-surface-container-low border border-outline-variant/20 rounded-[28px] pl-6 pr-20 py-5 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/40 text-on-surface font-semibold placeholder:text-on-surface-variant/50 transition-all shadow-inner"
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <button 
            type="submit" 
            disabled={loading || (!input.trim() && !voiceMode)}
            className="absolute right-2 w-16 h-14 flex items-center justify-center bg-on-surface text-white rounded-[24px] disabled:opacity-20 disabled:cursor-not-allowed hover:bg-slate-800 transition-all shadow-lg active:scale-95"
          >
            {voiceMode ? <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }}><Sparkles size={20} /></motion.div> : <Send size={20} />}
          </button>
        </form>
        <div className="flex items-center gap-2 mt-4 justify-center">
            <Sparkles size={12} className="text-amber-400" />
            <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-40">Powered by Your Money AI Engine</span>
        </div>
      </div>
    </div>
  );
}
