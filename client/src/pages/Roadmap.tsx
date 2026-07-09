// client/src/pages/Roadmap.tsx
import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Lock, Map } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import confetti from 'canvas-confetti';

import { phases, tagColors } from '../constants/roadmap';
import { OverallProgress } from '../components/features/roadmap/OverallProgress';
import { TaskItem } from '../components/features/roadmap/TaskItem';
import type { RoadmapPhase } from '../types';

export default function RoadmapPage() {
    const token = useAuthStore((state) => state.token);
    const navigate = useNavigate();

    // Gọi API lấy dữ liệu tiến độ thực tế từ Database
    const { data, isLoading } = useQuery<{ completedTaskIds: string[] }>({
        queryKey: ['roadmap-progress'],
        queryFn: async () => {
            const res = await fetch('http://localhost:5000/api/roadmap', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Không thể tải tiến độ lộ trình');
            return res.json();
        },
        enabled: !!token,
    });

    const completedTasks = new Set<string>(data?.completedTaskIds || []);
    const [expandedPhases, setExpandedPhases] = useState<Set<string>>(() => new Set(['phase-1']));

    // Hiệu ứng pháo hoa
    useEffect(() => {
        if (data?.completedTaskIds && data.completedTaskIds.length > 0 && data.completedTaskIds.length % 5 === 0) {
            confetti({ particleCount: 80, spread: 65, origin: { y: 0.5 } });
        }
    }, [data?.completedTaskIds]);

    const togglePhase = (phaseId: string) => {
        setExpandedPhases((prev) => {
            const next = new Set(prev);
            if (next.has(phaseId)) next.delete(phaseId);
            else next.add(phaseId);
            return next;
        });
    };

    const getPhaseProgress = (phase: RoadmapPhase) => {
        const done = phase.tasks.filter((t) => completedTasks.has(t.id)).length;
        return { done, total: phase.tasks.length, pct: Math.round((done / phase.tasks.length) * 100) };
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

    const totalTasks = phases.reduce((s, p) => s + p.tasks.length, 0);
    const totalDone = completedTasks.size;
    const overallPct = Math.round((totalDone / totalTasks) * 100);

    const currentPhaseIdx = phases.findIndex((p, idx) => {
        const { done, total } = getPhaseProgress(p);
        return done < total && isPhaseUnlocked(p, idx);
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12 text-muted-foreground text-sm">
                Đang tải lộ trình học tập từ Database...
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-foreground text-2xl font-bold tracking-tight mb-1">Lộ trình học tập</h2>
                    <p className="text-muted-foreground text-sm">
                        Hành trình từ người mới bắt đầu đến giao tiếp lưu loát — đồng bộ tiến độ thực tế từ Database
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-primary/5 border border-primary/10 rounded-xl px-3 py-2 shrink-0">
                    <Map className="w-4 h-4 text-primary" />
                    <span className="text-primary text-xs font-semibold">
                        {totalDone}/{totalTasks} hoàn thành
                    </span>
                </div>
            </div>

            {/* Render component tiến trình tổng thể */}
            <OverallProgress
                overallPct={overallPct}
                totalDone={totalDone}
                totalTasks={totalTasks}
                phases={phases}
                completedTasks={completedTasks}
            />

            {/* Phase Cards */}
            <div className="relative">
                <div className="absolute left-7 top-8 bottom-8 w-0.5 bg-gradient-to-b from-emerald-300 via-blue-300 via-purple-300 to-amber-300 opacity-30 hidden md:block" />

                <div className="space-y-4">
                    {phases.map((phase, phaseIdx) => {
                        const { done, total, pct } = getPhaseProgress(phase);
                        const isExpanded = expandedPhases.has(phase.id);
                        const unlocked = isPhaseUnlocked(phase, phaseIdx);
                        const isCurrent = phaseIdx === currentPhaseIdx;
                        const isComplete = done === total;

                        return (
                            <div key={phase.id} className="relative">
                                <button
                                    onClick={() => unlocked && togglePhase(phase.id)}
                                    disabled={!unlocked}
                                    className={`w-full text-left rounded-2xl border p-5 transition-all duration-200 ${unlocked
                                            ? `${phase.color} ${phase.borderColor} hover:shadow-md hover:-translate-y-0.5 cursor-pointer`
                                            : 'bg-muted/30 border-border opacity-60 cursor-not-allowed'
                                        } ${isCurrent && unlocked ? 'ring-2 ring-primary/30 ring-offset-2' : ''}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="relative shrink-0">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${unlocked ? 'bg-white dark:bg-card shadow-sm border border-border' : 'bg-muted'}`} style={{ fontSize: '1.75rem' }}>
                                                {unlocked ? phase.icon : '🔒'}
                                            </div>
                                            <div className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-white ${isComplete ? 'bg-emerald-50' : unlocked ? 'bg-primary' : 'bg-muted-foreground/40'}`} style={{ fontSize: '0.55rem', fontWeight: 700 }}>
                                                {isComplete ? '✓' : phase.number}
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                                <h3 className="text-foreground text-base font-semibold">
                                                    Giai đoạn {phase.number} — {phase.title}
                                                </h3>
                                                {isCurrent && unlocked && (
                                                    <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded-full" style={{ fontSize: '0.6rem', fontWeight: 600 }}>
                                                        ĐANG HỌC
                                                    </span>
                                                )}
                                                {isComplete && (
                                                    <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 px-2 py-0.5 rounded-full" style={{ fontSize: '0.6rem', fontWeight: 600 }}>
                                                        ✓ HOÀN THÀNH
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-muted-foreground text-xs mb-2">{phase.subtitle}</p>

                                            {unlocked && (
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1 h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                                                        <div className={`h-full rounded-full transition-all duration-500 ${phase.lineColor}`} style={{ width: `${pct}%` }} />
                                                    </div>
                                                    <span className="text-muted-foreground shrink-0 text-xs">{done}/{total} nhiệm vụ</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col items-end gap-1 shrink-0">
                                            <span className="text-muted-foreground text-xs">{phase.duration}</span>
                                            {unlocked && <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />}
                                            {!unlocked && (
                                                <div className="text-center">
                                                    <Lock className="w-4 h-4 text-muted-foreground mx-auto" />
                                                    <span className="text-muted-foreground" style={{ fontSize: '0.6rem' }}>Cần {phase.unlockAfter} nhiệm vụ GĐ{phaseIdx}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </button>

                                {isExpanded && unlocked && (
                                    <div className="mt-2 ml-0 md:ml-8 space-y-2">
                                        {phase.tasks.map((task) => (
                                            <TaskItem
                                                key={task.id}
                                                task={task}
                                                isDone={completedTasks.has(task.id)}
                                                tagColor={tagColors[task.tag || ''] || 'bg-muted text-muted-foreground'}
                                                onNavigate={(section) => navigate('/' + section)}
                                            />
                                        ))}

                                        <div className={`${phase.color} ${phase.borderColor} border rounded-xl px-4 py-3 flex items-center justify-between`}>
                                            <span className="text-foreground text-xs font-medium">Tổng XP Giai đoạn {phase.number}</span>
                                            <span className="text-amber-600 dark:text-amber-400 text-sm font-bold">{phase.tasks.reduce((s, t) => s + t.xpReward, 0)} XP</span>
                                        </div>

                                        {phaseIdx < phases.length - 1 && (
                                            <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-xl">
                                                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                                                <p className="text-muted-foreground text-xs">
                                                    Hoàn thành <strong>{phases[phaseIdx + 1].unlockAfter ?? 3} nhiệm vụ</strong> để mở khóa Giai đoạn {phase.number + 1} — {phases[phaseIdx + 1].title}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
