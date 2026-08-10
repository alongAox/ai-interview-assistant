import DashboardHome from "@/components/DashboardHome";

export default function DashboardPage() {
  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] flex-1 overflow-hidden bg-slate-50 dark:bg-slate-950">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.12),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.08),transparent_40%)] dark:bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.18),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.12),transparent_40%)]"
      />
      <main className="relative mx-auto flex min-h-full max-w-6xl flex-col px-4 py-10 sm:px-6 sm:py-14">
        <DashboardHome />
      </main>
    </div>
  );
}
