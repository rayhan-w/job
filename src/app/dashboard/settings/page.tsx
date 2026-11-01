"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/components/LanguageContext";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Settings, Lock, Globe, Bell, CheckCircle2, AlertCircle } from "lucide-react";

export default function SettingsPage() {
  const { language, setLanguage } = useLanguage();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [msg, setMsg] = useState<{ text: string; error?: boolean } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.authenticated) {
          setUserData(data.user);
        } else {
          window.location.href = "/login?callbackUrl=/dashboard/settings";
        }
      })
      .catch(() => (window.location.href = "/login"))
      .finally(() => setLoading(false));
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setMsg({
        text: language === "bn" ? "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।" : "Password must be at least 6 characters.",
        error: true,
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMsg({
        text: language === "bn" ? "পাসওয়ার্ড দুটি মিলছে না।" : "Passwords do not match.",
        error: true,
      });
      return;
    }

    try {
      // Use existing profile API to update password
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });
      if (res.ok) {
        setMsg({
          text: language === "bn" ? "পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!" : "Password updated successfully!",
        });
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const d = await res.json();
        setMsg({ text: d.error || "Failed to update password", error: true });
      }
    } catch {
      setMsg({ text: "Server error", error: true });
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <DashboardSidebar userRole={userData?.role} />

        <div className="flex-1 space-y-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2.5">
              <Settings className="w-6 h-6 text-gray-700" />
              <span>{language === "bn" ? "অ্যাকাউন্ট সেটিংস" : "Account Settings"}</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {language === "bn" ? "পাসওয়ার্ড পরিবর্তন ও ভাষা পছন্দ নির্বাচন করুন।" : "Manage your security and platform preferences."}
            </p>
          </div>

          {msg && (
            <div
              className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2.5 ${
                msg.error
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : "bg-emerald-50 text-emerald-800 border border-emerald-200"
              }`}
            >
              {msg.error ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
              <span>{msg.text}</span>
            </div>
          )}

          {/* Language preference */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
              <Globe className="w-4 h-4 text-orange-600" />
              <span>{language === "bn" ? "ভাষা নির্বাচন (Language Preference)" : "Language Preference"}</span>
            </h2>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setLanguage("bn")}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs transition ${
                  language === "bn" ? "bg-orange-600 text-white shadow-sm" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                বাংলা (Bengali)
              </button>
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs transition ${
                  language === "en" ? "bg-orange-600 text-white shadow-sm" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                English
              </button>
            </div>
          </div>

          {/* Change password */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-orange-600" />
              <span>{language === "bn" ? "পাসওয়ার্ড পরিবর্তন করুন" : "Change Password"}</span>
            </h2>

            <form onSubmit={handlePasswordChange} className="max-w-md space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {language === "bn" ? "নতুন পাসওয়ার্ড" : "New Password"}
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-sm focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {language === "bn" ? "নতুন পাসওয়ার্ড নিশ্চিত করুন" : "Confirm New Password"}
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-sm focus:border-orange-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl transition shadow-sm"
              >
                {language === "bn" ? "পাসওয়ার্ড আপডেট করুন" : "Update Password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
