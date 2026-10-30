"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "./LanguageContext";
import {
  LayoutDashboard,
  User,
  Briefcase,
  Bookmark,
  Bell,
  Wallet,
  ShoppingBag,
  HelpCircle,
  Share2,
  Settings,
  LogOut,
  Building2,
  ShieldCheck,
} from "lucide-react";

export function DashboardSidebar({ userRole = "CUSTOMER" }: { userRole?: string }) {
  const pathname = usePathname();
  const { t, language } = useLanguage();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  const navItems = [
    {
      label: language === "bn" ? "ড্যাশবোর্ড" : "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: language === "bn" ? "আমার প্রোফাইল" : "My Profile",
      href: "/dashboard/profile",
      icon: User,
    },
    {
      label: language === "bn" ? "চাকরির আবেদন" : "My Applications",
      href: "/dashboard/applications",
      icon: Briefcase,
    },
    {
      label: language === "bn" ? "সংরক্ষিত চাকরি" : "Saved Jobs",
      href: "/dashboard/saved-jobs",
      icon: Bookmark,
    },
    {
      label: language === "bn" ? "জব অ্যালার্ট" : "Job Alerts",
      href: "/dashboard/alerts",
      icon: Bell,
    },
    {
      label: language === "bn" ? "ওয়ালেট" : "Wallet",
      href: "/dashboard/wallet",
      icon: Wallet,
    },
    {
      label: language === "bn" ? "আমার অর্ডার" : "My Orders",
      href: "/dashboard/orders",
      icon: ShoppingBag,
    },
    {
      label: language === "bn" ? "কুইজ" : "Quiz",
      href: "/quiz",
      icon: HelpCircle,
    },
    {
      label: language === "bn" ? "রেফারেল" : "Referral",
      href: "/dashboard/referral",
      icon: Share2,
    },
    {
      label: language === "bn" ? "সেটিংস" : "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ];

  return (
    <aside className="w-full lg:w-64 bg-slate-900 text-slate-300 rounded-3xl p-5 flex flex-col justify-between shrink-0 shadow-xl">
      <div>
        <div className="flex items-center gap-3 px-3 py-4 border-b border-slate-800 mb-4">
          <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-white text-lg">
            JQ
          </div>
          <div>
            <div className="font-bold text-white text-base">JobPortal</div>
            <div className="text-[11px] text-emerald-400 font-medium">Candidate Panel</div>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? "bg-emerald-600 text-white font-semibold shadow-sm"
                    : "hover:bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {userRole === "SUPER_ADMIN" && (
            <Link
              href="/admin"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition mt-4"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Admin Panel</span>
            </Link>
          )}
        </nav>
      </div>

      <div className="pt-4 border-t border-slate-800 mt-6">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition w-full text-left"
        >
          <LogOut className="w-4 h-4" />
          <span>{language === "bn" ? "লগআউট" : "Logout"}</span>
        </button>
      </div>
    </aside>
  );
}
