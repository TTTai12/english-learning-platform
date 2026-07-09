import { RotateCcw, CheckCircle, XCircle } from 'lucide-react';

interface SessionResultProps {
  knownCount: number;
  unknownCount: number;
  totalCards: number;
  onReset: () => void;
  onNewExtract: () => void;
}

export function SessionResult({
  knownCount,
  unknownCount,
  totalCards,
  onReset,
  onNewExtract,
}: SessionResultProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-8 text-center space-y-5 shadow-xs">
      <div className="text-5xl">🎉</div>
      <div className="space-y-1">
        <h3 className="text-foreground text-lg font-bold">Hoàn thành phiên ôn tập!</h3>
        <p className="text-muted-foreground text-sm">
          Bạn đã thuộc lòng <strong className="text-emerald-500 font-bold">{knownCount}</strong> / {totalCards} thuật ngữ.
        </p>
      </div>

      <div className="flex justify-center gap-3 text-xs font-semibold">
        <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-500/10 px-4 py-2 rounded-xl">
          <CheckCircle className="w-4 h-4" />
          <span>{knownCount} Từ đã thuộc</span>
        </div>
        <div className="flex items-center gap-1.5 text-destructive bg-destructive/10 px-4 py-2 rounded-xl">
          <XCircle className="w-4 h-4" />
          <span>{unknownCount} Từ cần xem lại</span>
        </div>
      </div>

      <div className="flex justify-center gap-3 pt-3 border-t border-border">
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-all text-sm font-semibold cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          Học lại bộ này
        </button>
        <button
          onClick={onNewExtract}
          className="px-5 py-2.5 bg-muted text-foreground border border-border rounded-xl hover:bg-accent transition-all text-sm font-semibold cursor-pointer"
        >
          Trích xuất văn bản mới
        </button>
      </div>
    </div>
  );
}
