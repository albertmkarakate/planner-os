import React, { useState, useEffect } from 'react';
import { 
  Target, 
  ListTodo, 
  Timer, 
  Layout, 
  CheckCircle2, 
  Circle, 
  MoreHorizontal, 
  Plus, 
  Play, 
  Pause, 
  RotateCcw,
  Zap,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer 
} from 'recharts';

type TaskStatus = 'todo' | 'progress' | 'done';

interface Task {
  id: string;
  title: string;
  priority: 'High' | 'Medium' | 'Low';
  tag: string;
  status: TaskStatus;
}

export default function ProductivityView() {
  const [activeTool, setActiveTool] = useState<'kanban' | 'pomodoro' | 'wheel'>('kanban');

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-4xl tracking-tight text-white flex items-center gap-4">
          <Target className="text-[#9d81ff]" size={36} />
          High-Performance Toolbox
        </h2>
        
        <div className="flex bg-white/5 p-1 rounded-2xl gap-1 border border-white/5">
          {[
            { id: 'kanban', label: 'Kanban Board', icon: Layout },
            { id: 'pomodoro', label: 'Focus Timer', icon: Timer },
            { id: 'wheel', label: 'Wheel of Life', icon: Target },
          ].map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTool === tool.id 
                  ? 'bg-[#9d81ff] text-white shadow-lg' 
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              <tool.icon size={14} />
              {tool.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTool}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          {activeTool === 'kanban' && <KanbanBoard />}
          {activeTool === 'pomodoro' && <PomodoroTimer />}
          {activeTool === 'wheel' && <WheelOfLife />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem("planner_tasks");
    if (saved) return JSON.parse(saved);
    return [
      {
        id: "1",
        title: "Biology Lab Report: Cellular Respiration",
        priority: "High",
        tag: "Biology 101",
        status: "progress",
      },
      {
        id: "2",
        title: "Review History Lecture Slides (Week 4)",
        priority: "Medium",
        tag: "History of Art",
        status: "todo",
      },
      {
        id: "3",
        title: "Math Problem Set: Calculus",
        priority: "High",
        tag: "Advanced Math",
        status: "todo",
      },
      {
        id: "4",
        title: "Email Professor about Essay",
        priority: "Low",
        tag: "Notes",
        status: "done",
      },
    ];
  });

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskForm, setTaskForm] = useState<Partial<Task>>({
    title: "",
    priority: "Medium",
    tag: "General",
    status: "todo",
  });

  useEffect(() => {
    localStorage.setItem("planner_tasks", JSON.stringify(tasks));
  }, [tasks]);

  const moveTask = (id: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t)),
    );
  };

  const openTaskModal = (task: Task | null = null, initialStatus: TaskStatus = "todo") => {
    if (task) {
      setEditingTask(task);
      setTaskForm(task);
    } else {
      setEditingTask(null);
      setTaskForm({ title: "", priority: "Medium", tag: "General", status: initialStatus });
    }
    setShowTaskModal(true);
  };

  const handleSaveTask = () => {
    if (!taskForm.title?.trim()) return;
    if (editingTask) {
      setTasks((prev) =>
        prev.map((t) => (t.id === editingTask.id ? ({ ...t, ...taskForm } as Task) : t)),
      );
    } else {
      const newTask: Task = {
        id: Date.now().toString(),
        title: taskForm.title || "",
        priority: taskForm.priority || "Medium",
        tag: taskForm.tag || "General",
        status: taskForm.status || "todo",
      };
      setTasks((prev) => [...prev, newTask]);
    }
    setShowTaskModal(false);
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setShowTaskModal(false);
  };

  const columns: { id: TaskStatus; label: string; color: string }[] = [
    { id: "todo", label: "To Do", color: "#white/20" },
    { id: "progress", label: "In Progress", color: "#9d81ff" },
    { id: "done", label: "Completed", color: "#4ade80" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
      {columns.map((col) => (
        <div key={col.id} className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor:
                    col.color === "#white/20"
                      ? "rgba(255,255,255,0.2)"
                      : col.color,
                }}
              />
              <h3 className="text-xs font-black uppercase tracking-widest text-white/50">
                {col.label}
              </h3>
              <span className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded text-white/30 font-mono">
                {tasks.filter((t) => t.status === col.id).length}
              </span>
            </div>
            <button 
              onClick={() => openTaskModal(null, col.id)}
              className="text-white/20 hover:text-white transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>

          <div className="space-y-3 min-h-[400px] p-2 bg-white/[0.02] rounded-3xl border border-dashed border-white/5">
            {tasks
              .filter((t) => t.status === col.id)
              .map((task) => (
                <motion.div
                  layoutId={task.id}
                  key={task.id}
                  className="p-5 glass-card space-y-4 group cursor-grab active:cursor-grabbing hover:border-white/20 transition-all shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <span
                      className={`text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded border ${
                        task.priority === "High"
                          ? "bg-red-500/10 text-red-400 border-red-500/20"
                          : task.priority === "Medium"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-white/10 text-white/40 border-white/20"
                      }`}
                    >
                      {task.priority}
                    </span>
                    <button 
                      onClick={() => openTaskModal(task)}
                      className="text-white/20 hover:text-white group-hover:block hidden"
                    >
                      <MoreHorizontal size={14} />
                    </button>
                  </div>

                  <p className="text-sm font-bold text-white leading-tight">
                    {task.title}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[10px] font-medium text-white/30">
                      <Star size={10} className="text-[#9d81ff]" />
                      {task.tag}
                    </div>

                    <div className="flex gap-1">
                      {col.id !== "todo" && (
                        <button
                          onClick={() =>
                            moveTask(
                              task.id,
                              col.id === "done" ? "progress" : "todo",
                            )
                          }
                          className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-white/30 hover:text-white transition-all"
                        >
                          <RotateCcw size={12} />
                        </button>
                      )}
                      {col.id !== "done" && (
                        <button
                          onClick={() =>
                            moveTask(
                              task.id,
                              col.id === "todo" ? "progress" : "done",
                            )
                          }
                          className="p-1.5 bg-[#9d81ff]/20 hover:bg-[#9d81ff] rounded-lg text-[#9d81ff] hover:text-white transition-all"
                        >
                          <CheckCircle2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>
        </div>
      ))}

      <AnimatePresence>
        {showTaskModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-md bg-[#1a1a24] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#9d81ff]/10 flex items-center justify-center text-[#9d81ff]">
                    <ListTodo size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg leading-none">
                      {editingTask ? "Refactor Task" : "New Objective Node"}
                    </h3>
                    <p className="text-[10px] font-black uppercase text-white/30 tracking-widest mt-1">
                      Productivity Registry
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowTaskModal(false)}
                  className="p-2 hover:bg-white/5 rounded-lg transition-all text-white/40 hover:text-white"
                >
                  <Plus className="rotate-45" size={24} />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-white/30 tracking-widest">
                    Objective Label
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Finish Calculus p-set"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white outline-none focus:border-[#9d81ff] transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-white/30 tracking-widest">
                      Priority Flux
                    </label>
                    <select
                      value={taskForm.priority}
                      onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as any })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white outline-none focus:border-[#9d81ff] transition-all appearance-none"
                    >
                      <option value="High" className="bg-[#1a1a24]">High</option>
                      <option value="Medium" className="bg-[#1a1a24]">Medium</option>
                      <option value="Low" className="bg-[#1a1a24]">Low</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-white/30 tracking-widest">
                      Classification
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Biology"
                      value={taskForm.tag}
                      onChange={(e) => setTaskForm({ ...taskForm, tag: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white outline-none focus:border-[#9d81ff] transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-white/30 tracking-widest">
                      Execution State
                    </label>
                    <select
                      value={taskForm.status}
                      onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value as any })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white outline-none focus:border-[#9d81ff] transition-all appearance-none"
                    >
                      <option value="todo" className="bg-[#1a1a24]">To Do</option>
                      <option value="progress" className="bg-[#1a1a24]">In Progress</option>
                      <option value="done" className="bg-[#1a1a24]">Completed</option>
                    </select>
                  </div>
              </div>

              <div className="p-8 border-t border-white/5 bg-black/20 flex gap-3">
                {editingTask && (
                  <button
                    onClick={() => handleDeleteTask(editingTask.id)}
                    className="p-4 bg-red-500/10 text-red-500 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex-1"
                  >
                    Terminate
                  </button>
                )}
                <button
                  onClick={handleSaveTask}
                  className="p-4 bg-[#9d81ff] text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[#9d81ff]/20 hover:scale-[1.02] active:scale-95 transition-all flex-[2]"
                >
                  {editingTask ? "Sync Changes" : "Commit Node"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PomodoroTimer() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');

  useEffect(() => {
    let interval: any;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            setIsActive(false);
            setMode(prev => prev === 'focus' ? 'break' : 'focus');
            setMinutes(mode === 'focus' ? 5 : 25);
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, minutes, seconds, mode]);

  const reset = () => {
    setIsActive(false);
    setMinutes(mode === 'focus' ? 25 : 5);
    setSeconds(0);
  };

  const progress = ((minutes * 60 + seconds) / (mode === 'focus' ? 25 * 60 : 5 * 60)) * 100;

  return (
    <div className="max-w-xl mx-auto py-12 space-y-12">
      <div className="flex justify-center gap-4">
        {['focus', 'break'].map((m) => (
          <button
            key={m}
            onClick={() => {
              setMode(m as any);
              setMinutes(m === 'focus' ? 25 : 5);
              setSeconds(0);
              setIsActive(false);
            }}
            className={`px-6 py-2 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all ${
              mode === m 
                ? 'bg-[#9d81ff] text-white shadow-lg' 
                : 'bg-white/5 text-white/40 hover:text-white shadow-none'
            }`}
          >
            {m === 'focus' ? 'Focus Session' : 'Short Break'}
          </button>
        ))}
      </div>

      <div className="relative aspect-square max-w-[300px] mx-auto flex items-center justify-center">
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle 
            cx="50%" cy="50%" r="48%" 
            className="fill-none stroke-white/5 stroke-[4]" 
          />
          <motion.circle 
            cx="50%" cy="50%" r="48%" 
            className="fill-none stroke-[8] stroke-[#9d81ff]"
            style={{ 
              strokeLinecap: 'round',
              strokeDasharray: '301.59',
              strokeDashoffset: 301.59 - (301.59 * (100 - progress)) / 100
            }}
          />
        </svg>
        
        <div className="text-center space-y-2">
           <span className="text-7xl font-black tracking-tighter text-white tabular-nums">
             {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
           </span>
           <p className="text-xs font-bold text-white/20 uppercase tracking-[0.3em]">
             {mode === 'focus' ? 'Stay Disciplined' : 'Rest Well'}
           </p>
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <button 
          onClick={() => setIsActive(!isActive)}
          className="w-16 h-16 rounded-full bg-[#9d81ff] text-white flex items-center justify-center shadow-xl shadow-[#9d81ff]/20 hover:scale-110 active:scale-95 transition-all"
        >
          {isActive ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
        </button>
        <button 
          onClick={reset}
          className="w-16 h-16 rounded-full bg-white/5 text-white/60 flex items-center justify-center hover:bg-white/10 hover:text-white transition-all"
        >
          <RotateCcw size={24} />
        </button>
      </div>

      <div className="p-8 glass-card border-[#9d81ff]/20 flex items-center gap-6">
        <div className="w-12 h-12 rounded-2xl bg-[#9d81ff]/10 flex items-center justify-center text-[#9d81ff]">
          <Zap size={24} />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-white">AI Focus Strategy</h4>
          <p className="text-xs text-white/40 leading-relaxed">
            Based on your biology curriculum, we suggest 4 Focus cycles for 'Cellular Biology' today. 
            Estimated completion: 2h 10m.
          </p>
        </div>
      </div>
    </div>
  );
}

function WheelOfLife() {
  const [data, setData] = useState([
    { subject: 'Studies', A: 85, fullMark: 100 },
    { subject: 'Social', A: 65, fullMark: 100 },
    { subject: 'Health', A: 70, fullMark: 100 },
    { subject: 'Finance', A: 50, fullMark: 100 },
    { subject: 'Self-Care', A: 90, fullMark: 100 },
    { subject: 'Hobbies', A: 40, fullMark: 100 },
  ]);

  const [isHovering, setIsHovering] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const updateValue = (index: number, val: number) => {
    setData(prev => prev.map((item, i) => i === index ? { ...item, A: Math.min(100, Math.max(0, val)) } : item));
  };

  const handleChartClick = (event: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const x = event.clientX - rect.left - centerX;
    const y = event.clientY - rect.top - centerY;
    
    // Calculate angle in degrees, adjusted so 0 is top
    let angle = (Math.atan2(y, x) * 180) / Math.PI + 90;
    if (angle < 0) angle += 360;
    
    // Each segment is 60 degrees (360/6)
    // Categories are centered at 0, 60, 120, 180, 240, 300
    // We adjust by 30 to find the closest segment
    const segmentIndex = Math.round(angle / 60) % 6;
    
    // Distance from center determines the value (max radius is roughly 40-45% of min(w,h))
    const distance = Math.sqrt(x * x + y * y);
    const maxRadius = Math.min(centerX, centerY) * 0.8;
    const newValue = Math.round((distance / maxRadius) * 100);
    
    updateValue(segmentIndex, newValue);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6">
      <div 
        className="p-8 glass-card space-y-8 flex flex-col items-center justify-center min-h-[500px] relative group"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className="w-full">
           <h3 className="text-xs font-black uppercase tracking-widest text-white/30 text-center mb-8">Wheel of Life Optimization</h3>
        </div>
        
        <div 
          className="w-full h-80 relative cursor-crosshair" 
          ref={containerRef}
          onClick={handleChartClick}
        >
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 'bold' }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar
                name="Performance"
                dataKey="A"
                stroke="#9d81ff"
                fill="#9d81ff"
                fillOpacity={0.6}
                isAnimationActive={false}
              />
            </RadarChart>
          </ResponsiveContainer>

          <AnimatePresence>
            {isHovering && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute top-2 left-2 p-2 bg-white/5 border border-white/10 rounded-lg backdrop-blur-md pointer-events-none"
              >
                <p className="text-[10px] font-black uppercase text-[#9d81ff] tracking-widest">Interactive Mode</p>
                <p className="text-[9px] text-white/40">Click segments to calibrate</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-sm font-bold text-white/40 italic px-8 leading-relaxed">
          "Your Wheel reveals a strong lean towards Academics. We recommend 20% more focus on Social & Hobbies to maintain long-term burnout resistance."
        </p>
      </div>

      <div className="p-8 glass-card space-y-6">
        <h3 className="text-xs font-black uppercase tracking-widest text-white/30">Manual Calibration</h3>
        <div className="space-y-6">
          {data.map((item, i) => (
            <div key={i} className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <span className="text-sm font-bold text-white tracking-tight">{item.subject}</span>
                <span className="text-xs font-mono text-[#9d81ff] bg-[#9d81ff]/10 px-2 py-0.5 rounded-full">{item.A}%</span>
              </div>
              
              <div className="relative h-4 flex items-center group">
                <div className="absolute inset-0 h-1 bg-white/5 rounded-full" />
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${item.A}%` }}
                  className="absolute left-0 h-1 bg-[#9d81ff] rounded-full shadow-[0_0_8px_#9d81ff]" 
                />
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={item.A} 
                  onChange={(e) => updateValue(i, parseInt(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <motion.div 
                  className="absolute w-3 h-3 rounded-full bg-white border border-[#9d81ff] shadow-xl pointer-events-none z-20"
                  animate={{ left: `calc(${item.A}% - 6px)` }}
                />
              </div>
            </div>
          ))}
        </div>
        
        <div className="pt-8 space-y-4 text-left">
           <h4 className="text-xs font-bold uppercase text-white/20 px-1">Proactive Goal Setting</h4>
           <div className="p-5 bg-white/5 rounded-2xl border border-white/10 space-y-4">
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                 <div className="p-2 bg-amber-400/10 rounded-lg">
                    <Star size={14} className="text-amber-400" />
                 </div>
                 <p className="text-xs font-bold text-white">Balanced Student Badge</p>
               </div>
               <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
                 {Math.round((data.filter(d => d.A >= 50).length / data.length) * 100)}%
               </span>
             </div>
             <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
               <motion.div 
                 animate={{ width: `${(data.filter(d => d.A >= 50).length / data.length) * 100}%` }}
                 className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.2)]" 
               />
             </div>
             <p className="text-[10px] text-white/30 leading-relaxed font-medium">
               Earned by keeping all sectors above <span className="text-white/60">50%</span> for 30 consecutive days. 
               ({data.filter(d => d.A >= 50).length}/{data.length} sectors qualified)
             </p>
           </div>
        </div>
      </div>
    </div>
  );
}
