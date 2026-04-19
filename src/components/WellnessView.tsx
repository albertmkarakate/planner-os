import React, { useState } from 'react';
import { 
  Heart, 
  Activity, 
  Droplets, 
  Moon, 
  Coffee, 
  Smile,
  Zap,
  ShieldAlert,
  Brain,
  Focus,
  Plus
} from 'lucide-react';
import { motion } from 'motion/react';
import { EmptyState } from './ui/EmptyState';
import { DataTracker, TrackerType } from './ui/DataTracker';

interface TrackerConfig {
  id: string;
  type: TrackerType;
  title: string;
  icon: any;
  color: string;
  unit?: string;
  range?: [number, number];
  description?: string;
}

const TRACKER_CONFIGS: TrackerConfig[] = [
  { id: 'mood', type: 'slider', title: 'Mood Velocity', icon: Smile, color: '#9b59b6', range: [1, 10], description: 'Emotional baseline' },
  { id: 'water', type: 'log', title: 'Hydration IQ', icon: Droplets, color: '#3498db', unit: 'Glasses', description: 'Metabolic fuel' },
  { id: 'sleep', type: 'stat', title: 'Rest Recovery', icon: Moon, color: '#f39c12', unit: 'h', description: 'Last night sync' },
  { id: 'activity', type: 'grid', title: 'Physical Flux', icon: Activity, color: '#2ecc71', description: '28-day movement intensity' },
  { id: 'focus', type: 'slider', title: 'Cognitive Load', icon: Focus, color: '#e74c3c', range: [1, 100], description: 'Brain bandwidth' },
];

export default function WellnessView() {
  const [trackerValues, setTrackerValues] = useState<Record<string, any>>({
    mood: 7,
    water: 4,
    sleep: 7.2,
    activity: Array.from({ length: 28 }, () => Math.floor(Math.random() * 4)),
    focus: 64
  });

  const [hasData, setHasData] = useState(true);

  const updateTracker = (id: string, val: any) => {
    setTrackerValues(prev => ({ ...prev, [id]: val }));
  };

  if (!hasData) {
    return (
      <EmptyState 
        icon={ShieldAlert}
        title="Biometric Sync Lost"
        description="The Intelligence OS requires a constant stream of wellness data to correlate your cognitive peaks with your study schedule."
        actionLabel="Re-sync Wearables"
        onAction={() => setHasData(true)}
      />
    );
  }

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[var(--color-accent)]/10 rounded-2xl border border-[var(--color-accent)]/20 shadow-lg shadow-[var(--color-accent)]/5">
            <Heart className="text-[var(--color-accent)]" size={24} />
          </div>
          <div>
            <h2 className="font-black text-4xl tracking-tighter text-[var(--color-text-primary)]">Wellness Matrix</h2>
            <p className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-[0.2em] opacity-40">Proactive Biometric Correlation Engine</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Primary AI Insight Card */}
        <div className="lg:col-span-2 p-8 glass-card border-[var(--color-accent)]/30 relative overflow-hidden group shadow-2xl flex flex-col justify-center gap-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-accent)] opacity-10 blur-[100px] -mr-32 -mt-32 group-hover:opacity-20 transition-all" />
          
          <div className="flex items-center gap-3 text-[var(--color-accent)]">
            <Brain size={24} />
            <span className="text-xs font-black uppercase tracking-[0.3em]">Neural State Analysis</span>
          </div>
          
          <h3 className="text-3xl font-black tracking-tight text-[var(--color-text-primary)] leading-tight max-w-xl">
            "Your mood and hydration levels indicate 
            an optimal <span className="text-[var(--color-accent)]">Deep Study</span> window 
            opening in exactly 45 minutes."
          </h3>
          
          <div className="flex items-center gap-8 border-t border-white/5 pt-8 mt-2">
             <div>
               <p className="text-[10px] font-black uppercase text-[var(--color-text-secondary)] opacity-40 mb-1">Focus Propensity</p>
               <p className="text-2xl font-black text-[var(--color-accent)]">HIGH</p>
             </div>
             <div>
               <p className="text-[10px] font-black uppercase text-[var(--color-text-secondary)] opacity-40 mb-1">Recommended Flux</p>
               <p className="text-2xl font-black text-[var(--color-text-primary)]">2.4h BLOCK</p>
             </div>
             <button className="ml-auto px-6 py-3 bg-[var(--color-accent)] text-white rounded-[6px] text-xs font-black uppercase tracking-widest shadow-lg shadow-[var(--color-accent)]/20 hover:scale-105 active:scale-95 transition-all">
               Commit to Focus
             </button>
          </div>
        </div>

        {/* Dynamic Trackers - Assembly via Factory */}
        {TRACKER_CONFIGS.map((config) => (
          <DataTracker 
            key={config.id}
            type={config.type}
            title={config.title}
            icon={config.icon}
            color={config.color}
            unit={config.unit}
            range={config.range}
            description={config.description}
            value={trackerValues[config.id]}
            data={config.type === 'grid' ? trackerValues[config.id] : undefined}
            onUpdate={(val) => updateTracker(config.id, val)}
          />
        ))}

        {/* Manual Input Log Card (Biometrics) */}
        <div className="p-8 glass-panel space-y-6 flex flex-col justify-between border-dashed border-white/20">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[var(--color-text-secondary)] opacity-40">
              <Zap size={16} />
              <h4 className="text-[10px] font-black uppercase tracking-widest leading-none">External Ingestion</h4>
            </div>
            <p className="text-sm font-bold text-[var(--color-text-primary)] leading-tight">
              Awaiting manual biometric input for <span className="text-[#e74c3c]">Resting Heart Rate</span>.
            </p>
          </div>
          
          <div className="relative group">
            <input 
              type="number" 
              placeholder="e.g. 64 bpm"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)] transition-all"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[var(--color-accent)] text-white rounded-[6px] shadow-lg">
              <Plus size={14} />
            </button>
          </div>
          
          <p className="text-[10px] text-[var(--color-text-secondary)] opacity-30 italic leading-relaxed">
            Historical correlation suggests a 15% increase in retention when HVP rates are below 70 during lectures.
          </p>
        </div>
      </div>

      {/* Biometric Ledger Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-secondary)] opacity-40">Biometric Event Ledger</h3>
          <span className="text-[9px] font-mono p-1 bg-white/5 rounded text-[var(--color-text-secondary)]">Uptime: 48:12:04</span>
        </div>
        <div className="glass-panel overflow-hidden border-white/5">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/5 text-[9px] font-black uppercase tracking-widest text-[var(--color-text-secondary)]">
                <th className="px-6 py-3">Timestamp</th>
                <th className="px-6 py-3">Metric</th>
                <th className="px-6 py-3">Value</th>
                <th className="px-6 py-3">Delta</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="text-xs font-bold text-[var(--color-text-primary)]/80">
              {[
                { time: '14:23:01', metric: 'Hydration', val: '250ml', delta: '+8%', status: 'Nominal' },
                { time: '13:00:00', metric: 'Cognitive Load', val: '84%', delta: '+12%', status: 'Peak' },
                { time: '08:15:44', metric: 'Sleep Quality', val: '88/100', delta: '-3%', status: 'Sub-Optimal' },
              ].map((row, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 font-mono text-[10px] opacity-40">{row.time}</td>
                  <td className="px-6 py-4">{row.metric}</td>
                  <td className="px-6 py-4">{row.val}</td>
                  <td className={`px-6 py-4 ${row.delta.startsWith('+') ? 'text-[#4ade80]' : 'text-[#f87171]'}`}>{row.delta}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] uppercase tracking-tighter">
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
