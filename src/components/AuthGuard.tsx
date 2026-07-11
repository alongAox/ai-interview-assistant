"use client";

import { useEffect, useState } from "react";
import { disableGuestMode, isGuestMode } from "@/lib/auth/guest-mode";
import { supabase } from "@/lib/supabase";

type AuthGuardProps = {
  children: React.ReactNode;
};

function redirectToLogin() {
  window.location.replace("/");
}

/** 已登录或访客模式可访问；否则重定向登录页 */
export default function AuthGuard({ children }: AuthGuardProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function verifyAccess() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) {
        return;
      }

      if (session) {
        disableGuestMode();
        setReady(true);
        return;
      }

      if (isGuestMode()) {
        setReady(true);
        return;
      }

      redirectToLogin();
    }

    verifyAccess();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        disableGuestMode();
        setReady(true);
        return;
      }

      if (event === "SIGNED_OUT") {
        disableGuestMode();
        redirectToLogin();
        return;
      }

      if (isGuestMode()) {
        setReady(true);
        return;
      }

      redirectToLogin();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          验证访问权限...
        </p>
      </div>
    );
  }

  return children;
}
