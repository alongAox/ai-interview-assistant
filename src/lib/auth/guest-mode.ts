const GUEST_MODE_KEY = "ai-interview-guest-mode";

/** 启用当前标签页的访客模式（免登录使用） */
export function enableGuestMode() {
  if (typeof window === "undefined") {
    return;
  }
  sessionStorage.setItem(GUEST_MODE_KEY, "true");
}

/** 关闭访客模式 */
export function disableGuestMode() {
  if (typeof window === "undefined") {
    return;
  }
  sessionStorage.removeItem(GUEST_MODE_KEY);
}

/** 是否处于访客模式（通过登录页免登录入口进入） */
export function isGuestMode() {
  if (typeof window === "undefined") {
    return false;
  }
  return sessionStorage.getItem(GUEST_MODE_KEY) === "true";
}
