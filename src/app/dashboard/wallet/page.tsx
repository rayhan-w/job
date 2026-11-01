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
  const [cashInRequests, setCashInRequests] = useState<any[]>([]);
  const [cashOutRequests, setCashOutRequests] = useState<any[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  // Cash in modal/form states
  const [cashInAmount, setCashInAmount] = useState("");
  const [cashInMethod, setCashInMethod] = useState("bKash");
  const [cashInSender, setCashInSender] = useState("");
  const [cashInTrxId, setCashInTrxId] = useState("");
  const [cashInNote, setCashInNote] = useState("");
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
      const [userRes, txRes, settingsRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/wallet/transactions"),
        fetch("/api/settings"),
      ]);

      if (userRes.ok) {
        const uData = await userRes.json();
        if (uData?.user) setUserData(uData.user);
      }

      if (txRes.ok) {
        const txData = await txRes.json();
        setTransactions(txData.transactions || []);
        setCashInRequests(txData.cashInRequests || []);
        setCashOutRequests(txData.cashOutRequests || []);
      }

      if (settingsRes.ok) {
        const sData = await settingsRes.json();
        if (sData?.settings) setSettings(sData.settings);
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
          note: cashInNote,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCashInMsg({
          text:
            language === "bn"
              ? "ক্যাশ ইন রিকোয়েস্ট জমা হয়েছে (PENDING)। অ্যাডমিন অনুমোদনের সাথে সাথে ব্যালেন্সে যোগ হবে।"
              : "Cash in request submitted (PENDING). Balance will be credited upon admin approval.",
        });
        setCashInAmount("");
        setCashInSender("");
        setCashInTrxId("");
        setCashInNote("");
        fetchWalletData();
      } else {
        setCashInMsg({
          text: data.error || (language === "bn" ? "রিকোয়েস্ট ব্যর্থ হয়েছে" : "Request failed"),
          error: true,
        });
      }
    } catch {
      setCashInMsg({
        text: language === "bn" ? "সার্ভার এরর" : "Server error",
        error: true,
      });
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
        setCashOutMsg({
          text:
            language === "bn"
              ? "ক্যাশ আউট রিকোয়েস্ট সফলভাবে জমা হয়েছে এবং সমপরিমাণ টাকা হোল্ডে রাখা হয়েছে।"
              : "Cash out request submitted and amount placed on hold.",
        });
        setCashOutAmount("");
        setCashOutReceiver("");
        fetchWalletData();
      } else {
        setCashOutMsg({
          text: data.error || (language === "bn" ? "ক্যাশ আউট ব্যর্থ হয়েছে" : "Cash out failed"),
          error: true,
        });
      }
    } catch {
      setCashOutMsg({
        text: language === "bn" ? "সার্ভার এরর" : "Server error",
        error: true,
      });
    } finally {
      setCashOutSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
        <DashboardSidebar userRole="CUSTOMER" />
        <div className="flex-1 space-y-6">
          <div className="h-8 w-48 bg-gray-200 animate-pulse rounded-xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="h-36 bg-gray-100 animate-pulse rounded-3xl" />
            <div className="h-36 bg-gray-100 animate-pulse rounded-3xl" />
          </div>
          <div className="h-72 bg-gray-100 animate-pulse rounded-3xl" />
        </div>
      </div>
    );
  }

  const currentBalance = userData?.wallet?.balance ?? 0;
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
              {language === "bn" ? "সরাসরি ওয়ালেট ব্যালেন্স ও লেনদেন হিসাব" : "Wallet balance & movements"}
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
                <span>
                  {language === "bn"
                    ? "যেকোনো চাকরি বা কুইজ প্যাকেজ কেনার জন্য প্রস্তুত"
                    : "Ready for purchasing any job circular or quiz package"}
                </span>
              </div>
            </div>

            <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {language === "bn" ? "হোল্ড ব্যালেন্স (ক্যাশ আউট প্রক্রিয়ায়)" : "Held Balance (In Cash Out)"}
                </div>
                <div className="text-3xl font-black text-gray-900 mt-2">
                  ৳ {heldBalance.toLocaleString()}
                </div>
              </div>
              <div className="text-xs text-amber-600 flex items-center gap-1.5 mt-4">
                <Clock className="w-4 h-4 shrink-0" />
                <span>
                  {language === "bn"
                    ? "অ্যাডমিন অনুমোদনের পর প্রদান করা হবে বা বাতিল হলে ব্যালেন্সে ফেরত আসবে"
                    : "Will be disbursed upon approval or refunded back if rejected"}
                </span>
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
                    {language === "bn" ? "ক্যাশ ইন (টাকা জমা করুন)" : "Cash In"}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {language === "bn" ? "বিকাশ / নগদ / রকেট দিয়ে টাকা পাঠান" : "Send money via bKash / Nagad / Rocket"}
                  </p>
                </div>
              </div>

              {/* Official Payment Instructions */}
              <div className="bg-gray-50 p-4 rounded-2xl text-xs text-gray-600 space-y-1.5 mb-5 border border-gray-200">
                <div className="font-bold text-gray-800 mb-1">
                  {language === "bn" ? "অফিসিয়াল নম্বরসমূহ (Send Money):" : "Official Accounts (Send Money):"}
                </div>
                <div>
                  bKash (Personal):{" "}
                  <span className="font-mono font-bold text-gray-900">
                    {settings.bkashNumber || "(অ্যাডমিন সেটিংস থেকে নম্বর যুক্ত করা হবে)"}
                  </span>
                </div>
                <div>
                  Nagad (Personal):{" "}
                  <span className="font-mono font-bold text-gray-900">
                    {settings.nagadNumber || "(অ্যাডমিন সেটিংস থেকে নম্বর যুক্ত করা হবে)"}
                  </span>
                </div>
                <div>
                  Rocket (Personal):{" "}
                  <span className="font-mono font-bold text-gray-900">
                    {settings.rocketNumber || "(অ্যাডমিন সেটিংস থেকে নম্বর যুক্ত করা হবে)"}
                  </span>
                </div>
              </div>

              <form onSubmit={handleCashIn} className="space-y-4">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-xs text-emerald-900 space-y-1">
                  <div className="font-bold flex items-center justify-between">
                    <span>
                      {cashInMethod === "bKash" && (language === "bn" ? "অফিসিয়াল bKash নম্বর:" : "Official bKash Number:")}
                      {cashInMethod === "Nagad" && (language === "bn" ? "অফিসিয়াল Nagad নম্বর:" : "Official Nagad Number:")}
                      {cashInMethod === "Rocket" && (language === "bn" ? "অফিসিয়াল Rocket নম্বর:" : "Official Rocket Number:")}
                      {cashInMethod === "Bank" && (language === "bn" ? "অফিসিয়াল ব্যাংক:" : "Official Bank:")}
                    </span>
                    <span className="font-mono font-bold text-sm text-emerald-800 select-all">
                      {cashInMethod === "bKash" && (settings?.bkashNumber || "01700-000000")}
                      {cashInMethod === "Nagad" && (settings?.nagadNumber || "01700-000000")}
                      {cashInMethod === "Rocket" && (settings?.rocketNumber || "01700-000000")}
                      {cashInMethod === "Bank" && (settings?.bankInfo || "City Bank: 1234567890")}
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    {language === "bn"
                      ? "প্রথমে উক্ত নম্বরে টাকা পাঠিয়ে নিচে আপনার নম্বর ও TrxID দিন।"
                      : "Send money to the number above and provide your sender number & TrxID below."}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {language === "bn" ? "পরিমাণ (৳)" : "Amount (৳)"}
                  </label>
                  <input
                    type="number"
                    required
                    min="10"
                    placeholder="e.g. 100"
                    value={cashInAmount}
                    onChange={(e) => setCashInAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      {language === "bn" ? "মেথড" : "Method"}
                    </label>
                    <select
                      value={cashInMethod}
                      onChange={(e) => setCashInMethod(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-emerald-500 focus:outline-none bg-white"
                    >
                      <option value="bKash">bKash</option>
                      <option value="Nagad">Nagad</option>
                      <option value="Rocket">Rocket</option>
                      <option value="Bank">Bank</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      {language === "bn" ? "প্রেরকের নম্বর" : "Sender Number"}
                    </label>
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
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {language === "bn" ? "ট্রানজেকশন আইডি (TrxID)" : "Transaction ID (TrxID)"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TEST2026AUDIT"
                    value={cashInTrxId}
                    onChange={(e) => setCashInTrxId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-emerald-500 focus:outline-none uppercase font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {language === "bn" ? "নোট / রেফারেন্স (ঐচ্ছিক)" : "Note / Remarks (Optional)"}
                  </label>
                  <input
                    type="text"
                    placeholder={language === "bn" ? "e.g. কুইজ ফি বা জরুরি ডিপোজিট" : "e.g. Deposit reference"}
                    value={cashInNote}
                    onChange={(e) => setCashInNote(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={cashInSubmitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-sm transition shadow-sm disabled:opacity-60"
                >
                  {cashInSubmitting
                    ? (language === "bn" ? "পাঠানো হচ্ছে..." : "Submitting...")
                    : (language === "bn" ? "ক্যাশ ইন রিকোয়েস্ট পাঠান" : "Submit Cash In Request")}
                </button>

                {cashInMsg && (
                  <p className={`text-xs text-center font-medium ${cashInMsg.error ? "text-red-600" : "text-emerald-700 font-bold"}`}>
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
                    {language === "bn" ? "ক্যাশ আউট (উইথড্র)" : "Cash Out (Withdraw)"}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {language === "bn" ? "ব্যালেন্স থেকে টাকা উত্তোলন করুন" : "Withdraw funds to your account"}
                  </p>
                </div>
              </div>

              <form onSubmit={handleCashOut} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {language === "bn" ? "উত্তোলনের পরিমাণ (৳)" : "Amount (৳)"}
                  </label>
                  <input
                    type="number"
                    required
                    min="100"
                    placeholder="Min: 100"
                    value={cashOutAmount}
                    onChange={(e) => setCashOutAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      {language === "bn" ? "মেথড" : "Method"}
                    </label>
                    <select
                      value={cashOutMethod}
                      onChange={(e) => setCashOutMethod(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-blue-500 focus:outline-none bg-white"
                    >
                      <option value="bKash">bKash</option>
                      <option value="Nagad">Nagad</option>
                      <option value="Rocket">Rocket</option>
                      <option value="Bank">Bank</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      {language === "bn" ? "গ্রাহকের নম্বর" : "Account Number"}
                    </label>
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
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-sm transition shadow-sm disabled:opacity-60"
                >
                  {cashOutSubmitting
                    ? (language === "bn" ? "পাঠানো হচ্ছে..." : "Submitting...")
                    : (language === "bn" ? "ক্যাশ আউট রিকোয়েস্ট পাঠান" : "Submit Cash Out Request")}
                </button>

                {cashOutMsg && (
                  <p className={`text-xs text-center font-medium ${cashOutMsg.error ? "text-red-600" : "text-emerald-700 font-bold"}`}>
                    {cashOutMsg.text}
                  </p>
                )}
              </form>
            </div>
          </div>

          {/* Pending and Recent Requests */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6 space-y-4">
            <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-600" />
              <span>{language === "bn" ? "পেন্ডিং ও সাম্প্রতিক রিকোয়েস্ট সমূহ" : "Pending & Recent Requests"}</span>
            </h2>

            {cashInRequests.length === 0 && cashOutRequests.length === 0 ? (
              <p className="text-xs text-gray-400 py-3 text-center">
                {language === "bn" ? "কোনো পেন্ডিং বা সাম্প্রতিক রিকোয়েস্ট নেই।" : "No pending or recent requests."}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-600">
                  <thead className="bg-gray-50 text-gray-700 font-bold uppercase text-[11px] border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3">{language === "bn" ? "তারিখ" : "Date"}</th>
                      <th className="px-4 py-3">{language === "bn" ? "ধরণ" : "Type"}</th>
                      <th className="px-4 py-3">{language === "bn" ? "পরিমাণ" : "Amount"}</th>
                      <th className="px-4 py-3">{language === "bn" ? "মেথড / TrxID" : "Method / TrxID"}</th>
                      <th className="px-4 py-3">{language === "bn" ? "নোট" : "Note"}</th>
                      <th className="px-4 py-3">{language === "bn" ? "স্ট্যাটাস" : "Status"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {cashInRequests.map((req) => (
                      <tr key={"in-" + req.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 text-gray-500">
                          {new Date(req.createdAt).toLocaleDateString(language === "bn" ? "bn-BD" : "en-US", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-4 py-3 font-bold text-emerald-700">ক্যাশ ইন (Cash In)</td>
                        <td className="px-4 py-3 font-black text-emerald-600">৳ {req.amount}</td>
                        <td className="px-4 py-3 font-mono">
                          {req.method} • {req.transactionId}
                        </td>
                        <td className="px-4 py-3 text-gray-500">{req.note || "-"}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              req.status === "APPROVED"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : req.status === "REJECTED"
                                ? "bg-red-50 text-red-700 border border-red-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {req.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {cashOutRequests.map((req) => (
                      <tr key={"out-" + req.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 text-gray-500">
                          {new Date(req.createdAt).toLocaleDateString(language === "bn" ? "bn-BD" : "en-US", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-4 py-3 font-bold text-blue-700">ক্যাশ আউট (Cash Out)</td>
                        <td className="px-4 py-3 font-black text-blue-600">৳ {req.amount}</td>
                        <td className="px-4 py-3 font-mono">
                          {req.method} • {req.receiverNumber}
                        </td>
                        <td className="px-4 py-3 text-gray-500">-</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              req.status === "APPROVED"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : req.status === "REJECTED"
                                ? "bg-red-50 text-red-700 border border-red-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {req.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Real Ledger Transactions Table */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-black text-gray-900">
                {language === "bn" ? "অপরিবর্তনযোগ্য লেজার হিসাব (Immutable Ledger)" : "Transaction History"}
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
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-xs text-gray-400">
                        {language === "bn" ? "কোনো পূর্ববর্তী লেনদেন পাওয়া যায়নি।" : "No transaction records found."}
                      </td>
                    </tr>
                  ) : (
                    transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-gray-50/50">
                        <td className="px-6 py-4 text-xs text-gray-500">
                          {new Date(tx.createdAt).toLocaleDateString(language === "bn" ? "bn-BD" : "en-US", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded ${
                              tx.amount > 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                            }`}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td
                          className={`px-6 py-4 font-bold ${
                            tx.amount > 0 ? "text-emerald-600" : "text-red-600"
                          }`}
                        >
                          {tx.amount > 0 ? `+৳ ${tx.amount}` : `-৳ ${Math.abs(tx.amount)}`}
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-900">
                          ৳ {tx.balanceAfter?.toLocaleString() || "0"}
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-500">{tx.note || "-"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
