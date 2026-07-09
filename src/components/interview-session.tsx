"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import InterviewReport from "@/components/InterviewReport";
import {
  clearInterviewSessionCache,
  formatCachedTime,
  getInterviewSessionCache,
  saveInterviewSessionCache,
} from "@/lib/cache/analysis-cache";
import { getInterviewQuestions } from "@/lib/data/interview-questions";
import { buildInterviewReport } from "@/lib/report/build-report";
import type { InterviewScoreResult, ScoredInterviewItem } from "@/lib/types/score";

type ScoringState = "idle" | "loading" | "done" | "error";

export default function InterviewSession() {
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState<string[]>([]);
  const [completed, setCompleted] = useState(false);
  const [scoringState, setScoringState] = useState<ScoringState>("idle");
  const [scoreError, setScoreError] = useState("");
  const [averageScore, setAverageScore] = useState<number | null>(null);
  const [scoredItems, setScoredItems] = useState<ScoredInterviewItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [sessionCachedAt, setSessionCachedAt] = useState<string | null>(null);

  useEffect(() => {
    const questionList = getInterviewQuestions();
    setQuestions(questionList);

    const cache = getInterviewSessionCache();
    const isSameQuestions =
      cache &&
      cache.questions.length === questionList.length &&
      cache.questions.every((item, index) => item === questionList[index]);

    if (isSameQuestions && cache) {
      setAnswers(cache.answers);
      setCurrentIndex(cache.currentIndex);
      setAnswer(cache.answers[cache.currentIndex] ?? "");
      setCompleted(cache.completed);
      setScoringState(cache.scoringState);
      setAverageScore(cache.averageScore);
      setScoredItems(cache.scoredItems);
      setSessionCachedAt(cache.cachedAt);
    }

    setHydrated(true);
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
    setScoreError("");
    setAverageScore(null);
    setScoredItems([]);
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

  async function submitScores(
    finalAnswers: string[],
    questionList: string[],
  ) {
    const allItems = questionList.map((question, index) => ({
      question,
      answer: finalAnswers[index] ?? "",
      index,
    }));

    setScoringState("loading");
    setScoreError("");

    try {
      const response = await fetch("/api/analyze/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: allItems.map(({ question, answer }) => ({ question, answer })),
        }),
      });

      const data = (await response.json()) as {
        scores?: InterviewScoreResult[];
        averageScore?: number;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "评分失败，请稍后重试");
      }

      const results: ScoredInterviewItem[] = allItems.map((item, scoreIndex) => ({
        index: item.index,
        question: item.question,
        answer: item.answer,
        ...data.scores![scoreIndex],
      }));

      setScoredItems(results);
      setAverageScore(data.averageScore ?? null);
      setScoringState("done");
    } catch (error) {
      setScoringState("error");
      setScoreError(
        error instanceof Error ? error.message : "评分失败，请稍后重试",
      );
    }
  }

  function handlePrevious() {
    if (isFirstQuestion) {
      return;
    }
    saveAndGoTo(currentIndex - 1);
  }

  async function handleNext() {
    const nextAnswers = persistCurrentAnswer([...answers]);
    setAnswers(nextAnswers);

    if (isLastQuestion) {
      setCompleted(true);
      await submitScores(nextAnswers, questions);
      return;
    }

    setCompleted(false);
    resetScores();
    setCurrentIndex(currentIndex + 1);
    setAnswer(nextAnswers[currentIndex + 1] ?? "");
  }

  if (total === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">加载题目中...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col lg:flex-row">
      <aside className="w-full border-b border-slate-200 bg-white/80 p-6 lg:w-[360px] lg:shrink-0 lg:border-b-0 lg:border-r dark:border-slate-800 dark:bg-slate-900/70">
        <Link
          href="/"
          className="text-sm text-slate-500 transition hover:text-slate-800 dark:hover:text-slate-200"
        >
          ← 返回首页
        </Link>

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
              ? "正在 AI 评分，请稍候..."
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
                ? "评分中..."
                : isLastQuestion && !completed
                  ? "完成并评分"
                  : completed && scoringState !== "done"
                    ? "重新评分"
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

        {scoreError && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            {scoreError}
          </div>
        )}

        {scoringState === "done" && averageScore !== null && (
          <div className="mt-8">
            <InterviewReport
              report={buildInterviewReport(averageScore, scoredItems)}
              items={scoredItems}
            />
          </div>
        )}
      </section>
    </div>
  );
}
