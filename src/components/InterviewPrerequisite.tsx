import Link from "next/link";

/** 未完成简历分析时，引导用户先上传简历 */
export default function InterviewPrerequisite() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-lg flex-col justify-center px-4 py-16 sm:px-6">
      <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-8 text-center shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-2xl dark:bg-indigo-500/10">
          📄
        </div>
        <h1 className="mt-5 text-xl font-bold text-slate-900 dark:text-slate-50">
          请先完成简历分析
        </h1>
        <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">
          模拟面试需要根据您上传的简历生成针对性问题。请先上传 PDF
          简历并完成 AI 分析，再开始面试。
        </p>

        <ol className="mt-6 space-y-2 text-left text-sm text-slate-600 dark:text-slate-400">
          <li className="flex gap-2">
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
              1.
            </span>
            上传 PDF 简历
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
              2.
            </span>
            等待 AI 分析并生成 10 道针对性面试题
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
              3.
            </span>
            点击「开始面试」进入模拟面试
          </li>
        </ol>

        <Link
          href="/dashboard"
          className="mt-8 inline-flex h-11 w-full items-center justify-center rounded-2xl bg-indigo-600 px-6 text-sm font-semibold text-white transition hover:bg-indigo-500"
        >
          前往简历分析
        </Link>
      </div>
    </div>
  );
}
