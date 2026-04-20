import React, { useState } from "react";
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
  Star,
  Sparkles,
  Link as LinkIcon,
  Globe,
  Youtube,
  Trash2,
  Network,
  Database,
  FilePlus,
  Settings2,
} from "lucide-react";
import {
  processSyllabusHybrid,
  generateStudyGoals,
  processStudyMaterials,
} from "../lib/gemini";
import { motion, AnimatePresence } from "motion/react";
import { EmptyState } from "./ui/EmptyState";

const CLASSES = [
  { id: "1", name: "Biology 101", semester: "Semester 1", color: "#FF6321" },
  { id: "2", name: "Advanced Math", semester: "Semester 1", color: "#141414" },
  { id: "3", name: "History of Art", semester: "Semester 1", color: "#3B82F6" },
];

interface ClassesViewProps {
  learningMode: 'Traditional' | 'Self-Study' | 'Project-Based';
}

export default function ClassesView({ learningMode }: ClassesViewProps) {
  const getLabels = () => {
    switch (learningMode) {
      case 'Traditional':
        return {
          portfolio: 'Academic Portfolio',
          parent: 'Semester',
          module: 'Course',
          action: 'Incorporate Course',
          repository: 'Course Material Repository',
          annex: 'Annex New Resource',
          burnup: 'Semester Burnup',
          burnupDesc: 'major milestones for this semester'
        };
      case 'Self-Study':
        return {
          portfolio: 'Learning Matrix',
          parent: 'Path',
          module: 'Pathway',
          action: 'Initialize Pathway',
          repository: 'Material Database',
          annex: 'Queue Asset',
          burnup: 'Path Progress',
          burnupDesc: 'mastery milestones for this path'
        };
      case 'Project-Based':
      default:
        return {
          portfolio: 'Workstream Matrix',
          parent: 'Sprint',
          module: 'Workspace',
          action: 'Spin up Workspace',
          repository: 'Asset Pipeline',
          annex: 'Ingest Deliverable',
          burnup: 'Sprint Velocity',
          burnupDesc: 'deliverables for this sprint'
        };
    }
  };

  const labels = getLabels();

  const [classes, setClasses] = useState<any[]>(() => {
    const saved = localStorage.getItem("planner_classes");
    if (saved) return JSON.parse(saved);
    return CLASSES;
  });
  const [selectedClass, setSelectedClass] = useState<any>(classes[0]);
  const [activeTab, setActiveTab] = useState<
    "overview" | "assignments" | "notes"
  >("overview");
  const [isUploading, setIsUploading] = useState(false);
  const [ragResult, setRagResult] = useState<any>(null);
  const [showIngestModal, setShowIngestModal] = useState(false);
  const [ingestionQueue, setIngestionQueue] = useState<
    { type: "text" | "link" | "file"; content: string; label: string }[]
  >([]);
  const [ingestInput, setIngestInput] = useState("");
  const [ingestType, setIngestType] = useState<"text" | "link">("text");
  const [ingestLabel, setIngestLabel] = useState("");

  const [showClassModal, setShowClassModal] = useState(false);
  const [editingClass, setEditingClass] = useState<any>(null);
  const [classForm, setClassForm] = useState({
    name: "",
    semester: "",
    color: "#3B82F6",
  });

  React.useEffect(() => {
    localStorage.setItem("planner_classes", JSON.stringify(classes));
  }, [classes]);

  const openClassModal = (cls: any = null) => {
    if (cls) {
      setEditingClass(cls);
      setClassForm({ name: cls.name, semester: cls.semester, color: cls.color });
    } else {
      setEditingClass(null);
      setClassForm({ name: "", semester: `${labels.parent} 1`, color: "#3B82F6" });
    }
    setShowClassModal(true);
  };

  const handleSaveClass = () => {
    if (!classForm.name.trim()) return;
    if (editingClass) {
      const updated = classes.map((c) =>
        c.id === editingClass.id ? { ...c, ...classForm } : c,
      );
      setClasses(updated);
      if (selectedClass.id === editingClass.id) {
        setSelectedClass({ ...selectedClass, ...classForm });
      }
    } else {
      const newClass = {
        id: Date.now().toString(),
        ...classForm,
      };
      setClasses([...classes, newClass]);
      setSelectedClass(newClass);
    }
    setShowClassModal(false);
  };

  const handleDeleteClass = (id: string) => {
    const filtered = classes.filter((c) => c.id !== id);
    setClasses(filtered);
    if (selectedClass.id === id && filtered.length > 0) {
      setSelectedClass(filtered[0]);
    }
    setShowClassModal(false);
  };

  // Study Goals logic
  const [studyGoals, setStudyGoals] = useState<Record<string, string[]>>(() => {
    const saved = localStorage.getItem("studyGoals");
    if (saved) return JSON.parse(saved);
    return {
      "1": [
        "Master mitosis vs meiosis",
        "Review lab 3 results",
        "Complete pre-lab reading",
      ],
      "2": [
        "Perfect chain rule derivation",
        "Finish worksheet 4",
        "Prepare for Friday quiz",
      ],
      "3": ["Read primary source on Baroque Art", "Outline final essay"],
    };
  });

  React.useEffect(() => {
    localStorage.setItem("studyGoals", JSON.stringify(studyGoals));
  }, [studyGoals]);

  const [newGoalInput, setNewGoalInput] = useState("");
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [editingGoalIndex, setEditingGoalIndex] = useState<number | null>(null);

  const handleAiGenerateGoals = async () => {
    setIsAiGenerating(true);
    const goals = await generateStudyGoals(
      selectedClass.name,
      ragResult?.managerNote,
    );
    if (goals && goals.length > 0) {
      setStudyGoals((prev) => ({
        ...prev,
        [selectedClass.id]: [...(prev[selectedClass.id] || []), ...goals],
      }));
    }
    setIsAiGenerating(false);
  };

  const handleAiSuggestSingleGoal = async () => {
    setIsAiGenerating(true);
    const context = ragResult ? JSON.stringify(ragResult) : undefined;
    const goals = await generateStudyGoals(selectedClass.name, context);
    if (goals && goals.length > 0) {
      setNewGoalInput(goals[0]);
    }
    setIsAiGenerating(false);
  };

  const saveGoal = () => {
    if (!newGoalInput.trim()) return;
    if (editingGoalIndex !== null) {
      setStudyGoals((prev) => ({
        ...prev,
        [selectedClass.id]: prev[selectedClass.id].map((g, i) =>
          i === editingGoalIndex ? newGoalInput.trim() : g,
        ),
      }));
      setEditingGoalIndex(null);
    } else {
      setStudyGoals((prev) => ({
        ...prev,
        [selectedClass.id]: [
          ...(prev[selectedClass.id] || []),
          newGoalInput.trim(),
        ],
      }));
    }
    setNewGoalInput("");
  };

  const startEditingGoal = (index: number) => {
    setEditingGoalIndex(index);
    setNewGoalInput(studyGoals[selectedClass.id][index]);
  };

  const removeGoal = (index: number) => {
    setStudyGoals((prev) => ({
      ...prev,
      [selectedClass.id]: prev[selectedClass.id].filter((_, i) => i !== index),
    }));
  };

  const currentGoals = studyGoals[selectedClass.id] || [];

  const handleSyllabusUpload = async () => {
    setIsUploading(true);
    const mockSyllabus =
      "Course: Biology 101. Major Exam April 20th. Grading: 40% Final, 20% Lab, 40% Exams.";
    const result = await processSyllabusHybrid(mockSyllabus);
    setRagResult(result);
    setIsUploading(false);
    setActiveTab("overview");
  };

  const addToQueue = () => {
    if (!ingestInput.trim()) return;
    setIngestionQueue((prev) => [
      ...prev,
      {
        type: ingestType,
        content: ingestInput,
        label:
          ingestLabel || (ingestType === "link" ? ingestInput : "Text Snippet"),
      },
    ]);
    setIngestInput("");
    setIngestLabel("");
  };

  const removeFromQueue = (idx: number) => {
    setIngestionQueue((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleIngestMaterials = async () => {
    if (ingestionQueue.length === 0) return;
    setIsUploading(true);
    const result = await processStudyMaterials(ingestionQueue);
    if (result) {
      setRagResult({
        ...ragResult,
        managerNote: result.managerNote,
        notebook: result.notebook,
        mindMap: result.mindMap,
      });
      setIngestionQueue([]);
      setShowIngestModal(false);
    }
    setIsUploading(false);
  };

  const exportToNotebooks = () => {
    if (!ragResult || !ragResult.notebook) return;
    const savedNotes = localStorage.getItem("knowledge_notes");
    const notes = savedNotes ? JSON.parse(savedNotes) : [];
    const newNote = {
      id: Date.now().toString(),
      title: `${selectedClass.name}: ${ragResult.notebook.title || "Synthesized Knowledge"}`,
      date: "Just Now",
      content: ragResult.notebook.concepts
        .map((c: any) => `## ${c.tag}\n${c.summary}`)
        .join("\n\n"),
    };
    localStorage.setItem("knowledge_notes", JSON.stringify([newNote, ...notes]));
    alert("Knowledge capsule synthesized and exported to Notebooks.");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-10">
      {/* Master: Sidebar List */}
      <div className="md:col-span-1 space-y-6">
        <div className="flex items-center justify-between ml-2">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
            {labels.portfolio}
          </h2>
          <button
            onClick={() => openClassModal()}
            className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[var(--color-accent)] transition-all"
          >
            <Plus size={14} />
          </button>
        </div>
        <div className="space-y-3">
          {classes.map((cls) => (
            <div
              key={cls.id}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedClass(cls)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  setSelectedClass(cls);
                }
              }}
              className={`group w-full p-5 rounded-[6px] flex items-center justify-between transition-all border cursor-pointer select-none ${
                selectedClass.id === cls.id
                  ? "bg-white/10 dark:bg-white/10 border-black/10 dark:border-white/20 text-[var(--color-text-primary)] shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-md"
                  : "bg-transparent border-transparent hover:bg-black/5 dark:hover:bg-white/5 text-[var(--color-text-secondary)]"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{
                    backgroundColor: `${cls.color}20`,
                    color: cls.color,
                  }}
                >
                  <Book size={20} />
                </div>
                <div className="text-left font-sans text-ellipsis overflow-hidden">
                  <p className="font-bold text-sm tracking-tight truncate max-w-[120px]">
                    {cls.name}
                  </p>
                  <p className="text-[10px] text-[var(--color-text-secondary)] opacity-50 uppercase font-black tracking-tighter">
                    {cls.semester.replace('Semester', labels.parent).replace('Path', labels.parent).replace('Sprint', labels.parent)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openClassModal(cls);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-2 text-white/20 hover:text-white transition-all"
                >
                  <Settings2 size={14} />
                </button>
                <ChevronRight
                  size={14}
                  className={`transition-transform ${selectedClass.id === cls.id ? "translate-x-0" : "-translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"}`}
                />
              </div>
            </div>
          ))}
          <button
            onClick={() => openClassModal()}
            className="w-full p-5 rounded-[6px] border border-dashed border-black/10 dark:border-white/5 hover:border-black/20 dark:hover:border-white/20 flex items-center justify-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
          >
            <Plus size={18} />{" "}
            <span className="text-sm font-bold">{labels.action}</span>
          </button>
        </div>

        {/* Global Progress Mini Widget */}
        <div className="p-6 glass-card bg-[var(--color-accent)]/[0.05] border-[var(--color-accent)]/[0.1] space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-accent)]">
              {labels.burnup}
            </span>
            <span className="text-xs font-bold text-[var(--color-text-primary)]">
              64%
            </span>
          </div>
          <div className="h-1 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
            <div className="h-full w-[64%] bg-[var(--color-accent)] rounded-full shadow-[0_0_8px_var(--color-accent)]" />
          </div>
          <p className="text-[10px] text-[var(--color-text-secondary)] italic leading-tight">
            "You've completed 4 of 7 {labels.burnupDesc}."
          </p>
        </div>
      </div>

      {/* Detail: Content Area */}
      <div className="md:col-span-3 space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="font-bold text-5xl tracking-tighter text-[var(--color-text-primary)]">
                {selectedClass.name}
              </h2>
              <Star size={20} className="text-amber-400 fill-amber-400" />
            </div>
            <p className="text-[var(--color-text-secondary)] text-sm font-medium">
              Integrated Curriculum & Resource Mapping
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-2xl gap-1 border border-black/5 dark:border-white/5 backdrop-blur-xl">
              {[
                { id: "overview", label: "Overview", icon: Brain },
                {
                  id: "assignments",
                  label: "Assignments",
                  icon: ClipboardList,
                },
                { id: "notes", label: "Lectures", icon: FolderOpen },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-[6px] text-xs font-bold transition-all ${
                    activeTab === tab.id
                      ? "nav-item-active text-white"
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-black/5 dark:hover:bg-white/5"
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
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* RAG Syllabus Reader Section */}
                <div className="p-8 glass-card space-y-6 min-h-[500px] relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-2 h-full bg-[var(--color-accent)]/[0.2]" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[var(--color-text-secondary)]">
                      <FileText size={22} />
                      <h3 className="text-xs font-black uppercase tracking-[0.2em]">
                        Intelligence Curator
                      </h3>
                    </div>
                    <button
                      onClick={handleSyllabusUpload}
                      disabled={isUploading}
                      className="p-2.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-[6px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all shadow-sm"
                    >
                      {isUploading ? (
                        <div className="w-4 h-4 border-2 border-[var(--color-text-secondary)] border-t-[var(--color-accent)] rounded-full animate-spin" />
                      ) : (
                        <Plus size={18} />
                      )}
                    </button>
                  </div>

                  {ragResult ? (
                    <div className="space-y-8">
                      <div className="p-5 bg-[var(--color-accent)]/[0.1] border border-[var(--color-accent)]/[0.2] rounded-2xl">
                        <p className="text-[10px] font-black uppercase text-[var(--color-accent)] mb-2 tracking-widest">
                          Architect's Summary
                        </p>
                        <p className="text-sm text-[var(--color-text-primary)] font-medium italic leading-relaxed">
                          "{ragResult.managerNote}"
                        </p>
                      </div>

                      {ragResult.mindMap && (
                        <div className="p-6 bg-black/10 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5 space-y-4">
                          <div className="flex items-center gap-2 text-[var(--color-accent)]">
                            <Network size={16} />
                            <h4 className="text-[10px] font-black uppercase tracking-widest">
                              Mind Map Visualization
                            </h4>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {ragResult.mindMap.nodes?.map((node: any) => (
                              <div
                                key={node.id}
                                className="px-3 py-1.5 bg-black/20 dark:bg-white/10 rounded-full text-[10px] font-bold text-white/70 border border-white/5 flex items-center gap-2"
                              >
                                <div className="w-1 h-1 rounded-full bg-[var(--color-accent)]" />
                                {node.label}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="space-y-4">
                        <p className="text-[10px] font-black uppercase text-[var(--color-text-secondary)] tracking-widest">
                          Academic Strategy
                        </p>
                        <div className="grid gap-3">
                          {ragResult.keyDeadlines?.map((d: any, i: number) => (
                            <div
                              key={i}
                              className="flex items-center justify-between p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5 group hover:bg-black/[0.08] dark:hover:bg-white/[0.08] transition-all"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] shadow-[0_0_8px_var(--color-accent)]" />
                                <span className="text-sm font-bold text-[var(--color-text-primary)]">
                                  {d.title}
                                </span>
                              </div>
                              <span className="text-[10px] font-mono bg-black/10 dark:bg-white/10 text-[var(--color-text-secondary)] px-2 py-1 rounded-lg border border-black/10 dark:border-white/10">
                                {d.date}
                              </span>
                            </div>
                          ))}
                          {ragResult.notebook?.concepts?.map((c: any, i: number) => (
                            <div
                              key={i}
                              className="p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5 space-y-2"
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#4ade80]" />
                                <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">
                                  {c.tag}
                                </span>
                              </div>
                              <p className="text-xs text-white/70 font-medium leading-relaxed">
                                {c.summary}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <button
                          onClick={() => setShowIngestModal(true)}
                          className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                        >
                          <Plus size={14} /> Feed More Intelligence
                        </button>

                        {ragResult && ragResult.notebook && (
                          <button
                            onClick={exportToNotebooks}
                            className="w-full py-4 bg-[var(--color-accent)]/[0.1] border border-[var(--color-accent)]/[0.2] rounded-2xl text-[10px] font-black uppercase tracking-widest text-[var(--color-accent)] hover:bg-[var(--color-accent)]/[0.15] transition-all flex items-center justify-center gap-2"
                          >
                            <FilePlus size={14} /> Export to Notebook Capsules
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <EmptyState
                      icon={Upload}
                      title="Intelligent Curriculum OS"
                      description="Inject your syllabus, PDFs, lecture transcripts or web links. The RAG engine will synthesize a master strategy map across your semester."
                      actionLabel="Open Ingestion Matrix"
                      onAction={() => setShowIngestModal(true)}
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
                        <h3 className="text-xs font-black uppercase tracking-widest text-[var(--color-accent)]">
                          Proactive Tutor
                        </h3>
                      </div>
                      <p className="text-2xl leading-tight font-black tracking-tight">
                        "I've identified that questions on cellular respiration
                        appear in 35% of previous papers."
                      </p>
                      <div className="flex gap-3 pt-2">
                        <button className="flex-1 py-4 bg-[var(--color-text-primary)] text-[var(--color-bg-main)] hover:opacity-90 transition-all rounded-[6px] text-xs font-black uppercase tracking-widest shadow-xl">
                          Synthesize Plan
                        </button>
                        <button className="p-4 bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 transition-colors rounded-[6px] border border-black/10 dark:border-white/10 backdrop-blur-md">
                          <MessageSquare size={20} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Study Objectives & Micro-Quests */}
                  <div className="p-8 glass-card space-y-6 text-[var(--color-text-primary)]">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black uppercase tracking-widest text-[var(--color-text-secondary)]">
                        Study Objectives
                      </h3>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={handleAiGenerateGoals}
                          disabled={isAiGenerating}
                          className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest border border-[var(--color-accent)]/[0.2] px-2.5 py-1 rounded-full text-[var(--color-accent)] hover:bg-[var(--color-accent)]/[0.05] transition-all disabled:opacity-50"
                        >
                          {isAiGenerating ? (
                            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Sparkles size={12} />
                          )}
                          AI Bulk
                        </button>
                        <span className="text-[10px] font-bold text-[var(--color-accent)]">
                          {currentGoals.length} Active
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {currentGoals.map((goal, i) => (
                        <div
                          key={i}
                          className={`flex items-center justify-between p-4 bg-black/5 dark:bg-white/5 rounded-2xl border transition-all group ${editingGoalIndex === i ? "border-[var(--color-accent)]" : "border-black/5 dark:border-white/5 hover:border-[var(--color-accent)]/[0.3]"}`}
                        >
                          <div
                            className="flex items-center gap-3 flex-1 cursor-pointer"
                            onClick={() => startEditingGoal(i)}
                          >
                            <div className="w-5 h-5 rounded-md border border-[var(--color-accent)]/[0.3] flex items-center justify-center text-[var(--color-accent)] group-hover:bg-[var(--color-accent)] group-hover:text-white transition-all">
                              <div className="w-1.5 h-1.5 rounded-full bg-current" />
                            </div>
                            <span className="text-sm font-bold text-[var(--color-text-primary)]">
                              {goal}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => removeGoal(i)}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-all font-bold"
                            >
                              <Plus size={14} className="rotate-45" />
                            </button>
                          </div>
                        </div>
                      ))}

                      <div className="flex gap-2 pt-2">
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            value={newGoalInput}
                            onChange={(e) => setNewGoalInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && saveGoal()}
                            placeholder="Define milestone..."
                            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/5 rounded-[6px] px-4 py-2 pr-10 text-xs font-bold focus:border-[var(--color-accent)] transition-all outline-none"
                          />
                          <button
                            onClick={handleAiSuggestSingleGoal}
                            disabled={isAiGenerating}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-accent)] hover:scale-110 transition-all disabled:opacity-30"
                            title="AI Suggest"
                          >
                            {isAiGenerating ? (
                              <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Sparkles size={14} />
                            )}
                          </button>
                        </div>
                        <button
                          onClick={saveGoal}
                          className="p-3 bg-[var(--color-accent)] text-white rounded-[6px] hover:opacity-90 transition-all font-bold"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 glass-card space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black uppercase tracking-widest text-[var(--color-text-secondary)]">
                        {labels.repository}
                      </h3>
                      <span className="text-[10px] font-bold text-[var(--color-text-secondary)] opacity-30">
                        3 Items
                      </span>
                    </div>
                    <div className="space-y-4">
                      {[
                        "Lec_01_Basics.pdf",
                        "Lab_Guidelines.docx",
                        "Reference_List.epub",
                      ].map((f, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between group cursor-pointer p-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-black/5 dark:bg-white/5 rounded-xl flex items-center justify-center text-[var(--color-text-secondary)] opacity-50 group-hover:opacity-100 transition-all border border-black/5 dark:border-white/5">
                              <FileText size={20} />
                            </div>
                            <span className="text-sm font-bold text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors">
                              {f}
                            </span>
                          </div>
                          <Plus
                            size={16}
                            className="text-[var(--color-text-secondary)] opacity-10 group-hover:opacity-100 transition-all"
                          />
                        </div>
                      ))}
                    </div>
                    <button className="w-full py-4 border-2 border-dashed border-black/5 dark:border-white/5 rounded-[6px] text-[var(--color-text-secondary)] opacity-30 text-xs font-black uppercase tracking-widest hover:opacity-100 transition-all">
                      {labels.annex}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "assignments" && (
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
                        {
                          title: "Laboratory Refraction Lab",
                          status: "In Review",
                          weight: "15%",
                          due: "Tomorrow",
                        },
                        {
                          title: "Unit 2 Assessment",
                          status: "Open",
                          weight: "20%",
                          due: "Apr 24",
                        },
                        {
                          title: "Semester Term Paper",
                          status: "Blocked",
                          weight: "40%",
                          due: "May 12",
                        },
                      ].map((a, i) => (
                        <tr
                          key={i}
                          className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors group"
                        >
                          <td className="px-8 py-6 font-bold text-sm text-[var(--color-text-primary)]">
                            {a.title}
                          </td>
                          <td className="px-8 py-6">
                            <span
                              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest 
                                 ${
                                   a.status === "In Review"
                                     ? "bg-amber-500/10 text-amber-600 dark:text-amber-500 border border-amber-500/20"
                                     : a.status === "Open"
                                       ? "bg-blue-500/10 text-blue-600 dark:text-blue-500 border border-blue-500/20"
                                       : "bg-[var(--color-text-secondary)]/[0.1] text-[var(--color-text-secondary)] border border-[var(--color-text-secondary)]/[0.2]"
                                 }`}
                            >
                              {a.status}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-sm font-mono text-[var(--color-text-secondary)]">
                            {a.weight}
                          </td>
                          <td className="px-8 py-6 text-xs text-[var(--color-text-secondary)] opacity-50 font-bold">
                            {a.due}
                          </td>
                          <td className="px-8 py-6">
                            <button className="p-2 text-[var(--color-text-secondary)] opacity-30 hover:opacity-100 transition-colors">
                              <MoreVertical size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "notes" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { name: `${labels.parent} 1 Lectures`, items: 12 },
                  { name: "Research Papers", items: 5 },
                  { name: "Exam Prep Drafts", items: 3 },
                ].map((folder, i) => (
                  <div
                    key={i}
                    className="p-8 glass-card space-y-6 group cursor-pointer hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-all border-b-4 border-b-[var(--color-accent)]/[0.1] hover:border-b-[var(--color-accent)]"
                  >
                    <div className="w-14 h-14 bg-black/5 dark:bg-white/5 rounded-2xl flex items-center justify-center text-[var(--color-text-secondary)] opacity-30 group-hover:bg-[var(--color-accent)] group-hover:opacity-100 border border-black/5 dark:border-white/5 transition-all">
                      <FolderOpen size={28} />
                    </div>
                    <div>
                      <h4 className="font-black text-lg text-[var(--color-text-primary)] mb-1">
                        {folder.name}
                      </h4>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-secondary)] opacity-40">
                        {folder.items} Document Entities
                      </p>
                    </div>
                    <div className="pt-4 flex items-center gap-2 text-xs font-bold text-[var(--color-accent)] transition-all opacity-0 group-hover:opacity-100">
                      Open Folder <ChevronRight size={14} />
                    </div>
                  </div>
                ))}
                <button className="p-8 border-2 border-dashed border-black/5 dark:border-white/5 rounded-3xl flex flex-col items-center justify-center gap-4 text-[var(--color-text-secondary)] opacity-30 hover:opacity-100 transition-all bg-black/[0.01] dark:bg-white/[0.01]">
                  <Plus size={32} />
                  <span className="text-xs font-black uppercase tracking-widest">
                    Construct New Set
                  </span>
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {showClassModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-md bg-[#0f0f12] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-accent)]/10 flex items-center justify-center text-[var(--color-accent)]">
                    <Book size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg leading-none">
                      {editingClass ? "Refactor Module" : "New Curriculum Node"}
                    </h3>
                    <p className="text-[10px] font-black uppercase text-white/30 tracking-widest mt-1">
                      Academic Database Config
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowClassModal(false)}
                  className="p-2 hover:bg-white/5 rounded-lg transition-all text-white/40 hover:text-white"
                >
                  <Plus className="rotate-45" size={24} />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-white/30 tracking-widest">
                    Module Designation
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Psychology 101"
                    value={classForm.name}
                    onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white outline-none focus:border-[var(--color-accent)] transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-white/30 tracking-widest">
                    Temporal Period
                  </label>
                  <select
                    value={classForm.semester}
                    onChange={(e) => setClassForm({ ...classForm, semester: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white outline-none focus:border-[var(--color-accent)] transition-all appearance-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={`Semester ${s}`} className="bg-[#0f0f12]">
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-white/30 tracking-widest">
                    Neural Color Code
                  </label>
                  <div className="flex gap-3">
                    {["#FF6321", "#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#141414"].map(
                      (c) => (
                        <button
                          key={c}
                          onClick={() => setClassForm({ ...classForm, color: c })}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            classForm.color === c ? "border-white scale-110 shadow-lg" : "border-transparent opacity-50 hover:opacity-100"
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      )
                    )}
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-white/5 bg-black/20 flex gap-3">
                {editingClass && (
                  <button
                    onClick={() => handleDeleteClass(editingClass.id)}
                    className="p-4 bg-red-500/10 text-red-500 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex-1"
                  >
                    Delete Node
                  </button>
                )}
                <button
                  onClick={handleSaveClass}
                  className="p-4 bg-[var(--color-accent)] text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[var(--color-accent)]/20 hover:scale-[1.02] active:scale-95 transition-all flex-[2]"
                >
                  {editingClass ? "Commit Changes" : "Initialize Module"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showClassModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-md bg-[#0f0f12] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-accent)]/10 flex items-center justify-center text-[var(--color-accent)]">
                    <Book size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg leading-none">
                      {editingClass ? "Refactor Module" : "New Curriculum Node"}
                    </h3>
                    <p className="text-[10px] font-black uppercase text-white/30 tracking-widest mt-1">
                      Academic Database Config
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowClassModal(false)}
                  className="p-2 hover:bg-white/5 rounded-lg transition-all text-white/40 hover:text-white"
                >
                  <Plus className="rotate-45" size={24} />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-white/30 tracking-widest">
                    Module Designation
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Psychology 101"
                    value={classForm.name}
                    onChange={(e) =>
                      setClassForm({ ...classForm, name: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white outline-none focus:border-[var(--color-accent)] transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-white/30 tracking-widest">
                    Temporal Period
                  </label>
                  <select
                    value={classForm.semester}
                    onChange={(e) =>
                      setClassForm({ ...classForm, semester: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white outline-none focus:border-[var(--color-accent)] transition-all appearance-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option
                        key={s}
                        value={`Semester ${s}`}
                        className="bg-[#0f0f12]"
                      >
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-white/30 tracking-widest">
                    Neural Color Code
                  </label>
                  <div className="flex gap-3">
                    {[
                      "#FF6321",
                      "#3B82F6",
                      "#10B981",
                      "#8B5CF6",
                      "#F59E0B",
                      "#141414",
                    ].map((c) => (
                      <button
                        key={c}
                        onClick={() => setClassForm({ ...classForm, color: c })}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          classForm.color === c
                            ? "border-white scale-110 shadow-lg"
                            : "border-transparent opacity-50 hover:opacity-100"
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-white/5 bg-black/20 flex gap-3">
                {editingClass && (
                  <button
                    onClick={() => handleDeleteClass(editingClass.id)}
                    className="p-4 bg-red-500/10 text-red-500 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex-1"
                  >
                    Delete Node
                  </button>
                )}
                <button
                  onClick={handleSaveClass}
                  className="p-4 bg-[var(--color-accent)] text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[var(--color-accent)]/20 hover:scale-[1.02] active:scale-95 transition-all flex-[2]"
                >
                  {editingClass ? "Commit Changes" : "Initialize Module"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showIngestModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-2xl bg-[#0f0f12] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-accent)]/10 flex items-center justify-center text-[var(--color-accent)]">
                    <Database size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg leading-none">
                      Ingestion Matrix
                    </h3>
                    <p className="text-[10px] font-black uppercase text-white/30 tracking-widest mt-1">
                      Resource Extraction Protocol
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowIngestModal(false)}
                  className="p-2 hover:bg-white/5 rounded-lg transition-all text-white/40 hover:text-white"
                >
                  <Plus className="rotate-45" size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: "text", label: "Manual Transcript", icon: FileText },
                    { id: "link", label: "Web/External Link", icon: Globe },
                    { id: "file", label: "Local PDF/Asset", icon: Plus },
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setIngestType(type.id as any)}
                      className={`p-4 rounded-xl border transition-all flex items-center gap-3 ${
                        ingestType === type.id
                          ? "bg-[var(--color-accent)]/10 border-[var(--color-accent)] text-white"
                          : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10"
                      }`}
                    >
                      <type.icon size={18} />
                      <span className="text-xs font-bold">{type.label}</span>
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-white/30 tracking-widest">
                      Resource Identifier
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Week 4 Lecture Notes..."
                      value={ingestLabel}
                      onChange={(e) => setIngestLabel(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white outline-none focus:border-[var(--color-accent)] transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-white/30 tracking-widest">
                      Payload Data
                    </label>
                    <textarea
                      placeholder={
                        ingestType === "link"
                          ? "Paste HTTPS resource URL here..."
                          : "Paste raw transcript or notes here..."
                      }
                      value={ingestInput}
                      onChange={(e) => setIngestInput(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white outline-none focus:border-[var(--color-accent)] transition-all h-32 resize-none"
                    />
                    <button
                      onClick={addToQueue}
                      className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all"
                    >
                      Add to Ingestion Queue
                    </button>
                  </div>
                </div>

                {ingestionQueue.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-black uppercase text-white/30 tracking-widest">
                        Payload Queue
                      </h4>
                      <span className="text-[10px] font-mono text-[var(--color-accent)]">
                        {ingestionQueue.length} Active Node(s)
                      </span>
                    </div>
                    <div className="space-y-2">
                      {ingestionQueue.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl"
                        >
                          <div className="flex items-center gap-3">
                            {item.type === "link" ? (
                              <LinkIcon size={14} className="text-blue-400" />
                            ) : (
                              <FileText size={14} className="text-[#9d81ff]" />
                            )}
                            <span className="text-xs font-bold text-white/70">
                              {item.label}
                            </span>
                          </div>
                          <button
                            onClick={() => removeFromQueue(idx)}
                            className="text-red-500/40 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-8 border-t border-white/5 bg-black/20">
                <button
                  onClick={handleIngestMaterials}
                  disabled={isUploading || ingestionQueue.length === 0}
                  className="w-full py-5 bg-[var(--color-accent)] text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[var(--color-accent)]/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 disabled:scale-100 flex items-center justify-center gap-3"
                >
                  {isUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Initializing RAG Engine...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} /> Process Intelligence Payload
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
