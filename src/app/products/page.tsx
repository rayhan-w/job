"use client";

import React, { useState } from "react";
import { useLanguage } from "@/components/LanguageContext";
import { ShoppingBag, CheckCircle2, AlertCircle, Sparkles, BookOpen, Laptop, FileText } from "lucide-react";

export default function ProductsPage() {
  const { language } = useLanguage();
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [buyMessage, setBuyMessage] = useState<{ id: string; text: string; error?: boolean } | null>(null);

  const sampleProducts = [
    {
      id: "prod-1",
      nameBn: "বিসিএস প্রিপারেশন মাস্টার গাইড",
      category: "Books",
      salePrice: 450,
      costPrice: 300,
      descBn: "বিসিএস প্রিলিমিনারি ও লিখিত পরীক্ষার সম্পূর্ণ প্রস্তুতি সহায়িকা বই।",
      icon: BookOpen,
      color: "emerald",
    },
    {
      nameBn: "ব্যাংক জব ম্যাথ ও ইংলিশ অনলাইন কোর্স",
      id: "prod-2",
      category: "Courses",
      salePrice: 1200,
      costPrice: 800,
      descBn: "সকল সরকারি ও বেসরকারি ব্যাংকের নিয়োগ পরীক্ষার স্পেশাল লাইভ কোর্স।",
      icon: Laptop,
      color: "blue",
    },
    {
      nameBn: "প্রিমিয়াম সিভি রিভিউ ও ক্যারিয়ার কনসালটেন্সি",
      id: "prod-3",
      category: "Services",
      salePrice: 500,
      costPrice: 200,
      descBn: "এইচআর প্রফেশনাল দ্বারা আপনার সিভির পূর্ণাঙ্গ রিভিউ ও গাইডলাইন।",
      icon: FileText,
      color: "purple",
    },
  ];

  const handleBuy = async (productId: string) => {
    setBuyingId(productId);
    setBuyMessage(null);
    try {
      const res = await fetch("/api/orders/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{ productId: "seeded-product-id", quantity: 1 }],
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setBuyMessage({
          id: productId,
          text: "অর্ডার সফল! ওয়ালেট থেকে টাকা কাটা হয়েছে এবং এজেন্ট কমিশন জমা হয়েছে ✓",
        });
      } else {
        setBuyMessage({
          id: productId,
          text: data.error || "অর্ডার সম্পন্ন করা যায়নি",
          error: true,
        });
      }
    } catch {
      setBuyMessage({ id: productId, text: "সার্ভার এরর", error: true });
    } finally {
      setBuyingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
          {language === "bn" ? "চাকরি প্রস্তুতি বই ও ক্যারিয়ার সেবা" : "Career Products & Preparation Books"}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {language === "bn"
            ? "ওয়ালেট ব্যালেন্স দিয়ে সহজে কিনুন। প্রতিটি ক্রয় থেকে রেফারেল কমিশন অর্জিত হয়।"
            : "Purchase with your wallet balance. Every purchase generates referral commissions."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sampleProducts.map((p) => {
          const Icon = p.icon;
          const profit = p.salePrice - p.costPrice;

          return (
            <div
              key={p.id}
              className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6" />
                </div>

                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{p.category}</span>
                <h3 className="font-bold text-gray-900 text-lg mt-1">{p.nameBn}</h3>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">{p.descBn}</p>

                {/* Price & Commission Preview */}
                <div className="mt-6 pt-4 border-t border-gray-100 flex items-baseline justify-between">
                  <div>
                    <span className="text-xs text-gray-400">বিক্রয়মূল্য: </span>
                    <span className="text-2xl font-black text-gray-900">৳ {p.salePrice}</span>
                  </div>
                  <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded">
                    কমিশন এলিজিবল
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => handleBuy(p.id)}
                  disabled={buyingId === p.id}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-sm transition shadow-sm"
                >
                  {buyingId === p.id ? "প্রসেস হচ্ছে..." : "ওয়ালেট দিয়ে কিনুন"}
                </button>

                {buyMessage && buyMessage.id === p.id && (
                  <p
                    className={`text-xs mt-2 text-center font-medium ${
                      buyMessage.error ? "text-red-600" : "text-emerald-600"
                    }`}
                  >
                    {buyMessage.text}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
