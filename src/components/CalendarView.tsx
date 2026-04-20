import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  CalendarPlus, 
  List, 
  Grid, 
  Columns3,
  Search,
  Bell,
  Clock,
  Share2,
  ExternalLink,
  UtensilsCrossed,
  Trophy,
  Target
} from 'lucide-react';
import { EmptyState } from './ui/EmptyState';
import { motion, AnimatePresence } from 'motion/react';

type CalendarMode = 'month' | 'week' | 'year';

interface CalendarEvent {
  id: string;
  day: number;
  title: string;
  type: 'academic' | 'wellness' | 'social' | 'spiritual';
  time?: string;
  description?: string;
}

export default function CalendarView() {
  const [mode, setMode] = useState<CalendarMode>('month');
  const [selectedDay, setSelectedDay] = useState<number | null>(19);
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem('calendar_events');
    if (saved) return JSON.parse(saved);
    return [
      { id: '1', day: 20, title: 'Biology Exam: Unit 2', type: 'academic', time: '10:00 AM', description: 'Major assessment on Cellular Respiration.' },
      { id: '2', day: 15, title: 'History Essay Due', type: 'academic', time: '11:59 PM' },
      { id: '3', day: 25, title: 'Lab Reflection', type: 'academic', time: '02:00 PM' },
      { id: '4', day: 19, title: 'Yoga Session', type: 'wellness', time: '08:00 AM' },
      { id: '5', day: 19, title: 'Deep Work: Math', type: 'academic', time: '02:00 PM' },
    ];
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Partial<CalendarEvent> | null>(null);

  React.useEffect(() => {
    localStorage.setItem('calendar_events', JSON.stringify(events));
  }, [events]);

  const handleAddEvent = () => {
    setEditingEvent({ day: selectedDay || 1, title: '', type: 'academic', time: '' });
    setIsEditing(true);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setIsEditing(true);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  const handleSaveEvent = () => {
    if (!editingEvent?.title) return;
    if (editingEvent.id) {
      setEvents(prev => prev.map(e => e.id === editingEvent.id ? (editingEvent as CalendarEvent) : e));
    } else {
      const newEvent: CalendarEvent = {
        ...editingEvent as any,
        id: Math.random().toString(36).substr(2, 9),
      };
      setEvents(prev => [...prev, newEvent]);
    }
    setIsEditing(false);
    setEditingEvent(null);
  };

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // --- MOCK OS INTEGRATION FUNCTION ---
  const handleExportToOS = (event: CalendarEvent) => {
    // In a real environment with the desktop bridge, we would send this to the Python side.
    // console.log("Exporting to .ics...", event);
    alert(`Generating .ics for "${event.title}"... \nOpening native OS Calendar for import.`);
    // Logic: fetch('/api/export-ics', { method: 'POST', ... })
  };

  return (
    <div className="space-y-6 pb-10">
      {/* --- HEADER ROUTER --- */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-[6px] bg-[#9d81ff] flex items-center justify-center shadow-lg shadow-[#9d81ff]/20">
            <CalendarIcon className="text-white" size={28} />
          </div>
          <div>
             <h2 className="font-bold text-3xl tracking-tighter text-[var(--color-text-primary)]">Temporal Map</h2>
             <p className="text-[10px] font-black uppercase text-[var(--color-text-secondary)] opacity-50 tracking-widest">Multi-Engine Event Synchronization</p>
          </div>
          
          <div className="hidden lg:flex bg-white/5 p-1 rounded-[6px] gap-1 border border-white/5 ml-4">
            {[
              { id: 'year', label: 'Yearly Overview', icon: Grid },
              { id: 'month', label: 'Monthly Plan', icon: Columns3 },
              { id: 'week', label: 'Weekly Schedule', icon: List },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id as CalendarMode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-[6px] text-[10px] font-black uppercase tracking-widest transition-all ${
                  mode === m.id 
                    ? 'bg-[#9d81ff] text-white shadow-lg' 
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                <m.icon size={12} />
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex glass-panel overflow-hidden border-white/5 bg-white/5 flex-1 md:flex-none h-12">
            <button className="px-4 hover:bg-white/10 transition-colors border-r border-white/10 text-white/60"><ChevronLeft size={16} /></button>
            <button className="px-8 py-2 text-sm font-bold border-r border-white/10 text-white whitespace-nowrap min-w-[140px]">April 2026</button>
            <button className="px-4 hover:bg-white/10 transition-colors text-white/60"><ChevronRight size={16} /></button>
          </div>
          <button 
            onClick={handleAddEvent}
            className="bg-[#9d81ff] h-12 text-white px-6 rounded-[6px] text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-[#9d81ff]/20"
          >
            <Plus size={16} /> Incorporate Entry
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isEditing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="glass-card max-w-md w-full p-8 border-[#9d81ff]/20 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#9d81ff]/10 blur-3xl -mr-16 -mt-16" />
              <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black uppercase tracking-widest text-[#9d81ff]">
                    {editingEvent?.id ? 'Adjust Entry' : 'Spawn Event'}
                  </h3>
                  <button onClick={() => setIsEditing(false)} className="text-white/20 hover:text-white">
                    <Plus className="rotate-45" size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Intelligence Index (Title)</label>
                    <input 
                      type="text" 
                      value={editingEvent?.title || ''}
                      onChange={e => setEditingEvent(prev => ({ ...prev!, title: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-[6px] p-3 text-sm text-white outline-none focus:border-[#9d81ff]"
                      placeholder="e.g. Bio Exam 2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Temporal Marker (Day)</label>
                      <input 
                        type="number" 
                        min="1" max="30"
                        value={editingEvent?.day || ''}
                        onChange={e => setEditingEvent(prev => ({ ...prev!, day: parseInt(e.target.value) }))}
                        className="w-full bg-white/5 border border-white/10 rounded-[6px] p-3 text-sm text-white outline-none focus:border-[#9d81ff]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Stamp (Time)</label>
                      <input 
                        type="text" 
                        value={editingEvent?.time || ''}
                        onChange={e => setEditingEvent(prev => ({ ...prev!, time: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-[6px] p-3 text-sm text-white outline-none focus:border-[#9d81ff]"
                        placeholder="10:00 AM"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Classification</label>
                    <div className="flex gap-2">
                      {['academic', 'wellness', 'social', 'spiritual'].map(t => (
                        <button 
                          key={t}
                          onClick={() => setEditingEvent(prev => ({ ...prev!, type: t as any }))}
                          className={`flex-1 py-2 rounded-[6px] text-[10px] font-black uppercase tracking-widest border transition-all ${
                            editingEvent?.type === t 
                              ? 'bg-[#9d81ff]/20 border-[#9d81ff] text-[#9d81ff]' 
                              : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Descriptive Metadata</label>
                    <textarea 
                      value={editingEvent?.description || ''}
                      onChange={e => setEditingEvent(prev => ({ ...prev!, description: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-[6px] p-3 text-sm text-white outline-none focus:border-[#9d81ff] h-24 resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  {editingEvent?.id && (
                    <button 
                      onClick={() => { handleDeleteEvent(editingEvent.id!); setIsEditing(false); }}
                      className="flex-1 py-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-[6px] text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-xl shadow-red-500/10"
                    >
                      Delete Entry
                    </button>
                  )}
                  <button 
                    onClick={handleSaveEvent}
                    className="flex-[2] py-4 bg-[#9d81ff] text-white rounded-[6px] text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-[#9d81ff]/20"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
           key={mode}
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -10 }}
           transition={{ duration: 0.2 }}
           className="w-full"
        >
          {mode === 'year' && <YearlyView events={events} />}
          {mode === 'month' && <MonthlyView events={events} selectedDay={selectedDay} setSelectedDay={setSelectedDay} onExport={handleExportToOS} onEdit={handleEditEvent} onAdd={handleAddEvent} weekdays={weekdays} />}
          {mode === 'week' && <WeeklyView events={events} weekdays={weekdays} onEdit={handleEditEvent} onAdd={handleAddEvent} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// --- SUB-VIEWS ---

function YearlyView({ events }: { events: CalendarEvent[] }) {
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-in fade-in duration-500">
      {/* 3x4 Grid of Mini Calendars */}
      <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
        {months.map((m, idx) => (
          <div key={m} className="p-4 glass-card border-white/5 space-y-3">
             <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-[10px] font-black tracking-widest text-[#9d81ff]">{m} 2026</span>
                {idx === 3 && <div className="w-1.5 h-1.5 rounded-full bg-[#9d81ff] animate-pulse" />}
             </div>
             <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                  <div key={d} className={`text-[8px] font-bold text-center py-1 rounded ${d === 19 && idx === 3 ? 'bg-[#9d81ff] text-white' : 'text-white/20'}`}>
                    {d}
                  </div>
                ))}
             </div>
          </div>
        ))}
      </div>

      {/* Yearly Goals & Vision */}
      <div className="space-y-6">
         <div className="p-8 glass-card border-[#9d81ff]/20 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#9d81ff]/10 blur-3xl -mr-16 -mt-16" />
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                <Target className="text-[#9d81ff]" size={20} />
                <h3 className="text-xs font-black uppercase tracking-widest text-white">Yearly Vision</h3>
              </div>
              <ul className="space-y-4">
                 <li className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-white">1. AWS Certification</span>
                    <p className="text-[10px] text-white/30 uppercase tracking-tighter">Scheduled for June Final</p>
                 </li>
                 <li className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-white">2. Cumulative GPA 4.0</span>
                    <p className="text-[10px] text-white/30 uppercase tracking-tighter">Current Weighted Avg: 3.84</p>
                 </li>
                 <li className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-white">3. Sleep Hygiene (8h)</span>
                    <p className="text-[10px] text-white/30 uppercase tracking-tighter">Wellness Matrix Target</p>
                 </li>
              </ul>
            </div>
         </div>

         <div className="p-6 glass-panel border-amber-500/20 bg-amber-500/5">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-400 mb-2">Key Critical Dates</h4>
            <div className="space-y-3">
               <div className="flex items-center justify-between text-[10px] font-bold">
                 <span className="text-white/60">Apr 20 - Apr 30</span>
                 <span className="text-amber-400">Final Exams</span>
               </div>
               <div className="flex items-center justify-between text-[10px] font-bold">
                 <span className="text-white/60">June 05</span>
                 <span className="text-white/40">Internship Start</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function MonthlyView({ events, selectedDay, setSelectedDay, onExport, onEdit, onAdd, weekdays }: any) {
  const daysInMonth = Array.from({ length: 35 }, (_, i) => i - 3);
  const getEventsForDay = (day: number) => events.filter((e: any) => e.day === day);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Calendar Grid */}
      <div className="lg:col-span-3 glass-panel overflow-hidden shadow-2xl border-white/5">
        <div className="grid grid-cols-7 border-b border-white/10 bg-white/[0.02]">
          {weekdays.map((day: string) => (
            <div key={day} className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/20 text-center">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7">
          {daysInMonth.map((day, i) => {
            const isCurrentMonth = day > 0 && day <= 30;
            const dayEvents = getEventsForDay(day);
            const isSelected = selectedDay === day;
            const isToday = day === 19;

            return (
              <div 
                key={i} 
                onClick={() => isCurrentMonth && setSelectedDay(day)}
                className={`min-h-[140px] p-4 border-r border-b border-white/5 flex flex-col gap-2 transition-all cursor-pointer relative
                  ${!isCurrentMonth ? 'bg-black/20 text-white/5 opacity-50 pointer-events-none' : 'hover:bg-white/[0.03]'}
                  ${isSelected ? 'bg-white/[0.05] ring-1 ring-inset ring-[#9d81ff]/30' : ''}
                `}
              >
                <div className="flex items-center justify-between">
                   <span className={`text-sm font-bold ${
                     isToday ? 'w-8 h-8 bg-[#9d81ff] text-white rounded-[6px] flex items-center justify-center -ml-1 -mt-1 shadow-lg shadow-[#9d81ff]/30' : 
                     isSelected ? 'text-[#9d81ff]' : 'text-white/40'
                   }`}>
                     {day > 0 ? (day > 30 ? day - 30 : day) : 31 + day}
                   </span>
                   
                   <div className="flex gap-0.5">
                     {isCurrentMonth && dayEvents.some((e: any) => e.type === 'wellness') && <div className="w-1.5 h-1.5 rounded-full bg-[#4ade80]" />}
                     {isCurrentMonth && dayEvents.some((e: any) => e.type === 'academic') && <div className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]" />}
                     {isCurrentMonth && dayEvents.some((e: any) => e.type === 'spiritual') && <div className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />}
                   </div>
                </div>

                <div className="flex-1 space-y-1 mt-1">
                  {isCurrentMonth && dayEvents.slice(0, 2).map((e: any) => (
                    <div 
                      key={e.id} 
                      onClick={(ev) => {
                        ev.stopPropagation();
                        onEdit(e);
                      }}
                      className={`px-2 py-1 text-[9px] font-black uppercase tracking-tighter rounded-[4px] border flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] transition-transform
                        ${e.type === 'academic' ? 'bg-[#9d81ff]/10 text-[#9d81ff] border-[#9d81ff]/20' : 
                          e.type === 'wellness' ? 'bg-[#4ade80]/10 text-[#4ade80] border-[#4ade80]/20' : 
                          e.type === 'spiritual' ? 'bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20' :
                          'bg-white/10 text-white/40 border-white/20'}
                      `}
                    >
                      <div className="w-1 h-1 rounded-full bg-current" />
                      <span className="truncate">{e.title}</span>
                    </div>
                  ))}
                  {dayEvents.length > 2 && <p className="text-[10px] font-bold text-white/20 pl-2">+{dayEvents.length - 2} more</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Focused Detail Panel */}
      <div className="lg:col-span-1 space-y-6">
        {selectedDay ? (
          <div className="space-y-6">
            <div className="p-8 glass-card border-[#9d81ff]/20 shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#9d81ff]/10 blur-3xl -mr-10 -mt-10" />
              <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between">
                   <p className="text-[10px] font-black tracking-[0.2em] uppercase text-white/30">Detail Matrix</p>
                   <span className="text-2xl font-black text-white">April {selectedDay}</span>
                </div>

                <div className="space-y-4">
                  {getEventsForDay(selectedDay).length > 0 ? (
                    getEventsForDay(selectedDay).map((e: any) => (
                      <div 
                        key={e.id} 
                        onClick={() => onEdit(e)}
                        className="p-4 bg-white/5 rounded-[6px] border border-white/5 space-y-3 group hover:bg-white/[0.08] transition-all relative cursor-pointer"
                      >
                         <div className="flex items-center justify-between">
                           <div className="flex items-center gap-2">
                              <Clock size={14} className="text-[#9d81ff]" />
                              <span className="text-[10px] font-bold text-white/40">{e.time || 'All Day'}</span>
                           </div>
                           <div className="flex gap-1">
                             <button 
                               onClick={(ev) => {
                                 ev.stopPropagation();
                                 onExport(e);
                               }}
                               className="p-1 px-2 rounded-[4px] bg-[#9d81ff]/10 text-[#9d81ff] text-[8px] font-black hover:bg-[#9d81ff] hover:text-white transition-all opacity-0 group-hover:opacity-100 flex items-center gap-1"
                             >
                               <Share2 size={8} /> OS PUSH
                             </button>
                           </div>
                         </div>
                         <h4 className="font-bold text-sm text-white">{e.title}</h4>
                         <p className="text-[10px] text-white/30 font-medium line-clamp-2">{e.description || 'No additional intelligence data available.'}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm font-bold text-white/20 italic text-center py-10 border-2 border-dashed border-white/5 rounded-[6px]">Void Schedule</p>
                  )}
                </div>

                <button 
                  onClick={onAdd}
                  className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-[6px] font-bold text-sm flex items-center justify-center gap-2 transition-all border border-white/5"
                >
                  <Plus size={18} /> Spawn Entry
                </button>
              </div>
            </div>
            
            <button 
              onClick={() => {
                const highPrio = getEventsForDay(selectedDay).find((e:any) => e.type === 'academic');
                if (highPrio) onExport(highPrio);
              }}
              className="w-full py-4 bg-[#9d81ff] text-white rounded-[6px] text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-[#9d81ff]/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Bell size={16} /> Sync Critical to System
            </button>
          </div>
        ) : (
          <div className="p-12 glass-panel border-dashed border-white/10 flex flex-col items-center justify-center text-center space-y-4 h-full min-h-[400px]">
             <CalendarIcon size={48} className="text-white/10" />
             <p className="text-sm font-bold text-white/20">Awaiting Coordinate Selection</p>
          </div>
        )}
      </div>
    </div>
  );
}

function WeeklyView({ events, weekdays, onEdit, onAdd }: any) {
  const getEventsForDay = (day: number) => events.filter((e: any) => e.day === day);
  
  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      {/* 7-Day Agile columns */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {weekdays.map((dayName: string, idx: number) => {
          const dayNum = 19 + (idx === 0 ? -6 : idx-1); // Mock mapping for April 13-19 week (base 19 for today)
          const dayEvents = getEventsForDay(dayNum);
          
          return (
            <div key={dayName} className={`glass-card p-4 border-white/5 space-y-4 flex flex-col min-h-[300px] ${idx === 1 || idx === 3 ? 'bg-[#9d81ff]/5 border-[#9d81ff]/20' : ''}`}>
               <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#9d81ff]">{dayName}</span>
                  <span className="text-[10px] font-bold text-white/20">{dayNum}</span>
               </div>
               
               <div className="space-y-2 flex-1">
                 {dayEvents.length > 0 ? (
                   dayEvents.map((e: any) => (
                     <div 
                       key={e.id} 
                       onClick={() => onEdit(e)}
                       className={`p-3 rounded-[6px] border cursor-pointer hover:scale-[1.02] transition-transform space-y-1
                         ${e.type === 'academic' ? 'bg-[#9d81ff]/10 text-[#9d81ff] border-[#9d81ff]/20' : 
                           e.type === 'wellness' ? 'bg-[#4ade80]/10 text-[#4ade80] border-[#4ade80]/20' : 
                           e.type === 'spiritual' ? 'bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20' :
                           'bg-white/10 text-white/40 border-white/20'}
                       `}
                     >
                       <p className="text-[9px] font-black uppercase truncate">{e.title}</p>
                       {e.time && <p className="text-[8px] font-bold opacity-60 flex items-center gap-1"><Clock size={8} /> {e.time}</p>}
                     </div>
                   ))
                 ) : (
                   <div 
                    onClick={() => onAdd()}
                    className="py-12 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-[6px] hover:bg-white/[0.02] cursor-pointer transition-colors"
                   >
                     <Plus size={14} className="text-white/10" />
                   </div>
                 )}
               </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Section: Meal Plan & Priorities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="p-8 glass-card border-white/5 space-y-6">
            <div className="flex items-center gap-3">
              <UtensilsCrossed className="text-amber-500" size={20} />
              <h3 className="text-xs font-black uppercase tracking-widest text-white">Weekly Nutrition Matrix</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
               {['Mon: Salmon & Veggies', 'Tue: Meal Prep Pasta', 'Wed: Quinoa Salad', 'Thu: Grilled Chicken'].map(dish => (
                 <div key={dish} className="flex items-center gap-3 p-3 bg-white/5 rounded-[6px] border border-white/5">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500/40" />
                    <span className="text-[10px] font-bold text-white/60">{dish}</span>
                 </div>
               ))}
            </div>
         </div>

         <div className="p-8 glass-card border-[#9d81ff]/20 bg-gradient-to-br from-[#9d81ff]/10 to-transparent">
            <div className="flex items-center gap-3 mb-6">
              <Trophy className="text-[#9d81ff]" size={20} />
              <h3 className="text-xs font-black uppercase tracking-widest text-white">Top 3 Weekly Priorities</h3>
            </div>
            <div className="space-y-4">
               {[
                 { label: 'Exam Readiness Protocol', progress: 85 },
                 { label: 'Financial Matrix Audit', progress: 100 },
                 { label: 'Syllabus RAG Optimization', progress: 40 },
               ].map((p, i) => (
                 <div key={i} className="space-y-2">
                   <div className="flex items-center justify-between">
                     <span className="text-sm font-bold text-white">{p.label}</span>
                     <span className="text-[10px] font-mono text-[#9d81ff]">{p.progress}%</span>
                   </div>
                   <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                     <motion.div 
                       initial={{ width: 0 }}
                       animate={{ width: `${p.progress}%` }}
                       className="h-full bg-[#9d81ff]"
                     />
                   </div>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}
