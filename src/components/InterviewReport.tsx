import ScoreRing, { getScoreLevel } from "@/components/score-ring";
import type { InterviewReportProps } from "@/lib/types/report";
import type { ScoredInterviewItem } from "@/lib/types/score";

function FeedbackBlock({
  label,
  content,
  tone,
}: {
  label: string;
  content: string;
  tone: "positive" | "negative" | "neutral" | "highlight";
}) {
  const toneClass =
    tone === "positive"
      ? "border-emerald-200/70 bg-emerald-50/60 dark:border-emerald-500/20 dark:bg-emerald-500/5"
      : tone === "negative"
        ? "border-rose-200/70 bg-rose-50/60 dark:border-rose-500/20 dark:bg-rose-500/5"
        : tone === "highlight"
          ? "border-indigo-200/70 bg-indigo-50/50 dark:border-indigo-500/20 dark:bg-indigo-500/5"
          : "border-slate-200/80 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-950/40";

  return (
    <div className={`rounded-xl border px-3.5 py-3 ${toneClass}`}>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-1.5 whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-slate-300">
        {content}
      </p>
    </div>
  );
}

function splitPoints(text: string) {
  return text
    .split("\n")
    .map((line) => line.replace(/^[•\-]\s*/, "").trim())
    .filter(Boolean);
}

function InsightList({
  title,
  content,
  dotClass,
}: {
  title: string;
  content: string;
  dotClass: string;
}) {
  const points = splitPoints(content);

  return (
    <div className="py-5 first:pt-0">
      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
        {title}
      </h4>
      <ul className="mt-3 space-y-2.5">
        {points.map((point, index) => (
          <li
            key={`${title}-${index}`}
            className="flex gap-3 text-sm leading-6 text-slate-600 dark:text-slate-300"
          >
            <span
              className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${dotClass}`}
            />
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function OverallSection({ report }: { report: InterviewReportProps["report"] }) {
  return (
    <section className="border-b border-slate-200/80 px-6 py-6 sm:px-8 dark:border-slate-800">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
        总体评价
      </h3>

      <figure className="mt-5">
        <figcaption className="text-xs text-slate-400">一句话总结</figcaption>
        <blockquote className="mt-2 border-l-[3px] border-indigo-400 pl-4 text-[15px] leading-7 text-slate-700 dark:border-indigo-500 dark:text-slate-200">
          {report.summary}
        </blockquote>
      </figure>

      <div className="mt-2 divide-y divide-slate-100 dark:divide-slate-800">
        <InsightList
          title="优势"
          content={report.strengths}
          dotClass="bg-emerald-500"
        />
        <InsightList
          title="不足"
          content={report.weaknesses}
          dotClass="bg-rose-400"
        />
        <InsightList
          title="学习建议"
          content={report.suggestions}
          dotClass="bg-indigo-400"
        />
      </div>
    </section>
  );
}

function QuestionReview({
  item,
  maxScore,
  defaultOpen,
}: {
  item: ScoredInterviewItem;
  maxScore: number;
  defaultOpen?: boolean;
}) {
  const level = getScoreLevel(item.score, maxScore);
  const answerText = item.answer.trim() ? item.answer : "（未作答）";
  const isEmpty = answerText === "（未作答）";

  return (
    <details
      open={defaultOpen}
      className="group rounded-2xl border border-slate-200/80 bg-white/60 transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950/30 dark:hover:border-slate-700"
    >
      <summary className="flex cursor-pointer list-none items-center gap-4 px-4 py-4 sm:px-5 [&::-webkit-details-marker]:hidden">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {item.index + 1}
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
            {item.question}
          </p>
          <p className="mt-0.5 text-xs text-slate-400">
            {isEmpty ? "未作答" : "已作答"}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${level.badge}`}
          >
            {level.label}
          </span>
          <span className={`text-sm font-bold tabular-nums ${level.text}`}>
            {item.score}
            <span className="text-xs font-normal text-slate-400">
              /{maxScore}
            </span>
          </span>
          <svg
            className="h-4 w-4 text-slate-400 transition group-open:rotate-180"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </summary>

      <div className="space-y-3 border-t border-slate-200/80 px-4 pb-4 pt-3 sm:px-5 dark:border-slate-800">
        <div className="rounded-xl bg-slate-50/80 px-3.5 py-3 dark:bg-slate-900/50">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            题目
          </p>
          <p className="mt-1.5 text-sm leading-6 text-slate-700 dark:text-slate-300">
            {item.question}
          </p>
        </div>

        <div className="rounded-xl border border-dashed border-slate-200 bg-white/70 px-3.5 py-3 dark:border-slate-700 dark:bg-slate-950/30">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            你的回答
          </p>
          <p
            className={`mt-1.5 whitespace-pre-wrap text-sm leading-6 ${
              isEmpty
                ? "italic text-slate-400 dark:text-slate-500"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            {answerText}
          </p>
        </div>

        <div className="grid gap-2.5">
          {item.strengths && (
            <FeedbackBlock label="优点" content={item.strengths} tone="positive" />
          )}
          {item.weaknesses && (
            <FeedbackBlock
              label="不足"
              content={item.weaknesses}
              tone="negative"
            />
          )}
          {item.suggestions && (
            <FeedbackBlock
              label="改进建议"
              content={item.suggestions}
              tone="neutral"
            />
          )}
        </div>
      </div>
    </details>
  );
}

/** 纯展示组件：综合报告 + 分题评阅，不包含 AI 请求或数据持久化逻辑 */
export default function InterviewReport({
  report,
  items = [],
  maxScore = 10,
}: InterviewReportProps) {
  const overallScore =
    typeof report.overallScore === "number" && !Number.isNaN(report.overallScore)
      ? report.overallScore
      : 0;
  const safeReport = {
    overallScore,
    summary: report.summary?.trim() || "暂无总结",
    strengths: report.strengths?.trim() || "暂无数据",
    weaknesses: report.weaknesses?.trim() || "暂无数据",
    suggestions: report.suggestions?.trim() || "暂无数据",
  };
  const safeItems = Array.isArray(items) ? items : [];
  const level = getScoreLevel(safeReport.overallScore, maxScore);
  const answeredCount = safeItems.filter((item) => item.answer?.trim()).length;

  return (
    <article
      id="interview-report"
      className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80"
    >
      <header className="border-b border-slate-200/80 bg-gradient-to-br from-indigo-50 via-white to-sky-50 px-6 py-7 dark:border-slate-800 dark:from-indigo-500/10 dark:via-slate-900 dark:to-sky-500/5 sm:px-8 sm:py-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <ScoreRing
            score={safeReport.overallScore}
            maxScore={maxScore}
            size={112}
          />

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-300">
              Interview Report
            </p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-50">
              面试报告
            </h2>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${level.badge}`}
              >
                综合 {level.label}
              </span>
              {safeItems.length > 0 && (
                <>
                  <span className="rounded-full bg-white/80 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    共 {safeItems.length} 题
                  </span>
                  <span className="rounded-full bg-white/80 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    已作答 {answeredCount} 题
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <OverallSection report={safeReport} />

      {safeItems.length > 0 && (
        <div className="p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
              分题评阅
            </h3>
            <p className="text-xs text-slate-400">点击展开查看详情</p>
          </div>

          <div className="space-y-2.5">
            {safeItems.map((item, index) => (
              <QuestionReview
                key={`${item.index}-${item.question}`}
                item={item}
                maxScore={maxScore}
                defaultOpen={index === 0}
              />
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
