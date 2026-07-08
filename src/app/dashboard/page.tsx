import Link from "next/link";

const stats = [
  { label: "练习次数", value: "0" },
  { label: "平均得分", value: "—" },
  { label: "最近练习", value: "暂无" },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Link
            href="/"
            className="text-sm text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            ← 返回首页
          </Link>
          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
            控制台
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              面试控制台
            </h1>
            <p className="mt-1 text-zinc-600 dark:text-zinc-400">
              查看练习进度，快速开始新一轮模拟面试。
            </p>
          </div>
          <Link
            href="/interview"
            className="inline-flex h-11 items-center justify-center rounded-full bg-zinc-900 px-6 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            开始新练习
          </Link>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{stat.label}</p>
              <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <section className="mt-10 rounded-2xl border border-dashed border-zinc-300 bg-white p-8 dark:border-zinc-700 dark:bg-zinc-900">
          <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
            练习记录
          </h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            完成第一次模拟面试后，记录将显示在这里。
          </p>
        </section>
      </main>
    </div>
  );
}
