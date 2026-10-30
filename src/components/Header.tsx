"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "./LanguageContext";
import { Search, Globe, User, Wallet, LogOut, ShieldAlert, ArrowRight, Sparkles } from "lucide-react";

export function Header() {
  const { language, setLanguage, t } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.authenticated) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  const handleExitImpersonation = async () => {
    const res = await fetch("/api/admin/impersonate/exit", { method: "POST" });
    if (res.ok) {
      window.location.href = "/admin";
    }
  };

  return (
    <>
      {/* Impersonation Banner */}
      {user?.impersonatorId && (
        <div className="bg-amber-500 text-slate-900 px-4 py-2 font-medium flex items-center justify-between text-sm shadow-md">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-slate-950" />
            <span>
              {t("impersonation_banner", { name: user.name })} ({user.role})
            </span>
          </div>
          <button
            onClick={handleExitImpersonation}
            className="bg-slate-950 text-white text-xs px-3 py-1 rounded-full font-semibold hover:bg-slate-800 transition"
          >
            {t("return_to_admin")}
          </button>
        </div>
      )}

      {/* Floating Pill Navigation Header matching uploaded mockup */}
      <header className="sticky top-4 z-50 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full transition-all duration-200">
        <div className="bg-white/95 backdrop-blur-md rounded-full border border-gray-200/80 shadow-lg shadow-orange-500/5 px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-9 h-9 bg-gradient-to-tr from-orange-600 to-amber-500 rounded-xl flex items-center justify-center text-white font-extrabold text-base shadow-sm group-hover:scale-105 transition">
              <span>W</span>
            </div>
            <div>
              <div className="text-lg font-black text-gray-900 tracking-tight leading-none">
                WO<span className="text-orange-600">JOB</span>
              </div>
              <div className="text-[9px] font-semibold text-gray-400 tracking-wider uppercase">
                {language === "bn" ? "ক্যারিয়ার পোর্টাল" : "Career Portal"}
              </div>
            </div>
          </Link>

          {/* Center Navigation Links (Pill style matching mockup) */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-semibold text-gray-600">
            <Link href="/" className="hover:text-orange-600 transition">
              {t("nav_home")}
            </Link>
            <Link href="/jobs" className="hover:text-orange-600 transition">
              {t("nav_jobs")}
            </Link>
            <Link href="/quiz" className="hover:text-orange-600 transition">
              {t("nav_quiz")}
            </Link>
            <Link href="/products" className="hover:text-orange-600 transition">
              {t("nav_products")}
            </Link>
            <Link href="/contact" className="hover:text-orange-600 transition">
              {t("nav_contact")}
            </Link>
          </nav>

          {/* Right Controls: Language Toggle & User / CTA */}
          <div className="flex items-center gap-3">
            {/* Language Switcher Pill */}
            <div className="flex items-center bg-gray-100/90 rounded-full p-1 text-xs font-bold text-gray-600 border border-gray-200/50">
              <button
                onClick={() => setLanguage("bn")}
                className={`px-2.5 py-1 rounded-full transition ${
                  language === "bn"
                    ? "bg-orange-600 text-white shadow-sm"
                    : "hover:text-gray-900"
                }`}
              >
                বাংলা
              </button>
              <button
                onClick={() => setLanguage("en")}
                className={`px-2.5 py-1 rounded-full transition ${
                  language === "en"
                    ? "bg-orange-600 text-white shadow-sm"
                    : "hover:text-gray-900"
                }`}
              >
                EN
              </button>
            </div>

            {/* Auth Buttons / User Area */}
            {loading ? (
              <div className="w-20 h-9 bg-gray-100 animate-pulse rounded-full" />
            ) : user ? (
              <div className="flex items-center gap-2">
                {/* Wallet Shortcut */}
                <Link
                  href="/dashboard/wallet"
                  className="hidden sm:flex items-center gap-1.5 bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full border border-orange-200 text-xs font-bold hover:bg-orange-100 transition"
                >
                  <Wallet className="w-3.5 h-3.5 text-orange-600" />
                  <span>৳ {user.wallet?.balance?.toLocaleString() || "0"}</span>
                </Link>

                {/* Dashboard Pill */}
                <Link
                  href={user.role === "SUPER_ADMIN" || user.role === "ADMIN_STAFF" ? "/admin" : "/dashboard"}
                  className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-gray-800 transition"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>{user.name.split(" ")[0]}</span>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-1.5 text-gray-400 hover:text-red-600 rounded-full transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-orange-600 px-3 py-2 text-xs font-bold transition"
                >
                  {t("nav_login")}
                </Link>
                <Link
                  href="/register"
                  className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-full text-xs font-bold transition shadow-sm shadow-orange-500/20 flex items-center gap-1.5"
                >
                  <span>{language === "bn" ? "নিবন্ধন করুন" : "Hire Now"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
