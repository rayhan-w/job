"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageContext";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { ShoppingBag, BookOpen, Clock, ArrowRight, CheckCircle2 } from "lucide-react";

export default function OrdersPage() {
  const { language } = useLanguage();
  const [userData, setUserData] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.authenticated) {
          setUserData(data.user);
          // Fetch user's real orders and purchased quiz packages
          fetch("/api/orders")
            .then((res) => res.json())
            .then((oData) => {
              if (oData?.orders) setOrders(oData.orders);
              if (oData?.quizAttempts) setQuizAttempts(oData.quizAttempts);
            })
            .catch(() => {});
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-600" />
      </div>
    );
  }

  const hasPurchases = orders.length > 0 || quizAttempts.length > 0;

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
              <span>{language === "bn" ? "কুইজ খেলুন" : "Browse Quizzes"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6">
            {!hasPurchases ? (
              <div className="py-12 text-center text-gray-500 space-y-3">
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-gray-800 text-base">
                  {language === "bn" ? "কোনো প্যাকেজ কেনা হয়নি" : "No Packages Purchased Yet"}
                </h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  {language === "bn"
                    ? "আপনি এখনো কোনো পেইড কুইজ প্যাকেজ ক্রয় করেননি। আমাদের কুইজ সেকশন থেকে প্রস্তুতিমূলক প্যাকেজ কিনুন।"
                    : "You haven't purchased any quiz packages yet. Browse our quiz bank to practice."}
                </p>
                <div className="pt-2">
                  <Link
                    href="/quiz"
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
                  >
                    <span>{language === "bn" ? "কুইজ প্যাকেজ দেখুন" : "View Quiz Packages"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Orders list */}
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                        <ShoppingBag className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm">
                          {ord.items?.[0]?.product?.nameBn || `Order #${ord.id.slice(0, 8)}`}
                        </h3>
                        <p className="text-xs text-gray-400">
                          {language === "bn" ? "তারিখ:" : "Date:"} {new Date(ord.createdAt).toLocaleDateString()} |{" "}
                          {language === "bn" ? "মূল্য: ৳" : "Total: ৳"}{ord.totalAmount}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{ord.status}</span>
                      </span>
                      <Link
                        href="/quiz"
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-sm"
                      >
                        {language === "bn" ? "কুইজ খেলুন →" : "Play Now →"}
                      </Link>
                    </div>
                  </div>
                ))}

                {/* Quiz attempts / packages */}
                {quizAttempts.map((attempt) => (
                  <div
                    key={attempt.id}
                    className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm">
                          {language === "bn" ? attempt.packageNameBn : attempt.packageNameEn || attempt.packageNameBn}
                        </h3>
                        <p className="text-xs text-gray-400">
                          {attempt.bookName} • {attempt.questionCount} {language === "bn" ? "টি প্রশ্ন" : "Questions"} |{" "}
                          {new Date(attempt.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <Link
                      href={`/quiz/play/${attempt.id}`}
                      className="self-start sm:self-auto px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl transition shadow-sm"
                    >
                      {attempt.status === "COMPLETED"
                        ? (language === "bn" ? "ফলাফল দেখুন →" : "View Result →")
                        : (language === "bn" ? "চালিয়ে যান →" : "Continue Quiz →")}
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
