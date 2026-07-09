export function getScoreLevel(score: number, maxScore: number) {
  const ratio = score / maxScore;

  if (ratio >= 0.8) {
    return {
      label: "优秀",
      ring: "stroke-emerald-500",
      text: "text-emerald-600 dark:text-emerald-400",
      badge:
        "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
    };
  }

  if (ratio >= 0.6) {
    return {
      label: "良好",
      ring: "stroke-indigo-500",
      text: "text-indigo-600 dark:text-indigo-400",
      badge:
        "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300",
    };
  }

  if (ratio >= 0.3) {
    return {
      label: "待提升",
      ring: "stroke-amber-500",
      text: "text-amber-600 dark:text-amber-400",
      badge:
        "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
    };
  }

  return {
    label: "不足",
    ring: "stroke-rose-500",
    text: "text-rose-600 dark:text-rose-400",
    badge:
      "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
  };
}

export default function ScoreRing({
  score,
  maxScore,
  size = 88,
}: {
  score: number;
  maxScore: number;
  size?: number;
}) {
  const level = getScoreLevel(score, maxScore);
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / maxScore) * circumference;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={6}
          className="stroke-slate-200 dark:stroke-slate-800"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          className={level.ring}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-bold tabular-nums ${level.text} ${size >= 100 ? "text-3xl" : "text-2xl"}`}>
          {score}
        </span>
        <span className="text-[10px] text-slate-400">/{maxScore}</span>
      </div>
    </div>
  );
}
