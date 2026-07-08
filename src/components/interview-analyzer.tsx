"use client";

import { useRef, useState } from "react";
import {
  ANALYSIS_SECTIONS,
  type ResumeAnalysis,
} from "@/lib/types/analysis";

export default function InterviewAnalyzer() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ResumeAnalysis | null>(null);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];

    if (!selected) {
      return;
    }

    if (selected.type !== "application/pdf") {
      setError("请上传 PDF 格式的文件");
      setFile(null);
      setResult(null);
      return;
    }

    setError("");
    setFile(selected);
    setResult(null);
  }

  async function handleAnalyze() {
    if (!file) {
      setError("请先上传 PDF 文件");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "分析失败，请稍后重试");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "分析失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        AI Interview Assistant
      </h1>

      <div className="mt-12 flex w-full flex-col items-center gap-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleFileChange}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex h-11 w-full max-w-xs items-center justify-center rounded-lg border border-zinc-300 bg-white px-6 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          上传 PDF
        </button>

        {file && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            已选择：{file.name}
          </p>
        )}

        <button
          type="button"
          onClick={handleAnalyze}
          disabled={loading || !file}
          className="inline-flex h-11 w-full max-w-xs items-center justify-center rounded-lg bg-zinc-900 px-6 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {loading ? "分析中..." : "分析"}
        </button>
      </div>

      {error && (
        <p className="mt-6 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <section className="mt-10 w-full rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          结果区域
        </h2>

        {!result && !loading && (
          <p className="mt-4 text-sm leading-6 text-zinc-400 dark:text-zinc-500">
            上传 PDF 并点击「分析」后，结果将显示在这里。
          </p>
        )}

        {loading && (
          <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
            正在分析简历，请稍候...
          </p>
        )}

        {result && (
          <div className="mt-4 space-y-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                文件
              </p>
              <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">
                {result.fileName}
              </p>
            </div>

            {ANALYSIS_SECTIONS.map(({ key, label }) => (
              <div key={key}>
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                  {label}
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-zinc-700 dark:text-zinc-300">
                  {result[key]}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
