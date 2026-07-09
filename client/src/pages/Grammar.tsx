import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Timer, RefreshCw, History, CheckCircle2, TrendingUp,
  ChevronDown, ChevronUp, Loader2
} from 'lucide-react';
import { fetchGrammarTopics } from '../services/grammar';
import { colorConfigs } from '../constants/grammar';
import { FormulaCard } from '../components/features/grammar/FormulaCard';

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

const iconMap: Record<string, React.ComponentType<any>> = {
  Timer,
  RefreshCw,
  History,
  CheckCircle2,
  TrendingUp,
};

export default function GrammarPage() {
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const { data: topics = [], isLoading } = useQuery<GrammarTopic[]>({
    queryKey: ['grammar'],
    queryFn: fetchGrammarTopics,
  });

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

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
      <div>
        <h2 className="text-foreground text-2xl font-bold tracking-tight mb-1">Mẫu câu theo Thì</h2>
        <p className="text-muted-foreground text-sm font-medium">Nắm vững 5 thì phổ biến trong giao tiếp tiếng Anh hàng ngày</p>
      </div>

      <div className="space-y-4">
        {topics.map((topic) => {
          const isExpanded = activeTopicId === topic.id;
          const config = colorConfigs[topic.color] || colorConfigs.blue;
          const IconComponent = iconMap[topic.icon] || Timer;

          return (
            <div
              key={topic.id}
              className={`border rounded-2xl overflow-hidden transition-all duration-300 ${config.border} ${
                isExpanded ? 'bg-card shadow-md' : `${config.bg} ${config.hover}`
              }`}
            >
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

              {isExpanded && (
                <div className="border-t border-border bg-muted/20 p-5 space-y-6 animate-in fade-in duration-300">
                  {topic.patterns.map((pattern, idx) => (
                    <FormulaCard
                      key={idx}
                      pattern={pattern}
                      config={config}
                      speak={speak}
                      handleCopy={handleCopy}
                      copiedText={copiedText}
                      isLast={idx === topic.patterns.length - 1}
                    />
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
