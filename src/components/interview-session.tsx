"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import InterviewReport from "@/components/InterviewReport";
import {
  CACHE_SCOPE_CHANGED_EVENT,
  formatCachedTime,
  getInterviewSessionCache,
  saveInterviewSessionCache,
} from "@/lib/cache/analysis-cache";
import {
  getInterviewQuestions,
  getTargetedInterviewContext,
  hasTargetedInterviewQuestions,
} from "@/lib/data/interview-questions";
import InterviewPrerequisite from "@/components/InterviewPrerequisite";
import { isGuestMode } from "@/lib/auth/guest-mode";
import {
  generateInterviewReport,
  rebuildInterviewReport,
} from "@/lib/report/generate-report";
import type { InterviewReportData } from "@/lib/types/report";
import type { ScoredInterviewItem } from "@/lib/types/score";
import { supabase } from "@/lib/supabase";

type ScoringState = "idle" | "loading" | "done" | "error";

export default function InterviewSession() {
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState<string[]>([]);
  const [completed, setCompleted] = useState(false);
  const [scoringState, setScoringState] = useState<ScoringState>("idle");
  const [reportError, setReportError] = useState("");
  const [reportSaveMessage, setReportSaveMessage] = useState("");
  const [averageScore, setAverageScore] = useState<number | null>(null);
  const [scoredItems, setScoredItems] = useState<ScoredInterviewItem[]>([]);
  const [report, setReport] = useState<InterviewReportData | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [sessionCachedAt, setSessionCachedAt] = useState<string | null>(null);
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
  const [interviewReady, setInterviewReady] = useState(false);

  function restoreSessionCache(questionList: string[]) {
    const context = getTargetedInterviewContext();
    const ready = questionList.length > 0 && Boolean(context);
    setInterviewReady(ready);
    setResumeFileName(context?.fileName ?? null);
    setQuestions(questionList);

    const cache = getInterviewSessionCache();
    const isSameQuestions =
      cache &&
      cache.questions.length === questionList.length &&
      cache.questions.every((item, index) => item === questionList[index]);

    if (!isSameQuestions || !cache) {
      setAnswers([]);
      setCurrentIndex(0);
      setAnswer("");
      setCompleted(false);
      setScoringState("idle");
      setReportError("");
      setAverageScore(null);
      setScoredItems([]);
      setReport(null);
      setSessionCachedAt(null);
      return;
    }

    setAnswers(cache.answers);
    setCurrentIndex(cache.currentIndex);
    setAnswer(cache.answers[cache.currentIndex] ?? "");
    setCompleted(cache.completed);
    setScoringState(cache.scoringState);
    setAverageScore(cache.averageScore);
    setScoredItems(cache.scoredItems);
    setSessionCachedAt(cache.cachedAt);
    setReportError("");
    setReport(null);

    if (
      cache.scoringState === "done" &&
      cache.averageScore !== null &&
      cache.scoredItems.length > 0
    ) {
      const restored = rebuildInterviewReport(
        cache.averageScore,
        cache.scoredItems,
      );

      if (restored.ok) {
        setReport(restored.data.report);
      } else {
        setScoringState("error");
        setReportError(restored.error);
      }
    }
  }

  useEffect(() => {
    const questionList = getInterviewQuestions();
    restoreSessionCache(questionList);
    setHydrated(true);

    function handleCacheScopeChanged() {
      restoreSessionCache(getInterviewQuestions());
    }

    window.addEventListener(CACHE_SCOPE_CHANGED_EVENT, handleCacheScopeChanged);
    return () => {
      window.removeEventListener(
        CACHE_SCOPE_CHANGED_EVENT,
        handleCacheScopeChanged,
      );
    };
  }, []);

  function getPersistedAnswers(nextAnswer = answer) {
    const nextAnswers = [...answers];
    nextAnswers[currentIndex] = nextAnswer;
    return nextAnswers;
  }

  useEffect(() => {
    if (!hydrated || questions.length === 0 || scoringState === "loading") {
      return;
    }

    saveInterviewSessionCache({
      questions,
      answers: getPersistedAnswers(),
      currentIndex,
      completed,
      scoringState,
      averageScore,
      scoredItems,
    });
  }, [
    hydrated,
    questions,
    answers,
    currentIndex,
    answer,
    completed,
    scoringState,
    averageScore,
    scoredItems,
  ]);

  const currentQuestion = questions[currentIndex] ?? "";
  const isFirstQuestion = currentIndex === 0;
  const isLastQuestion = currentIndex >= questions.length - 1;
  const total = questions.length;
  const isScoring = scoringState === "loading";

  function persistCurrentAnswer(nextAnswers: string[]) {
    nextAnswers[currentIndex] = answer;
    return nextAnswers;
  }

  function resetScores() {
    setScoringState("idle");
    setReportError("");
    setReportSaveMessage("");
    setAverageScore(null);
    setScoredItems([]);
    setReport(null);
  }

  async function persistReportToDatabase(reportData: InterviewReportData) {
    if (isGuestMode()) {
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      setReportSaveMessage("未登录，报告仅保存在本地。");
      return;
    }

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ report: reportData }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setReportSaveMessage(`云端保存失败：${data.error || "请稍后重试"}`);
        return;
      }

      setReportSaveMessage("报告已保存到您的账号。");
    } catch {
      setReportSaveMessage("云端保存失败：网络异常，请稍后重试");
    }
  }

  async function submitReport(
    finalAnswers: string[],
    questionList: string[],
  ) {
    const allItems = questionList.map((question, index) => ({
      question,
      answer: finalAnswers[index] ?? "",
      index,
    }));

    setScoringState("loading");
    setReportError("");
    setReportSaveMessage("");
    setReport(null);

    const result = await generateInterviewReport(allItems);

    if (result.ok) {
      setReport(result.data.report);
      setScoredItems(result.data.items);
      setAverageScore(result.data.averageScore);
      setScoringState("done");
      await persistReportToDatabase(result.data.report);
      return;
    }

    setScoringState("error");
    setReportError(result.error);
    setAverageScore(null);
    setScoredItems([]);
    setReport(null);
  }

  function handlePrevious() {
    if (isFirstQuestion) {
      return;
    }
    saveAndGoTo(currentIndex - 1);
  }

  function saveAndGoTo(index: number) {
    if (index === currentIndex) {
      return;
    }

    const nextAnswers = persistCurrentAnswer([...answers]);
    setAnswers(nextAnswers);
    setCompleted(false);
    resetScores();
    setCurrentIndex(index);
    setAnswer(nextAnswers[index] ?? "");
  }

  async function handleNext() {
    const nextAnswers = persistCurrentAnswer([...answers]);
    setAnswers(nextAnswers);

    if (isLastQuestion) {
      setCompleted(true);
      await submitReport(nextAnswers, questions);
      return;
    }

    setCompleted(false);
    resetScores();
    setCurrentIndex(currentIndex + 1);
    setAnswer(nextAnswers[currentIndex + 1] ?? "");
  }

  if (!hydrated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">加载中...</p>
      </div>
    );
  }

  if (!interviewReady || !hasTargetedInterviewQuestions()) {
    return <InterviewPrerequisite />;
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col lg:flex-row">
      <aside className="w-full border-b border-slate-200 bg-white/80 p-6 lg:w-[360px] lg:shrink-0 lg:border-b-0 lg:border-r dark:border-slate-800 dark:bg-slate-900/70">
        <Link
          href="/dashboard"
          className="text-sm text-slate-500 transition hover:text-slate-800 dark:hover:text-slate-200"
        >
          ← 返回首页
        </Link>

        {resumeFileName && (
          <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-400">
            基于简历 · {resumeFileName}
          </p>
        )}

        {sessionCachedAt && (
          <p className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300">
            已恢复上次进度 · {formatCachedTime(sessionCachedAt)}
          </p>
        )}

        <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-300">
          当前题目
        </p>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {currentIndex + 1} / {total}
        </p>

        <h1 className="mt-4 text-xl font-semibold leading-8 text-slate-900 dark:text-slate-50">
          {currentQuestion}
        </h1>

        <div className="mt-8 space-y-2">
          {questions.map((question, index) => (
            <button
              key={`${index}-${question}`}
              type="button"
              onClick={() => saveAndGoTo(index)}
              disabled={isScoring}
              className={`w-full rounded-xl px-3 py-2 text-left text-xs leading-5 transition disabled:cursor-not-allowed disabled:opacity-50 ${
                index === currentIndex
                  ? "bg-indigo-50 font-medium text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
                  : answers[index]
                    ? "text-emerald-600 hover:bg-slate-50 dark:text-emerald-400 dark:hover:bg-slate-800/50"
                    : "text-slate-400 hover:bg-slate-50 dark:text-slate-500 dark:hover:bg-slate-800/50"
              }`}
            >
              {index + 1}.{" "}
              {index === currentIndex
                ? "进行中"
                : answers[index]
                  ? "已作答"
                  : "待回答"}
            </button>
          ))}
        </div>
      </aside>

      <section className="flex flex-1 flex-col overflow-y-auto p-6">
        <label
          htmlFor="answer"
          className="text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          你的回答
        </label>

        <textarea
          id="answer"
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          disabled={isScoring}
          placeholder="在此输入你的回答..."
          className="mt-3 min-h-[280px] resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-500/20"
        />

        <div className="mt-4 flex items-center justify-between gap-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isScoring
              ? "正在生成报告，请稍候..."
              : isLastQuestion && !completed
                ? "已是最后一题"
                : completed
                  ? "可返回上一题修改回答"
                  : `第 ${currentIndex + 1} 题 / 共 ${total} 题`}
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={isFirstQuestion || isScoring}
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              上一题
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={(completed && scoringState === "done") || isScoring}
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-indigo-600 px-8 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isScoring
                ? "生成中..."
                : isLastQuestion && !completed
                  ? "完成并生成报告"
                  : completed && scoringState !== "done"
                    ? "重新生成报告"
                    : "Next"}
            </button>
          </div>
        </div>

        {completed && scoringState === "loading" && (
          <div className="mt-6 space-y-3">
            {questions.map((question, index) => (
              <div
                key={`loading-${index}-${question}`}
                className="h-20 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800"
              />
            ))}
          </div>
        )}

        {reportError && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            {reportError}
          </div>
        )}

        {reportSaveMessage && (
          <div
            className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
              reportSaveMessage.startsWith("报告已保存")
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
                : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
            }`}
          >
            {reportSaveMessage}
          </div>
        )}

        {scoringState === "done" && report && (
          <div className="mt-8">
            <InterviewReport report={report} items={scoredItems} />
          </div>
        )}
      </section>
    </div>
  );
}
