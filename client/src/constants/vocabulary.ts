import type { VocabularyTopic } from '../types';

export const topics: VocabularyTopic[] = [
  { id: 'daily', name: 'Giao tiếp hàng ngày', icon: '💬', wordCount: 150, learnedCount: 87, color: 'bg-blue-500/5 dark:bg-blue-900/10', borderColor: 'border-blue-500/15 dark:border-blue-700/30', iconBg: 'bg-blue-500/10 text-blue-600' },
  { id: 'business', name: 'Công việc & Kinh doanh', icon: '💼', wordCount: 200, learnedCount: 54, color: 'bg-emerald-500/5 dark:bg-emerald-900/10', borderColor: 'border-emerald-500/15 dark:border-emerald-700/30', iconBg: 'bg-emerald-500/10 text-emerald-600' },
  { id: 'travel', name: 'Du lịch', icon: '✈️', wordCount: 120, learnedCount: 95, color: 'bg-purple-500/5 dark:bg-purple-900/10', borderColor: 'border-purple-500/15 dark:border-purple-700/30', iconBg: 'bg-purple-500/10 text-purple-600' },
  { id: 'food', name: 'Ẩm thực', icon: '🍜', wordCount: 100, learnedCount: 41, color: 'bg-amber-500/5 dark:bg-amber-900/10', borderColor: 'border-amber-500/15 dark:border-amber-700/30', iconBg: 'bg-amber-500/10 text-amber-600' },
  { id: 'health', name: 'Sức khỏe & Y tế', icon: '🏥', wordCount: 90, learnedCount: 22, color: 'bg-rose-500/5 dark:bg-rose-900/10', borderColor: 'border-rose-500/15 dark:border-rose-700/30', iconBg: 'bg-rose-500/10 text-rose-600' },
  { id: 'technology', name: 'Công nghệ & IT', icon: '💻', wordCount: 180, learnedCount: 113, color: 'bg-indigo-500/5 dark:bg-indigo-900/10', borderColor: 'border-indigo-500/15 dark:border-indigo-700/30', iconBg: 'bg-indigo-500/10 text-indigo-600' },
];

export const difficultyConfig = {
  easy: { label: 'Dễ', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  medium: { label: 'Trung bình', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  hard: { label: 'Khó', color: 'bg-red-500/10 text-red-600 dark:text-red-400' },
};
