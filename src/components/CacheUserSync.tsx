"use client";

import { useEffect } from "react";
import {
  clearGuestTransientData,
  notifyCacheScopeChanged,
  setCacheUserId,
} from "@/lib/cache/analysis-cache";
import { supabase } from "@/lib/supabase";

/** 同步 Supabase 登录状态与本地缓存 scope（访客与账号数据互不合并） */
export default function CacheUserSync() {
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCacheUserId(session?.user?.id ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        clearGuestTransientData();
      }

      setCacheUserId(session?.user?.id ?? null);

      if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
        notifyCacheScopeChanged();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return null;
}
