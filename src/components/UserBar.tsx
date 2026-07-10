"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { disableGuestMode } from "@/lib/auth/guest-mode";
import { supabase } from "@/lib/supabase";

/** 顶部用户栏：导航、登录/退出 */
export default function UserBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [email, setEmail] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setEmail(user?.email ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    setSigningOut(true);

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }

      disableGuestMode();
      router.replace("/");
      router.refresh();
    } catch {
      setSigningOut(false);
    }
  }

  return (
    <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <nav className="flex items-center gap-4 text-sm">
          <Link
            href="/dashboard"
            className={`font-medium transition ${
              pathname === "/dashboard"
                ? "text-indigo-600 dark:text-indigo-400"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            }`}
          >
            简历分析
          </Link>
          <Link
            href="/interview"
            className={`font-medium transition ${
              pathname === "/interview"
                ? "text-indigo-600 dark:text-indigo-400"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            }`}
          >
            模拟面试
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {email ? (
            <>
              <span className="hidden max-w-[200px] truncate text-xs text-slate-500 sm:inline dark:text-slate-400">
                {email}
              </span>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={signingOut}
                className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                {signingOut ? "退出中..." : "退出登录"}
              </button>
            </>
          ) : (
            <Link
              href="/"
              className="inline-flex h-9 items-center justify-center rounded-xl bg-indigo-600 px-4 text-xs font-semibold text-white transition hover:bg-indigo-500"
            >
              登录
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
