"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageContext";
import { UserCheck, ArrowLeft, CheckCircle2, AlertCircle, KeyRound, Smartphone, Mail, ArrowRight, ShieldCheck } from "lucide-react";

export default function ForgotPasswordPage() {
  const { language } = useLanguage();
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultData, setResultData] = useState<{
    userName?: string;
    phone?: string;
    email?: string | null;
    emailSent?: boolean;
    resetUrl?: string;
    message?: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResultData(null);

    const trimmed = identifier.trim();
    if (!trimmed) {
      setError(
        language === "bn"
          ? "অনুগ্রহ করে আপনার নিবন্ধিত মোবাইল নম্বর অথবা ইমেইল দিন।"
          : "Please enter your registered mobile number or email address."
      );
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: trimmed }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setResultData({
          userName: data.name,
          phone: data.phone,
          email: data.email,
          emailSent: data.emailSent,
          resetUrl: data.resetUrl,
          message: data.message,
        });
      } else {
        setError(data.error || (language === "bn" ? "অ্যাকাউন্ট ভেরিফিকেশন ব্যর্থ হয়েছে" : "Verification failed"));
      }
    } catch {
      setError(
        language === "bn"
          ? "সার্ভার বা নেটওয়ার্ক সংযোগে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।"
          : "Network or server error. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white p-7 sm:p-9 rounded-3xl border border-gray-100 shadow-xl w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="w-13 h-13 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-orange-100 shadow-xs">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            {language === "bn" ? "পাসওয়ার্ড ভুলে গেছেন?" : "Forgot Password?"}
          </h1>
          <p className="mt-1 text-xs text-gray-500 leading-relaxed">
            {language === "bn"
              ? "আপনার নিবন্ধিত মোবাইল নম্বর অথবা ইমেইল ঠিকানা দিন, আমরা অ্যাকাউন্ট যাচাই করে পাসওয়ার্ড রিসেট করব।"
              : "Enter your registered mobile number or email address to verify and reset your password."}
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 text-red-700 text-xs rounded-2xl border border-red-200 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed font-medium">{error}</span>
          </div>
        )}

        {resultData ? (
          <div className="space-y-5">
            {/* Account Verified Card */}
            <div className="p-4 bg-emerald-50 text-emerald-900 text-xs rounded-2xl border border-emerald-200 space-y-3">
              <div className="flex items-center gap-2 font-bold text-emerald-800 text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{language === "bn" ? "অ্যাকাউন্ট যাচাই সফল হয়েছে!" : "Account Verified!"}</span>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-emerald-100 text-gray-700 space-y-1">
                <div className="font-bold text-gray-900 text-xs">
                  {resultData.userName || (language === "bn" ? "ব্যবহারকারী" : "User")}
                </div>
                <div className="text-[11px] text-gray-500 flex items-center gap-1.5">
                  <Smartphone className="w-3 h-3 text-gray-400" />
                  <span>{resultData.phone}</span>
                  {resultData.email && (
                    <>
                      <span>•</span>
                      <Mail className="w-3 h-3 text-gray-400" />
                      <span>{resultData.email}</span>
                    </>
                  )}
                </div>
              </div>

              <p className="leading-relaxed text-gray-600 text-[11px]">
                {resultData.message}
              </p>
            </div>

            {/* Direct Password Reset Button */}
            {resultData.resetUrl && (
              <a
                href={resultData.resetUrl}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 px-4 rounded-xl text-center flex items-center justify-center gap-2 text-sm shadow-md shadow-orange-600/20 transition group"
              >
                <ShieldCheck className="w-4 h-4 text-white" />
                <span>{language === "bn" ? "সরাসরি নতুন পাসওয়ার্ড সেট করুন" : "Set New Password Now"}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </a>
            )}

            <div className="pt-2 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{language === "bn" ? "লগইন পৃষ্ঠায় ফিরে যান" : "Back to Sign In"}</span>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                {language === "bn" ? "মোবাইল নম্বর অথবা ইমেইল" : "Mobile Number or Email"}
              </label>
              <div className="relative">
                <Smartphone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder={language === "bn" ? "০১৭XXXXXXXX অথবা name@example.com" : "017XXXXXXXX or name@example.com"}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-orange-500 focus:outline-none transition bg-gray-50/50 focus:bg-white"
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                {language === "bn"
                  ? "নিবন্ধিত ১১ ডিজিটের মোবাইল নম্বর অথবা ইমেইল লিখুন"
                  : "Enter your registered 11-digit mobile number or email"}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl text-sm transition shadow-md shadow-orange-600/20 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{language === "bn" ? "যাচাই করা হচ্ছে..." : "Verifying..."}</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>{language === "bn" ? "পাসওয়ার্ড রিসেট করুন" : "Reset Password"}</span>
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{language === "bn" ? "লগইনে ফিরে যান" : "Back to Login"}</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
