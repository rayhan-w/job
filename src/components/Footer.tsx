"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "./LanguageContext";

export function Footer() {
  const { language } = useLanguage();

  return (
    <footer className="bg-slate-900 text-gray-400 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white font-black text-xs shadow-md shadow-orange-500/30">
              W
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white">
              WO<span className="text-orange-500">JOB</span>
            </span>
          </div>
          <p className="mt-3 text-sm text-gray-400 leading-relaxed">
            {language === "bn"
              ? "বাংলাদেশের সরকারি, বেসরকারি, কৃষি ও মৎস্য সেক্টরের চাকরির সর্বাধুনিক পোর্টাল। একবার প্রোফাইল বানান, ১ ক্লিকে আবেদন করুন।"
              : "Modern portal for Government, Private, Agriculture, and Fisheries jobs in Bangladesh. Build your portfolio once, apply in 1-click."}
          </p>
          <div className="mt-4 text-xs text-gray-500">
            © 2026 WOJOB. {language === "bn" ? "সর্বস্বত্ব সংরক্ষিত।" : "All rights reserved."}
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
    </footer>
  );
}
