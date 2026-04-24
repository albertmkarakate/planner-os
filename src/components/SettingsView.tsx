import React, { useState } from 'react';
import { 
  Bot, 
  Settings, 
  Activity, 
  Brain, 
  Lock, 
  Check, 
  Cpu, 
  Globe, 
  Trash2, 
  Terminal,
  Zap,
  Save,
  Palette,
  Mic,
  MicOff,
  Volume2,
  Ear,
  Plus,
  Route,
  Layers,
  BookOpen,
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Tab = 'ai' | 'tasks' | 'profile' | 'privacy' | 'appearance';

interface SettingsViewProps {
  accentColor: string;
  onAccentColorChange: (color: string) => void;
  theme: 'dark' | 'light';
  onThemeChange: (theme: 'dark' | 'light') => void;
  learningMode: 'Traditional' | 'Self-Study' | 'Project-Based';
  onLearningModeChange: (mode: 'Traditional' | 'Self-Study' | 'Project-Based') => void;
}

export default function SettingsView({ 
  accentColor, 
  onAccentColorChange,
  theme,
  onThemeChange,
  learningMode,
  onLearningModeChange
}: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState<Tab>('ai');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const tabs = [
    { id: 'ai', label: 'AI & Models', icon: Bot },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'tasks', label: 'Active Tasks', icon: Activity },
    { id: 'voice', label: 'Voice & Audio', icon: Mic },
    { id: 'profile', label: 'Learning Profile', icon: Brain },
    { id: 'privacy', label: 'Privacy & Data', icon: Lock }
  ] as const;

  return (
    <div className="space-y-8 pb-10 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-4xl tracking-tight text-[var(--color-text-primary)] flex items-center gap-4">
          <Settings className="text-[var(--color-accent)]" size={36} />
          Planner Configuration
        </h2>
        <button 
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 bg-[var(--color-accent)] text-white rounded-[6px] font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[var(--color-accent)]/20 overflow-hidden relative"
        >
          <AnimatePresence mode="wait">
            {isSaved ? (
              <motion.div key="check" initial={{ y: 20 }} animate={{ y: 0 }} exit={{ y: -20 }} className="flex items-center gap-2">
                <Check size={18} /> Configuration Saved
              </motion.div>
            ) : (
              <motion.div key="save" initial={{ y: 20 }} animate={{ y: 0 }} exit={{ y: -20 }} className="flex items-center gap-2">
                <Save size={18} /> Save & Apply
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="md:col-span-1 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 p-4 rounded-[6px] transition-all border ${
                activeTab === tab.id 
                  ? 'bg-[var(--color-accent)]/10 border-[var(--color-accent)]/30 text-[var(--color-accent)] ring-2 ring-[var(--color-accent)]/5 shadow-lg' 
                  : 'bg-transparent border-transparent hover:bg-white/5 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              <tab.icon size={20} />
              <span className="font-bold text-sm">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="md:col-span-3 min-h-[500px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="glass-card p-8 h-full space-y-8"
            >
              {activeTab === 'ai' && <AIConfigTab />}
              {activeTab === 'voice' && <VoiceTab />}
              {activeTab === 'appearance' && (
                <AppearanceTab 
                  accentColor={accentColor} 
                  onAccentColorChange={onAccentColorChange}
                  theme={theme}
                  onThemeChange={onThemeChange}
                />
              )}
              {activeTab === 'tasks' && <TasksTab />}
              {activeTab === 'profile' && (
                <ProfileTab 
                  learningMode={learningMode} 
                  onLearningModeChange={onLearningModeChange} 
                />
              )}
              {activeTab === 'privacy' && <PrivacyTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function AppearanceTab({ accentColor, onAccentColorChange, theme, onThemeChange }: any) {
  const presets = ['#3498db', '#2ecc71', '#f39c12', '#e74c3c', '#9b59b6']; // Directive V3 Semantic Colors
  
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-text-primary)]/30">
          🎨 App Appearance & Theming
        </h3>
        <div className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-4">
          <label className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-widest">Base Theme</label>
          <div className="flex gap-4">
            {['light', 'dark', 'system'].map((t) => (
              <button
                key={t}
                onClick={() => onThemeChange(t as any)}
                className={`flex-1 py-4 px-6 rounded-[6px] border-2 transition-all font-bold text-sm flex items-center justify-center gap-3 ${
                  theme === t 
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]' 
                    : 'border-white/5 bg-white/5 text-[var(--color-text-secondary)] hover:bg-white/10'
                }`}
              >
                <div className={`w-3 h-3 rounded-full ${
                  t === 'dark' ? 'bg-zinc-800' : 
                  t === 'light' ? 'bg-white border border-black/10' : 
                  'bg-gradient-to-br from-white to-zinc-800 border border-black/10'}`} />
                {t.charAt(0).toUpperCase() + t.slice(1)} {t !== 'system' ? 'Mode' : ''}
              </button>
            ))}
          </div>
        </div>
        
        <div className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-4">
          <label className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-widest">Accent Color (Dynamic Engine)</label>
          <div className="flex flex-wrap gap-3">
             {presets.map((color) => (
               <button
                 key={color}
                 onClick={() => onAccentColorChange(color)}
                 className={`w-12 h-12 rounded-[6px] transition-all relative ${accentColor === color ? 'ring-2 ring-white ring-offset-4 ring-offset-[var(--color-bg-main)] scale-110' : 'hover:scale-105'}`}
                 style={{ backgroundColor: color }}
               >
                 {accentColor === color && <Check className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white" size={16} />}
               </button>
             ))}
             <label className="w-12 h-12 rounded-[6px] bg-white/5 border border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:bg-white/10 transition-all">
                <Plus size={16} className="text-[var(--color-text-secondary)]" />
                <input 
                  type="color" 
                  value={accentColor}
                  onChange={(e) => onAccentColorChange(e.target.value)}
                  className="sr-only"
                />
             </label>
          </div>
          <p className="text-[10px] text-[var(--color-text-secondary)] italic">Select a semantic accent color or provide a custom hex code. Changes propagate globally through the QSS engine.</p>
        </div>
      </div>
    </div>
  );
}

function AIConfigTab() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-text-primary)]/30">
          <Cpu size={14} /> Local AI (Worker Engine)
        </h3>
        <div className="grid gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-[var(--color-text-secondary)] ml-1 uppercase">Ollama Server URL</label>
            <input 
              type="text" 
              defaultValue="http://localhost:11434"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)] transition-all font-mono"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-[var(--color-text-secondary)] ml-1 uppercase">Default Local Model</label>
            <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)] transition-all appearance-none cursor-pointer">
              <option className="bg-[#0d0d12]">Llama 3 (8B)</option>
              <option className="bg-[#0d0d12]">Mistral (7B)</option>
              <option className="bg-[#0d0d12]">Phi-3 (Mini)</option>
            </select>
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-[6px] text-xs font-bold text-[var(--color-text-primary)] hover:bg-white/10 transition-all">
            <Zap size={14} className="text-[var(--color-accent)]" /> Test Connection
          </button>
        </div>
      </div>

      <div className="space-y-4 pt-8 border-t border-white/5 transition-all">
        <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-text-primary)]/30">
          <Globe size={14} /> Online AI (Supervisor Engine)
        </h3>
        <div className="grid gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-[var(--color-text-secondary)] ml-1 uppercase">Primary Cloud Provider</label>
            <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)] transition-all appearance-none cursor-pointer">
              <option className="bg-[#0d0d12]">Google AI (Gemini)</option>
              <option className="bg-[#0d0d12]">OpenAI (ChatGPT)</option>
              <option className="bg-[#0d0d12]">Anthropic (Claude)</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-[var(--color-text-secondary)] ml-1 uppercase">API Key</label>
            <div className="relative group">
              <input 
                type="password" 
                placeholder="••••••••••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)] transition-all font-mono"
              />
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]/20 group-focus-within:text-[var(--color-accent)] transition-all" size={16} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function VoiceTab() {
  const [openMic, setOpenMic] = useState(false);
  const [voiceActivation, setVoiceActivation] = useState(true);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
       <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-text-primary)]/30">
          <Mic size={14} /> Voice Command Configuration
        </h3>
        
        <div className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-bold text-white">Open Mic (Continuous Listening)</p>
              <p className="text-[10px] text-white/30 uppercase tracking-widest font-black">Requires background permission</p>
            </div>
            <button 
              onClick={() => setOpenMic(!openMic)}
              className={`w-14 h-8 rounded-full relative transition-all duration-300 ${openMic ? 'bg-[var(--color-accent)]' : 'bg-white/10'}`}
            >
              <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-xl transition-all duration-300 ${openMic ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <div className="space-y-1">
              <p className="text-sm font-bold text-white">Voice Activation Keyword</p>
              <p className="text-[10px] text-white/30 italic uppercase tracking-wider font-bold">"Hey Demon Lord..."</p>
            </div>
            <button 
              onClick={() => setVoiceActivation(!voiceActivation)}
              className={`w-14 h-8 rounded-full relative transition-all duration-300 ${voiceActivation ? 'bg-[var(--color-accent)]' : 'bg-white/10'}`}
            >
              <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-xl transition-all duration-300 ${voiceActivation ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </div>

        <div className="grid gap-6">
           <div className="space-y-2">
            <label className="text-xs font-bold text-white/30 ml-1 uppercase tracking-widest">Input Sensitivity</label>
            <div className="flex items-center gap-4">
              <Ear size={14} className="text-white/20" />
              <input type="range" className="flex-1 accent-[var(--color-accent)]" />
              <Volume2 size={14} className="text-[var(--color-accent)]" />
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-[var(--color-accent)]/5 border border-[var(--color-accent)]/10 flex gap-4 items-start">
        <ShieldAlert size={18} className="text-[var(--color-accent)] shrink-0" />
        <p className="text-[10px] text-[var(--color-text-secondary)] leading-tight italic">
          Continuous listening (Open Mic) modes may increase battery consumption and data usage if cloud-based STT engines are prioritized. Local processing is recommended for privacy.
        </p>
      </div>
    </div>
  );
}

function TasksTab() {
  const currentTasks = [
    { status: 'idle', label: 'Online AI Supervisor', icon: Globe },
    { status: 'running', label: 'Local AI: Chunking \'Biology_Syllabus.pdf\' (45% complete)', icon: Cpu },
    { status: 'queued', label: 'Local AI: Generating weekly meal plan from budget', icon: Terminal }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-widest text-white/30">Process Monitor</h3>
        <span className="px-2 py-1 bg-[#4ade80]/10 text-[#4ade80] rounded text-[10px] font-bold uppercase tracking-tighter animate-pulse">Live</span>
      </div>
      
      <div className="space-y-3">
        {currentTasks.map((task, i) => (
          <div key={i} className="p-5 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-4 transition-all hover:bg-white/[0.07]">
            <div className={`w-2 h-2 rounded-full ${
              task.status === 'running' ? 'bg-[#9d81ff] shadow-[0_0_10px_#9d81ff]' : 
              task.status === 'queued' ? 'bg-amber-400 shadow-[0_0_10px_#fbbf24]' : 
              'bg-white/20'
            }`} />
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40">
              <task.icon size={18} />
            </div>
            <p className="flex-1 text-sm font-bold text-white/80">{task.label}</p>
          </div>
        ))}
      </div>

      <button className="w-full py-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-[6px] font-bold text-sm hover:bg-red-500 hover:text-white transition-all mt-8">
        Abort All Active Processes
      </button>
    </div>
  );
}

function ProfileTab({ learningMode, onLearningModeChange }: any) {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-text-primary)]/30">
          <Brain size={14} /> Intelligence Orchestration Profile
        </h3>
        
        <div className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-4">
          <label className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-widest">Active Learning Mode</label>
          <div className="grid grid-cols-1 gap-3">
            {[
              { id: 'Traditional', label: 'Traditional (Academic)', desc: 'Optimized for university terms and course hierarchies.', icon: BookOpen },
              { id: 'Self-Study', label: 'Self-Study (Autodidact)', desc: 'Optimized for learning paths and mastery modules.', icon: Route },
              { id: 'Project-Based', label: 'Project-Based (Pro)', desc: 'Optimized for active workspaces and sprint delivery.', icon: Layers }
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => onLearningModeChange(m.id as any)}
                className={`flex items-center gap-4 p-4 rounded-[6px] border transition-all text-left group ${
                  learningMode === m.id 
                    ? 'bg-[var(--color-accent)]/10 border-[var(--color-accent)]/30 ring-1 ring-[var(--color-accent)]/20' 
                    : 'bg-white/5 border-white/5 hover:bg-white/10'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                  learningMode === m.id ? 'bg-[var(--color-accent)] text-white shadow-lg shadow-[var(--color-accent)]/20' : 'bg-white/5 text-white/40'
                }`}>
                  <m.icon size={20} />
                </div>
                <div className="flex-1">
                   <h4 className={`text-sm font-bold ${learningMode === m.id ? 'text-[var(--color-accent)]' : 'text-white'}`}>{m.label}</h4>
                   <p className="text-[10px] text-[var(--color-text-secondary)] opacity-60 leading-tight">{m.desc}</p>
                </div>
                {learningMode === m.id && (
                  <div className="w-5 h-5 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-white">
                    <Check size={12} />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-white/30 ml-1 uppercase tracking-widest">Cognitive Style</label>
          <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#9d81ff] transition-all appearance-none cursor-pointer">
            <option className="bg-[#0d0d12]">Visual (Bullet points, charts)</option>
            <option className="bg-[#0d0d12]">Text-Heavy (Detailed paragraphs)</option>
            <option className="bg-[#0d0d12]">Socratic (Asking clarifying questions)</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-white/30 ml-1 uppercase tracking-widest">Engagement Frequency</label>
          <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#9d81ff] transition-all appearance-none cursor-pointer">
            <option className="bg-[#0d0d12]">Every Morning at 08:30 AM</option>
            <option className="bg-[#0d0d12]">Immediately upon Class/Biometric Change</option>
            <option className="bg-[#0d0d12]">Manual Trigger Only</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-white/30 ml-1 uppercase tracking-widest">AI Coaching Voice</label>
          <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#9d81ff] transition-all appearance-none cursor-pointer">
            <option className="bg-[#0d0d12]">Encouraging & Empathetic</option>
            <option className="bg-[#0d0d12]">Strict & Goal-Oriented</option>
            <option className="bg-[#0d0d12]">Academic & Formal (Research Assistant)</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function PrivacyTab() {
  return (
    <div className="space-y-10">
      <div className="space-y-6">
        <label className="flex items-center gap-4 group cursor-pointer">
          <div className="relative">
            <input type="checkbox" className="sr-only peer" />
            <div className="w-12 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white/40 after:border-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#9d81ff]/50" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Full Privacy Mode</p>
            <p className="text-xs text-white/30">Disable all cloud API calls and force local processing only.</p>
          </div>
        </label>

        <label className="flex items-center gap-4 group cursor-pointer">
          <div className="relative">
            <input type="checkbox" className="sr-only peer" defaultChecked />
            <div className="w-12 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white/40 after:border-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#9d81ff]/50" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Autonomous Ingestion</p>
            <p className="text-xs text-white/30">Automatically ingest new PDFs discovered in tracked folders.</p>
          </div>
        </label>
      </div>

      <div className="pt-8 border-t border-white/5">
        <button className="flex items-center gap-3 text-xs font-bold text-red-400/60 hover:text-red-400 transition-colors uppercase tracking-[0.2em]">
          <Trash2 size={16} /> Purge Local AI Knowledge Base
        </button>
      </div>
    </div>
  );
}
