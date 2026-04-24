import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Send, ShieldAlert, Activity, Cpu, Database, Code, Brain, Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LogEntry {
  id: string;
  type: 'info' | 'error' | 'success' | 'agent';
  message: string;
  timestamp: string;
}

export default function DemonLordView() {
  const [task, setTask] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: "1",
      type: "success",
      message: "Demon Lord Orchestration System (DLOS) initialized.",
      timestamp: new Date().toLocaleTimeString()
    }
  ]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch('/api/system/logs');
        const data = await response.json();
        setLogs(prev => {
          // Merge unique logs
          const existingIds = new Set(prev.map(l => l.id));
          const newLogs = data.filter((l: LogEntry) => !existingIds.has(l.id));
          return [...prev, ...newLogs];
        });
      } catch (err) {
        console.error("Failed to fetch system logs:", err);
      }
    };

    const interval = setInterval(fetchLogs, 5000);
    fetchLogs(); // Initial fetch
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!task.trim() || isProcessing) return;

    const userTask = task;
    setTask('');
    setIsProcessing(true);

    // Add user message to logs
    const userLog: LogEntry = {
      id: Date.now().toString(),
      type: "info",
      message: `User: ${userTask}`,
      timestamp: new Date().toLocaleTimeString()
    };
    setLogs(prev => [...prev, userLog]);

    try {
      const response = await fetch('/api/demon-lord', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: userTask }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        const agentLog: LogEntry = {
          id: (Date.now() + 1).toString(),
          type: "agent",
          message: data.output || "Task completed successfully with no output.",
          timestamp: new Date().toLocaleTimeString()
        };
        setLogs(prev => [...prev, agentLog]);
      } else {
        throw new Error(data.message || 'Orchestration failed.');
      }
    } catch (err: any) {
      const errorLog: LogEntry = {
        id: (Date.now() + 1).toString(),
        type: "error",
        message: `System Error: ${err.message}`,
        timestamp: new Date().toLocaleTimeString()
      };
      setLogs(prev => [...prev, errorLog]);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        const errorLog: LogEntry = {
          id: Date.now().toString(),
          type: "error",
          message: "System: Speech recognition is not supported in this browser.",
          timestamp: new Date().toLocaleTimeString()
        };
        setLogs(prev => [...prev, errorLog]);
        return;
      }

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false; // Set to true for "Open Mic" behavior but false is safer for UI feedback
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        const log: LogEntry = {
          id: Date.now().toString(),
          type: "info",
          message: "System: Monitoring neural frequencies (Listening...)",
          timestamp: new Date().toLocaleTimeString()
        };
        setLogs(prev => [...prev, log]);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        setTask(transcript);
        
        // If it's the final result, we could auto-submit if "Open Mic" is fully autonomous
        if (event.results[event.results.length - 1].isFinal) {
           // stop for now to give user chance to edit
           setIsListening(false);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech Recognition Error', event.error);
        setIsListening(false);
        const log: LogEntry = {
          id: Date.now().toString(),
          type: "error",
          message: `System: Neural link failed (${event.error})`,
          timestamp: new Date().toLocaleTimeString()
        };
        setLogs(prev => [...prev, log]);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-[var(--color-text-primary)]">Demon Lord Orchestration</h2>
          <p className="text-xs text-[var(--color-text-secondary)]">Autonomous Multi-Agent Command Core</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 glass-panel bg-red-500/10 border-red-500/20 text-red-500 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse" />
            <span>Root Access Active</span>
          </div>
        </div>
      </header>

      {/* Grid Status */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Supreme Lord', icon: ShieldAlert, color: 'text-red-500' },
          { label: 'System Control', icon: Cpu, color: 'text-blue-500' },
          { label: 'Code Weaver', icon: Code, color: 'text-green-500' },
          { label: 'Nexus Memory', icon: Database, color: 'text-purple-500' },
        ].map((item, i) => (
          <div key={i} className="glass-card p-4 flex flex-col items-center gap-2 text-center group hover:bg-white/5 transition-all cursor-default">
            <item.icon className={`w-5 h-5 ${item.color} group-hover:scale-110 transition-transform`} />
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-primary)]">{item.label}</span>
            <div className="flex items-center gap-1.5">
              <div className="w-1 h-1 rounded-full bg-[#4ade80]" />
              <span className="text-[8px] font-bold text-[#4ade80] opacity-70">ONLINE</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">
        {/* Terminal/Logs */}
        <div className="lg:col-span-2 glass-panel p-0 flex flex-col overflow-hidden border-black/10 dark:border-white/5 shadow-2xl">
          <div className="flex items-center justify-between p-4 border-b border-white/5 bg-black/20">
            <div className="flex items-center gap-2">
              <Terminal size={14} className="text-[var(--color-accent)]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)]">Neural Log Stream</span>
            </div>
            <Activity size={12} className="text-[#4ade80] animate-pulse" />
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 font-mono text-[11px] space-y-3 custom-scrollbar bg-black/40">
            <AnimatePresence>
              {logs.map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex gap-3"
                >
                  <span className="text-white/20 shrink-0">[{log.timestamp}]</span>
                  <span className={`
                    ${log.type === 'error' ? 'text-red-400' : ''}
                    ${log.type === 'success' ? 'text-green-400' : ''}
                    ${log.type === 'agent' ? 'text-[var(--color-accent)]' : ''}
                    ${log.type === 'info' ? 'text-blue-300' : ''}
                    break-words whitespace-pre-wrap
                  `}>
                    {log.message}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
            {isProcessing && (
              <motion.div 
                animate={{ opacity: [1, 0.5, 1] }} 
                transition={{ repeat: Infinity, duration: 1 }}
                className="text-[var(--color-accent)]"
              >
                &gt; Orchestrating Demon Lords...
              </motion.div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-4 border-t border-white/5 bg-black/20">
            <div className="relative">
              <input
                type="text"
                value={task}
                onChange={(e) => setTask(e.target.value)}
                disabled={isProcessing}
                placeholder="Issue a command to the Demon Lords..."
                className="w-full bg-white/5 border border-white/10 rounded-full pl-4 pr-24 py-3 text-xs text-white placeholder:text-white/20 focus:ring-1 focus:ring-[var(--color-accent)] outline-none transition-all"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-2 rounded-full transition-all ${
                    isListening 
                      ? 'bg-red-500/20 text-red-500 animate-pulse' 
                      : 'text-white/20 hover:text-[var(--color-accent)]'
                  }`}
                >
                  {isListening ? <Mic size={16} /> : <MicOff size={16} />}
                </button>
                <button
                  type="submit"
                  disabled={isProcessing || !task.trim()}
                  className="p-2 text-[var(--color-accent)] hover:scale-110 disabled:opacity-30 transition-all"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Sidebar Info */}
        <div className="glass-card p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-[var(--color-text-secondary)]">System Status</h3>
            <div className="space-y-3">
              {[
                { label: 'Memory Persistence', value: 'Enabled', active: true },
                { label: 'Ollama Integration', value: 'Local Only', active: true },
                { label: 'Sandboxed Tools', value: 'Shield Active', active: true },
                { label: 'Background Sync', value: 'Idle', active: false },
              ].map((stat, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-white/50">{stat.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-white">{stat.value}</span>
                    <div className={`w-1.5 h-1.5 rounded-full ${stat.active ? 'bg-[#4ade80]' : 'bg-white/10'}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[var(--color-accent)]/5 border border-[var(--color-accent)]/10 space-y-2">
            <div className="flex items-center gap-2 text-[var(--color-accent)]">
              <Brain size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">Architect's Note</span>
            </div>
            <p className="text-[10px] italic text-[var(--color-text-secondary)] leading-relaxed">
              The DLOS architecture uses a hierarchical bus-driven approach. Commands originate from the Supreme Lord and cascade through domain-specific controllers.
            </p>
          </div>
          
          <div className="pt-4 border-t border-white/5">
             <button className="w-full py-3 rounded-lg border border-red-500/30 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 transition-colors">
               Emergency Protocol (HALT)
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
