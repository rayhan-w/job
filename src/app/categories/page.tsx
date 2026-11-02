"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageContext";
import {
  Briefcase,
  Building2,
  GraduationCap,
  Sprout,
  Fish,
  Laptop,
  Users,
  Folder,
  Search,
  ArrowRight,
  Sparkles,
} from "lucide-react";

function getCategoryIcon(slug: string, iconName?: string) {
  const key = (slug + " " + (iconName || "")).toLowerCase();
  if (key.includes("govt") || key.includes("sorkari")) return <Building2 className="w-7 h-7 text-emerald-600" />;
  if (key.includes("private") || key.includes("besorkari")) return <Briefcase className="w-7 h-7 text-blue-600" />;
  if (key.includes("sprout") || key.includes("krishi") || key.includes("agro")) return <Sprout className="w-7 h-7 text-amber-600" />;
  if (key.includes("fish") || key.includes("motso")) return <Fish className="w-7 h-7 text-sky-600" />;
  if (key.includes("laptop") || key.includes("it") || key.includes("tech")) return <Laptop className="w-7 h-7 text-indigo-600" />;
  if (key.includes("briefcase") || key.includes("bank")) return <Briefcase className="w-7 h-7 text-emerald-600" />;
  if (key.includes("users") || key.includes("ngo")) return <Users className="w-7 h-7 text-rose-600" />;
  if (key.includes("edu") || key.includes("shikkha")) return <GraduationCap className="w-7 h-7 text-purple-600" />;
  return <Folder className="w-7 h-7 text-orange-600" />;
}

function toBanglaNumber(num: number) {
  const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num.toString().replace(/\d/g, (d) => bnDigits[parseInt(d, 10)]);
}

export default function CategoriesPage() {
  const { language, t } = useLanguage();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchCategories = () => {
    setLoading(true);
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data?.categories) setCategories(data.categories);
      })
      .catch((err) => console.error("Fetch categories error:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter((cat) => {
    const term = search.toLowerCase();
    const nameBn = (cat.nameBn || "").toLowerCase();
    const nameEn = (cat.nameEn || "").toLowerCase();
    const slug = (cat.slug || "").toLowerCase();
    return nameBn.includes(term) || nameEn.includes(term) || slug.includes(term);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Page Header */}
      <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
            <span>{language === "bn" ? "সকল চাকরির সেক্টর" : "All Job Sectors"}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            {language === "bn" ? "সকল চাকরির ক্যাটাগরি" : "All Job Categories"}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {language === "bn"
              ? "পছন্দের সেক্টর বা ক্যাটাগরিতে ক্লিক করে সরাসরি সেই ক্যাটাগরির সক্রিয় সার্কুলারগুলো দেখুন।"
              : "Explore career opportunities by industry sector. Real-time active job openings updated live."}
          </p>
        </div>

        {/* Search Box */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder={language === "bn" ? "ক্যাটাগরি খুঁজুন..." : "Filter categories..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 text-xs sm:text-sm focus:border-orange-500 focus:outline-none bg-gray-50/50"
          />
        </div>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-600" />
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center text-gray-500 border border-gray-200/80">
          {language === "bn" ? "কোনো ক্যাটাগরি পাওয়া যায়নি।" : "No categories matched your search."}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredCategories.map((cat) => (
            <Link
              key={cat.id}
              href={`/jobs?category=${cat.slug}`}
              className="group bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-lg hover:border-orange-400 transition-all duration-200 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-13 h-13 rounded-2xl bg-orange-50/80 border border-orange-100 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0 p-3">
                  {getCategoryIcon(cat.slug, cat.icon)}
                </div>
                <div className="min-w-0">
                  <h2 className="font-bold text-gray-900 group-hover:text-orange-600 transition text-sm sm:text-base truncate">
                    {language === "bn" ? cat.nameBn : cat.nameEn || cat.nameBn}
                  </h2>
                  <p className="text-xs text-gray-500 font-semibold mt-0.5">
                    {language === "bn"
                      ? `${toBanglaNumber(cat.jobCount || 0)}টি চাকরি`
                      : `${cat.jobCount || 0} ${cat.jobCount === 1 ? "Job" : "Jobs"}`}
                  </p>
                </div>
              </div>

              <div className="w-8 h-8 rounded-full bg-gray-50 group-hover:bg-orange-600 group-hover:text-white flex items-center justify-center text-gray-400 transition-colors shrink-0">
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
