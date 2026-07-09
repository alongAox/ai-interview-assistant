export type ScoreDetail = {
  label: string;
  score: number;
  maxScore?: number;
};

export type ScoreCardProps = {
  title?: string;
  score: number;
  maxScore?: number;
  summary?: string;
  answerPreview?: string;
  strengths?: string;
  weaknesses?: string;
  suggestions?: string;
  details?: ScoreDetail[];
  variant?: "default" | "hero";
};

function formatScore(score: number, maxScore: number) {
  return `${score} / ${maxScore}`;
}

function getScoreLevel(score: number, maxScore: number) {
  const ratio = score / maxScore;

  if (ratio >= 0.8) {
    return {
      label: "优秀",
      ring: "stroke-emerald-500",
      text: "text-emerald-600 dark:text-emerald-400",
      badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
    };
  }

  if (ratio >= 0.6) {
    return {
      label: "良好",
      ring: "stroke-indigo-500",
      text: "text-indigo-600 dark:text-indigo-400",
      badge: "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300",
    };
  }

  if (ratio >= 0.3) {
    return {
      label: "待提升",
      ring: "stroke-amber-500",
      text: "text-amber-600 dark:text-amber-400",
      badge: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
    };
  }

  return {
    label: "不足",
    ring: "stroke-rose-500",
    text: "text-rose-600 dark:text-rose-400",
    badge: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
  };
}

function ScoreRing({
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
        <span className={`text-2xl font-bold tabular-nums ${level.text}`}>
          {score}
        </span>
        <span className="text-[10px] text-slate-400">/{maxScore}</span>
      </div>
    </div>
  );
}

function FeedbackBlock({
  label,
  content,
  tone,
}: {
  label: string;
  content: string;
  tone: "positive" | "negative" | "neutral";
}) {
  const toneClass =
    tone === "positive"
      ? "border-emerald-200/80 bg-emerald-50/70 dark:border-emerald-500/20 dark:bg-emerald-500/5"
      : tone === "negative"
        ? "border-rose-200/80 bg-rose-50/70 dark:border-rose-500/20 dark:bg-rose-500/5"
        : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/50";

  return (
    <div className={`rounded-2xl border px-4 py-3 ${toneClass}`}>
      <p className="text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-slate-300">
        {content}
      </p>
    </div>
  );
}

export default function ScoreCard({
  title = "面试评分",
  score,
  maxScore = 10,
  summary,
  answerPreview,
  strengths,
  weaknesses,
  suggestions,
  details = [],
  variant = "default",
}: ScoreCardProps) {
  const level = getScoreLevel(score, maxScore);
  const isHero = variant === "hero";

  return (
    <section
      className={`overflow-hidden rounded-3xl border shadow-sm backdrop-blur ${
        isHero
          ? "border-indigo-200/80 bg-gradient-to-br from-indigo-50 via-white to-sky-50 dark:border-indigo-500/20 dark:from-indigo-500/10 dark:via-slate-900/80 dark:to-sky-500/5"
          : "border-slate-200/80 bg-white/85 dark:border-slate-800 dark:bg-slate-900/70"
      }`}
    >
      <div className={`p-6 ${isHero ? "sm:p-8" : ""}`}>
        <div className="flex items-start gap-5">
          <ScoreRing score={score} maxScore={maxScore} size={isHero ? 104 : 88} />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2
                className={`font-semibold text-slate-900 dark:text-slate-50 ${isHero ? "text-xl" : "text-lg"}`}
              >
                {title}
              </h2>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${level.badge}`}
              >
                {level.label}
              </span>
            </div>

            {summary && (
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                {summary}
              </p>
            )}

            <p className={`mt-2 text-sm font-medium tabular-nums ${level.text}`}>
              {formatScore(score, maxScore)}
            </p>
          </div>
        </div>

        {answerPreview !== undefined && (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-950/40">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              你的回答
            </p>
            <p
              className={`mt-2 whitespace-pre-wrap text-sm leading-6 ${
                answerPreview === "（未作答）"
                  ? "italic text-slate-400 dark:text-slate-500"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              {answerPreview}
            </p>
          </div>
        )}

        {details.length > 0 && (
          <ul className="mt-6 space-y-3">
            {details.map((item) => {
              const itemMaxScore = item.maxScore ?? maxScore;
              const itemLevel = getScoreLevel(item.score, itemMaxScore);

              return (
                <li
                  key={item.label}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/40"
                >
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    {item.label}
                  </span>
                  <span
                    className={`text-sm font-semibold tabular-nums ${itemLevel.text}`}
                  >
                    {formatScore(item.score, itemMaxScore)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}

        {(strengths || weaknesses || suggestions) && (
          <div className="mt-6 grid gap-3">
            {strengths && (
              <FeedbackBlock label="优点" content={strengths} tone="positive" />
            )}
            {weaknesses && (
              <FeedbackBlock label="不足" content={weaknesses} tone="negative" />
            )}
            {suggestions && (
              <FeedbackBlock
                label="改进建议"
                content={suggestions}
                tone="neutral"
              />
            )}
          </div>
        )}
      </div>
    </section>
  );
}
