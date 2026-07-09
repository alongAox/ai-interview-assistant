"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getInterviewQuestions } from "@/lib/data/interview-questions";

export default function InterviewSession() {
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState<string[]>([]);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    setQuestions(getInterviewQuestions());
  }, []);

  const currentQuestion = questions[currentIndex] ?? "";
  const isFirstQuestion = currentIndex === 0;
  const isLastQuestion = currentIndex >= questions.length - 1;
  const total = questions.length;

  function persistCurrentAnswer(nextAnswers: string[]) {
    nextAnswers[currentIndex] = answer;
    return nextAnswers;
  }

  function saveAndGoTo(index: number) {
    if (index === currentIndex) {
      return;
    }

    const nextAnswers = persistCurrentAnswer([...answers]);
    setAnswers(nextAnswers);
    setCompleted(false);
    setCurrentIndex(index);
    setAnswer(nextAnswers[index] ?? "");
  }

  function handlePrevious() {
    if (isFirstQuestion) {
      return;
    }
    saveAndGoTo(currentIndex - 1);
  }

  function handleNext() {
    const nextAnswers = persistCurrentAnswer([...answers]);
    setAnswers(nextAnswers);

    if (isLastQuestion) {
      setCompleted(true);
      return;
    }

    setCompleted(false);
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
      {/* 左侧：当前题目 */}
      <aside className="w-full border-b border-slate-200 bg-white/80 p-6 lg:w-[360px] lg:shrink-0 lg:border-b-0 lg:border-r dark:border-slate-800 dark:bg-slate-900/70">
        <Link
          href="/"
          className="text-sm text-slate-500 transition hover:text-slate-800 dark:hover:text-slate-200"
        >
          ← 返回首页
        </Link>

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
              className={`w-full rounded-xl px-3 py-2 text-left text-xs leading-5 transition ${
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

      {/* 右侧：作答区 */}
      <section className="flex flex-1 flex-col p-6">
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
          placeholder="在此输入你的回答..."
          className="mt-3 min-h-[320px] flex-1 resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-500/20"
        />

        <div className="mt-4 flex items-center justify-between gap-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isLastQuestion && !completed
              ? "已是最后一题"
              : completed
                ? "可返回上一题修改回答"
                : `第 ${currentIndex + 1} 题 / 共 ${total} 题`}
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={isFirstQuestion}
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              上一题
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={completed}
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-indigo-600 px-8 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isLastQuestion && !completed ? "完成" : "Next"}
            </button>
          </div>
        </div>

        {completed && (
          <p className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
            全部题目已完成，可以返回首页重新生成题目。
          </p>
        )}
      </section>
    </div>
  );
}
