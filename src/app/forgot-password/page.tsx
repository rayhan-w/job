"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageContext";
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, KeyRound } from "lucide-react";

export default function ForgotPasswordPage() {
  const { language } = useLanguage();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();

      if (res.ok) {
        setSuccessMsg(
          language === "bn"
            ? "যদি আপনার এই ইমেইলটি নিবন্ধিত থাকে, তবে পাসওয়ার্ড রিসেটের লিংক পাঠানো হয়েছে। ইনবক্স অথবা স্প্যাম ফোল্ডার চেক করুন।"
            : "If an account with this email exists, a password reset link has been sent. Please check your inbox or spam folder."
        );
      } else {
        setError(data.error || "Failed to send reset email");
      }
    } catch {
      setError("Network or server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-orange-100">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            {language === "bn" ? "পাসওয়ার্ড ভুলে গেছেন?" : "Forgot Password?"}
          </h1>
          <p className="mt-1 text-xs text-gray-500">
            {language === "bn"
              ? "আপনার নিবন্ধিত ইমেইল ঠিকানা দিন, আমরা একটি রিসেট লিংক পাঠাব।"
              : "Enter your registered email address and we will send you a reset link."}
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg ? (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 text-emerald-800 text-xs rounded-2xl border border-emerald-200 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-medium">{successMsg}</div>
            </div>

            <Link
              href="/login"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-bold text-sm transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{language === "bn" ? "লগইন পৃষ্ঠায় ফিরে যান" : "Back to Sign In"}</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {language === "bn" ? "ইমেইল ঠিকানা" : "Email Address"}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl text-sm transition shadow-md disabled:opacity-60"
            >
              {loading
                ? (language === "bn" ? "লিংক পাঠানো হচ্ছে..." : "Sending link...")
                : (language === "bn" ? "রিসেট লিংক পাঠান" : "Send Reset Link")}
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
