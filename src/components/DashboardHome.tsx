"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import InterviewHistoryCard from "@/components/InterviewHistoryCard";
import InterviewReport from "@/components/InterviewReport";
import { isGuestMode } from "@/lib/auth/guest-mode";
import {
  getInterviewHistory,
  type InterviewHistoryItem,
} from "@/lib/history";

const RECENT_HISTORY_LIMIT = 5;

export default function DashboardHome() {
  const pathname = usePathname();
  const [history, setHistory] = useState<InterviewHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");
  const [isGuest, setIsGuest] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InterviewHistoryItem | null>(
    null,
  );

  const loadHistory = useCallback(async () => {
    if (isGuestMode()) {
      setIsGuest(true);
      setHistoryLoading(false);
      setHistory([]);
      setHistoryError("");
      return;
    }

    setIsGuest(false);
    setHistoryLoading(true);
    setHistoryError("");

    const result = await getInterviewHistory(RECENT_HISTORY_LIMIT);

    if (!result.ok) {
      setHistory([]);
      setHistoryError(result.error);
      setHistoryLoading(false);
      return;
    }

    setHistory(result.items);
    setHistoryLoading(false);
  }, []);

  useEffect(() => {
    void loadHistory();

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        void loadHistory();
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [loadHistory, pathname]);

  return (
    <>
      <div className="flex w-full flex-col gap-8">
        <header className="space-y-3">
          <p className="inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300">
            Dashboard
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-slate-50">
            面试助手
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-base dark:text-slate-400">
            上传简历、生成针对性面试题，开始新一轮模拟面试。
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
          <section className="rounded-3xl border border-slate-200/80 bg-white/85 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
            <div className="flex h-full flex-col">
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-300">
                开始新面试
              </p>
              <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-50">
                准备下一轮模拟面试
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                先上传 PDF 简历并完成 AI 分析，再生成 10
                道针对性面试题，即可进入模拟面试。
              </p>

              <ol className="mt-6 space-y-3 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/40">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
                    1
                  </span>
                  <span>上传简历并完成 AI 分析</span>
                </li>
                <li className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/40">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
                    2
                  </span>
                  <span>生成针对性面试题</span>
                </li>
                <li className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/40">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
                    3
                  </span>
                  <span>开始模拟面试并获取报告</span>
                </li>
              </ol>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/resume"
                  className="inline-flex h-11 flex-1 items-center justify-center rounded-2xl bg-indigo-600 px-6 text-sm font-semibold text-white transition hover:bg-indigo-500"
                >
                  开始新面试
                </Link>
                <Link
                  href="/interview"
                  className="inline-flex h-11 flex-1 items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  继续面试
                </Link>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200/80 bg-white/85 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-300">
                  最近记录
                </p>
                <h2 className="mt-1 text-xl font-semibold text-slate-900 dark:text-slate-50">
                  最近 {RECENT_HISTORY_LIMIT} 条历史
                </h2>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {historyLoading &&
                [1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-40 animate-pulse rounded-3xl bg-slate-100 dark:bg-slate-800"
                  />
                ))}

              {!historyLoading && isGuest && (
                <div className="rounded-2xl border border-dashed border-slate-200 px-6 py-10 text-center dark:border-slate-800">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    访客模式不保存历史记录。登录后可在此查看最近面试报告。
                  </p>
                  <Link
                    href="/"
                    className="mt-4 inline-flex h-10 items-center justify-center rounded-2xl bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-500"
                  >
                    去登录
                  </Link>
                </div>
              )}

              {!historyLoading && !isGuest && historyError && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                  {historyError}
                </div>
              )}

              {!historyLoading &&
                !isGuest &&
                !historyError &&
                history.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-200 px-6 py-10 text-center dark:border-slate-800">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      暂无历史记录。完成一次模拟面试后，报告会显示在这里。
                    </p>
                  </div>
                )}

              {!historyLoading &&
                !isGuest &&
                history.map((item) => (
                  <InterviewHistoryCard
                    key={item.id}
                    item={item}
                    onViewDetail={(id) => {
                      const selected = history.find(
                        (entry) => entry.id === id,
                      );
                      if (selected) {
                        setSelectedItem(selected);
                      }
                    }}
                  />
                ))}
            </div>
          </section>
        </div>
      </div>

      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-4 sm:items-center">
          <button
            type="button"
            aria-label="关闭详情"
            className="absolute inset-0"
            onClick={() => setSelectedItem(null)}
          />
          <div className="relative z-10 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="sticky top-0 flex items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
              <div>
                <p className="text-xs text-slate-400">面试报告详情</p>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {new Date(selectedItem.createdAt).toLocaleString("zh-CN")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 px-4 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                关闭
              </button>
            </div>
            <InterviewReport report={selectedItem.report} />
          </div>
        </div>
      )}
    </>
  );
}
