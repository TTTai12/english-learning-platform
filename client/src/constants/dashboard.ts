import { BookOpen, Mic, MessageSquare, Layers, Map } from 'lucide-react';

export const weeklyData = [
  { day: 'T2', minutes: 25, words: 12 },
  { day: 'T3', minutes: 40, words: 20 },
  { day: 'T4', minutes: 15, words: 8 },
  { day: 'T5', minutes: 55, words: 28 },
  { day: 'T6', minutes: 35, words: 17 },
  { day: 'T7', minutes: 60, words: 32 },
  { day: 'CN', minutes: 30, words: 15 },
];

export const quickActions = [
  { path: '/roadmap', icon: Map, label: 'Lộ trình', desc: 'Xem định hướng học tập', color: 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-100/50 dark:border-indigo-900/30', iconColor: 'text-indigo-600 dark:text-indigo-400' },
  { path: '/vocabulary', icon: BookOpen, label: 'Từ vựng', desc: 'Học từ mới hôm nay', color: 'bg-blue-50/50 dark:bg-blue-900/20 border-blue-100/50 dark:border-blue-900/30', iconColor: 'text-blue-600 dark:text-blue-400' },
  { path: '/speaking', icon: Mic, label: 'Luyện nói', desc: 'Cải thiện phát âm', color: 'bg-emerald-50/50 dark:bg-emerald-900/20 border-emerald-100/50 dark:border-emerald-900/30', iconColor: 'text-emerald-600 dark:text-emerald-400' },
  { path: '/conversation', icon: MessageSquare, label: 'Hội thoại', desc: 'Chat với AI', color: 'bg-violet-50/50 dark:bg-violet-900/20 border-violet-100/50 dark:border-violet-900/30', iconColor: 'text-violet-600 dark:text-violet-400' },
  { path: '/flashcards', icon: Layers, label: 'Flashcards', desc: 'Ôn tập nhanh', color: 'bg-amber-50/50 dark:bg-amber-900/20 border-amber-100/50 dark:border-amber-900/30', iconColor: 'text-amber-600 dark:text-amber-400' },
];
