import { getScoreLevel } from "@/components/score-ring";
import type { InterviewHistoryItem } from "@/lib/history";

export type InterviewHistoryCardProps = {
  item: InterviewHistoryItem;
  maxScore?: number;
  onViewDetail?: (id: string) => void;
};

function formatHistoryDate(iso: string) {
  return new Date(iso).toLocaleString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** 面试历史记录卡片（纯展示，不请求数据库） */
export default function InterviewHistoryCard({
  item,
  maxScore = 10,
  onViewDetail,
}: InterviewHistoryCardProps) {
  const { overallScore, summary } = item.report;
  const level = getScoreLevel(overallScore, maxScore);

  return (
    <article className="rounded-3xl border border-slate-200/80 bg-white/85 p-5 shadow-sm backdrop-blur transition hover:border-indigo-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/70 dark:hover:border-indigo-500/30">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
            日期
          </p>
          <time
            dateTime={item.createdAt}
            className="mt-1 block text-sm font-medium text-slate-900 dark:text-slate-100"
          >
            {formatHistoryDate(item.createdAt)}
          </time>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Score
          </p>
          <div className="mt-1 flex items-center justify-end gap-2">
            <span
              className={`text-lg font-bold tabular-nums ${level.text}`}
            >
              {overallScore}
            </span>
            <span className="text-sm text-slate-400 dark:text-slate-500">
              / {maxScore}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${level.badge}`}
            >
              {level.label}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
          Summary
        </p>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
          {summary}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onViewDetail?.(item.id)}
        className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-2xl border border-indigo-200 bg-indigo-50 px-4 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/20"
      >
        View Detail
      </button>
    </article>
  );
}
