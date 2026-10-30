"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/components/LanguageContext";
import { User, Phone, Lock, Share2, AlertCircle } from "lucide-react";

function RegisterContent() {
  const { language } = useLanguage();
  const searchParams = useSearchParams();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [refCode, setRefCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      setRefCode(ref);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          password,
          refCode: refCode.trim() || undefined,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        window.location.href = "/dashboard";
      } else {
        setError(data.error || "Registration failed");
      }
    } catch {
      setError("Network or server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl mx-auto shadow-blue-200 shadow-md">
            JQ
          </div>
          <h1 className="mt-4 text-2xl font-black text-gray-900 tracking-tight">
            {language === "bn" ? "নতুন অ্যাকাউন্ট খুলুন" : "Create an Account"}
          </h1>
          <p className="mt-1 text-xs text-gray-500">
            {language === "bn"
              ? "১ বার প্রোফাইল তৈরি করে সকল চাকরিতে ১ ক্লিকে আবেদন করুন"
              : "Build your profile once, apply in 1 click forever"}
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
              {language === "bn" ? "আপনার পুরো নাম" : "Full Name"}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                placeholder="e.g. রাহাতুল ইসলাম"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              {language === "bn" ? "ফোন নম্বর" : "Phone Number"}
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                placeholder="017xxxxxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              {language === "bn" ? "পাসওয়ার্ড" : "Password"}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              {language === "bn" ? "রেফারেল কোড (ঐচ্ছিক)" : "Referral Code (Optional)"}
            </label>
            <div className="relative">
              <Share2 className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="e.g. REF12345"
                value={refCode}
                onChange={(e) => setRefCode(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-blue-500 focus:outline-none font-mono"
              />
            </div>
            {!refCode && (
              <p className="text-[11px] text-gray-400 mt-1">
                {language === "bn"
                  ? "* কোনো কোড না দিলে স্বয়ংক্রিয়ভাবে সিস্টেমের ডিফল্ট এজেন্টের অধীনে যুক্ত হবেন।"
                  : "* Without a referral code, you will automatically be assigned under the default agent."}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-sm transition shadow-md"
          >
            {loading
              ? (language === "bn" ? "অ্যাকাউন্ট তৈরি হচ্ছে..." : "Creating account...")
              : (language === "bn" ? "রেজিস্টার করুন" : "Register")}
          </button>
        </form>

        <div className="text-center text-xs text-gray-500">
          {language === "bn" ? "ইতিমধ্যে অ্যাকাউন্ট আছে?" : "Already have an account?"}{" "}
          <Link href="/login" className="font-bold text-blue-600 hover:text-blue-700">
            {language === "bn" ? "লগইন করুন" : "Sign In"}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
