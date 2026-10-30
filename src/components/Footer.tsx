import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-gray-400 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="text-2xl font-black text-white tracking-tight">
            Job<span className="text-emerald-500">Portal</span>
          </div>
          <p className="mt-3 text-sm text-gray-400 leading-relaxed">
            বাংলাদেশের সরকারি, বেসরকারি, এনজিও ও ব্যাংক চাকরির সর্ববৃহৎ পোর্টাল। একবার প্রোফাইল বানান, ১ ক্লিকে আবেদন করুন।
          </p>
          <div className="mt-4 text-xs text-gray-500">
            © 2026 JobPortal. All rights reserved.
          </div>
        </div>

        <div>
          <h4 className="text-white font-semibold text-sm tracking-wide uppercase mb-4">ক্যারিয়ার ও চাকরি</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/jobs?category=govt" className="hover:text-emerald-400 transition">সরকারি চাকরি</Link></li>
            <li><Link href="/jobs?category=bank" className="hover:text-emerald-400 transition">ব্যাংক জব</Link></li>
            <li><Link href="/jobs?category=private" className="hover:text-emerald-400 transition">বেসরকারি চাকরি</Link></li>
            <li><Link href="/jobs?category=ngo" className="hover:text-emerald-400 transition">এনজিও চাকরি</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold text-sm tracking-wide uppercase mb-4">অন্যান্য সুবিধা</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/quiz" className="hover:text-emerald-400 transition">কুইজ প্রতিযোগিতা ও পুরস্কার</Link></li>
            <li><Link href="/products" className="hover:text-emerald-400 transition">প্রস্তুতি বই ও কোর্স</Link></li>
            <li><Link href="/dashboard/wallet" className="hover:text-emerald-400 transition">ওয়ালেট ও লেনদেন</Link></li>
            <li><Link href="/dashboard/referral" className="hover:text-emerald-400 transition">লাইফটাইম রেফারেল কমিশন</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold text-sm tracking-wide uppercase mb-4">হেল্প ও সাপোর্ট</h4>
          <ul className="space-y-2 text-sm">
            <li><span className="text-gray-300">হটলাইন:</span> 09600-000000</li>
            <li><span className="text-gray-300">ইমেইল:</span> support@jobportal.bd</li>
            <li><span className="text-gray-300">ঠিকানা:</span> গুলশান-১, ঢাকা, বাংলাদেশ</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
