import InterviewSession from "@/components/interview-session";

export default function InterviewPage() {
  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] flex-1 overflow-hidden bg-slate-50 dark:bg-slate-950">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.1),transparent_45%)] dark:bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.16),transparent_45%)]"
      />
      <main className="relative mx-auto max-w-6xl">
        <InterviewSession />
      </main>
    </div>
  );
}
