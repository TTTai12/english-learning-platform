import { scenarios } from '../../../constants/conversation';
import type { Scenario } from '../../../types';

interface ScenarioSelectorProps {
  onSelect: (scenario: Scenario) => void;
}

export function ScenarioSelector({ onSelect }: ScenarioSelectorProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-foreground text-2xl font-bold tracking-tight">Hội thoại mô phỏng</h2>
        <p className="text-muted-foreground text-sm">Chọn một tình huống để bắt đầu luyện tập chat với AI</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scenarios.map((sc) => (
          <button
            key={sc.id}
            onClick={() => onSelect(sc)}
            className="bg-card border border-border/80 p-5 rounded-2xl text-left transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-4">
              <span className="text-3xl">{sc.icon}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                sc.difficulty === 'Dễ' ? 'bg-emerald-500/10 text-emerald-600' :
                sc.difficulty === 'Trung bình' ? 'bg-amber-500/10 text-amber-600' : 'bg-red-500/10 text-red-600'
              }`}>
                {sc.difficulty}
              </span>
            </div>
            <h3 className="text-foreground font-bold text-sm mb-1 group-hover:text-primary transition-colors">{sc.title}</h3>
            <p className="text-muted-foreground text-xs leading-normal">{sc.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
