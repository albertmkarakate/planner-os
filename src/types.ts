export type Section = 
  | 'briefing'
  | 'calendar'
  | 'classes'
  | 'wellness'
  | 'productivity'
  | 'finance'
  | 'notes'
  | 'demon_lord'
  | 'knowledge_lab'
  | 'knowledge_graph'
  | 'classroom'
  | 'settings';

export interface StudyGoal {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  class: string;
  status: 'pending' | 'completed';
}

export interface WellnessData {
  sleepHours: number;
  waterIntake: number;
  mood: number; // 1-10
  stress: number; // 1-10
}

export interface SyllabusData {
  className: string;
  semester: string;
  gradingRubric: string;
  schedule: string[];
}
