// client/src/components/features/roadmap/TaskItem.tsx
import { CheckCircle2, Circle, Zap, ArrowRight } from 'lucide-react';
import type { RoadmapTask } from '../../../types';

interface TaskItemProps {
    task: RoadmapTask;
    isDone: boolean;
    tagColor: string;
    onNavigate: (section: string) => void;
}

export function TaskItem({ task, isDone, tagColor, onNavigate }: TaskItemProps) {
    return (
        <div
            className={`bg-card border rounded-xl p-4 transition-all duration-200 group ${isDone
                    ? 'border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/50 dark:bg-emerald-900/10'
                    : 'border-border hover:border-primary/30 hover:shadow-sm'
                }`}
        >
            <div className="flex items-start gap-3">
                {/* Checkbox Icon */}
                <div className="mt-0.5 shrink-0">
                    {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                        <Circle className="w-5 h-5 text-muted-foreground" />
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap mb-1">
                        <p className={`text-sm font-medium ${isDone ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                            {task.label}
                        </p>
                        <div className="flex items-center gap-1.5 shrink-0">
                            {task.tag && (
                                <span className={`px-2 py-0.5 rounded-full ${tagColor}`} style={{ fontSize: '0.6rem', fontWeight: 600 }}>
                                    {task.tag}
                                </span>
                            )}
                            <span className="flex items-center gap-0.5 text-amber-600 dark:text-amber-400" style={{ fontSize: '0.65rem', fontWeight: 600 }}>
                                <Zap className="w-2.5 h-2.5" />
                                {task.xpReward} XP
                            </span>
                        </div>
                    </div>
                    <p className="text-muted-foreground text-xs">{task.desc}</p>
                </div>

                {/* Nút chuyển đến phân hệ để học */}
                {task.section && !isDone && (
                    <button
                        onClick={() => onNavigate(task.section!)}
                        className="shrink-0 flex items-center gap-1 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-indigo-600 text-xs font-semibold cursor-pointer"
                    >
                        Bắt đầu
                        <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>
        </div>
    );
}
