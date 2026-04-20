import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BrainCircuit, 
  ChevronRight, 
  ChevronLeft, 
  School, 
  Rocket, 
  Calendar, 
  FileText, 
  Plus,
  Sparkles,
  CheckCircle2,
  Route,
  Layers
} from 'lucide-react';

interface OnboardingWizardProps {
  onComplete: (data: any) => void;
  onClose: () => void;
}

export default function OnboardingWizard({ onComplete, onClose }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    mode: 'Traditional',
    courseName: '',
    targetDate: '',
    resources: ["Pending: 'Chapter1_Networking.pdf'", "Pending: 'Exam_Objectives.docx'"]
  });

  const nextStep = () => setStep(s => Math.min(s + 1, 4));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleComplete = () => {
    onComplete(formData);
  };

  const steps = [
  { id: 1, title: 'Welcome', icon: BrainCircuit },
  { id: 2, title: 'Architecture', icon: Layers },
  { id: 3, title: 'Details', icon: Calendar },
  { id: 4, title: 'Resources', icon: FileText },
];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-2xl glass-panel shadow-2xl overflow-hidden flex flex-col bg-[var(--color-bg-main)]"
        style={{ height: '500px' }}
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-accent)] flex items-center justify-center shadow-lg shadow-[var(--color-accent)]/20">
              <Sparkles className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-[var(--color-text-primary)]">AI Setup Wizard</h2>
              <p className="text-[10px] uppercase font-bold tracking-widest text-[var(--color-text-secondary)] opacity-50">Intelligence Calibration</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {steps.map((s) => (
              <div 
                key={s.id}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  step >= s.id ? 'bg-[var(--color-accent)] w-8' : 'bg-white/10 w-4'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {step === 1 && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-black tracking-tighter text-[var(--color-text-primary)]">Welcome to your AI Study Hub</h3>
                  <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
                    This wizard will configure your learning environment. The AI Agent will customize your dashboard, merge redundant menus based on your needs, and prepare your database for optimal performance.
                  </p>
                  <div className="p-6 bg-[var(--color-accent)]/5 border border-[var(--color-accent)]/20 rounded-2xl">
                    <p className="text-xs italic text-[var(--color-accent)]">
                      "Let's build a neuro-optimized workspace tailored specifically for your academic goals."
                    </p>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-black tracking-tighter text-[var(--color-text-primary)]">Select Learning Architecture</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {[
                      { id: 'Traditional', label: 'Traditional (Academic)', sub: 'University curriculum, semesters, and course hierarchies.', icon: School },
                      { id: 'Self-Study', label: 'Self-Study (Autodidact)', sub: 'Independent learning paths and mastery modules.', icon: Route },
                      { id: 'Project-Based', label: 'Project-Based (Professional)', sub: 'Workspaces and deliverable-focused sprint delivery.', icon: Layers },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setFormData({ ...formData, mode: item.id })}
                        className={`flex items-start gap-4 p-5 rounded-2xl border-2 text-left transition-all ${
                          formData.mode === item.id 
                            ? 'bg-[var(--color-accent)]/10 border-[var(--color-accent)]' 
                            : 'bg-white/5 border-transparent hover:bg-white/10'
                        }`}
                      >
                        <div className={`p-3 rounded-xl ${formData.mode === item.id ? 'bg-[var(--color-accent)] text-white' : 'bg-white/10 text-[var(--color-text-secondary)]'}`}>
                          <item.icon size={20} />
                        </div>
                        <div>
                          <p className={`text-sm font-bold ${formData.mode === item.id ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'}`}>{item.label}</p>
                          <p className="text-[10px] text-[var(--color-text-secondary)] opacity-60">{item.sub}</p>
                        </div>
                        {formData.mode === item.id && <CheckCircle2 className="ml-auto text-[var(--color-accent)]" size={18} />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-black tracking-tighter text-[var(--color-text-primary)]">Project / Class Details</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)]">Primary Focus / Course Name</label>
                      <input 
                        type="text" 
                        value={formData.courseName}
                        onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                        placeholder="e.g., AWS Solutions Architect or BIO-101"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-accent)] transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)]">Target Completion / Exam Date</label>
                      <input 
                        type="text" 
                        value={formData.targetDate}
                        onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                        placeholder="YYYY-MM-DD"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-accent)] transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-black tracking-tighter text-[var(--color-text-primary)]">Resource Ingestion Queue</h3>
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-accent)]/10 text-[var(--color-accent)] rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-[var(--color-accent)] hover:text-white transition-all">
                      <Plus size={14} /> Add Resource
                    </button>
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)] opacity-60">
                    Drop your syllabi, textbooks, or reference URLs here. The AI will process these in the background for your 'Read It Later' or 'Tutor' modes.
                  </p>
                  <div className="space-y-2">
                    {formData.resources.map((res, i) => (
                      <div key={i} className="flex items-center gap-3 p-4 bg-white/5 border border-white/5 rounded-xl group transition-all hover:bg-white/10">
                        <FileText size={16} className="text-[var(--color-accent)]" />
                        <span className="text-xs font-bold text-[var(--color-text-primary)]">{res}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-white/5 flex items-center justify-between bg-white/[0.01]">
          <button 
            onClick={step === 1 ? onClose : prevStep}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all"
          >
            <ChevronLeft size={16} />
            {step === 1 ? 'Skip Setup' : 'Back'}
          </button>
          
          <button 
            onClick={step === 4 ? handleComplete : nextStep}
            disabled={step === 3 && !formData.courseName}
            className="flex items-center gap-2 px-8 py-2.5 bg-[var(--color-accent)] text-white rounded-xl text-xs font-black uppercase tracking-[0.15em] shadow-lg shadow-[var(--color-accent)]/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all"
          >
            {step === 4 ? 'Initialize OS' : 'Next Step'}
            <ChevronRight size={16} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
