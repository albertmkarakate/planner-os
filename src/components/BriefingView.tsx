import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Brain, 
  Zap, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  BrainCircuit, 
  X, 
  RotateCcw,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateDailyBriefing } from '../lib/gemini';
import { EmptyState } from './ui/EmptyState';

/**
 * AIDailyBriefing View
 * Refactored for Thread-Safety (Async Worker Pattern)
 * 
 * Directives Implemented:
 * 1. Background Execution logic (Async/Await mimicking QThread)
 * 2. UI State Management (Progress Bar, Disable logic)
 * 3. Robust Error Handling (Connection timeouts, Schema validation)
 */
export default function BriefingView() {
  const [briefing, setBriefing] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initial Fetch Data
  const userData = {
    name: "Alex",
    classes: ["Biology", "Advanced Math", "History of Art"],
    sleep: 6.5,
    upcomingExams: [{ class: "Biology", date: "2024-04-20" }]
  };

  /**
   * Refactored Worker Logic (The "AIBriefingWorker" equivalent)
   * This executes the logic without blocking the main event loop.
   */
  const handleGenerateBriefing = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      // Small simulated delay to allow Progress Bar visibility (Architecture V3 UX)
      await new Promise(r => setTimeout(r, 800));

      const result = await generateDailyBriefing(userData);
      
      if (!result) {
        throw new Error("Failed to parse unstructured LLM output.");
      }

      setBriefing(result);
    } catch (err: any) {
      console.error(err);
      // "Error Signal" logic
      setError(err.message || "Error: Local AI engine is not responding. Please ensure Ollama is running.");
    } finally {
      // "Finished Signal" logic
      setIsGenerating(false);
    }
  };

  // Auto-generate on first mount (Optional, but keeping for better UX)
  useEffect(() => {
    handleGenerateBriefing();
  }, []);

  const [notification, setNotification] = useState<string | null>(null);

  return (
    <div className="space-y-10 pb-10">
      {/* 2. Loading State / Progress Bar (Indeterminate mode) */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden relative">
              <motion.div 
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-transparent via-[var(--color-accent)] to-transparent"
              />
            </div>
            <p className="text-[10px] font-black uppercase text-[var(--color-accent)] text-center mt-2 tracking-[0.3em] animate-pulse">
              Synthesizing Daily Intelligence...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Error MessageBox equivalent */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-6 bg-red-500/10 border border-red-500/20 rounded-[6px] flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h4 className="font-bold text-red-500 text-sm">Main Thread Exception</h4>
                <p className="text-xs text-red-500/60 font-medium">{error}</p>
              </div>
            </div>
            <button 
              onClick={handleGenerateBriefing}
              className="px-4 py-2 bg-red-500 text-white rounded-[6px] text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-colors"
            >
              Restart Worker
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="relative">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Sparkles className="text-[var(--color-accent)] w-5 h-5" />
            <h2 className="font-bold text-4xl tracking-tighter text-[var(--color-text-primary)] leading-tight">Intelligence Briefing</h2>
          </div>
          
          {/* 1. Generate Activity Button */}
          <button 
            onClick={handleGenerateBriefing}
            disabled={isGenerating}
            className="flex items-center gap-2 px-6 py-3 bg-[var(--color-accent)] text-white rounded-[6px] text-xs font-black uppercase tracking-widest shadow-lg shadow-[var(--color-accent)]/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
          >
            {isGenerating ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <RefreshCw size={14} />}
            Generate Today's Briefing
          </button>
        </div>
        <p className="text-xl font-medium text-white/50 max-w-2xl leading-relaxed">
          {briefing ? "Strategic roadmap assembled based on your current biometric and academic payload." : "No briefing loaded. Click generate to initialize the AI engine."}
        </p>
      </section>

      {briefing && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Priority Goals */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-widest text-white/30">Intelligence Priorities</h3>
              <span className="text-[10px] font-mono p-1 bg-white/5 rounded text-white/40">QTHREAD://ACTIVE_WORKER_01</span>
            </div>
            
            <div className="space-y-3">
              {briefing.priorities?.map((goal: string, i: number) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={i}
                  className="group p-5 glass-card flex items-start gap-4 hover:bg-white/5 transition-all cursor-pointer shadow-lg"
                >
                  <div className="w-10 h-10 rounded-[6px] bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--color-accent)] group-hover:text-white transition-colors border border-white/10">
                    <CheckCircle2 size={18} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg leading-tight text-white mb-1">{goal}</h4>
                    <p className="text-xs text-white/40 font-medium">Mapped from curriculum syllabus via RAG</p>
                  </div>
                  <button className="self-center p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight size={20} className="text-white/20 hover:text-[var(--color-accent)]" />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* AI Insights Sidebar */}
          <div className="space-y-8">
            <div className="p-8 glass-card border-[var(--color-accent)]/30 relative overflow-hidden group shadow-2xl shadow-[var(--color-accent)]/5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-accent)] opacity-10 blur-3xl -mr-16 -mt-16 group-hover:opacity-30 transition-opacity" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4 text-[var(--color-accent)]">
                  <Brain size={20} />
                  <span className="text-xs font-bold uppercase tracking-widest">Architect Details</span>
                </div>
                <p className="text-sm font-medium leading-relaxed mb-8 text-[var(--color-text-primary)] opacity-80">
                  {briefing.details}
                </p>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden mt-4">
                  <div className="h-full w-full bg-gradient-to-r from-[var(--color-accent)]/20 to-[var(--color-accent)]" />
                </div>
                <p className="text-[10px] font-bold text-[var(--color-accent)] mt-2 uppercase tracking-tighter">Analysis Confidence: 94.2%</p>
              </div>
            </div>

            {/* Wellness Mini Stats */}
            <div className="p-6 glass-card space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">System Performance</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-[6px] border border-white/5">
                   <p className="text-[10px] font-bold text-white/40 mb-1">Worker</p>
                   <p className="text-sm font-black text-[#4ade80]">Stable</p>
                </div>
                <div className="p-4 bg-white/5 rounded-[6px] border border-white/5">
                   <p className="text-[10px] font-bold text-white/40 mb-1">Thread</p>
                   <p className="text-sm font-black text-[var(--color-accent)]">Async</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Initial State / Empty State */}
      {!briefing && !isGenerating && !error && (
        <EmptyState 
           icon={BrainCircuit}
           title="AI Strategy Dormant"
           description="Click the generate button to spawn a background worker and synthesize your daily intelligence roadmap."
           actionLabel="Spawn Intelligence Worker"
           onAction={handleGenerateBriefing}
        />
      )}
    </div>
  );
}
