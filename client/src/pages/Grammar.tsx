import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Timer, RefreshCw, History, CheckCircle2, TrendingUp,
    Volume2, Copy, Check, ChevronDown, ChevronUp, Loader2
} from 'lucide-react';
import { fetchGrammarTopics } from '../services/grammar';

// Định nghĩa kiểu dữ liệu cho Mẫu câu
interface Example {
    english: string;
    vietnamese: string;
}

interface Pattern {
    name: string;
    formula: string;
    examples: Example[];
}

interface GrammarTopic {
    id: string;
    title: string;
    description: string;
    icon: string;
    color: string;
    patterns: Pattern[];
}

// Bản đồ ánh xạ tên icon từ DB sang Lucide Icons
const iconMap: Record<string, React.ComponentType<any>> = {
    Timer,
    RefreshCw,
    History,
    CheckCircle2,
    TrendingUp,
};

// Cấu hình màu sắc đồng bộ động theo từng Thì
const colorConfigs: Record<string, { bg: string; border: string; hover: string; iconBg: string; text: string }> = {
    blue: {
        bg: 'bg-blue-500/5 dark:bg-blue-900/10',
        border: 'border-blue-500/15 dark:border-blue-700/30',
        hover: 'hover:border-blue-500/30',
        iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
        text: 'text-blue-600 dark:text-blue-400'
    },
    emerald: {
        bg: 'bg-emerald-500/5 dark:bg-emerald-900/10',
        border: 'border-emerald-500/15 dark:border-emerald-700/30',
        hover: 'hover:border-emerald-500/30',
        iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        text: 'text-emerald-600 dark:text-emerald-400'
    },
    purple: {
        bg: 'bg-purple-500/5 dark:bg-purple-900/10',
        border: 'border-purple-500/15 dark:border-purple-700/30',
        hover: 'hover:border-purple-500/30',
        iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
        text: 'text-purple-600 dark:text-purple-400'
    },
    amber: {
        bg: 'bg-amber-500/5 dark:bg-amber-900/10',
        border: 'border-amber-500/15 dark:border-amber-700/30',
        hover: 'hover:border-amber-500/30',
        iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
        text: 'text-amber-600 dark:text-amber-400'
    },
    rose: {
        bg: 'bg-rose-500/5 dark:bg-rose-900/10',
        border: 'border-rose-500/15 dark:border-rose-700/30',
        hover: 'hover:border-rose-500/30',
        iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
        text: 'text-rose-600 dark:text-rose-400'
    }
};

export default function GrammarPage() {
    const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
    const [copiedText, setCopiedText] = useState<string | null>(null);

    // 1. Gọi useQuery để lấy danh sách từ fetchGrammarTopics
    // TODO: Sử dụng useQuery với key là ['grammar'] và queryFn là fetchGrammarTopics, ép kiểu dữ liệu là <GrammarTopic[]>
    const { data: topics = [], isLoading } = useQuery<GrammarTopic[]>({
        queryKey: ['grammar'],
        queryFn: fetchGrammarTopics,
    });

    // Phát âm câu ví dụ bằng Web Speech API
    const speak = (text: string) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.85;
        window.speechSynthesis.speak(utterance);
    };

    // Copy câu ví dụ vào clipboard
    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedText(text);
        setTimeout(() => setCopiedText(null), 2000);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-muted-foreground text-sm font-medium">Đang tải kiến thức ngữ pháp...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* HEADER */}
            <div>
                <h2 className="text-foreground text-2xl font-bold tracking-tight mb-1">Mẫu câu theo Thì</h2>
                <p className="text-muted-foreground text-sm font-medium">Nắm vững 5 thì phổ biến trong giao tiếp tiếng Anh hàng ngày</p>
            </div>

            {/* DANH SÁCH ACCORDION CÁC THÌ */}
            <div className="space-y-4">
                {topics.map((topic) => {
                    const isExpanded = activeTopicId === topic.id;
                    const config = colorConfigs[topic.color] || colorConfigs.blue;
                    const IconComponent = iconMap[topic.icon] || Timer;

                    return (
                        <div
                            key={topic.id}
                            className={`border rounded-2xl overflow-hidden transition-all duration-300 ${config.border} ${isExpanded ? 'bg-card shadow-md' : `${config.bg} ${config.hover}`
                                }`}
                        >
                            {/* ACCORDION HEADER (Click để mở rộng/thu nhỏ) */}
                            <button
                                onClick={() => setActiveTopicId(isExpanded ? null : topic.id)}
                                className="w-full flex items-center justify-between p-5 text-left cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl ${config.iconBg} flex items-center justify-center shrink-0`}>
                                        <IconComponent className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-foreground font-bold text-base leading-tight">{topic.title}</h3>
                                        <p className="text-muted-foreground text-xs font-medium mt-0.5">{topic.description}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className="bg-muted text-muted-foreground text-[10px] font-bold px-2 py-0.5 rounded-md border border-border">
                                        {topic.patterns.length} mẫu
                                    </span>
                                    {isExpanded ? (
                                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                    )}
                                </div>
                            </button>

                            {/* ACCORDION DETAILED BODY (Chỉ hiển thị khi expanded) */}
                            {isExpanded && (
                                <div className="border-t border-border bg-muted/20 p-5 space-y-6 animate-in fade-in duration-300">
                                    {topic.patterns.map((pattern, idx) => (
                                        <div key={idx} className="space-y-4">
                                            {/* Tiêu đề & Công thức mẫu */}
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-card border border-border rounded-xl p-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-lg text-[10px] font-bold">
                                                        Công thức
                                                    </span>
                                                    <span className="text-foreground text-sm font-mono font-bold tracking-wide">
                                                        {pattern.formula}
                                                    </span>
                                                </div>
                                                <span className="text-muted-foreground text-xs font-bold sm:self-center">
                                                    {pattern.name}
                                                </span>
                                            </div>

                                            {/* Danh sách các ví dụ */}
                                            <div className="space-y-3 pl-3">
                                                {pattern.examples.map((example, eIdx) => (
                                                    <div key={eIdx} className="flex items-start gap-3 group/item">
                                                        <span className={`text-sm mt-1 shrink-0 ${config.text}`}>⚡</span>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-foreground text-sm font-semibold tracking-wide">
                                                                {example.english}
                                                            </p>
                                                            <p className="text-muted-foreground text-xs mt-0.5">
                                                                {example.vietnamese}
                                                            </p>
                                                        </div>

                                                        {/* Các nút Hành động: Phát âm & Copy (Ẩn mặc định, hiện khi hover hoặc trên mobile) */}
                                                        <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => speak(example.english)}
                                                                className="p-1.5 hover:bg-accent rounded-lg text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                                                                title="Nghe phát âm"
                                                            >
                                                                <Volume2 className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleCopy(example.english)}
                                                                className="p-1.5 hover:bg-accent rounded-lg text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                                                                title="Sao chép câu"
                                                            >
                                                                {copiedText === example.english ? (
                                                                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                                                                ) : (
                                                                    <Copy className="w-3.5 h-3.5" />
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Đường gạch ngang phân chia các mẫu (trừ mẫu cuối) */}
                                            {idx < topic.patterns.length - 1 && (
                                                <hr className="border-border/60" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
