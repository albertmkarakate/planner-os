import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  BookOpen, 
  HeartPulse, 
  TrendingUp, 
  Wallet, 
  StickyNote,
  ChevronRight,
  Menu,
  X,
  Plus,
  AlertCircle,
  BrainCircuit,
  Settings,
  Route,
  Layers,
  LayoutGrid,
  Sun,
  Moon,
  Search as SearchIcon,
  Bell,
  FlaskConical,
  Network
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Section } from './types';
import BriefingView from './components/BriefingView';
import CalendarView from './components/CalendarView';
import ClassesView from './components/ClassesView';
import WellnessView from './components/WellnessView';
import ProductivityView from './components/ProductivityView';
import FinanceView from './components/FinanceView';
import NotesView from './components/NotesView';
import KnowledgeLab from './components/KnowledgeLab';
import KnowledgeGraphView from './components/KnowledgeGraphView';
import SettingsView from './components/SettingsView';
import OnboardingWizard from './components/OnboardingWizard';
import SearchOverlay from './components/SearchOverlay';

interface NavItem {
  id: Section;
  label: string;
  icon: any;
}

interface NavGroup {
  label: string | null;
  items: NavItem[];
}

export type LearningMode = 'Traditional' | 'Self-Study' | 'Project-Based';

export default function App() {
  const [activeSection, setActiveSection] = useState<Section>('briefing');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>(() => (localStorage.getItem('planner_theme') as any) || 'dark');
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem('planner_accent') || '#9d81ff');
  const [learningMode, setLearningMode] = useState<LearningMode>(() => (localStorage.getItem('planner_learning_mode') as LearningMode) || 'Traditional');
  const [showWizard, setShowWizard] = useState(() => !localStorage.getItem('planner_setup_complete'));
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleThemeChange = () => {
      if (theme === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.className = isDark ? 'dark' : 'light';
      } else {
        document.documentElement.className = theme;
      }
    };
    handleThemeChange();
    localStorage.setItem('planner_theme', theme);

    if (theme === 'system') {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = (e: MediaQueryListEvent) => {
        document.documentElement.className = e.matches ? 'dark' : 'light';
      };
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.setProperty('--color-accent', accentColor);
    localStorage.setItem('planner_accent', accentColor);
  }, [accentColor]);

  const getNavConfig = () => {
    switch (learningMode) {
      case 'Traditional':
        return {
          group: 'Terms & Courses',
          icon: BookOpen,
          calendar: 'Academic Calendar',
          tracker: 'Semesters (1-8)'
        };
      case 'Self-Study':
        return {
          group: 'Learning Paths',
          icon: Route,
          calendar: 'Skill Tree Timeline',
          tracker: 'Mastery Modules'
        };
      case 'Project-Based':
      default:
        return {
          group: 'Workspaces',
          icon: Layers,
          calendar: 'Project Roadmap',
          tracker: 'Sprint Boards'
        };
    }
  };

  const navConfig = getNavConfig();

  const navGroups: NavGroup[] = [
    {
      label: null,
      items: [{ id: 'briefing', label: 'AI Daily Briefing', icon: LayoutDashboard }]
    },
    {
      label: navConfig.group,
      items: [
        { id: 'calendar', label: navConfig.calendar, icon: Calendar },
        { id: 'classes', label: navConfig.tracker, icon: navConfig.icon },
      ]
    },
    {
      label: 'Strategy',
      items: [
        { id: 'wellness', label: 'Wellness Matrix', icon: HeartPulse },
        { id: 'productivity', label: 'Productivity OS', icon: TrendingUp },
        { id: 'finance', label: 'Financial Matrix', icon: Wallet },
      ]
    },
    {
      label: 'Knowledge',
      items: [
        { id: 'notes', label: 'Knowledge Base', icon: StickyNote },
        { id: 'knowledge_lab', label: 'AI Knowledge Lab', icon: FlaskConical },
        { id: 'knowledge_graph', label: 'Neural Graph', icon: Network },
      ]
    }
  ];

  const allItems: NavItem[] = navGroups.reduce((acc, group) => [...acc, ...group.items], [] as NavItem[]);

  const toggleGroup = (label: string) => {
    setCollapsedGroups(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'briefing': return <BriefingView />;
      case 'calendar': return <CalendarView />;
      case 'classes': return <ClassesView learningMode={learningMode} />;
      case 'wellness': return <WellnessView />;
      case 'productivity': return <ProductivityView />;
      case 'finance': return <FinanceView />;
      case 'notes': return <NotesView />;
      case 'knowledge_lab': return <KnowledgeLab />;
      case 'knowledge_graph': return <KnowledgeGraphView onOpenNotebook={(title) => setActiveSection('notes')} />;
      case 'settings': 
        return (
          <SettingsView 
            accentColor={accentColor} 
            onAccentColorChange={setAccentColor}
            theme={theme}
            onThemeChange={setTheme}
            learningMode={learningMode}
            onLearningModeChange={(m) => {
              setLearningMode(m);
              localStorage.setItem('planner_learning_mode', m);
            }}
          />
        );
      default: return <BriefingView />;
    }
  };

  const handleWizardComplete = (data: any) => {
    console.log('Setup Complete:', data);
    setLearningMode(data.mode);
    localStorage.setItem('planner_learning_mode', data.mode);
    localStorage.setItem('planner_setup_complete', 'true');
    setShowWizard(false);
  };

  const handleSearchSelect = (type: string, id: string) => {
    setSearchQuery('');
    switch (type) {
      case 'note': setActiveSection('notes'); break;
      case 'class': setActiveSection('classes'); break;
      case 'event': setActiveSection('calendar'); break;
      case 'task': setActiveSection('productivity'); break;
    }
  };

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  return (
    <div className={`flex h-screen p-5 gap-5 font-sans selection:bg-[var(--color-accent)]/30 selection:text-white transition-colors duration-500`}>
      <div className="mesh-gradient" />
      
      {/* Sidebar - Dynamically Refactored for Smart Nesting */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="relative glass-panel sidebar flex flex-col h-full z-30 overflow-hidden"
      >
        <div className="p-6 flex items-center justify-between border-b border-black/5 dark:border-white/5 h-20">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)] flex items-center justify-center flex-shrink-0 border border-black/10 dark:border-white/10 shadow-lg shadow-[var(--color-accent)]/20">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            {isSidebarOpen && (
              <span className="font-bold tracking-tighter whitespace-nowrap text-lg bg-gradient-to-r from-[var(--color-text-primary)] to-[var(--color-accent)] bg-clip-text text-transparent uppercase tracking-[0.1em]">Planner OS</span>
            )}
          </div>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-colors text-[var(--color-text-primary)]"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-4 overflow-y-auto custom-scrollbar">
          {navGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              {group.label && isSidebarOpen && (
                <button 
                  onClick={() => toggleGroup(group.label!)}
                  className="w-full flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-secondary)] opacity-50 px-3 py-2 hover:opacity-100 transition-opacity"
                >
                  {group.label}
                  <motion.div animate={{ rotate: collapsedGroups[group.label!] ? -90 : 0 }}>
                    <ChevronRight size={10} />
                  </motion.div>
                </button>
              )}
              
              <AnimatePresence initial={false}>
                {(!group.label || !collapsedGroups[group.label!]) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden space-y-1"
                  >
                    {group.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className={`w-full flex items-center gap-3 p-3 transition-all group rounded-[6px] ${
                          activeSection === item.id 
                            ? 'nav-item-active shadow-lg shadow-[var(--color-accent)]/10' 
                            : 'hover:bg-black/5 dark:hover:bg-white/5 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                        }`}
                      >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        {isSidebarOpen && (
                          <span className="font-bold text-[13px] flex-1 text-left tracking-tight">{item.label}</span>
                        )}
                        {isSidebarOpen && activeSection === item.id && (
                          <motion.div layoutId="active-indicator" className="w-1 h-4 bg-white rounded-full" />
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-black/5 dark:border-white/5 space-y-2">
          <button 
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 p-3 rounded-[6px] transition-all hover:bg-black/5 dark:hover:bg-white/5 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            {isSidebarOpen && <span className="font-bold text-[13px] tracking-tight">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
          
          <button 
            onClick={() => setActiveSection('settings')}
            className={`w-full flex items-center gap-3 p-3 rounded-[6px] transition-all ${
              activeSection === 'settings' 
                ? 'nav-item-active' 
                : 'hover:bg-black/5 dark:hover:bg-white/5 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <Settings className="w-5 h-5" />
            {isSidebarOpen && <span className="font-bold text-[13px] tracking-tight">System Settings</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col gap-5 overflow-hidden">
        <header className="flex items-center justify-between p-4 h-20">
          {/* Breadcrumb Titling */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-[var(--color-text-secondary)] mb-1">
              <span>{learningMode === 'Traditional' ? 'Academic Planner' : learningMode === 'Self-Study' ? 'Autodidact OS' : 'Professional Workstream'}</span> 
              <ChevronRight size={10} className="opacity-50" />
              <span className="text-[var(--color-text-primary)]">{allItems.find(n => n.id === activeSection)?.label || 'Settings'}</span>
            </div>
            <h1 className="text-2xl font-black tracking-tighter text-[var(--color-text-primary)] leading-none">Intelligence OS</h1>
          </div>

          <div className="flex items-center gap-6">
             {/* Dynamic Search Bar - 250px per spec */}
             <div className="relative hidden lg:block">
               <SearchIcon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] opacity-50" />
               <input 
                 type="text" 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 placeholder={`Search notes, tasks, or ${learningMode === 'Traditional' ? 'courses' : learningMode === 'Self-Study' ? 'paths' : 'workspaces'}...`}
                 className="w-[250px] bg-black/5 dark:bg-white/5 border-none outline-none rounded-full pl-10 pr-4 py-2.5 text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]/30 focus:ring-1 focus:ring-[var(--color-accent)] transition-all"
               />
               <SearchOverlay 
                 query={searchQuery} 
                 onClose={() => setSearchQuery('')} 
                 onSelect={handleSearchSelect}
               />
             </div>

             {/* Functional Icons */}
             <div className="flex items-center gap-3">
               <button className="relative p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
                 <Bell size={20} />
                 <div className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-[#ef4444] rounded-full border border-[var(--color-bg-main)]" />
               </button>
               
               <div className="hidden md:flex items-center gap-2 px-3 py-1.5 glass-panel bg-[var(--color-accent)]/[0.05] border-[var(--color-accent)]/[0.2] text-[var(--color-accent)] rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg">
                 <div className="w-1.5 h-1.5 rounded-full bg-[#4ade80] shadow-[0_0_8px_#4ade80]" />
                 <span>Sync Active</span>
               </div>
             </div>

             {/* User Avatar - 32x32 per spec */}
             <div className="w-8 h-8 rounded-full bg-[#3498db] ring-2 ring-[var(--color-accent)]/20 overflow-hidden shadow-lg hover:scale-110 transition-all cursor-pointer">
               <img src="https://picsum.photos/seed/student/100/100" alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        <footer className="glass-panel py-3 px-6 flex justify-between items-center text-[10px] text-[var(--color-text-secondary)] font-bold uppercase tracking-widest">
           <div className="flex gap-8">
             <span>Environment: Linux x86_64</span>
             <span>Relational: SQLite Vector</span>
           </div>
           <span className="flex items-center gap-2 text-[#4ade80] font-black">
             <div className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse" /> Architecture Stable
           </span>
        </footer>
      </main>

      <AnimatePresence>
        {showWizard && (
          <OnboardingWizard 
            onComplete={handleWizardComplete}
            onClose={() => setShowWizard(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
