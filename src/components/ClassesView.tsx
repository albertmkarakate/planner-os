import React, { useState } from 'react';
import { 
  Book, 
  FileText, 
  Upload, 
  Plus, 
  Brain, 
  MessageSquare, 
  Table as TableIcon, 
  FolderOpen, 
  ClipboardList,
  ChevronRight,
  MoreVertical,
  Star
} from 'lucide-react';
import { processSyllabusHybrid } from '../lib/gemini';
import { motion, AnimatePresence } from 'motion/react';
import { EmptyState } from './ui/EmptyState';

const CLASSES = [
  { id: '1', name: 'Biology 101', semester: 'Semester 1', color: '#FF6321' },
  { id: '2', name: 'Advanced Math', semester: 'Semester 1', color: '#141414' },
  { id: '3', name: 'History of Art', semester: 'Semester 1', color: '#3B82F6' },
];

export default function ClassesView() {
  const [selectedClass, setSelectedClass] = useState<any>(CLASSES[0]);
  const [activeTab, setActiveTab] = useState<'overview' | 'assignments' | 'notes'>('overview');
  const [isUploading, setIsUploading] = useState(false);
  const [ragResult, setRagResult] = useState<any>(null);

  const handleSyllabusUpload = async () => {
    setIsUploading(true);
    const mockSyllabus = "Course: Biology 101. Major Exam April 20th. Grading: 40% Final, 20% Lab, 40% Exams.";
    const result = await processSyllabusHybrid(mockSyllabus);
    setRagResult(result);
    setIsUploading(false);
    setActiveTab('overview');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-10">
      {/* Master: Sidebar List */}
      <div className="md:col-span-1 space-y-6">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--color-text-secondary)] ml-2">Academic Portfolio</h2>
        <div className="space-y-3">
          {CLASSES.map(cls => (
            <button
              key={cls.id}
              onClick={() => setSelectedClass(cls)}
              className={`group w-full p-5 rounded-[6px] flex items-center justify-between transition-all border ${
                selectedClass.id === cls.id 
                  ? 'bg-white/10 dark:bg-white/10 border-black/10 dark:border-white/20 text-[var(--color-text-primary)] shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-md' 
                  : 'bg-transparent border-transparent hover:bg-black/5 dark:hover:bg-white/5 text-[var(--color-text-secondary)]'
              }`}
            >
              <div className="flex items-center gap-4">
                <div 
                   className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110" 
                   style={{ backgroundColor: `${cls.color}20`, color: cls.color }}
                >
                  <Book size={20} />
                </div>
                <div className="text-left font-sans">
                   <p className="font-bold text-sm tracking-tight">{cls.name}</p>
                   <p className="text-[10px] text-[var(--color-text-secondary)] opacity-50 uppercase font-black tracking-tighter">{cls.semester}</p>
                </div>
              </div>
              <ChevronRight size={14} className={`transition-transform ${selectedClass.id === cls.id ? 'translate-x-0' : '-translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`} />
            </button>
          ))}
          <button className="w-full p-5 rounded-[6px] border border-dashed border-black/10 dark:border-white/5 hover:border-black/20 dark:hover:border-white/20 flex items-center justify-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
            <Plus size={18} /> <span className="text-sm font-bold">Incorporate Module</span>
          </button>
        </div>

        {/* Global Progress Mini Widget */}
        <div className="p-6 glass-card bg-[var(--color-accent)]/[0.05] border-[var(--color-accent)]/[0.1] space-y-4">
           <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-accent)]">Semester Burnup</span>
              <span className="text-xs font-bold text-[var(--color-text-primary)]">64%</span>
           </div>
           <div className="h-1 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
              <div className="h-full w-[64%] bg-[var(--color-accent)] rounded-full shadow-[0_0_8px_var(--color-accent)]" />
           </div>
           <p className="text-[10px] text-[var(--color-text-secondary)] italic leading-tight">"You've completed 4 of 7 major milestones for this semester."</p>
        </div>
      </div>

      {/* Detail: Content Area */}
      <div className="md:col-span-3 space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="font-bold text-5xl tracking-tighter text-[var(--color-text-primary)]">{selectedClass.name}</h2>
              <Star size={20} className="text-amber-400 fill-amber-400" />
            </div>
            <p className="text-[var(--color-text-secondary)] text-sm font-medium">Integrated Curriculum & Resource Mapping</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-2xl gap-1 border border-black/5 dark:border-white/5 backdrop-blur-xl">
               {[
                 { id: 'overview', label: 'Overview', icon: Brain },
                 { id: 'assignments', label: 'Assignments', icon: ClipboardList },
                 { id: 'notes', label: 'Lectures', icon: FolderOpen },
               ].map((tab) => (
                 <button
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id as any)}
                   className={`flex items-center gap-2 px-5 py-2.5 rounded-[6px] text-xs font-bold transition-all ${
                     activeTab === tab.id 
                       ? 'nav-item-active text-white' 
                       : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-black/5 dark:hover:bg-white/5'
                   }`}
                 >
                   <tab.icon size={14} />
                   {tab.label}
                 </button>
               ))}
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab + selectedClass.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* RAG Syllabus Reader Section */}
                <div className="p-8 glass-card space-y-6 min-h-[500px] relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-2 h-full bg-[var(--color-accent)]/[0.2]" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[var(--color-text-secondary)]">
                      <FileText size={22} />
                      <h3 className="text-xs font-black uppercase tracking-[0.2em]">Curriculum Extractor</h3>
                    </div>
                    <button 
                      onClick={handleSyllabusUpload}
                      disabled={isUploading}
                      className="p-2.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-[6px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all shadow-sm"
                    >
                      {isUploading ? <div className="w-4 h-4 border-2 border-[var(--color-text-secondary)] border-t-[var(--color-accent)] rounded-full animate-spin" /> : <Plus size={18} />}
                    </button>
                  </div>

                  {ragResult ? (
                    <div className="space-y-8">
                       <div className="p-5 bg-[var(--color-accent)]/[0.1] border border-[var(--color-accent)]/[0.2] rounded-2xl">
                          <p className="text-[10px] font-black uppercase text-[var(--color-accent)] mb-2 tracking-widest">Architect's Summary</p>
                          <p className="text-sm text-[var(--color-text-primary)] font-medium italic leading-relaxed">"{ragResult.managerNote}"</p>
                       </div>

                       <div className="space-y-4">
                          <p className="text-[10px] font-black uppercase text-[var(--color-text-secondary)] tracking-widest">Crucial Deadlines</p>
                          <div className="grid gap-3">
                             {ragResult.keyDeadlines?.map((d: any, i: number) => (
                               <div key={i} className="flex items-center justify-between p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5 group hover:bg-black/[0.08] dark:hover:bg-white/[0.08] transition-all">
                                 <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] shadow-[0_0_8px_var(--color-accent)]" />
                                    <span className="text-sm font-bold text-[var(--color-text-primary)]">{d.title}</span>
                                 </div>
                                 <span className="text-[10px] font-mono bg-black/10 dark:bg-white/10 text-[var(--color-text-secondary)] px-2 py-1 rounded-lg border border-black/10 dark:border-white/10">{d.date}</span>
                               </div>
                             ))}
                          </div>
                       </div>
                    </div>
                  ) : (
                    <EmptyState 
                      icon={Upload}
                      title="Curriculum Uncharted"
                      description="Upload your module syllabus to initialize the RAG knowledge agent. The Architect AI will map your semester automatically."
                      actionLabel="Ingest Syllabus"
                      onAction={handleSyllabusUpload}
                    />
                  )}
                </div>

                {/* AI Tutor & Files Pane */}
                <div className="space-y-8">
                   <div className="p-8 glass-card bg-gradient-to-br from-[var(--color-accent)]/[0.1] to-transparent border-[var(--color-accent)]/[0.2] text-[var(--color-text-primary)] shadow-2xl relative overflow-hidden group">
                      <div className="absolute -top-10 -right-10 w-48 h-48 bg-[var(--color-accent)]/[0.2] blur-[80px] group-hover:bg-[var(--color-accent)]/[0.4] transition-all" />
                      <div className="relative z-10 space-y-5">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-xl bg-[var(--color-accent)] flex items-center justify-center shadow-lg shadow-[var(--color-accent)]/[0.4]">
                             <Brain size={22} className="text-white" />
                           </div>
                           <h3 className="text-xs font-black uppercase tracking-widest text-[var(--color-accent)]">Proactive Tutor</h3>
                        </div>
                        <p className="text-2xl leading-tight font-black tracking-tight">
                          "I've identified that questions on cellular respiration appear in 35% of previous papers."
                        </p>
                        <div className="flex gap-3 pt-2">
                          <button className="flex-1 py-4 bg-[var(--color-text-primary)] text-[var(--color-bg-main)] hover:opacity-90 transition-all rounded-[6px] text-xs font-black uppercase tracking-widest shadow-xl">Synthesize Plan</button>
                          <button className="p-4 bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 transition-colors rounded-[6px] border border-black/10 dark:border-white/10 backdrop-blur-md"><MessageSquare size={20} /></button>
                        </div>
                      </div>
                   </div>

                   <div className="p-8 glass-card space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black uppercase tracking-widest text-[var(--color-text-secondary)]">Module Repository</h3>
                        <span className="text-[10px] font-bold text-[var(--color-text-secondary)] opacity-30">3 Items</span>
                      </div>
                      <div className="space-y-4">
                        {['Lec_01_Basics.pdf', 'Lab_Guidelines.docx', 'Reference_List.epub'].map((f, i) => (
                          <div key={i} className="flex items-center justify-between group cursor-pointer p-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all">
                             <div className="flex items-center gap-4">
                               <div className="w-10 h-10 bg-black/5 dark:bg-white/5 rounded-xl flex items-center justify-center text-[var(--color-text-secondary)] opacity-50 group-hover:opacity-100 transition-all border border-black/5 dark:border-white/5">
                                 <FileText size={20} />
                               </div>
                               <span className="text-sm font-bold text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors">{f}</span>
                             </div>
                             <Plus size={16} className="text-[var(--color-text-secondary)] opacity-10 group-hover:opacity-100 transition-all" />
                          </div>
                        ))}
                      </div>
                      <button className="w-full py-4 border-2 border-dashed border-black/5 dark:border-white/5 rounded-[6px] text-[var(--color-text-secondary)] opacity-30 text-xs font-black uppercase tracking-widest hover:opacity-100 transition-all">
                        Annex New Resource
                      </button>
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'assignments' && (
              <div className="glass-card overflow-hidden shadow-2xl">
                 <div className="overflow-x-auto">
                   <table className="w-full border-collapse">
                     <thead>
                       <tr className="border-b border-black/5 dark:border-white/5 text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)] text-left bg-black/[0.01] dark:bg-white/[0.01]">
                         <th className="px-8 py-5">Assignment Title</th>
                         <th className="px-8 py-5">Status</th>
                         <th className="px-8 py-5">Value (%)</th>
                         <th className="px-8 py-5">Deadline</th>
                         <th className="px-8 py-5">Actions</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-black/5 dark:divide-white/5">
                        {[
                          { title: 'Laboratory Refraction Lab', status: 'In Review', weight: '15%', due: 'Tomorrow' },
                          { title: 'Unit 2 Assessment', status: 'Open', weight: '20%', due: 'Apr 24' },
                          { title: 'Semester Term Paper', status: 'Blocked', weight: '40%', due: 'May 12' },
                        ].map((a, i) => (
                          <tr key={i} className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors group">
                            <td className="px-8 py-6 font-bold text-sm text-[var(--color-text-primary)]">{a.title}</td>
                            <td className="px-8 py-6">
                               <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest 
                                 ${a.status === 'In Review' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-500 border border-amber-500/20' : 
                                   a.status === 'Open' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-500 border border-blue-500/20' : 
                                   'bg-[var(--color-text-secondary)]/[0.1] text-[var(--color-text-secondary)] border border-[var(--color-text-secondary)]/[0.2]'}`}>
                                 {a.status}
                               </span>
                            </td>
                            <td className="px-8 py-6 text-sm font-mono text-[var(--color-text-secondary)]">{a.weight}</td>
                            <td className="px-8 py-6 text-xs text-[var(--color-text-secondary)] opacity-50 font-bold">{a.due}</td>
                            <td className="px-8 py-6">
                               <button className="p-2 text-[var(--color-text-secondary)] opacity-30 hover:opacity-100 transition-colors"><MoreVertical size={18} /></button>
                            </td>
                          </tr>
                        ))}
                     </tbody>
                   </table>
                 </div>
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { name: 'Semester 1 Lectures', items: 12 },
                  { name: 'Research Papers', items: 5 },
                  { name: 'Exam Prep Drafts', items: 3 },
                ].map((folder, i) => (
                  <div key={i} className="p-8 glass-card space-y-6 group cursor-pointer hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-all border-b-4 border-b-[var(--color-accent)]/[0.1] hover:border-b-[var(--color-accent)]">
                    <div className="w-14 h-14 bg-black/5 dark:bg-white/5 rounded-2xl flex items-center justify-center text-[var(--color-text-secondary)] opacity-30 group-hover:bg-[var(--color-accent)] group-hover:opacity-100 border border-black/5 dark:border-white/5 transition-all">
                      <FolderOpen size={28} />
                    </div>
                    <div>
                      <h4 className="font-black text-lg text-[var(--color-text-primary)] mb-1">{folder.name}</h4>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-secondary)] opacity-40">{folder.items} Document Entities</p>
                    </div>
                    <div className="pt-4 flex items-center gap-2 text-xs font-bold text-[var(--color-accent)] transition-all opacity-0 group-hover:opacity-100">
                      Open Folder <ChevronRight size={14} />
                    </div>
                  </div>
                ))}
                <button className="p-8 border-2 border-dashed border-black/5 dark:border-white/5 rounded-3xl flex flex-col items-center justify-center gap-4 text-[var(--color-text-secondary)] opacity-30 hover:opacity-100 transition-all bg-black/[0.01] dark:bg-white/[0.01]">
                   <Plus size={32} />
                   <span className="text-xs font-black uppercase tracking-widest">Construct New Set</span>
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
