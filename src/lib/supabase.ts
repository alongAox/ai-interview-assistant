import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * 从环境变量读取 Supabase 配置。
 * NEXT_PUBLIC_* 前缀的变量可在浏览器端使用，适合 App Router 中的 Client / Server Component。
 */
function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url) {
    throw new Error(
      "缺少环境变量 NEXT_PUBLIC_SUPABASE_URL，请在 .env.local 中配置 Supabase Project URL。",
    );
  }

  if (!publishableKey) {
    throw new Error(
      "缺少环境变量 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY，请在 .env.local 中配置 Supabase Publishable Key。",
    );
  }

  return { url, publishableKey };
}

/** 创建 Supabase 客户端实例 */
function createSupabaseClient(): SupabaseClient {
  const { url, publishableKey } = getSupabaseEnv();

  return createClient(url, publishableKey);
}

/**
 * 默认 Supabase 客户端。
 * 使用 Publishable Key，适用于 App Router 中一般的客户端数据读写。
 * 服务端敏感操作请使用 SUPABASE_SECRET_KEY 单独创建 Admin Client。
 */
export const supabase = createSupabaseClient();
