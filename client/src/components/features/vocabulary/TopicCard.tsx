import type { VocabularyTopic } from '../../../types';

interface TopicCardProps {
  topic: VocabularyTopic;
  onClick: () => void;
}

export function TopicCard({ topic, onClick }: TopicCardProps) {
  const percent = Math.round((topic.learnedCount / topic.wordCount) * 100);

  return (
    <button
      onClick={onClick}
      className={`${topic.color} ${topic.borderColor} border rounded-2xl p-5 text-left transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer group`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 ${topic.iconBg} rounded-xl flex items-center justify-center text-xl border border-border/10 shadow-xs`}>
          {topic.icon}
        </div>
        <span className="text-muted-foreground text-xs font-semibold">{topic.wordCount} từ</span>
      </div>

      <h3 className="text-foreground font-bold text-sm mb-1 group-hover:text-primary transition-colors">{topic.name}</h3>
      <p className="text-muted-foreground text-xs font-medium mb-4">{topic.learnedCount}/{topic.wordCount} đã học</p>

      <div className="space-y-1.5">
        <div className="h-1.5 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="text-primary text-[11px] font-bold">{percent}% hoàn thành</p>
      </div>
    </button>
  );
}
