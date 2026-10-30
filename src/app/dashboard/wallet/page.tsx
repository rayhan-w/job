"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/components/LanguageContext";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  CreditCard,
  Send,
} from "lucide-react";

export default function WalletPage() {
  const { language, t } = useLanguage();
  const [userData, setUserData] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Cash in modal/form states
  const [cashInAmount, setCashInAmount] = useState("");
  const [cashInMethod, setCashInMethod] = useState("bKash");
  const [cashInSender, setCashInSender] = useState("");
  const [cashInTrxId, setCashInTrxId] = useState("");
  const [cashInSubmitting, setCashInSubmitting] = useState(false);
  const [cashInMsg, setCashInMsg] = useState<{ text: string; error?: boolean } | null>(null);

  // Cash out modal/form states
  const [cashOutAmount, setCashOutAmount] = useState("");
  const [cashOutMethod, setCashOutMethod] = useState("bKash");
  const [cashOutReceiver, setCashOutReceiver] = useState("");
  const [cashOutSubmitting, setCashOutSubmitting] = useState(false);
  const [cashOutMsg, setCashOutMsg] = useState<{ text: string; error?: boolean } | null>(null);

  const fetchWalletData = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data?.user) {
        setUserData(data.user);
        // fetch transactions
        const txRes = await fetch("/api/wallet/transactions");
        if (txRes.ok) {
          const txData = await txRes.json();
          setTransactions(txData.transactions || []);
        }
      }
    } catch {
      //
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  const handleCashIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setCashInSubmitting(true);
    setCashInMsg(null);
    try {
      const res = await fetch("/api/wallet/cash-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(cashInAmount),
          method: cashInMethod,
          senderNumber: cashInSender,
          transactionId: cashInTrxId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCashInMsg({ text: "ক্যাশ ইন রিকোয়েস্ট সফলভাবে জমা হয়েছে। অ্যাডমিন অনুমোদনের পর ব্যালেন্সে যোগ হবে।" });
        setCashInAmount("");
        setCashInSender("");
        setCashInTrxId("");
        fetchWalletData();
      } else {
        setCashInMsg({ text: data.error || "রিকোয়েস্ট ব্যর্থ হয়েছে", error: true });
      }
    } catch {
      setCashInMsg({ text: "সার্ভার এরর", error: true });
    } finally {
      setCashInSubmitting(false);
    }
  };

  const handleCashOut = async (e: React.FormEvent) => {
    e.preventDefault();
    setCashOutSubmitting(true);
    setCashOutMsg(null);
    try {
      const res = await fetch("/api/wallet/cash-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(cashOutAmount),
          method: cashOutMethod,
          receiverNumber: cashOutReceiver,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCashOutMsg({ text: "ক্যাশ আউট রিকোয়েস্ট জমা হয়েছে এবং টাকা হোল্ড করা হয়েছে।" });
        setCashOutAmount("");
        setCashOutReceiver("");
        fetchWalletData();
      } else {
        setCashOutMsg({ text: data.error || "ক্যাশ আউট ব্যর্থ হয়েছে", error: true });
      }
    } catch {
      setCashOutMsg({ text: "সার্ভার এরর", error: true });
    } finally {
      setCashOutSubmitting(false);
    }
  };

  const currentBalance = userData?.wallet?.balance ?? 2450;
  const heldBalance = userData?.wallet?.heldBalance ?? 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <DashboardSidebar userRole={userData?.role} />

        <div className="flex-1 space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              {language === "bn" ? "আমার ওয়ালেট" : "My Wallet"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {language === "bn" ? "ম্যানুয়াল ওয়ালেট ব্যালেন্স ও লেনদেন হিসাব" : "Manual wallet ledger & movements"}
            </p>
          </div>

          {/* Balance Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-6 rounded-3xl shadow-lg">
              <div className="text-xs font-semibold text-emerald-100 uppercase tracking-wider">
                {language === "bn" ? "ব্যবহারযোগ্য ব্যালেন্স" : "Available Balance"}
              </div>
              <div className="text-3xl md:text-4xl font-black mt-2">
                ৳ {currentBalance.toLocaleString()}
              </div>
              <div className="mt-4 text-xs text-emerald-100 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>যেকোনো পণ্য বা কুইজ প্যাকেজ কেনার জন্য প্রস্তুত</span>
              </div>
            </div>

            <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {language === "bn" ? "হোল্ড ব্যালেন্স (ক্যাশ আউট প্রক্রিয়ায়)" : "Held Balance"}
                </div>
                <div className="text-3xl font-black text-gray-900 mt-2">
                  ৳ {heldBalance.toLocaleString()}
                </div>
              </div>
              <div className="text-xs text-amber-600 flex items-center gap-1.5 mt-4">
                <Clock className="w-4 h-4 shrink-0" />
                <span>অ্যাডমিন অনুমোদনের পর পেমেন্ট পাঠানো হবে বা রিজেক্ট হলে ফেরত আসবে</span>
              </div>
            </div>
          </div>

          {/* Forms: Cash In & Cash Out Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Cash In Box */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <ArrowDownLeft className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">
                    {language === "bn" ? "ক্যাশ ইন (টাকা ঢোকান)" : "Cash In"}
                  </h3>
                  <p className="text-xs text-gray-500">বিকাশ / নগদ / রকেট দিয়ে টাকা পাঠান</p>
                </div>
              </div>

              {/* Official Payment Instructions */}
              <div className="bg-gray-50 p-4 rounded-2xl text-xs text-gray-600 space-y-1 mb-5 border border-gray-200">
                <div className="font-bold text-gray-800 mb-1">অফিসিয়াল নম্বরসমূহ (Send Money):</div>
                <div>bKash (Personal): <span className="font-mono font-bold text-gray-900">01700000000</span></div>
                <div>Nagad (Personal): <span className="font-mono font-bold text-gray-900">01800000000</span></div>
                <div>Rocket (Personal): <span className="font-mono font-bold text-gray-900">01900000000</span></div>
              </div>

              <form onSubmit={handleCashIn} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">পরিমাণ (৳)</label>
                  <input
                    type="number"
                    required
                    min="10"
                    placeholder="e.g. 500"
                    value={cashInAmount}
                    onChange={(e) => setCashInAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">মেথড</label>
                    <select
                      value={cashInMethod}
                      onChange={(e) => setCashInMethod(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="bKash">bKash</option>
                      <option value="Nagad">Nagad</option>
                      <option value="Rocket">Rocket</option>
                      <option value="Bank">Bank</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">প্রেরকের নম্বর</label>
                    <input
                      type="text"
                      required
                      placeholder="017xxxxxxxx"
                      value={cashInSender}
                      onChange={(e) => setCashInSender(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">ট্রানজেকশন আইডি (TrxID)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BL9A8X76"
                    value={cashInTrxId}
                    onChange={(e) => setCashInTrxId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-emerald-500 focus:outline-none uppercase font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={cashInSubmitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-sm transition shadow-sm"
                >
                  {cashInSubmitting ? "পাঠানো হচ্ছে..." : "ক্যাশ ইন রিকোয়েস্ট পাঠান"}
                </button>

                {cashInMsg && (
                  <p className={`text-xs text-center font-medium ${cashInMsg.error ? "text-red-600" : "text-emerald-600"}`}>
                    {cashInMsg.text}
                  </p>
                )}
              </form>
            </div>

            {/* Cash Out Box */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">
                    {language === "bn" ? "ক্যাশ আউট (টাকা তুলুন)" : "Cash Out"}
                  </h3>
                  <p className="text-xs text-gray-500">বিকাশ / নগদ / রকেটে টাকা উত্তোলন</p>
                </div>
              </div>

              <div className="bg-blue-50/60 p-4 rounded-2xl text-xs text-blue-800 space-y-1 mb-5 border border-blue-100">
                <div>• সর্বনিম্ন ক্যাশ আউট: ৳ ১০০, সর্বোচ্চ: ৳ ২৫,০০০</div>
                <div>• ক্যাশ আউট সার্ভিস চার্জ: ২% (রিকোয়েস্টের সাথে স্বয়ংক্রিয়ভাবে কাটা হবে)</div>
                <div>• রিকোয়েস্ট পাঠানোর সাথে সাথে টাকা হোল্ড করা হবে।</div>
              </div>

              <form onSubmit={handleCashOut} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">উত্তোলনের পরিমাণ (৳)</label>
                  <input
                    type="number"
                    required
                    min="100"
                    max="25000"
                    placeholder="e.g. 1000"
                    value={cashOutAmount}
                    onChange={(e) => setCashOutAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-blue-500 focus:outline-none"
                  />
                  {Number(cashOutAmount) > 0 && (
                    <div className="text-[11px] text-gray-500 mt-1">
                      ফি: ৳ {(Number(cashOutAmount) * 0.02).toFixed(2)} | আপনি পাবেন: ৳ {(Number(cashOutAmount) * 0.98).toFixed(2)}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">মেথড</label>
                    <select
                      value={cashOutMethod}
                      onChange={(e) => setCashOutMethod(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-blue-500 focus:outline-none"
                    >
                      <option value="bKash">bKash</option>
                      <option value="Nagad">Nagad</option>
                      <option value="Rocket">Rocket</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">যে নম্বরে টাকা নিবেন</label>
                    <input
                      type="text"
                      required
                      placeholder="017xxxxxxxx"
                      value={cashOutReceiver}
                      onChange={(e) => setCashOutReceiver(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={cashOutSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-sm transition shadow-sm"
                >
                  {cashOutSubmitting ? "পাঠানো হচ্ছে..." : "ক্যাশ আউট রিকোয়েস্ট পাঠান"}
                </button>

                {cashOutMsg && (
                  <p className={`text-xs text-center font-medium ${cashOutMsg.error ? "text-red-600" : "text-emerald-600"}`}>
                    {cashOutMsg.text}
                  </p>
                )}
              </form>
            </div>
          </div>

          {/* Immutable Transaction History Table */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-black text-gray-900">
                {language === "bn" ? "লেনদেন বিবরণ (Immutable Ledger)" : "Transaction History"}
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50/70 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">{language === "bn" ? "তারিখ" : "Date"}</th>
                    <th className="px-6 py-4">{language === "bn" ? "ধরণ" : "Type"}</th>
                    <th className="px-6 py-4">{language === "bn" ? "পরিমাণ" : "Amount"}</th>
                    <th className="px-6 py-4">{language === "bn" ? "ব্যালেন্স" : "Balance After"}</th>
                    <th className="px-6 py-4">{language === "bn" ? "নোট / রেফারেন্স" : "Note / Reference"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 text-xs text-gray-500">১০ জুন ২০২৬, ১২:৩০</td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">CASH_IN</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-600">+৳ ১,০০০.০০</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">৳ ২,৪৫০.০০</td>
                    <td className="px-6 py-4 text-xs">Approved cash-in via bKash (TrxID: 9X872AB)</td>
                  </tr>
                  <tr className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 text-xs text-gray-500">০৫ জুন ২০২৬, ১৫:৪৫</td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold bg-purple-50 text-purple-700 px-2 py-0.5 rounded">QUIZ_BONUS</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-600">+৳ ১০০.০০</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">৳ ১,৪৫০.০০</td>
                    <td className="px-6 py-4 text-xs">Target score bonus for General Knowledge quiz</td>
                  </tr>
                  <tr className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 text-xs text-gray-500">০১ জুন ২০২৬, ১০:০০</td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded">COMMISSION</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-600">+৳ ১৫০.০০</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">৳ ১,৩৫০.০০</td>
                    <td className="px-6 py-4 text-xs">Referral commission from customer purchase</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
