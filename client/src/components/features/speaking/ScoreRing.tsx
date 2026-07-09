interface ScoreRingProps {
  score: number;
}

export function ScoreRing({ score }: ScoreRingProps) {
  const getColors = () => {
    if (score >= 80) return 'border-emerald-500 text-emerald-500 bg-emerald-500/5';
    if (score >= 50) return 'border-amber-500 text-amber-500 bg-amber-500/5';
    return 'border-destructive text-destructive bg-destructive/5';
  };

  return (
    <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center text-xl font-bold ${getColors()}`}>
      {score}%
    </div>
  );
}
