"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "./LanguageContext";
import { Globe } from "lucide-react";

export function Footer() {
  const { language, setLanguage } = useLanguage();

  return (
    <footer className="bg-slate-900 text-gray-400 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Footer Bar with Brand & Moved Language Switcher */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-8 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white font-black text-sm shadow-md shadow-orange-500/30">
              W
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white">
              WO<span className="text-orange-500">JOB</span>
            </span>
            <span className="text-xs text-gray-500 ml-2 hidden md:inline">
              | {language === "bn" ? "ক্যারিয়ার পোর্টাল বাংলাদেশ" : "Career Portal Bangladesh"}
            </span>
          </div>

          {/* Language Switcher moved down to footer area as requested */}
          <div className="flex items-center gap-3 bg-slate-800/90 border border-slate-700/80 px-4 py-2 rounded-full shadow-sm">
            <div className="flex items-center gap-1.5 text-xs text-gray-300 font-bold">
              <Globe className="w-4 h-4 text-orange-400" />
              <span>{language === "bn" ? "ভাষা পরিবর্তন:" : "Language:"}</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setLanguage("bn")}
                className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                  language === "bn"
                    ? "bg-orange-600 text-white shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                বাংলা
              </button>
              <button
                onClick={() => setLanguage("en")}
                className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                  language === "en"
                    ? "bg-orange-600 text-white shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                English
              </button>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-white font-semibold text-sm tracking-wide uppercase mb-4">
              {language === "bn" ? "প্ল্যাটফর্ম পরিচিতি" : "About Platform"}
            </h4>
            <p className="text-sm text-gray-400 leading-relaxed">
              {language === "bn"
                ? "বাংলাদেশের সরকারি, বেসরকারি, কৃষি ও মৎস্য সেক্টরের চাকরির সর্বাধুনিক পোর্টাল। একবার প্রোফাইল বানান, ১ ক্লিকে আবেদন করুন।"
                : "Modern portal for Government, Private, Agriculture, and Fisheries jobs in Bangladesh. Build your portfolio once, apply in 1-click."}
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-xs text-gray-400">
              <Link href="/about" className="hover:text-orange-400 underline underline-offset-4">
                {language === "bn" ? "আমাদের সম্পর্কে" : "About Us"}
              </Link>
              <span>•</span>
              <Link href="/contact" className="hover:text-orange-400 underline underline-offset-4">
                {language === "bn" ? "যোগাযোগ" : "Contact"}
              </Link>
              <span>•</span>
              <Link href="/privacy" className="hover:text-orange-400 underline underline-offset-4">
                {language === "bn" ? "গোপনীয়তা নীতি" : "Privacy Policy"}
              </Link>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm tracking-wide uppercase mb-4">
              {language === "bn" ? "ক্যারিয়ার ও চাকরি" : "Career & Jobs"}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/jobs?category=govt" className="hover:text-orange-400 transition">
                  {language === "bn" ? "সরকারি চাকরি" : "Government Jobs"}
                </Link>
              </li>
              <li>
                <Link href="/jobs?category=krishi" className="hover:text-orange-400 transition">
                  {language === "bn" ? "কৃষি ও এগ্রো-ফার্মিং" : "Agriculture Jobs"}
                </Link>
              </li>
              <li>
                <Link href="/jobs?category=motso" className="hover:text-orange-400 transition">
                  {language === "bn" ? "মৎস্য ও অ্যাকুয়াকালচার" : "Fisheries Jobs"}
                </Link>
              </li>
              <li>
                <Link href="/jobs?category=private" className="hover:text-orange-400 transition">
                  {language === "bn" ? "বেসরকারি ও কর্পোরেট" : "Private Jobs"}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm tracking-wide uppercase mb-4">
              {language === "bn" ? "অন্যান্য সুবিধা" : "Features"}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/quiz" className="hover:text-orange-400 transition">
                  {language === "bn" ? "কুইজ প্রতিযোগিতা ও পুরস্কার" : "Quiz Contest & Cash Rewards"}
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-orange-400 transition">
                  {language === "bn" ? "প্রস্তুতি বই ও কোর্স" : "Preparation Books & Courses"}
                </Link>
              </li>
              <li>
                <Link href="/dashboard/wallet" className="hover:text-orange-400 transition">
                  {language === "bn" ? "ওয়ালেট ও লেনদেন" : "Wallet & Ledger"}
                </Link>
              </li>
              <li>
                <Link href="/dashboard/referral" className="hover:text-orange-400 transition">
                  {language === "bn" ? "লাইফটাইম রেফারেল কমিশন" : "Lifetime Referral Commission"}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm tracking-wide uppercase mb-4">
              {language === "bn" ? "হেল্প ও সাপোর্ট" : "Help & Support"}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="text-gray-300">{language === "bn" ? "হটলাইন:" : "Hotline:"}</span> 09600-000000
              </li>
              <li>
                <span className="text-gray-300">{language === "bn" ? "ইমেইল:" : "Email:"}</span> support@jobportal.bd
              </li>
              <li>
                <span className="text-gray-300">{language === "bn" ? "ঠিকানা:" : "Address:"}</span>{" "}
                {language === "bn" ? "গুলশান-১, ঢাকা, বাংলাদেশ" : "Gulshan-1, Dhaka, Bangladesh"}
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-slate-800 text-center text-xs text-gray-500">
          © 2026 WOJOB. {language === "bn" ? "সর্বস্বত্ব সংরক্ষিত।" : "All rights reserved."}
        </div>
      </div>
    </footer>
  );
}
