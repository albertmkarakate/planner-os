import React from 'react';
import { motion } from 'motion/react';
import { Plus, Minus, ChevronRight } from 'lucide-react';

export type TrackerType = 'slider' | 'grid' | 'log' | 'stat';

interface DataTrackerProps {
  key?: React.Key;
  type: TrackerType;
  title: string;
  icon: any;
  color: string;
  value?: any;
  unit?: string;
  range?: [number, number];
  data?: any[];
  onUpdate?: (val: any) => void;
  description?: string;
}

export function DataTracker({ 
  type, 
  title, 
  icon: Icon, 
  color, 
  value, 
  unit = '', 
  range = [1, 10], 
  data = [], 
  onUpdate,
  description
}: DataTrackerProps) {
  
  const renderContent = () => {
    switch (type) {
      case 'stat':
        return (
          <div className="flex flex-col gap-1">
            <p className="text-3xl font-black tracking-tighter text-[var(--color-text-primary)]">
              {value}{unit}
            </p>
            {description && <p className="text-[10px] uppercase font-bold text-[var(--color-text-secondary)] opacity-50">{description}</p>}
          </div>
        );
      
      case 'slider':
        const [min, max] = range;
        return (
          <div className="space-y-4 py-2">
             <div className="flex justify-between items-end">
                <span className="text-2xl font-black text-[var(--color-text-primary)]">{value}<span className="text-xs opacity-30">/{max}</span></span>
             </div>
             <div className="relative h-4 flex items-center group">
               <div className="absolute inset-0 h-1 bg-white/5 rounded-full" />
               <div 
                 className="absolute left-0 h-1 rounded-full transition-all" 
                 style={{ width: `${((value - min) / (max - min)) * 100}%`, backgroundColor: color }} 
               />
               <input 
                 type="range" 
                 min={min} 
                 max={max} 
                 value={value} 
                 onChange={(e) => onUpdate?.(parseInt(e.target.value))}
                 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
               />
               <motion.div 
                 className="absolute w-4 h-4 rounded-full border-2 border-white shadow-xl pointer-events-none z-20"
                 animate={{ left: `calc(${((value - min) / (max - min)) * 100}% - 8px)` }}
                 style={{ backgroundColor: color }}
               />
             </div>
          </div>
        );

      case 'grid':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-7 gap-1">
              {data.map((d, i) => (
                <div 
                  key={i} 
                  className="aspect-square rounded-[2px] transition-all hover:scale-110"
                  style={{ 
                    backgroundColor: d === 0 ? 'rgba(255,255,255,0.03)' : 
                                    d === 1 ? `${color}30` :
                                    d === 2 ? `${color}60` : color
                  }}
                  title={`Level ${d}`}
                />
              ))}
            </div>
            <div className="flex justify-between text-[8px] font-black uppercase text-[var(--color-text-secondary)] opacity-30">
              <span>Less</span>
              <span>Daily Intensity</span>
              <span>More</span>
            </div>
          </div>
        );

      case 'log':
        return (
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
               <p className="text-2xl font-black text-[var(--color-text-primary)]">{value}<span className="text-xs opacity-30 ml-1">{unit}</span></p>
               {description && <p className="text-[10px] font-bold text-[var(--color-text-secondary)] opacity-40">{description}</p>}
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => onUpdate?.(Math.max(0, value - 1))}
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center hover:bg-white/10 text-[var(--color-text-secondary)]"
              >
                <Minus size={14} />
              </button>
              <button 
                onClick={() => onUpdate?.(value + 1)}
                className="w-8 h-8 rounded-lg bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 flex items-center justify-center hover:bg-[var(--color-accent)] text-white shadow-lg"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5 space-y-4 hover:border-white/10 transition-all group relative overflow-hidden flex flex-col"
    >
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}15`, color: color }}>
            <Icon size={16} />
          </div>
          <h4 className="text-[11px] font-black uppercase tracking-widest text-[var(--color-text-secondary)] opacity-60">{title}</h4>
        </div>
        <ChevronRight size={14} className="text-[var(--color-text-secondary)] opacity-0 group-hover:opacity-30 transition-all -translate-x-2 group-hover:translate-x-0" />
      </div>

      <div className="z-10 flex-1 flex flex-col justify-center">
        {renderContent()}
      </div>

      {/* Subtle Background Glow */}
      <div 
        className="absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none -mr-16 -mt-16"
        style={{ backgroundColor: color }}
      />
    </motion.div>
  );
}
