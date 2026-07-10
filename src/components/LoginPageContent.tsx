"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import LoginButton from "@/components/LoginButton";
import { enableGuestMode } from "@/lib/auth/guest-mode";
import { supabase } from "@/lib/supabase";

/** 登录页：支持登录，也支持免登录直接进入功能页 */
export default function LoginPageContent() {
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setEmail(session?.user?.email ?? null);
      setReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">加载中...</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-8 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
      <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-300">
        AI Interview Assistant
      </p>
      <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-50">
        {email ? "欢迎回来" : "登录"}
      </h1>
      <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
        {email
          ? "欢迎回来，您的简历分析与面试记录已关联当前账号。"
          : "登录后，您的简历分析与面试进度将保存在账号中，可随时继续。"}
      </p>

      {email ? (
        <Link
          href="/dashboard"
          className="mt-8 inline-flex h-11 w-full items-center justify-center rounded-2xl bg-indigo-600 px-6 text-sm font-semibold text-white transition hover:bg-indigo-500"
        >
          进入功能页
        </Link>
      ) : (
        <LoginButton className="mt-8" />
      )}

      {!email && (
        <div className="mt-8 border-t border-slate-200 pt-6 dark:border-slate-800">
          <p className="text-center text-xs text-slate-400">或免登录直接使用</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Link
              href="/dashboard"
              onClick={enableGuestMode}
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              简历分析
            </Link>
            <Link
              href="/interview"
              onClick={enableGuestMode}
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              模拟面试
            </Link>
          </div>
          <p className="mt-3 text-center text-xs text-slate-400">
            访客模式不保存记录，关闭标签页后需重新进入
          </p>
        </div>
      )}
    </div>
  );
}
