import { Search } from 'lucide-react';
import type { VocabularyTopic } from '../../../types';
import { TopicCard } from './TopicCard';

interface TopicListProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filteredTopics: VocabularyTopic[];
  onSelectTopic: (topic: VocabularyTopic) => void;
}

export function TopicList({
  searchQuery,
  setSearchQuery,
  filteredTopics,
  onSelectTopic,
}: TopicListProps) {
  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Tìm kiếm chủ đề..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-card border border-border text-foreground rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-xs"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTopics.map((topic) => (
          <TopicCard
            key={topic.id}
            topic={topic}
            onClick={() => onSelectTopic(topic)}
          />
        ))}
      </div>
    </div>
  );
}
