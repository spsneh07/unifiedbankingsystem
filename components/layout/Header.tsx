'use client'
import { Bell, Search, Moon, Sun, LogOut, Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/Toast";
import { useSession } from "@/components/SessionProvider";
import { useRouter } from "next/navigation";
import { useTheme } from "@/hooks/useTheme";

const ROLE_COLORS: Record<string, string> = {
  admin: "#f0c040",
  employee: "#4090f0",
  customer: "#00d4aa",
};

export default function Header({ title, onMenuClick }: { title?: string, onMenuClick?: () => void }) {
  const { theme, toggleTheme } = useTheme();
  const [unreadAlerts, setUnreadAlerts] = useState(0);
  const { user, logout } = useSession();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetch("/api/alerts", { credentials: 'include' })
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

  const handleLogout = async () => {
    await logout();
  };

  const initials = user?.email ? String(user.email).slice(0, 2).toUpperCase() : "UB";
  const badgeColor = user?.role ? ROLE_COLORS[user.role] || "#00d4aa" : "#00d4aa";
  const displayEmail = user?.email || "Guest";
  const displayRole = user?.role || "user";

  return (
    <motion.header 
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-16 border-b border-gray-200 dark:border-[#1a1d24] bg-white dark:bg-[#0d0f14] flex items-center px-6 gap-4 sticky top-0 z-30"
    >
      {onMenuClick && (
        <button
          onClick={onMenuClick}
          className="lg:hidden w-9 h-9 flex items-center justify-center text-[#8890a0] hover:text-black dark:hover:text-white mr-1 -ml-2"
        >
          <Menu size={20} />
        </button>
      )}
      {title && (
        <motion.h1 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="font-display font-700 text-[17px] text-black dark:text-white mr-4"
        >
          {title}
        </motion.h1>
      )}
      <div className="flex-1 max-w-sm">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3d4455] z-10 pointer-events-none"
          />
          <input
            className="input !pl-10 py-2 text-sm"
            placeholder="Search accounts, customers…"
          />
        </div>
      </div>
      <div className="flex items-center gap-3 ml-auto">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          suppressHydrationWarning
          className="w-9 h-9 rounded-lg bg-[#1a1d24] flex items-center justify-center text-[#8890a0] hover:text-white transition-colors"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={theme}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </motion.div>
          </AnimatePresence>
        </motion.button>
        <motion.a
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          href="/alerts"
          className="relative w-9 h-9 rounded-lg bg-[#1a1d24] flex items-center justify-center text-[#8890a0] hover:text-white transition-colors"
        >
          <Bell size={16} />
          {unreadAlerts > 0 && (
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" 
            />
          )}
        </motion.a>

        {/* User info */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2 pl-3 border-l border-[#1a1d24]"
        >
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
        </motion.div>

        {/* Logout */}
        <motion.button
          whileHover={{ scale: 1.05, color: '#f05050' }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          title="Logout"
          className="w-9 h-9 rounded-lg bg-[#1a1d24] flex items-center justify-center text-[#8890a0] hover:text-[#f05050] transition-colors"
        >
          <LogOut size={16} />
        </motion.button>
      </div>
    </motion.header>
  );
}
