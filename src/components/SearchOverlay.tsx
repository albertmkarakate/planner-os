import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  StickyNote, 
  Book, 
  Calendar, 
  CheckSquare, 
  Search as SearchIcon,
  Tag,
  Clock,
  ExternalLink,
  Command
} from 'lucide-react';

interface SearchResult {
  id: string;
  type: 'note' | 'class' | 'event' | 'task';
  title: string;
  subtitle?: string;
  tags?: string[];
  date?: string;
  className?: string;
  content?: string;
}

interface SearchOverlayProps {
  query: string;
  onClose: () => void;
  onSelect: (type: string, id: string) => void;
}

export default function SearchOverlay({ query, onClose, onSelect }: SearchOverlayProps) {
  const results = useMemo(() => {
    if (!query || query.length < 2) return [];

    const lowerQuery = query.toLowerCase();
    
    // Simple command parsing
    const hasTagFilter = lowerQuery.includes('tag:');
    const hasClassFilter = lowerQuery.includes('class:') || lowerQuery.includes('in:');
    const hasDateFilter = lowerQuery.includes('date:');

    const extractFilter = (prefix: string) => {
      const parts = lowerQuery.split(prefix);
      if (parts.length > 1) {
        return parts[1].split(' ')[0].trim();
      }
      return null;
    };

    const tagFilter = extractFilter('tag:');
    const classFilter = extractFilter('class:') || extractFilter('in:');
    const dateFilter = extractFilter('date:');
    const cleanQuery = lowerQuery
      .replace(/tag:\S+/, '')
      .replace(/class:\S+/, '')
      .replace(/in:\S+/, '')
      .replace(/date:\S+/, '')
      .trim();

    // Data Sources
    const notes = JSON.parse(localStorage.getItem('knowledge_notes') || '[]');
    const classes = JSON.parse(localStorage.getItem('planner_classes') || '[]');
    const events = JSON.parse(localStorage.getItem('calendar_events') || '[]');
    const tasks = JSON.parse(localStorage.getItem('planner_tasks') || '[]');

    const allItems: SearchResult[] = [
      ...notes.map((n: any) => ({
        id: n.id,
        type: 'note',
        title: n.title,
        content: n.content,
        // Mock tags for notes if they don't exist
        tags: n.content?.match(/#\w+/g)?.map((t: string) => t.slice(1)) || []
      } as SearchResult)),
      ...classes.map((c: any) => ({
        id: c.id,
        type: 'class',
        title: c.name,
        subtitle: c.semester
      } as SearchResult)),
      ...events.map((e: any) => ({
        id: e.id,
        type: 'event',
        title: e.title,
        date: e.date,
        className: e.className,
        tags: [e.type]
      } as SearchResult)),
      ...tasks.map((t: any) => ({
        id: t.id,
        type: 'task',
        title: t.title,
        subtitle: t.status,
        tags: t.tags
      } as SearchResult))
    ];

    return allItems.filter(item => {
      let matches = true;

      if (tagFilter) {
        matches = matches && (item.tags?.some(t => t.toLowerCase().includes(tagFilter)) || item.content?.toLowerCase().includes(`#${tagFilter}`));
      }

      if (classFilter) {
        matches = matches && (
          item.className?.toLowerCase().includes(classFilter) || 
          item.title.toLowerCase().includes(classFilter) ||
          (item.type === 'note' && item.content?.toLowerCase().includes(classFilter))
        );
      }

      if (dateFilter) {
        matches = matches && item.date?.includes(dateFilter);
      }

      if (cleanQuery) {
        matches = matches && (
          item.title.toLowerCase().includes(cleanQuery) || 
          (item.subtitle?.toLowerCase().includes(cleanQuery)) ||
          (item.content?.toLowerCase().includes(cleanQuery))
        );
      }

      return matches;
    }).slice(0, 8); // Limit to top 8 results
  }, [query]);

  if (!query || results.length === 0) return null;

  return (
    <div className="absolute top-full left-0 w-[400px] mt-4 z-50">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card shadow-2xl p-2 border-black/10 dark:border-white/10 overflow-hidden"
      >
        <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5 mb-2">
          <Command size={12} className="text-[var(--color-text-secondary)]" />
          <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)]">Search Intelligence Results</span>
        </div>

        <div className="space-y-1">
          {results.map((result) => (
            <button
              key={result.type + result.id}
              onClick={() => onSelect(result.type, result.id)}
              className="w-full flex items-center gap-4 p-3 rounded-[6px] hover:bg-white/5 transition-all text-left group"
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                result.type === 'note' ? 'bg-amber-500/10 text-amber-500' :
                result.type === 'class' ? 'bg-blue-500/10 text-blue-500' :
                result.type === 'event' ? 'bg-purple-500/10 text-purple-500' :
                'bg-green-500/10 text-green-500'
              }`}>
                {result.type === 'note' && <StickyNote size={18} />}
                {result.type === 'class' && <Book size={18} />}
                {result.type === 'event' && <Calendar size={18} />}
                {result.type === 'task' && <CheckSquare size={18} />}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-[var(--color-text-primary)] truncate">{result.title}</h4>
                <div className="flex items-center gap-3 text-[10px] text-[var(--color-text-secondary)] opacity-50 font-medium">
                  <span className="capitalize">{result.type}</span>
                  {result.date && <span className="flex items-center gap-1"><Clock size={10} /> {result.date}</span>}
                  {result.subtitle && <span className="truncate">{result.subtitle}</span>}
                </div>
              </div>

              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <ExternalLink size={14} className="text-[var(--color-accent)]" />
              </div>
            </button>
          ))}
        </div>

        <div className="mt-2 p-3 bg-white/5 rounded-lg border border-white/5">
          <div className="flex items-center gap-3">
             <div className="flex gap-1.5 overflow-hidden">
               {['tag:', 'class:', 'date:'].map(filter => (
                 <span key={filter} className="px-2 py-0.5 bg-black/20 rounded font-mono text-[9px] text-[var(--color-text-secondary)] animate-pulse">
                   {filter}
                 </span>
               ))}
             </div>
             <span className="text-[9px] font-bold text-[var(--color-text-secondary)] italic">Try advanced filters...</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
