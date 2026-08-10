"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  CACHE_SCOPE_CHANGED_EVENT,
  clearInterviewSessionCache,
  clearWorkflowCache,
  formatCachedTime,
  getWorkflowCache,
  saveWorkflowCache,
} from "@/lib/cache/analysis-cache";
import { saveInterviewQuestions } from "@/lib/data/interview-questions";
import {
  ANALYSIS_SECTIONS,
  type ResumeAnalysisFields,
  type ResumeAnalysisResult,
} from "@/lib/types/analysis";
import type { WorkflowResult } from "@/lib/types/interview";

type Step =
  | "idle"
  | "analyzing"
  | "analysisDone"
  | "generating"
  | "done";

const WORKFLOW_STEPS = [
  { id: "analyze", label: "分析简历", description: "提取经历与能力画像" },
  { id: "questions", label: "生成面试题", description: "输出 10 道针对性问题" },
] as const;

function StepIndicator({ step }: { step: Step }) {
  const analysisComplete =
    step === "analysisDone" || step === "generating" || step === "done";
  const questionsComplete = step === "done";

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {WORKFLOW_STEPS.map((item, index) => {
        const isActive =
          (index === 0 && step === "analyzing") ||
          (index === 1 && step === "generating");
        const isDone =
          (index === 0 && analysisComplete) ||
          (index === 1 && questionsComplete);

        return (
          <div
            key={item.id}
            className={`rounded-2xl border px-4 py-3 transition ${
              isActive
                ? "border-indigo-300 bg-indigo-50 shadow-sm dark:border-indigo-500/40 dark:bg-indigo-500/10"
                : isDone
                  ? "border-emerald-200 bg-emerald-50/70 dark:border-emerald-500/30 dark:bg-emerald-500/10"
                  : "border-slate-200 bg-white/70 dark:border-slate-800 dark:bg-slate-900/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                  isDone
                    ? "bg-emerald-500 text-white"
                    : isActive
                      ? "bg-indigo-500 text-white animate-pulse-soft"
                      : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                {isDone ? "✓" : index + 1}
              </span>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {item.label}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {item.description}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function UploadIcon() {
  return (
    <svg
      aria-hidden
      className="h-8 w-8 text-indigo-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 16V4m0 0 8-8m-8 8 8 8M4 20h16"
      />
    </svg>
  );
}

export default function InterviewAnalyzer() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [cachedFileName, setCachedFileName] = useState<string | null>(null);
  const [cachedFileSize, setCachedFileSize] = useState<number | null>(null);
  const [cachedAt, setCachedAt] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("idle");
  const [error, setError] = useState("");
  const [result, setResult] = useState<WorkflowResult | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const loading = step === "analyzing" || step === "generating";

  function restoreWorkflowCache() {
    const cache = getWorkflowCache();

    if (!cache) {
      setFile(null);
      setResult(null);
      setCachedFileName(null);
      setCachedFileSize(null);
      setCachedAt(null);
      setStep("idle");
      setError("");
      return;
    }

    const hasQuestions =
      Array.isArray(cache.questions) && cache.questions.length > 0;

    setResult({
      fileName: cache.fileName,
      analysis: cache.analysis,
      questions: cache.questions,
    });
    setCachedFileName(cache.fileName);
    setCachedFileSize(cache.fileSize);
    setCachedAt(cache.cachedAt);
    setStep(hasQuestions ? "done" : "analysisDone");
    setError("");

    if (hasQuestions) {
      saveInterviewQuestions(cache.questions);
    }
  }

  useEffect(() => {
    restoreWorkflowCache();

    function handleCacheScopeChanged() {
      restoreWorkflowCache();
    }

    window.addEventListener(CACHE_SCOPE_CHANGED_EVENT, handleCacheScopeChanged);
    return () => {
      window.removeEventListener(
        CACHE_SCOPE_CHANGED_EVENT,
        handleCacheScopeChanged,
      );
    };
  }, []);

  function clearCachedState() {
    clearWorkflowCache();
    clearInterviewSessionCache();
    setCachedFileName(null);
    setCachedFileSize(null);
    setCachedAt(null);
  }

  function selectFile(selected: File | undefined) {
    if (!selected) {
      return;
    }

    if (selected.type !== "application/pdf") {
      setError("请上传 PDF 格式的文件");
      setFile(null);
      setResult(null);
      clearCachedState();
      return;
    }

    setError("");
    setFile(selected);
    setResult(null);
    setStep("idle");
    clearCachedState();
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    selectFile(event.target.files?.[0]);
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragOver(false);
    selectFile(event.dataTransfer.files?.[0]);
  }

  async function analyzeResumeStep(selectedFile: File) {
    const formData = new FormData();
    formData.append("file", selectedFile);

    const response = await fetch("/api/analyze/resume", {
      method: "POST",
      body: formData,
    });

    const data = (await response.json()) as ResumeAnalysisResult & {
      error?: string;
    };

    if (!response.ok) {
      throw new Error(data.error || "简历分析失败，请稍后重试");
    }

    return data;
  }

  async function generateQuestionsStep(analysis: ResumeAnalysisFields) {
    const response = await fetch("/api/analyze/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ analysis }),
    });

    const data = (await response.json()) as {
      questions?: string[];
      error?: string;
    };

    if (!response.ok) {
      throw new Error(data.error || "面试题生成失败，请稍后重试");
    }

    return data.questions ?? [];
  }

  async function handleAnalyze() {
    if (!file) {
      setError("请先上传 PDF 文件");
      return;
    }

    setError("");
    setResult(null);

    try {
      setStep("analyzing");
      const resumeResult = await analyzeResumeStep(file);

      const workflowResult = {
        fileName: resumeResult.fileName,
        analysis: resumeResult.analysis,
        questions: [] as string[],
      };

      setResult(workflowResult);
      setCachedFileName(resumeResult.fileName);
      setCachedFileSize(file.size);
      setCachedAt(new Date().toISOString());

      saveWorkflowCache({
        fileName: resumeResult.fileName,
        fileSize: file.size,
        analysis: resumeResult.analysis,
        questions: [],
      });
      clearInterviewSessionCache();

      setStep("analysisDone");
    } catch (err) {
      setStep("idle");
      setError(err instanceof Error ? err.message : "处理失败，请稍后重试");
    }
  }

  async function handleGenerateQuestions() {
    if (!result?.analysis) {
      setError("请先完成简历分析");
      return;
    }

    setError("");

    try {
      setStep("generating");
      const questions = await generateQuestionsStep(result.analysis);

      const workflowResult = {
        ...result,
        questions,
      };

      setResult(workflowResult);

      saveWorkflowCache({
        fileName: result.fileName,
        fileSize: file?.size ?? cachedFileSize ?? 0,
        analysis: result.analysis,
        questions,
      });
      saveInterviewQuestions(questions);
      clearInterviewSessionCache();

      setStep("done");
    } catch (err) {
      setStep("analysisDone");
      setError(err instanceof Error ? err.message : "处理失败，请稍后重试");
    }
  }

  function formatFileSize(size: number) {
    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    }
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div className="flex w-full flex-col gap-8">
      <header className="space-y-3 text-center sm:text-left">
        <p className="inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300">
          AI 驱动的面试准备助手
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-slate-50">
          AI Interview Assistant
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-base dark:text-slate-400">
          上传 PDF 简历并完成 AI 分析后，可单独生成 10
          道针对性面试题，再进入模拟面试。
        </p>
      </header>

      <section className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
        <StepIndicator step={step} />

        <div className="mt-6 space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />

          <div
            role="button"
            tabIndex={0}
            onClick={() => !loading && fileInputRef.current?.click()}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                if (!loading) fileInputRef.current?.click();
              }
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 transition ${
              dragOver
                ? "border-indigo-400 bg-indigo-50/80 dark:border-indigo-400 dark:bg-indigo-500/10"
                : "border-slate-300 bg-slate-50/80 hover:border-indigo-300 hover:bg-indigo-50/40 dark:border-slate-700 dark:bg-slate-950/40 dark:hover:border-indigo-500/40"
            } ${loading ? "pointer-events-none opacity-60" : ""}`}
          >
            <UploadIcon />
            <p className="mt-4 text-sm font-medium text-slate-900 dark:text-slate-100">
              点击或拖拽 PDF 到此处上传
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              仅支持 PDF 格式，建议文件小于 10MB
            </p>
          </div>

          {(file || cachedFileName) && (
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/60">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                  {file?.name ?? cachedFileName}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {file
                    ? formatFileSize(file.size)
                    : cachedFileSize
                      ? formatFileSize(cachedFileSize)
                      : "来自缓存"}
                  {cachedAt && !file && (
                    <span className="ml-2">
                      · 缓存于 {formatCachedTime(cachedAt)}
                    </span>
                  )}
                </p>
              </div>
              {!loading && (
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setResult(null);
                    setStep("idle");
                    setError("");
                    clearCachedState();
                  }}
                  className="shrink-0 text-xs text-slate-500 transition hover:text-slate-800 dark:hover:text-slate-200"
                >
                  清除
                </button>
              )}
            </div>
          )}

          {result && !file && cachedAt && (
            <p className="rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300">
              已恢复上次分析结果。如需重新分析，请重新上传 PDF。
            </p>
          )}

          <button
            type="button"
            onClick={handleAnalyze}
            disabled={loading || !file || step === "analysisDone" || step === "done"}
            className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-indigo-600 px-6 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 dark:disabled:bg-slate-800 dark:disabled:text-slate-500"
          >
            {step === "analyzing" ? "正在分析简历..." : "开始分析"}
          </button>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
              {error}
            </div>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            分析结果
          </h2>
          {result && (
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
              {result.questions.length > 0 ? "已完成" : "分析完成"}
            </span>
          )}
        </div>

        {!result && !loading && (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-200 px-6 py-10 text-center dark:border-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              简历分析结果将在这里展示；完成分析后可单独生成面试题。
            </p>
          </div>
        )}

        {loading && !result && (
          <div className="mt-6 space-y-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-16 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800"
              />
            ))}
          </div>
        )}

        {result && (
          <div className="mt-6 space-y-8">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/50">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                当前文件
              </p>
              <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">
                {result.fileName}
              </p>
            </div>

            <div>
              <div className="mb-4 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
                  1
                </span>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
                  简历分析
                </h3>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {ANALYSIS_SECTIONS.map(({ key, label }) => (
                  <div
                    key={key}
                    className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950/40"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-300">
                      {label}
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-slate-300">
                      {result.analysis[key]}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-4 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
                  2
                </span>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
                  针对性面试题
                </h3>
                {result.questions.length > 0 && (
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {result.questions.length} 道
                  </span>
                )}
              </div>

              {result.questions.length === 0 && step !== "generating" && (
                <div className="rounded-2xl border border-dashed border-slate-200 px-6 py-8 text-center dark:border-slate-800">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    简历分析已完成。点击下方按钮，基于分析结果生成 10 道针对性面试题。
                  </p>
                  <button
                    type="button"
                    onClick={handleGenerateQuestions}
                    disabled={loading}
                    className="mt-4 inline-flex h-11 items-center justify-center rounded-2xl bg-indigo-600 px-6 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 dark:disabled:bg-slate-800 dark:disabled:text-slate-500"
                  >
                    生成面试题
                  </button>
                </div>
              )}

              {step === "generating" && result.questions.length === 0 && (
                <div className="space-y-3">
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="h-16 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800"
                    />
                  ))}
                  <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                    正在生成面试题...
                  </p>
                </div>
              )}

              {result.questions.length > 0 && (
                <>
                  <ol className="space-y-3">
                    {result.questions.map((question, index) => (
                      <li
                        key={`${index}-${question}`}
                        className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950/40"
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                          {index + 1}
                        </span>
                        <p className="text-sm leading-6 text-slate-700 dark:text-slate-300">
                          {question}
                        </p>
                      </li>
                    ))}
                  </ol>
                  <Link
                    href="/interview"
                    onClick={() => saveInterviewQuestions(result.questions)}
                    className="mt-4 inline-flex h-11 items-center justify-center rounded-2xl bg-indigo-600 px-6 text-sm font-semibold text-white transition hover:bg-indigo-500"
                  >
                    开始面试
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
