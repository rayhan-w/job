"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "./LanguageContext";
import { Search, Globe, User, Wallet, LogOut, ShieldAlert, Briefcase } from "lucide-react";

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
      {/* Impersonation Banner (Acceptance test 5) */}
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
            className="bg-slate-950 text-white text-xs px-3 py-1 rounded font-semibold hover:bg-slate-800 transition"
          >
            {t("return_to_admin")}
          </button>
        </div>
      )}

      {/* Main Navigation Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-emerald-200 shadow-lg">
              <span className="font-extrabold tracking-tighter">JQ</span>
            </div>
            <div>
              <div className="text-2xl font-black text-gray-900 tracking-tight leading-none">
                Job<span className="text-emerald-600">Portal</span>
              </div>
              <div className="text-[11px] font-semibold text-gray-400 tracking-wider uppercase mt-1">
                Your Career, Our Priority
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-[15px] font-medium text-gray-600">
            <Link href="/" className="hover:text-emerald-600 transition">
              {t("nav_home")}
            </Link>
            <Link href="/jobs" className="hover:text-emerald-600 transition">
              {t("nav_jobs")}
            </Link>
            <Link href="/quiz" className="hover:text-emerald-600 transition">
              {t("nav_quiz")}
            </Link>
            <Link href="/products" className="hover:text-emerald-600 transition">
              {t("nav_products")}
            </Link>
            <Link href="/contact" className="hover:text-emerald-600 transition">
              {t("nav_contact")}
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-4">
            {/* Language Switcher (Acceptance test 3) */}
            <div className="flex items-center bg-gray-100 rounded-full p-1 text-xs font-semibold text-gray-600">
              <button
                onClick={() => setLanguage("bn")}
                className={`px-3 py-1 rounded-full transition ${
                  language === "bn"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "hover:text-gray-900"
                }`}
              >
                বাংলা
              </button>
              <button
                onClick={() => setLanguage("en")}
                className={`px-3 py-1 rounded-full transition ${
                  language === "en"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "hover:text-gray-900"
                }`}
              >
                EN
              </button>
            </div>

            {/* Auth Buttons / User Area */}
            {loading ? (
              <div className="w-20 h-9 bg-gray-100 animate-pulse rounded-lg" />
            ) : user ? (
              <div className="flex items-center gap-3">
                {/* Wallet Balance Shortcut */}
                <Link
                  href="/dashboard/wallet"
                  className="hidden sm:flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-200 text-sm font-semibold hover:bg-emerald-100 transition"
                >
                  <Wallet className="w-4 h-4 text-emerald-600" />
                  <span>৳ {user.wallet?.balance?.toLocaleString() || "0"}</span>
                </Link>

                {/* Dashboard Button */}
                <Link
                  href={user.role === "SUPER_ADMIN" || user.role === "ADMIN_STAFF" ? "/admin" : "/dashboard"}
                  className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
                >
                  <User className="w-4 h-4" />
                  <span>{user.name.split(" ")[0]}</span>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 text-gray-400 hover:text-red-600 rounded-lg transition"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-emerald-600 px-4 py-2 text-sm font-medium transition"
                >
                  {t("nav_login")}
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition shadow-sm"
                >
                  {t("nav_register")}
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
