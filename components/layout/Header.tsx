"use client";
import { Bell, Search, Moon, Sun, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/Toast";
import { getSession, clearSession, type SessionUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useTheme } from "@/hooks/useTheme";

const ROLE_COLORS: Record<string, string> = {
  admin: "#f0c040",
  employee: "#4090f0",
  customer: "#00d4aa",
};

export default function Header({ title }: { title?: string }) {
  const { theme, toggleTheme } = useTheme();
  const [unreadAlerts, setUnreadAlerts] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [session, setSession] = useState<SessionUser | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    setSession(getSession());

    fetch("/api/alerts")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUnreadAlerts(data.unreadCount);
          if (data.unreadCount > 0) {
            toast("info", `You have ${data.unreadCount} unread alerts.`);
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    clearSession();
    router.push("/");
  };

  const initials =
    mounted && session?.email ? session.email.slice(0, 2).toUpperCase() : "UB";
  const badgeColor =
    mounted && session?.role
      ? ROLE_COLORS[session.role] || "#00d4aa"
      : "#00d4aa";
  const displayEmail = mounted ? session?.email || "Guest" : "Guest";
  const displayRole = mounted ? session?.role || "user" : "user";

  return (
    <header className="h-16 border-b border-gray-200 dark:border-[#1a1d24] bg-white dark:bg-[#0d0f14] flex items-center px-6 gap-4 sticky top-0 z-30">
      {title && (
        <h1 className="font-display font-700 text-[17px] text-black dark:text-white mr-4">
          {title}
        </h1>
      )}
      <div className="flex-1 max-w-sm">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3d4455]"
          />
          <input
            className="input pl-9 py-2 text-sm"
            placeholder="Search accounts, customers…"
          />
        </div>
      </div>
      <div className="flex items-center gap-3 ml-auto">
        <button
          onClick={toggleTheme}
          suppressHydrationWarning
          className="w-9 h-9 rounded-lg bg-[#1a1d24] flex items-center justify-center text-[#8890a0] hover:text-white transition-colors"
        >
          {mounted && theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <a
          href="/alerts"
          className="relative w-9 h-9 rounded-lg bg-[#1a1d24] flex items-center justify-center text-[#8890a0] hover:text-white transition-colors"
        >
          <Bell size={16} />
          {unreadAlerts > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" />
          )}
        </a>

        {/* User info */}
        <div className="flex items-center gap-2 pl-3 border-l border-[#1a1d24]">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center font-display font-700 text-sm text-[#0a0c10]"
            style={{ background: badgeColor }}
          >
            {initials}
          </div>
          <div className="hidden sm:block">
            <div className="text-[13px] font-display font-600 text-black dark:text-white leading-tight truncate max-w-[140px]">
              {displayEmail}
            </div>
            <div
              className="text-[11px] capitalize"
              style={{ color: badgeColor }}
            >
              {displayRole}
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          title="Logout"
          className="w-9 h-9 rounded-lg bg-[#1a1d24] flex items-center justify-center text-[#8890a0] hover:text-[#f05050] transition-colors"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
