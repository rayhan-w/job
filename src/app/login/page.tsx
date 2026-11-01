"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageContext";
import { Phone, Lock, LogIn, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const { language, t } = useLanguage();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json();

      if (res.ok) {
        if (data.user.role === "SUPER_ADMIN" || data.user.role === "ADMIN_STAFF") {
          window.location.href = "/admin";
        } else {
          window.location.href = "/dashboard";
        }
      } else {
        setError(data.error || "Login failed");
      }
    } catch {
      setError("Network or server error");
    } finally {
      setLoading(false);
    }
  };

  const quickFill = (p: string, pwd: string) => {
    setPhone(p);
    setPassword(pwd);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-tr from-orange-600 to-amber-500 rounded-2xl flex items-center justify-center text-white font-extrabold text-xl mx-auto shadow-orange-200 shadow-md">
            W
          </div>
          <h1 className="mt-4 text-2xl font-black text-gray-900 tracking-tight">
            {language === "bn" ? "অ্যাকাউন্টে লগইন করুন" : "Sign In to Your Account"}
          </h1>
          <p className="mt-1 text-xs text-gray-500">
            {language === "bn" ? "আপনার ফোন নম্বর ও পাসওয়ার্ড দিন" : "Enter your phone and password"}
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              {language === "bn" ? "ফোন নম্বর অথবা ইমেইল" : "Phone Number or Email"}
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                placeholder={language === "bn" ? "017xxxxxxxx বা name@example.com" : "017xxxxxxxx or name@example.com"}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-gray-700">
                {language === "bn" ? "পাসওয়ার্ড" : "Password"}
              </label>
              <Link
                href="/forgot-password"
                className="text-[11px] font-semibold text-orange-600 hover:text-orange-700 hover:underline"
              >
                {language === "bn" ? "পাসওয়ার্ড ভুলে গেছেন?" : "Forgot password?"}
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-sm transition shadow-md flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? (language === "bn" ? "লগইন হচ্ছে..." : "Signing in...") : (language === "bn" ? "লগইন করুন" : "Sign In")}</span>
          </button>
        </form>

        {/* Quick Test Accounts Filler */}
        <div className="pt-4 border-t border-gray-100">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 text-center">
            {language === "bn" ? "টেস্ট অ্যাকাউন্ট (১-ক্লিক সিলেক্ট):" : "Test Accounts (1-Click Select):"}
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => quickFill("01712345678", "User@123456")}
              className="p-2 bg-emerald-50 text-emerald-800 rounded-lg font-semibold hover:bg-emerald-100 transition text-left"
            >
              👤 {language === "bn" ? "ক্যান্ডিডেট (রাহাতুল)" : "Candidate (Rahatul)"}
            </button>
            <button
              type="button"
              onClick={() => quickFill("01700000001", "Admin@123456")}
              className="p-2 bg-purple-50 text-purple-800 rounded-lg font-semibold hover:bg-purple-100 transition text-left"
            >
              🛡️ {language === "bn" ? "সুপার অ্যাডমিন" : "Super Admin"}
            </button>
            <button
              type="button"
              onClick={() => quickFill("01700000002", "Staff@123456")}
              className="p-2 bg-blue-50 text-blue-800 rounded-lg font-semibold hover:bg-blue-100 transition text-left"
            >
              👮 {language === "bn" ? "জব মডারেটর স্টাফ" : "Job Moderator Staff"}
            </button>
            <button
              type="button"
              onClick={() => quickFill("01700000021", "Agent@123456")}
              className="p-2 bg-amber-50 text-amber-800 rounded-lg font-semibold hover:bg-amber-100 transition text-left"
            >
              💼 {language === "bn" ? "এজেন্ট (ঢাকা)" : "Agent (Dhaka)"}
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-gray-600 bg-orange-50/80 p-3.5 rounded-2xl border border-orange-200/80">
          <span>{language === "bn" ? "নতুন অ্যাকাউন্ট প্রয়োজন? " : "Don't have an account? "}</span>
          <Link
            href="/register"
            className="font-bold text-orange-600 hover:text-orange-700 underline transition"
          >
            {language === "bn" ? "নিবন্ধন করুন (Create account)" : "Create account / Register"}
          </Link>
        </div>
      </div>
    </div>
  );
}
