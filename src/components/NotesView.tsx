import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  FileText, 
  FilePlus, 
  Timer, 
  Shuffle, 
  Type, 
  Image as ImageIcon, 
  Layout, 
  Brain, 
  Zap, 
  MessageSquare, 
  HelpCircle,
  Play,
  Pause,
  RotateCcw,
  BookOpen,
  ChevronRight,
  Sparkles,
  GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  generateCreatorTemplate, 
  gradeFeynmanExplanation, 
  generateElaborativeQuestions 
} from '../lib/gemini';

type EditorMode = 'text' | 'dual';
type ToolTab = 'recall' | 'feynman' | 'deepdive' | 'chat';

export default function NotesView() {
  const [notes, setNotes] = useState([
    { id: '1', title: 'Biology: Cell Structure', date: '2h ago', content: 'The cell is the basic structural, functional, and biological unit of all known organisms. Cells are the smallest units of life, and hence are often referred to as the "building blocks of life".' },
    { id: '2', title: 'History: WWII Origins', date: 'Yesterday', content: 'World War II was the deadliest conflict in human history, involving the vast majority of the worlds countries and every inhabited continent.' },
    { id: '3', title: 'Math: Calculus Derivatives', date: 'Apr 15', content: 'In calculus, the derivative of a function of a real variable measures the sensitivity to change of the function value with respect to a change in its argument.' },
  ]);

  const [activeNoteId, setActiveNoteId] = useState<string>('1');
  const [editorMode, setEditorMode] = useState<EditorMode>('text');
  const [activeTool, setActiveTool] = useState<ToolTab>('recall');
  
  // Method 1: Pomodoro State
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(25 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const activeNote = notes.find(n => n.id === activeNoteId) || notes[0];

  // Cognitive Tool Logic (Methods 6 & 7)
  const [feynmanInput, setFeynmanInput] = useState('');
  const [feynmanAnalysis, setFeynmanAnalysis] = useState('');
  const [isFeynmanLoading, setIsFeynmanLoading] = useState(false);
  const [elaborativeQuestions, setElaborativeQuestions] = useState<string[]>([]);
  const [isElaborateLoading, setIsElaborateLoading] = useState(false);

  const handleFeynmanCheck = async () => {
    if (!feynmanInput.trim()) return;
    setIsFeynmanLoading(true);
    const result = await gradeFeynmanExplanation(feynmanInput);
    setFeynmanAnalysis(result || "Evaluation failed.");
    setIsFeynmanLoading(false);
  };

  const handleDeepDive = async () => {
    setIsElaborateLoading(true);
    const questions = await generateElaborativeQuestions(activeNote.content);
    setElaborativeQuestions(questions || []);
    setIsElaborateLoading(false);
  };

  // AI Tutor Chat Integration
  const [chatMessages, setChatMessages] = useState<{sender: 'Me' | 'AI', text: string}[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  const handleSendMessage = async (text?: string) => {
    const msg = text || userInput;
    if (!msg.trim()) return;
    
    setChatMessages(prev => [...prev, { sender: 'Me', text: msg }]);
    if (!text) setUserInput('');
    setIsChatLoading(true);

    const prompt = `You are an expert, encouraging Socratic tutor. Here are the student's current notes: ${activeNote.content}. The student says: ${msg}. If they ask for an explanation, use analogies. DO NOT just give them the answers; ask guiding questions to test their understanding.`;
    
    try {
      const response = await gradeFeynmanExplanation(prompt); 
      setChatMessages(prev => [...prev, { sender: 'AI', text: response || "I'm having trouble connecting right now." }]);
    } catch (err) {
      console.error("Chat Error:", err);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] gap-6">
      {/* Top Bar: Pomodoro & Global Actions */}
      <div className="flex items-center justify-between glass-card p-4 border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-[6px] bg-[#9d81ff]/10 flex items-center justify-center text-[#9d81ff]">
            <BookOpen size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Active Knowledge Base</h2>
            <p className="text-[10px] font-black uppercase text-white/30 tracking-widest">Cognitive Notebook Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 px-4 py-2 bg-black/20 rounded-[6px] border border-white/5">
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">🍅 Pomodoro Focus</span>
              <span className="text-xl font-mono font-bold text-white leading-none">{formatTime(timeLeft)}</span>
            </div>
            <div className="flex gap-1">
              <button 
                onClick={toggleTimer}
                className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/60 hover:text-white"
              >
                {isActive ? <Pause size={16} /> : <Play size={16} />}
              </button>
              <button 
                onClick={resetTimer}
                className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/60 hover:text-white"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-[#9d81ff] text-white rounded-[6px] font-bold text-xs uppercase tracking-widest hover:shadow-xl hover:shadow-[#9d81ff]/20 transition-all shadow-lg">
            <Plus size={16} /> Create New Capsule
          </button>
        </div>
      </div>

      {/* Main Layout Splitter */}
      <div className="flex-1 flex gap-6 overflow-hidden">
        
        {/* Left Pane: Notebook List (Interleaving) */}
        <aside className="w-64 flex flex-col gap-4 overflow-hidden">
          <div className="flex-1 glass-card p-6 border-white/5 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black text-white/30 uppercase tracking-widest">Your Notebooks</h3>
              <Search size={14} className="text-white/20" />
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-2">
              {notes.map(note => (
                <button
                  key={note.id}
                  onClick={() => setActiveNoteId(note.id)}
                  className={`w-full text-left p-3 rounded-[6px] transition-all group ${
                    activeNoteId === note.id 
                      ? 'bg-[#9d81ff] text-white shadow-lg' 
                      : 'bg-white/5 text-white/40 hover:bg-white/10'
                  }`}
                >
                  <div className="text-xs font-bold truncate">{note.title}</div>
                  <div className={`text-[9px] mt-1 ${activeNoteId === note.id ? 'text-white/60' : 'text-white/20'}`}>{note.date}</div>
                </button>
              ))}
            </div>
            <button className="w-full py-3 bg-white/5 border border-white/10 rounded-[6px] text-white/40 flex items-center justify-center gap-2 hover:bg-white/10 transition-all group">
              <Shuffle size={14} className="group-hover:rotate-180 transition-transform duration-500" />
              <span className="text-[10px] font-black uppercase tracking-widest">Interleave Subjects</span>
            </button>
          </div>
        </aside>

        {/* Middle Pane: Editor (Dual Coding) */}
        <main className="flex-1 flex flex-col gap-4 overflow-hidden">
          <div className="flex-1 glass-card p-0 border-white/5 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
              <div className="flex items-center gap-3">
                <FileText size={16} className="text-[#9d81ff]" />
                <input 
                  type="text" 
                  value={activeNote.title}
                  readOnly
                  className="bg-transparent border-none outline-none text-sm font-bold text-white w-64"
                />
              </div>
              <div className="flex bg-black/20 p-1 rounded-[6px] border border-white/5">
                <button 
                  onClick={() => setEditorMode('text')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-[4px] text-[9px] font-black uppercase tracking-widest transition-all ${
                    editorMode === 'text' ? 'bg-white/10 text-white' : 'text-white/20 hover:text-white'
                  }`}
                >
                  <Type size={12} /> View Text
                </button>
                <button 
                  onClick={() => setEditorMode('dual')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-[4px] text-[9px] font-black uppercase tracking-widest transition-all ${
                    editorMode === 'dual' ? 'bg-white/10 text-white' : 'text-white/20 hover:text-white'
                  }`}
                >
                  <Layout size={12} /> Dual Coding
                </button>
              </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
              <div className={`p-8 custom-scrollbar overflow-y-auto ${editorMode === 'dual' ? 'w-1/2 border-r border-white/5' : 'w-full'}`}>
                <textarea 
                  className="w-full h-full bg-transparent border-none outline-none resize-none text-base leading-relaxed text-white/70 font-medium placeholder:text-white/10"
                  defaultValue={activeNote.content}
                  placeholder="Initiating cognitive capture... Use #tags to map intelligence nodes."
                />
              </div>
              {editorMode === 'dual' && (
                <div className="w-1/2 bg-black/40 flex flex-col items-center justify-center gap-4 group cursor-pointer">
                  <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/20 group-hover:bg-[#9d81ff]/20 group-hover:text-[#9d81ff] group-hover:scale-110 transition-all">
                    <ImageIcon size={32} />
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Drop Visual Context</span>
                    <p className="text-[9px] text-white/10 mt-1 uppercase font-bold tracking-widest">Diagrams / Charts / Mindmaps</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Right Pane: Cognitive Study Tools (Active Recall, Feynman, Retrieval) */}
        <aside className="w-80 flex flex-col gap-4 overflow-hidden">
          <div className="flex-1 glass-card p-6 border-white/5 flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <Brain size={18} className="text-[#9d81ff]" />
              <h3 className="text-[11px] font-black text-white uppercase tracking-[0.15em]">Cognitive Tools</h3>
            </div>

            <div className="flex border-b border-white/5">
              {[
                { id: 'recall', icon: Zap },
                { id: 'feynman', icon: GraduationCap },
                { id: 'deepdive', icon: MessageSquare },
                { id: 'chat', icon: Sparkles },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTool(tab.id as ToolTab)}
                  className={`flex-1 flex flex-col items-center gap-2 pb-4 transition-all relative ${
                    activeTool === tab.id ? 'text-[#9d81ff]' : 'text-white/20 hover:text-white/40'
                  }`}
                >
                  <tab.icon size={16} />
                  <span className="text-[8px] font-black uppercase tracking-widest">{tab.id}</span>
                  {activeTool === tab.id && (
                    <motion.div layoutId="tool-active" className="absolute bottom-0 left-0 w-full h-[1px] bg-[#9d81ff]" />
                  )}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTool}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  {activeTool === 'recall' && (
                    <div className="space-y-6">
                      <div className="p-4 bg-white/5 rounded-[6px] border border-white/5 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Retrieval Status</span>
                          <span className="text-[9px] font-bold text-[#4ade80]">Due Today</span>
                        </div>
                        <div className="text-2xl font-black text-white">14 <span className="text-[10px] text-white/30 uppercase font-bold tracking-widest">Cards</span></div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full w-[65%] bg-[#4ade80]" />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <button className="w-full py-4 bg-[#9d81ff]/10 border border-[#9d81ff]/20 text-[#9d81ff] rounded-[6px] text-[10px] font-black uppercase tracking-widest hover:bg-[#9d81ff]/20 transition-all flex items-center justify-center gap-2">
                          <Sparkles size={14} /> Auto-Generate Cards
                        </button>
                        <button className="w-full py-4 bg-white text-black rounded-[6px] text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl flex items-center justify-center gap-2">
                          <Play size={14} fill="black" /> Start Spaced Repetition
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTool === 'feynman' && (
                    <div className="flex flex-col h-full gap-4">
                      <p className="text-[10px] text-white/40 font-medium italic">"If you can't explain it simply, you don't understand it well enough."</p>
                      <textarea 
                        className="flex-1 w-full bg-white/5 border border-white/10 rounded-[6px] p-4 text-xs font-medium text-white/70 resize-none outline-none focus:border-[#9d81ff] transition-colors"
                        placeholder="Explain the active note as if to a 5-year-old child..."
                        value={feynmanInput}
                        onChange={(e) => setFeynmanInput(e.target.value)}
                      />
                      {feynmanAnalysis && (
                        <div className="p-3 bg-[#9d81ff]/10 rounded-[6px] border border-[#9d81ff]/20 text-[10px] text-white/70 italic leading-relaxed max-h-32 overflow-y-auto">
                          {feynmanAnalysis}
                        </div>
                      )}
                      <button 
                        onClick={handleFeynmanCheck}
                        disabled={isFeynmanLoading}
                        className="w-full py-4 bg-[#9d81ff] text-white rounded-[6px] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <HelpCircle size={14} /> {isFeynmanLoading ? "Grading..." : "AI Grade Explanation"}
                      </button>
                    </div>
                  )}

                  {activeTool === 'deepdive' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                         <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Interrogation Loop</span>
                         <Plus size={14} className="text-white/20" />
                      </div>
                      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                        {(elaborativeQuestions.length > 0 ? elaborativeQuestions : [
                          "Why does the Mitochondria produce ATP in this specific phase?",
                          "How does this relate to the metabolic goals of the organism?"
                        ]).map((q, i) => (
                           <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-[6px] hover:border-[#9d81ff]/30 cursor-pointer group transition-all">
                              <p className="text-[11px] font-bold text-white/60 group-hover:text-white leading-relaxed">{q}</p>
                              <div className="mt-3 flex justify-end">
                                <ChevronRight size={12} className="text-white/10 group-hover:text-[#9d81ff]" />
                              </div>
                           </div>
                        ))}
                      </div>
                      <button 
                        onClick={handleDeepDive}
                        disabled={isElaborateLoading}
                        className="w-full py-4 bg-white/5 border border-white/10 text-white/40 rounded-[6px] text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all disabled:opacity-50"
                      >
                        {isElaborateLoading ? "Synthesizing..." : "Synthesize New Questions"}
                      </button>
                    </div>
                  )}

                  {activeTool === 'chat' && (
                    <div className="flex flex-col h-full gap-4">
                      <div className="flex-1 bg-black/20 rounded-[6px] border border-white/5 p-4 overflow-y-auto space-y-4 custom-scrollbar">
                        {chatMessages.length === 0 && (
                          <div className="text-center py-10 opacity-20">
                            <MessageSquare className="mx-auto mb-2" size={32} />
                            <p className="text-[10px] font-black uppercase tracking-widest">Tutor Context Ready</p>
                          </div>
                        )}
                        {chatMessages.map((msg, i) => (
                          <div key={i} className={`flex flex-col ${msg.sender === 'Me' ? 'items-end' : 'items-start'}`}>
                            <span className={`text-[8px] font-black uppercase tracking-widest mb-1 ${msg.sender === 'Me' ? 'text-white/30' : 'text-[#9d81ff]'}`}>
                              {msg.sender === 'Me' ? 'Student' : 'AI Tutor'}
                            </span>
                            <div className={`p-3 rounded-[6px] text-xs leading-relaxed ${
                              msg.sender === 'Me' ? 'bg-[#9d81ff]/10 text-white/80 border border-[#9d81ff]/20' : 'bg-white/5 text-white/70 border border-white/10'
                            }`}>
                              {msg.text}
                            </div>
                          </div>
                        ))}
                        {isChatLoading && (
                          <div className="flex gap-1 items-center px-1">
                            <div className="w-1 h-1 bg-[#9d81ff] rounded-full animate-bounce" />
                            <div className="w-1 h-1 bg-[#9d81ff] rounded-full animate-bounce delay-75" />
                            <div className="w-1 h-1 bg-[#9d81ff] rounded-full animate-bounce delay-150" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <input 
                          type="text"
                          value={userInput}
                          onChange={(e) => setUserInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                          placeholder="Ask your tutor..."
                          className="flex-1 bg-white/5 border border-white/10 rounded-[6px] px-3 py-2 text-xs text-white outline-none focus:border-[#9d81ff] transition-colors"
                        />
                        <button 
                          onClick={() => handleSendMessage()}
                          disabled={isChatLoading}
                          className="px-4 bg-[#9d81ff] text-white rounded-[6px] text-xs font-bold disabled:opacity-50"
                        >
                          Send
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={() => handleSendMessage("Please summarize the core concepts of my current notes and point out anything I seem to be missing.")}
                          className="p-2 bg-white/5 border border-white/10 rounded-[6px] text-[8px] font-black uppercase tracking-widest text-white/40 hover:bg-white/10 transition-all text-left"
                        >
                          🧩 Explain Note
                        </button>
                        <button 
                          onClick={() => handleSendMessage("I am stuck on the last concept I wrote down. Please break it down into smaller pieces.")}
                          className="p-2 bg-white/5 border border-white/10 rounded-[6px] text-[8px] font-black uppercase tracking-widest text-white/40 hover:bg-white/10 transition-all text-left"
                        >
                          🆘 I'm Stuck
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
