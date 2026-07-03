// client/src/components/features/roadmap/OverallProgress.tsx
import { Target, Map } from 'lucide-react';
import type { RoadmapPhase } from '../../../types';

interface OverallProgressProps {
    overallPct: number;
    totalDone: number;
    totalTasks: number;
    phases: RoadmapPhase[];
    completedTasks: Set<string>;
}

export function OverallProgress({ overallPct, totalDone, totalTasks, phases, completedTasks }: OverallProgressProps) {
    // Hàm phụ trợ tính toán tiến độ chặng con để vẽ các vạch tiến trình nhỏ
    const getPhaseProgressPct = (phase: RoadmapPhase) => {
        const done = phase.tasks.filter((t) => completedTasks.has(t.id)).length;
        return Math.round((done / phase.tasks.length) * 100);
    };

    const getPrevPhaseCompleted = (phaseIndex: number) => {
        if (phaseIndex === 0) return 999;
        const prev = phases[phaseIndex - 1];
        return prev.tasks.filter((t) => completedTasks.has(t.id)).length;
    };

    const isPhaseUnlocked = (phase: RoadmapPhase, idx: number) => {
        if (idx === 0) return true;
        const required = phase.unlockAfter ?? 3;
        return getPrevPhaseCompleted(idx) >= required;
    };

    return (
        <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" />
                    <span className="text-foreground text-sm font-semibold">Tiến độ tổng thể</span>
                </div>
                <span className="text-primary text-sm font-bold">{overallPct}%</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden mb-3">
                <div
                    className="h-full bg-gradient-to-r from-primary via-purple-500 to-pink-500 rounded-full transition-all duration-700"
                    style={{ width: `${overallPct}%` }}
                />
            </div>

            {/* Phase mini indicators */}
            <div className="grid grid-cols-4 gap-2">
                {phases.map((phase, idx) => {
                    const pct = getPhaseProgressPct(phase);
                    const unlocked = isPhaseUnlocked(phase, idx);
                    return (
                        <div key={phase.id} className="text-center">
                            <div className="text-base mb-1">{phase.icon}</div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-1">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${unlocked ? phase.lineColor : 'bg-muted-foreground/20'}`}
                                    style={{ width: unlocked ? `${pct}%` : '0%' }}
                                />
                            </div>
                            <span className="text-muted-foreground" style={{ fontSize: '0.6rem' }}>
                                {unlocked ? `${pct}%` : '🔒 Khóa'}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
