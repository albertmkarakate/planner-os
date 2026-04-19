import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-24 px-8 text-center space-y-8 glass-panel border-white/5 bg-white/[0.01] relative overflow-hidden group shadow-2xl"
    >
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-[#9d81ff]/5 blur-3xl -ml-16 -mt-16 group-hover:bg-[#9d81ff]/10 transition-all duration-700" />
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl -mr-16 -mb-16 group-hover:bg-blue-500/10 transition-all duration-700" />
      
      <div className="relative">
        <motion.div 
          initial={{ rotate: -10 }}
          animate={{ rotate: 10 }}
          transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
          className="w-28 h-28 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center text-white/20 shadow-inner backdrop-blur-md relative z-10"
        >
          <Icon size={56} className="group-hover:scale-110 group-hover:text-[#9d81ff] transition-all duration-700" />
        </motion.div>
        
        {/* Decorative Sparkles */}
        <motion.div 
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute -top-4 -right-4 text-[#9d81ff]/40"
        >
          <Sparkles size={24} />
        </motion.div>
      </div>
      
      <div className="max-w-md space-y-3 relative z-10">
        <h3 className="text-3xl font-black text-white tracking-tighter leading-none">{title}</h3>
        <p className="text-sm text-white/40 leading-relaxed font-medium italic px-4">
          {description}
        </p>
      </div>

      {actionLabel && (
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAction}
          className="px-10 py-4 bg-[#9d81ff] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-[#9d81ff]/20 z-10 border border-white/10"
        >
          {actionLabel}
        </motion.button>
      )}
      
      {/* Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]" />
    </motion.div>
  );
}
