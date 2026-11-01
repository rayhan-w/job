"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageContext";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { ShoppingBag, BookOpen, Clock, ArrowRight } from "lucide-react";

export default function OrdersPage() {
  const { language } = useLanguage();
  const [userData, setUserData] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.authenticated) {
          setUserData(data.user);
          // Fetch quiz attempts / orders
          fetch("/api/quiz/packages")
            .then((res) => res.json())
            .then((qData) => {
              if (qData.packages) setOrders(qData.packages);
            });
        } else {
          window.location.href = "/login?callbackUrl=/dashboard/orders";
        }
      })
      .catch(() => (window.location.href = "/login"))
      .finally(() => setLoading(false));
  }, []);

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2.5">
                <ShoppingBag className="w-6 h-6 text-orange-600" />
                <span>{language === "bn" ? "আমার প্যাকেজ ও অর্ডার" : "My Orders & Packages"}</span>
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {language === "bn"
                  ? "আপনার কেনা কুইজ প্যাকেজ এবং ডিজিটাল কোর্সের তালিকা।"
                  : "Overview of your subscribed packages and learning material."}
              </p>
            </div>
            <Link
              href="/quiz"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-sm transition"
            >
              <span>{language === "bn" ? "কুইজ খেলুন" : "Play Quiz"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6">
            <div className="space-y-4">
              {orders.slice(0, 3).map((pkg) => (
                <div
                  key={pkg.id}
                  className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">
                        {language === "bn" ? pkg.nameBn : pkg.nameEn || pkg.nameBn}
                      </h3>
                      <p className="text-xs text-gray-400">
                        {language === "bn" ? "ফি: ৳" : "Fee: ৳"}{pkg.price} | {pkg.questionCount || 10} {language === "bn" ? "টি প্রশ্ন" : "Questions"}
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/quiz"
                    className="self-start sm:self-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-sm"
                  >
                    {language === "bn" ? "অংশ নিন →" : "Access Now →"}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
