import { Volume2, Copy, Check } from 'lucide-react';

interface Example {
  english: string;
  vietnamese: string;
}

interface Pattern {
  name: string;
  formula: string;
  examples: Example[];
}

interface FormulaCardProps {
  pattern: Pattern;
  config: { bg: string; border: string; hover: string; iconBg: string; text: string };
  speak: (text: string) => void;
  handleCopy: (text: string) => void;
  copiedText: string | null;
  isLast: boolean;
}

export function FormulaCard({
  pattern,
  config,
  speak,
  handleCopy,
  copiedText,
  isLast,
}: FormulaCardProps) {
  return (
    <div className="space-y-4">
      {/* Tiêu đề & Công thức mẫu */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2">
          <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-lg text-[10px] font-bold select-none">
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
            <span className={`text-sm mt-1 shrink-0 ${config.text} select-none`}>⚡</span>
            <div className="flex-1 min-w-0">
              <p className="text-foreground text-sm font-semibold tracking-wide">
                {example.english}
              </p>
              <p className="text-muted-foreground text-xs mt-0.5">
                {example.vietnamese}
              </p>
            </div>

            {/* Các nút Hành động: Phát âm & Copy */}
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
      {!isLast && <hr className="border-border/60" />}
    </div>
  );
}
