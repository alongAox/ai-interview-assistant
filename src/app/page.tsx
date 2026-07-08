import InterviewAnalyzer from "@/components/interview-analyzer";

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <main className="flex flex-1 items-center justify-center">
        <InterviewAnalyzer />
      </main>
    </div>
  );
}
