import React, { useState } from 'react';
import { 
  FlaskConical, 
  Share2, 
  Headphones, 
  Video, 
  Settings, 
  Download, 
  FileJson, 
  Layers, 
  Sparkles, 
  Play, 
  Pause,
  ChevronRight,
  Database,
  Cpu,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateCreatorTemplate } from '../lib/gemini';

type LabModule = 'export' | 'audio' | 'templates' | 'llm';

export default function KnowledgeLab() {
  const [activeTab, setActiveTab] = useState<LabModule>('export');

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-[6px] bg-[#9d81ff] flex items-center justify-center shadow-lg shadow-[#9d81ff]/20">
            <FlaskConical className="text-white" size={28} />
          </div>
          <div>
            <h2 className="font-bold text-3xl tracking-tighter text-white">AI Knowledge Lab</h2>
            <p className="text-[10px] font-black uppercase text-white/30 tracking-widest">Multi-Engine Synthesis Module</p>
          </div>
        </div>

        <nav className="flex bg-white/5 p-1 rounded-[6px] gap-1 border border-white/5">
          {[
            { id: 'export', label: 'Vault Export', icon: Share2 },
            { id: 'audio', label: 'Audio Podcast', icon: Headphones },
            { id: 'templates', label: 'Creator Styles', icon: Video },
            { id: 'llm', label: 'Model Manager', icon: Settings },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as LabModule)}
              className={`flex items-center gap-2 px-4 py-2 rounded-[6px] text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id 
                  ? 'bg-[#9d81ff] text-white shadow-lg' 
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon size={12} />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
           key={activeTab}
           initial={{ opacity: 0, scale: 0.98 }}
           animate={{ opacity: 1, scale: 1 }}
           exit={{ opacity: 0, scale: 1.02 }}
           transition={{ duration: 0.2 }}
           className="min-h-[500px]"
        >
          {activeTab === 'export' && <ExportModule />}
          {activeTab === 'audio' && <AudioModule />}
          {activeTab === 'templates' && <TemplatesModule />}
          {activeTab === 'llm' && <LLMModule />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function ExportModule() {
  const [isExpert, setIsExpert] = useState(false);
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <section className="p-8 glass-card space-y-6 border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-widest text-[#9d81ff]">Vault Extraction Protocol</h3>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-white/40">Expert Mode</span>
              <button 
                onClick={() => setIsExpert(!isExpert)}
                className={`w-10 h-5 rounded-full relative transition-colors ${isExpert ? 'bg-[#9d81ff]' : 'bg-white/10'}`}
              >
                <motion.div 
                  animate={{ x: isExpert ? 22 : 2 }}
                  className="w-4 h-4 rounded-full bg-white absolute top-0.5"
                />
              </button>
            </div>
          </div>

          <p className="text-sm font-medium text-white/50 leading-relaxed max-w-xl">
            Convert your entire academic second-brain into an Obsidian-compatible Knowledge Graph. Perfect for long-term retention and visual mapping.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 rounded-[6px] border border-white/5 space-y-2">
               <div className="flex items-center gap-2 text-[#9d81ff]">
                  <FileJson size={14} />
                  <span className="text-[10px] font-black uppercase">YAML Headers</span>
               </div>
               <p className="text-[10px] text-white/30">Auto-inject Metadata tags for graph filtering.</p>
            </div>
            <div className="p-4 bg-white/5 rounded-[6px] border border-white/5 space-y-2">
               <div className="flex items-center gap-2 text-[#4ade80]">
                  <Layers size={14} />
                  <span className="text-[10px] font-black uppercase">PARA Method</span>
               </div>
               <p className="text-[10px] text-white/30">Hierarchical structure for folders & vaults.</p>
            </div>
          </div>

          <button className="w-full py-4 bg-[#9d81ff] text-white rounded-[6px] text-xs font-black uppercase tracking-widest shadow-xl shadow-[#9d81ff]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
            <Download size={18} /> Push Vault to Cloud/Local
          </button>
        </section>

        {isExpert && (
           <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="p-6 glass-panel border-[#9d81ff]/20 space-y-4"
           >
              <h4 className="text-[10px] font-black uppercase tracking-widest text-[#9d81ff]">Expert Link Engine</h4>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="text-[9px] font-bold text-white/30 uppercase">Wiki-Link Regex</label>
                   <select className="w-full bg-white/5 border border-white/10 rounded-[6px] p-2 text-xs text-white">
                      <option>Standard: [[Link]]</option>
                      <option>Markdown: [Text](url)</option>
                   </select>
                </div>
                <div className="space-y-2">
                   <label className="text-[9px] font-bold text-white/30 uppercase">Vault Depth</label>
                   <select className="w-full bg-white/5 border border-white/10 rounded-[6px] p-2 text-xs text-white">
                      <option>Flat (NotebookLLM)</option>
                      <option>Project Folders</option>
                   </select>
                </div>
              </div>
           </motion.div>
        )}
      </div>

      <div className="space-y-6">
        <div className="p-6 glass-panel border-[#4ade80]/20 bg-[#4ade80]/5">
           <div className="flex items-center gap-2 text-[#4ade80] mb-4">
              <Sparkles size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Graph Intelligence</span>
           </div>
           <p className="text-xs text-white/60 leading-relaxed font-medium capitalize">
             Exporting with Wikilinks enabled will automatically connect your Biology labs to your Chemistry lectures if the AI detects overlapping concepts.
           </p>
        </div>
      </div>
    </div>
  );
}

function AudioModule() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleSimulate = () => {
    setIsGenerating(true);
    let p = 0;
    const interval = setInterval(() => {
      p += 5;
      setProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setIsGenerating(false);
      }
    }, 150);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="lg:col-span-1 space-y-4">
        <div className="p-6 glass-card border-white/5 space-y-4">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-white/30">1. Select Sources</h4>
          <div className="space-y-2">
             {["Biology Notes", "History Essay", "Kanban Dump"].map((s, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-[6px] border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                   <span className="text-xs font-bold text-white/60 group-hover:text-white">{s}</span>
                   <div className="w-4 h-4 rounded-[4px] border border-white/20 flex items-center justify-center">
                     <Plus size={10} className="text-white/20" />
                   </div>
                </div>
             ))}
          </div>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-6">
         <section className="p-8 glass-card border-white/5 relative overflow-hidden h-full flex flex-col justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-[#9d81ff]/10 to-transparent pointer-events-none" />
            <div className="relative z-10 text-center space-y-8">
               <div className="flex justify-center flex-wrap gap-4">
                  <div className="p-6 bg-white/5 rounded-full border border-white/10 flex flex-col items-center gap-2">
                     <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                        <Cpu size={24} />
                     </div>
                     <span className="text-[10px] font-black uppercase text-white/30">Host 1 (Alex)</span>
                  </div>
                  <div className="flex items-center">
                     <span className="text-xs font-black text-white/10 px-4">VS</span>
                  </div>
                  <div className="p-6 bg-white/5 rounded-full border border-white/10 flex flex-col items-center gap-2">
                     <div className="w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400">
                        <Sparkles size={24} />
                     </div>
                     <span className="text-[10px] font-black uppercase text-white/30">Host 2 (Sarah)</span>
                  </div>
               </div>

               <div className="space-y-4">
                  <h3 className="text-2xl font-black text-white leading-tight">Multi-Speaker Study Podcast</h3>
                  <p className="text-sm text-white/40 max-w-sm mx-auto font-medium">
                    The AI Scriptwriter will synthesize your notes into an engaging dialogue between two intelligence personas.
                  </p>
               </div>

               {isGenerating ? (
                 <div className="space-y-4 max-w-xs mx-auto">
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                       <motion.div animate={{ width: `${progress}%` }} className="h-full bg-[#9d81ff]" />
                    </div>
                    <p className="text-[10px] font-black text-[#9d81ff] uppercase tracking-widest animate-pulse">Synthesizing Script & TTS Wings...</p>
                 </div>
               ) : (
                 <button 
                  onClick={handleSimulate}
                  className="px-10 py-5 bg-white text-black rounded-[6px] font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl flex items-center gap-3 mx-auto"
                 >
                   <Play size={18} fill="black" /> Initialize Podcast Gen
                 </button>
               )}
            </div>
         </section>
      </div>

      <div className="lg:col-span-1 space-y-6">
         <div className="p-6 glass-panel border-[#9d81ff]/20 space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-[#9d81ff]">Vibe Matrix</h4>
            <div className="space-y-3">
               {["Deep Dive (Detailed)", "Quick Brief (Speed)", "Debate (Critical)"].map((v, i) => (
                  <button key={i} className="w-full p-3 bg-white/5 border border-white/5 rounded-[6px] text-left hover:border-[#9d81ff]/50 transition-all flex items-center justify-between group">
                     <span className="text-[10px] font-bold text-white/50 group-hover:text-white transition-colors">{v}</span>
                     <ChevronRight size={14} className="text-white/10 group-hover:text-[#9d81ff]" />
                  </button>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}

function TemplatesModule() {
  const [selectedStyle, setSelectedStyle] = useState('Minimalist Productivity');
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    const mockNotes = "Studying Biology involves active recall and spaced repetition. We focus on the Krebs cycle and mitochondrial transport.";
    const text = await generateCreatorTemplate(mockNotes, selectedStyle);
    setResult(text || "No response received.");
    setIsLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="lg:col-span-1 space-y-6">
        <div className="p-6 glass-card border-white/5 space-y-4">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-white/30">Creator Persona</h4>
          <div className="space-y-2">
            {[
              "Minimalist Productivity",
              "High-Energy Tech Review",
              "Lore Video Essayist",
              "Socratic Educator"
            ].map(s => (
              <button
                key={s}
                onClick={() => setSelectedStyle(s)}
                className={`w-full p-4 text-left rounded-[6px] text-xs font-bold transition-all ${
                  selectedStyle === s 
                    ? 'bg-[#9d81ff] text-white shadow-lg' 
                    : 'bg-white/5 text-white/40 hover:bg-white/10'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:col-span-3 space-y-6">
        <section className="p-8 glass-card border-white/5 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-widest text-white/30">Persona Output: {selectedStyle}</h3>
            <button 
              onClick={handleGenerate}
              disabled={isLoading}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-[6px] text-[10px] font-black uppercase tracking-widest text-[var(--color-accent)] border border-[var(--color-accent)]/20 transition-all disabled:opacity-50"
            >
              {isLoading ? "Synthesizing..." : "Generate Template"}
            </button>
          </div>

          <div className="min-h-[300px] p-8 bg-black/40 rounded-[6px] border border-white/5 font-medium leading-relaxed text-white/70 whitespace-pre-wrap italic">
            {result || "Cortex awaiting input. Select a persona and click generate to test the System Override engine."}
          </div>
        </section>
      </div>
    </div>
  );
}

function LLMModule() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <section className="p-8 glass-card border-white/5 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-widest text-[#9d81ff]">Ollama Model Orchestration</h3>
            <Database size={20} className="text-[#9d81ff]" />
          </div>

          <div className="space-y-4">
            <div className="p-5 bg-white/5 rounded-[6px] border border-white/5 flex items-center justify-between group hover:border-[#9d81ff]/30 transition-all">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#9d81ff]/10 flex items-center justify-center text-[#9d81ff]">
                    <Cpu size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">llama3:8b</h4>
                    <p className="text-[10px] font-medium text-white/30 uppercase tracking-tighter">Primary Intelligent Core</p>
                  </div>
               </div>
               <span className="text-[10px] font-black text-[#4ade80] px-3 py-1 bg-[#4ade80]/10 rounded-full">ACTIVE</span>
            </div>
            
            <div className="p-5 bg-white/5 rounded-[6px] border border-white/5 flex items-center justify-between group hover:border-[#9d81ff]/30 transition-all">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/20">
                    <Database size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white/60">phi3:mini</h4>
                    <p className="text-[10px] font-medium text-white/30 uppercase tracking-tighter">Edge Computation Engine</p>
                  </div>
               </div>
               <button className="text-[10px] font-black text-white/20 px-4 py-2 bg-white/5 rounded-[6px] hover:bg-[#9d81ff] hover:text-white transition-all">PULL WEIGHTS</button>
            </div>
          </div>

          <div className="p-4 bg-[var(--color-accent)]/10 rounded-[6px] border border-[var(--color-accent)]/20 flex gap-4">
             <div className="w-1 h-auto bg-[var(--color-accent)] rounded-full" />
             <p className="text-[10px] text-white/60 font-medium italic">
               "Note from Architect: Local models offer 100% data privacy. Your notes never leave this laboratory during synthesis."
             </p>
          </div>
        </section>
      </div>

      <div className="space-y-6">
        <div className="p-8 glass-panel border-[#9d81ff]/20 space-y-6">
           <h4 className="text-xs font-black uppercase text-white/30 tracking-widest">Hardware Metrics</h4>
           <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold text-white/40 uppercase">
                  <span>VRAM Utilization</span>
                  <span>4.2 / 8.0 GB</span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                   <div className="h-full w-[52%] bg-[#9d81ff]" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold text-white/40 uppercase">
                  <span>Inference Delay</span>
                  <span>24ms</span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                   <div className="h-full w-[12%] bg-[#4ade80]" />
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
