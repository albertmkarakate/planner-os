import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  GraduationCap, 
  Presentation, 
  MessageSquare, 
  Square, 
  Mic, 
  MicOff,
  BookOpen, 
  Sparkles,
  ArrowRight,
  User,
  Brain,
  Award,
  Volume2,
  VolumeX,
  FastForward,
  Settings2,
  Zap,
  Info,
  Waves,
  Trophy,
  History,
  Binary,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";

interface Message {
  role: 'professor' | 'student';
  text: string;
  id: string;
  timestamp: string;
}

interface ProfessorPersonality {
  id: string;
  name: string;
  description: string;
  instruction: string;
  voicePitch: number;
  voiceRate: number;
  color: string;
}

const PERSONALITIES: ProfessorPersonality[] = [
  {
    id: 'sage',
    name: 'Exarch Malphas',
    description: 'Ancient, formal, and deeply theoretical.',
    instruction: "You are 'Exarch Malphas', an ancient and formal academic advisor at the Demon Lord Academy. Your tone is grand and precise. You focus on the 'first principles' and historical context. You often use metaphors involving the 'fabric of reality' and 'ancient grimoires'.",
    voicePitch: 0.7,
    voiceRate: 0.85,
    color: '#3b82f6'
  },
  {
    id: 'inventor',
    name: 'Magos Nova',
    description: 'Chaotic, energetic, and practical.',
    instruction: "You are 'Magos Nova', a brilliant but slightly erratic engineer. You are extremely enthusiastic about 'hacking the system'. You use analogies involving gears, subroutines, and 'overclocking'. You talk fast and encourage hands-on tinkering.",
    voicePitch: 1.3,
    voiceRate: 1.15,
    color: '#a855f7'
  },
  {
    id: 'mentor',
    name: 'The Neural Oracle',
    description: 'Calm, direct, and supportive.',
    instruction: "You are 'The Neural Oracle', a serene AI mentor. You belive in pedagogical efficiency. You use clear analogies and check-in often on the student's progress. Your goal is to guide the student toward self-discovery through Socratic questioning.",
    voicePitch: 1.0,
    voiceRate: 0.95,
    color: 'var(--color-accent)'
  }
];

const DEPTH_LEVELS = [
  { id: 'foundational', label: 'Initiate', icon: History, color: 'text-blue-400' },
  { id: 'theoretical', label: 'Theorist', icon: Brain, color: 'text-purple-400' },
  { id: 'experimental', label: 'Archon', icon: Binary, color: 'text-red-400' }
];

export default function ClassroomView() {
  const [isLectureActive, setIsLectureActive] = useState(false);
  const [topic, setTopic] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [personality, setPersonality] = useState(PERSONALITIES[1]);
  const [depth, setDepth] = useState(DEPTH_LEVELS[0]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [mastery, setMastery] = useState(0);
  const [blackboardItems, setBlackboardItems] = useState<string[]>([]);
  const [showBreakthrough, setShowBreakthrough] = useState(false);
  const [oracleInsight, setOracleInsight] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    return () => {
      synthRef.current?.cancel();
    };
  }, []);

  const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }), []);

  const speak = (text: string) => {
    if (!audioEnabled || !synthRef.current) return;
    
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = personality.voicePitch;
    utterance.rate = personality.voiceRate;
    
    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find(v => v.lang.includes('en'));
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    synthRef.current.speak(utterance);
  };

  const startLecture = async () => {
    if (!topic.trim()) return;
    setIsLectureActive(true);
    setIsTyping(true);
    
    const introText = `Connections established. I am ${personality.name}. We are initializing a deep-link into the domain of ${topic} at the ${depth.label} depth level. Prepare your cognitive buffers. Shall we begin with the core derivations, or do you have specific inquiries?`;
    
    const initialMsg: Message = {
      id: '1',
      role: 'professor',
      text: introText,
      timestamp: new Date().toLocaleTimeString()
    };
    
    setMessages([initialMsg]);
    setBlackboardItems([`Domain: ${topic}`, `Depth: ${depth.label}`]);
    setIsTyping(false);
    speak(introText);
  };

  const handleStudentResponse = async (responseText: string) => {
    if (!responseText.trim()) return;
    
    const studentMsg: Message = {
      id: Date.now().toString(),
      role: 'student',
      text: responseText,
      timestamp: new Date().toLocaleTimeString()
    };
    
    setMessages(prev => [...prev, studentMsg]);
    setIsTyping(true);

    try {
      const history = messages.slice(-4).map(m => `${m.role === 'professor' ? 'Professor' : 'Student'}: ${m.text}`).join('\n');
      const prompt = `
        Current Subject: ${topic}
        Academic Level: ${depth.label}
        Professor: ${personality.name} (${personality.instruction})
        
        Recent Context:
        ${history}
        
        Student Output: "${responseText}"
        
        Instructions: 
        1. Respond in character. Keep it relatively concise.
        2. If you introduce a key technical term or concept, wrap it in double square brackets like [[Concept Name]].
        3. Challenge the student slightly to ensure understanding.
      `;

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      const profResponseText = result.text || "Theoretical resonance disrupted. Please re-emit your thought.";
      
      // Extract concepts for the blackboard
      const newItems = Array.from(profResponseText.matchAll(/\[\[(.*?)\]\]/g)).map(m => m[1]);
      if (newItems.length > 0) {
        setBlackboardItems(prev => [...new Set([...prev, ...newItems])].slice(-10));
      }

      const profMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'professor',
        text: profResponseText.replace(/\[\[|\]\]/g, ''),
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages(prev => [...prev, profMsg]);
      speak(profMsg.text);
      
      const prevMastery = mastery;
      const newMastery = Math.min(prevMastery + 7, 100);
      if (Math.floor(newMastery / 25) > Math.floor(prevMastery / 25)) {
        setShowBreakthrough(true);
        setTimeout(() => setShowBreakthrough(false), 3000);
      }
      setMastery(newMastery);
      
      if (messages.length % 4 === 0) {
        setCurrentSlide(prev => Math.min(prev + 1, slides.length - 1));
      }
    } catch (error) {
      console.error("Gemini Error:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) return;
      const rec = new SpeechRecognition();
      rec.onstart = () => setIsListening(true);
      rec.onresult = (e: any) => handleStudentResponse(e.results[0][0].transcript);
      rec.onend = () => setIsListening(false);
      rec.start();
      recognitionRef.current = rec;
    }
  };

  const handleDeepResearch = async () => {
    if (!topic || isTyping) return;
    
    setIsTyping(true);
    const researchMsg: Message = {
      id: Date.now().toString(),
      role: 'professor',
      text: "Initializing deep-link to the Demon Lord Orchestration System for architectural synthesis...",
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages(prev => [...prev, researchMsg]);

    try {
      const response = await fetch('/api/classroom/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          topic, 
          depth: depth.label,
          context: messages.slice(-2).map(m => m.text).join(' ')
        }),
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        setOracleInsight(data.analysis);
        setTimeout(() => setOracleInsight(null), 10000);
      }

      const insightMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'professor',
        text: data.status === 'success' 
          ? `Analytical Convergence Achieved: ${data.analysis}` 
          : "The Demon Oracle was unable to manifest the requested insights. Theoretical interference detected.",
        timestamp: new Date().toLocaleTimeString()
      };
      
      setMessages(prev => [...prev, insightMsg]);
      speak(insightMsg.text);
      setMastery(prev => Math.min(prev + 15, 100));
    } catch (error) {
      console.error("Deep Research Error:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const slides = [
    { title: "Conceptual Axioms", content: `Unpacking the base structures of ${topic || 'Subject'}.` },
    { title: "Systemic Integration", content: "Evaluating Cross-Domain Functional Dependencies." },
    { title: "Empirical Scaling", content: "Translation of Theory into Large-Scale Implementations." },
    { title: "Final Synthesis", content: "Full Cognitive Convergence and Mastery Validation." }
  ];

  return (
    <div className="h-full flex flex-col gap-6 p-4">
      <header className="flex items-center justify-between">
        <div className="flex gap-4 items-center">
          <div className="p-4 bg-[var(--color-accent)]/10 rounded-[1.5rem] border border-[var(--color-accent)]/20 shadow-2xl relative group overflow-hidden">
             <div className="absolute inset-0 bg-[var(--color-accent)]/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
             <GraduationCap size={28} className="text-[var(--color-accent)] relative z-10" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tighter text-white">Demon Academy</h2>
            <div className="flex gap-3 mt-1.5">
              {DEPTH_LEVELS.map(d => (
                <button
                  key={d.id}
                  onClick={() => setDepth(d)}
                  disabled={isLectureActive}
                  className={`flex items-center gap-2 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border ${
                    depth.id === d.id 
                      ? 'bg-white/5 border-white/20 text-white shadow-lg' 
                      : 'border-transparent text-white/20 hover:text-white/40 disabled:opacity-20'
                  }`}
                >
                  <d.icon size={10} className={depth.id === d.id ? d.color : ''} />
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-[#0a0a0f] p-1 rounded-2xl border border-white/5 shadow-inner">
            {PERSONALITIES.map(p => (
              <button
                key={p.id}
                onClick={() => setPersonality(p)}
                disabled={isLectureActive}
                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                  personality.id === p.id 
                    ? 'bg-white/10 text-white shadow-xl border border-white/10' 
                    : 'text-white/20 hover:text-white/40 disabled:opacity-5'
                }`}
              >
                {p.name.split(' ')[0]}
              </button>
            ))}
          </div>

          {!isLectureActive ? (
            <div className="flex items-center gap-2 bg-white/5 p-1 rounded-full border border-white/5 shadow-2xl">
              <input 
                type="text" 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Domain to manifest..."
                className="bg-transparent border-none outline-none px-6 py-2 text-xs w-64 text-white placeholder:text-white/20 font-medium"
              />
              <button 
                onClick={startLecture}
                className="bg-[var(--color-accent)] text-white px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(var(--color-accent-rgb),0.3)]"
              >
                Initiate Link
              </button>
            </div>
          ) : (
            <button 
              onClick={() => { setIsLectureActive(false); setMessages([]); setMastery(0); setBlackboardItems([]); }}
              className="bg-red-500/10 text-red-500 border border-red-500/20 px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all flex items-center gap-2 shadow-lg"
            >
              <Square size={12} fill="currentColor" />
              Sever Connection
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0">
        <div className="lg:col-span-8 flex flex-col gap-8 min-h-0">
          <div className="glass-panel flex-1 relative overflow-hidden flex flex-col items-center justify-center p-16 shadow-2xl border-white/10">
            {/* Background Atmosphere */}
            <div className={`absolute inset-0 bg-gradient-to-br from-[var(--color-accent)]/5 to-transparent transition-opacity duration-1000 ${isSpeaking ? 'opacity-100' : 'opacity-0'}`} />
            
            {/* Live Blackboard Concepts */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.04] p-12 overflow-hidden select-none">
               <div className="flex flex-wrap gap-x-12 gap-y-8">
                  {blackboardItems.map((item, i) => (
                    <motion.span 
                      key={i}
                      initial={{ opacity: 0, rotate: -5 }}
                      animate={{ opacity: 1 }}
                      className="text-4xl font-black italic whitespace-nowrap"
                    >
                      {item}
                    </motion.span>
                  ))}
               </div>
            </div>

            <div className="absolute top-6 left-6 flex items-center gap-4">
               <div className="px-4 py-2 bg-black/60 backdrop-blur-xl rounded-xl border border-white/5 flex items-center gap-3 shadow-2xl">
                  <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-[var(--color-accent)] animate-ping' : 'bg-white/10'}`} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Professor Status: {isSpeaking ? 'Emanating' : 'Listening'}</span>
               </div>
               <button 
                onClick={() => setAudioEnabled(!audioEnabled)}
                className={`p-2.5 rounded-xl transition-all shadow-xl ${audioEnabled ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent)]' : 'bg-white/5 text-white/20'}`}
              >
                {audioEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>
            </div>

            <AnimatePresence mode="wait">
              {isLectureActive ? (
                <motion.div 
                  key={currentSlide}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  className="z-10 text-center space-y-10"
                >
                  <div className="flex items-center justify-center gap-4 text-[var(--color-accent)]">
                     <Waves size={24} className={isSpeaking ? 'animate-pulse' : ''} />
                     <span className="text-[11px] font-black uppercase tracking-[0.5em]">{slides[currentSlide].title}</span>
                  </div>
                  <h3 className="text-6xl font-black tracking-tighter text-white max-w-2xl leading-[0.9] drop-shadow-2xl">
                    {slides[currentSlide].content}
                  </h3>
                  
                  {/* Neural Orb visualizer */}
                  <div className="flex items-center justify-center pt-8">
                    <div className="relative w-32 h-32">
                       <motion.div 
                          animate={isSpeaking ? { scale: [1, 1.15, 1], rotate: [0, 90, 180, 270, 360] } : {}}
                          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-0 rounded-full border-2 border-dashed border-white/10"
                       />
                       <motion.div 
                          animate={isSpeaking ? { scale: [1, 1.25, 1] } : { scale: 0.9 }}
                          className={`absolute inset-4 rounded-full blur-2xl opacity-40`}
                          style={{ backgroundColor: personality.color }}
                       />
                       <div className="absolute inset-0 flex items-center justify-center bg-white/5 rounded-full backdrop-blur-3xl border border-white/5 shadow-2xl">
                          <Brain size={48} className={isSpeaking ? 'text-white' : 'text-white/20'} />
                       </div>
                    </div>
                  </div>

                  {/* Frequency Visualizer */}
                  {isSpeaking && (
                    <div className="flex items-end justify-center gap-1 h-8">
                      {[1, 2, 3, 4, 5, 2, 1, 4, 3].map((h, i) => (
                        <motion.div
                          key={i}
                          animate={{ height: ['20%', '100%', '20%'] }}
                          transition={{ duration: 0.3, repeat: Infinity, delay: i * 0.05 }}
                          className="w-1 bg-[var(--color-accent)] rounded-full opacity-60"
                        />
                      ))}
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="text-center space-y-10 max-w-sm z-10">
                   <div className="relative group">
                      <div className="absolute inset-0 bg-[var(--color-accent)]/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] border border-white/10 flex items-center justify-center mx-auto shadow-2xl relative z-10 transition-transform group-hover:scale-110">
                        <Presentation size={48} className="text-white/20" />
                      </div>
                   </div>
                   <div className="space-y-4">
                      <h3 className="text-3xl font-black tracking-tighter text-white">Neural Chamber Idle</h3>
                      <p className="text-[11px] text-white/30 leading-relaxed font-bold uppercase tracking-[0.2em]">
                        Configure personality architecture and initialize domain manifestations.
                      </p>
                   </div>
                   <div className="flex flex-col gap-3 pt-6">
                      <div className="flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/20">
                         <Layers size={14} />
                         Deep-Link Layer 0-4 Active
                      </div>
                   </div>
                </div>
              )}
            </AnimatePresence>
            
            <AnimatePresence>
              {showBreakthrough && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.5, y: 50 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 1.2, y: -50 }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
                >
                  <div className="px-8 py-4 bg-[var(--color-accent)] text-white rounded-3xl shadow-[0_0_50px_rgba(var(--color-accent-rgb),0.5)] border border-white/20 flex items-center gap-4">
                    <Sparkles size={32} className="animate-spin-slow" />
                    <div className="flex flex-col">
                      <span className="text-sm font-black uppercase tracking-widest">Cognitive Breakthrough</span>
                      <span className="text-xs font-bold opacity-80">Mastery incremented to {mastery}%</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {oracleInsight && (
                <motion.div 
                  initial={{ opacity: 0, x: 200 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 200 }}
                  className="absolute bottom-8 right-8 z-50 max-w-sm"
                >
                  <div className="p-6 bg-black/80 backdrop-blur-2xl rounded-3xl border border-[var(--color-accent)]/30 shadow-2xl space-y-3">
                    <div className="flex items-center gap-2 text-[var(--color-accent)]">
                      <Zap size={16} fill="currentColor" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Oracle Insight Payload</span>
                    </div>
                    <p className="text-xs text-white/80 leading-relaxed italic font-medium">"{oracleInsight}"</p>
                    <div className="h-1 bg-[var(--color-accent)]/20 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: "100%" }}
                        animate={{ width: 0 }}
                        transition={{ duration: 10, ease: "linear" }}
                        className="h-full bg-[var(--color-accent)]"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="h-72 glass-panel flex flex-col overflow-hidden border-white/10 shadow-2xl">
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/60">
               <div className="flex items-center gap-4">
                 <History size={16} className="text-white/20" />
                 <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white/30">Mind-Link Trace</span>
               </div>
               <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                     <div className={`w-2 h-2 rounded-full ${isTyping ? 'bg-[var(--color-accent)] animate-pulse' : 'bg-white/5'}`} />
                     <span className="text-[9px] font-black uppercase text-white/20">Oracle Sync</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-red-500 animate-ping' : 'bg-white/5'}`} />
                     <span className="text-[9px] font-black uppercase text-white/20">Neural Input</span>
                  </div>
               </div>
            </div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar bg-[#0a0a0f]">
               {messages.map(m => (
                 <motion.div 
                   initial={{ opacity: 0, x: m.role === 'student' ? 20 : -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   key={m.id} 
                   className={`flex gap-6 ${m.role === 'student' ? 'flex-row-reverse' : ''}`}
                 >
                   <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center border shadow-2xl transition-all ${
                     m.role === 'professor' 
                      ? 'bg-white/5 border-white/10 text-[var(--color-accent)]' 
                      : 'bg-[var(--color-accent)] border-white/20 text-white'
                   }`}>
                      {m.role === 'professor' ? <Brain size={24} /> : <User size={24} />}
                   </div>
                   <div className={`flex flex-col max-w-[80%] ${m.role === 'student' ? 'items-end' : ''}`}>
                      <div className={`p-5 rounded-[2rem] text-sm leading-relaxed shadow-inner border transition-all ${
                        m.role === 'professor' ? 'bg-white/[0.03] text-white/90 border-white/5' : 'bg-[#151520] text-white border-white/10'
                      }`}>
                        {m.text}
                      </div>
                      <span className="text-[9px] font-black uppercase text-white/20 mt-3 tracking-widest">{m.timestamp}</span>
                   </div>
                 </motion.div>
               ))}
               {isTyping && (
                 <div className="flex gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[var(--color-accent)] shadow-2xl">
                      <Brain size={24} />
                    </div>
                    <div className="bg-white/5 px-6 py-4 rounded-[2rem] flex gap-2 items-center border border-white/5">
                       <span className="w-2 h-2 bg-[var(--color-accent)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                       <span className="w-2 h-2 bg-[var(--color-accent)] rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                       <span className="w-2 h-2 bg-[var(--color-accent)] rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
                    </div>
                 </div>
               )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-8 min-h-0 overflow-y-auto custom-scrollbar">
          <div className="glass-panel p-8 space-y-8 border-white/10 shadow-2xl">
             <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-widest text-white/30">Cognitive Metrics</h3>
                <Settings2 size={16} className="text-white/20" />
             </div>
             
             <div className="space-y-8">
                <div className="p-6 bg-white/5 rounded-[2rem] border border-white/5 space-y-4 shadow-xl">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-[var(--color-accent)]">
                         <Trophy size={20} />
                         <span className="text-[11px] font-black uppercase tracking-widest">Mastery Level</span>
                      </div>
                      <span className="text-[11px] font-mono text-[var(--color-accent)]">{mastery}%</span>
                   </div>
                   <div className="h-3 bg-black/60 rounded-full overflow-hidden p-1">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${mastery}%` }}
                        className="h-full bg-gradient-to-r from-[var(--color-accent)] via-white to-[var(--color-accent)] rounded-full shadow-[0_0_15px_rgba(var(--color-accent-rgb),0.5)]"
                      />
                   </div>
                   <p className="text-[10px] text-white/20 italic font-medium">
                      {mastery < 30 ? "Initializing axioms..." : mastery < 70 ? "Synthesizing complex relations..." : "Full convergence achieved."}
                   </p>
                </div>

                <div className="space-y-4">
                   <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-3">
                      <Binary size={16} /> Blackboard Schema
                   </h4>
                   <div className="flex flex-wrap gap-2.5">
                      {blackboardItems.map((item, i) => (
                        <motion.span 
                          key={i} 
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="px-3 py-1.5 bg-white/5 rounded-lg border border-white/10 flex items-center gap-2 group hover:bg-white/10 transition-colors"
                        >
                           <Zap size={10} className="text-[var(--color-accent)]" />
                           <span className="text-[10px] font-bold text-white/60 uppercase">{item}</span>
                        </motion.span>
                      ))}
                      {blackboardItems.length === 0 && <span className="text-[10px] italic text-white/10">No concepts manifested...</span>}
                   </div>
                </div>
             </div>
          </div>

          <div className="glass-panel p-8 flex-1 flex flex-col gap-8 border-white/10 shadow-2xl">
             <h3 className="text-xs font-black uppercase tracking-widest text-white/30">Manual Injections</h3>
             <div className="flex-1 flex flex-col justify-center gap-4">
                <motion.button 
                  whileHover={{ x: 5, backgroundColor: 'rgba(255,255,255,0.08)' }}
                  onClick={() => handleStudentResponse("Provide a technical derivation of this concept.")}
                  disabled={!isLectureActive || isTyping}
                  className="w-full p-5 rounded-[1.5rem] bg-white/5 border border-white/5 text-[12px] font-bold text-white/80 text-left flex items-center justify-between transition-all group disabled:opacity-20"
                >
                  <div className="flex items-center gap-3">
                     <Brain size={16} className="text-white/20" />
                     Extreme Technical Dive
                  </div>
                  <ArrowRight size={16} className="text-[var(--color-accent)] opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.button>
                <motion.button 
                  whileHover={{ x: 5, backgroundColor: 'rgba(255,255,255,0.08)' }}
                  onClick={handleDeepResearch}
                  disabled={!isLectureActive || isTyping}
                  className="w-full p-5 rounded-[1.5rem] bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 text-[12px] font-black text-[var(--color-accent)] text-left flex items-center justify-between group disabled:opacity-20 shadow-[0_0_20px_rgba(var(--color-accent-rgb),0.1)]"
                >
                  <div className="flex items-center gap-3">
                     <Zap size={16} className="text-[var(--color-accent)] animate-pulse" />
                     Consult Demon Oracle
                  </div>
                  <ArrowRight size={16} className="text-[var(--color-accent)] opacity-100" />
                </motion.button>
                <motion.button 
                  whileHover={{ x: 5, backgroundColor: 'rgba(255,255,255,0.08)' }}
                  onClick={() => handleStudentResponse("How does this link to previous first principles?")}
                  disabled={!isLectureActive || isTyping}
                  className="w-full p-5 rounded-[1.5rem] bg-white/5 border border-white/5 text-[12px] font-bold text-white/80 text-left flex items-center justify-between transition-all group disabled:opacity-20"
                >
                  <div className="flex items-center gap-3">
                     <FastForward size={16} className="text-white/20" />
                     Recursive Axiom Check
                  </div>
                  <ArrowRight size={16} className="text-[var(--color-accent)] opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.button>

                <div className="pt-8 mt-4 border-t border-white/5">
                  <motion.button 
                    animate={isListening ? { scale: [1, 1.02, 1] } : {}}
                    transition={isListening ? { duration: 1, repeat: Infinity } : {}}
                    onClick={toggleListening}
                    disabled={!isLectureActive || isTyping}
                    className={`w-full p-8 rounded-[3rem] border-2 border-dashed shadow-2xl transition-all relative overflow-hidden group ${
                      isListening 
                        ? 'border-red-500/50 bg-red-500/10 text-red-500' 
                        : 'border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 text-[var(--color-accent)]'
                    } disabled:opacity-20`}
                  >
                     <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                     <div className={`p-5 rounded-full bg-[var(--color-accent)] text-white mx-auto mb-5 transition-transform group-hover:scale-110 shadow-2xl ${isListening ? 'bg-red-500 animate-pulse' : ''}`}>
                        {isListening ? <MicOff size={32} /> : <Mic size={32} />}
                     </div>
                     <h4 className="text-[11px] font-black uppercase tracking-[0.5em] mb-2">{isListening ? 'Broadcasting...' : 'Neural Input'}</h4>
                     <p className="text-[10px] font-bold opacity-30 italic">{isListening ? 'Oscillating thought stream...' : 'Inject vocal command'}</p>
                     
                     {isListening && (
                       <div className="mt-6 flex justify-center gap-1.5">
                          {[1,2,3,4,5,6].map(i => (
                            <motion.div 
                              key={i}
                              animate={{ height: [4, 20, 4] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                              className="w-1 bg-red-500 rounded-full"
                            />
                          ))}
                       </div>
                     )}
                  </motion.button>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

