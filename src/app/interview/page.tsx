import Link from "next/link";

export default function InterviewPage() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-6">
          <Link
            href="/"
            className="text-sm text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            ← 返回首页
          </Link>
          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
            模拟面试
          </span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-12">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          准备开始
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          面试功能即将上线。你可以在此接入 AI 模型，实现问答对话与反馈生成。
        </p>

        <div className="mt-8 rounded-2xl border border-dashed border-zinc-300 bg-white p-8 dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            下一步建议：配置 <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs dark:bg-zinc-800">.env.local</code> 中的 AI API Key，并实现 <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs dark:bg-zinc-800">/api/chat</code> 路由。
          </p>
        </div>
      </main>
    </div>
  );
}
