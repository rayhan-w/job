"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "./LanguageContext";
import { User, Wallet, LogOut, ShieldAlert, LogIn } from "lucide-react";

export function Header() {
  const { language, t } = useLanguage();
  const [user, setUser] = useState<any>(null);

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
      .catch(() => setUser(null));
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

      {/* Slim & Compact Floating Header (v4: Logo + WOJOB + Login on left side only) */}
      <header className="sticky top-3 z-50 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full transition-all duration-200">
        <div className="bg-white/95 backdrop-blur-md rounded-full border border-gray-200/80 shadow-md shadow-orange-500/5 px-4 sm:px-5 h-12 flex items-center justify-between">
          {/* Left Side: Brand Logo (WOJOB) + Login (লগইন) */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-gradient-to-tr from-orange-600 to-amber-500 rounded-lg flex items-center justify-center text-white font-extrabold text-sm shadow-sm group-hover:scale-105 transition">
                <span>W</span>
              </div>
              <div className="text-base font-black text-gray-900 tracking-tight leading-none">
                WO<span className="text-orange-600">JOB</span>
              </div>
            </Link>

            {/* Login (লগইন) placed on the left side with brand - no wrapping, slim & compact */}
            {!user && (
              <Link
                href="/login"
                className="flex items-center gap-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1.5 rounded-full border border-orange-200/80 transition shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5 text-orange-600" />
                <span>{language === "bn" ? "লগইন" : "Login"}</span>
              </Link>
            )}
          </div>

          {/* Right Side / Authenticated User Pill (when logged in) */}
          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                {/* Wallet Shortcut */}
                <Link
                  href="/dashboard/wallet"
                  className="hidden sm:flex items-center gap-1 bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full border border-orange-200 text-xs font-bold hover:bg-orange-100 transition"
                >
                  <Wallet className="w-3.5 h-3.5 text-orange-600" />
                  <span>৳ {user.wallet?.balance?.toLocaleString() || "0"}</span>
                </Link>

                {/* Dashboard Pill */}
                <Link
                  href={user.role === "SUPER_ADMIN" || user.role === "ADMIN_STAFF" ? "/admin" : "/dashboard"}
                  className="flex items-center gap-1.5 bg-gray-900 text-white px-3.5 py-1.5 rounded-full text-xs font-bold hover:bg-gray-800 transition"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>{user.name.split(" ")[0]}</span>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-1 text-gray-400 hover:text-red-600 rounded-full transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>
    </>
  );
}
