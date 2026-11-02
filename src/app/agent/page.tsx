"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/components/LanguageContext";
import {
  Wallet,
  CheckCircle2,
  AlertCircle,
  Clock,
  Check,
  X,
  UserCheck,
  ShieldCheck,
  Percent,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  Send,
  Building2,
  RefreshCw,
} from "lucide-react";

export default function AgentPanelPage() {
  const { language } = useLanguage();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [confirmations, setConfirmations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionMsg, setActionMsg] = useState<{ text: string; error?: boolean } | null>(null);

  // Direct cash in form
  const [directPhone, setDirectPhone] = useState("");
  const [directAmount, setDirectAmount] = useState("");
  const [directNote, setDirectNote] = useState("");
  const [submittingDirect, setSubmittingDirect] = useState(false);

  const fetchAgentData = async () => {
    try {
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json();
      if (!meData?.authenticated || (meData.user.role !== "AGENT" && meData.user.role !== "SUPER_ADMIN")) {
        window.location.href = "/login?redirect=/agent";
        return;
      }
      setCurrentUser(meData.user);

      const cashInRes = await fetch("/api/agent/cash-in");
      if (cashInRes.ok) {
        const cData = await cashInRes.json();
        setConfirmations(cData.confirmations || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAgentData();
  }, []);

  const handleAction = async (confirmationId: string, action: "CONFIRM" | "REJECT") => {
    try {
      const res = await fetch("/api/agent/cash-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmationId, action }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionMsg({ text: data.message || "সফলভাবে সম্পন্ন হয়েছে!" });
        fetchAgentData();
      } else {
        setActionMsg({ text: data.error || "কার্যক্রম ব্যর্থ হয়েছে", error: true });
      }
    } catch {
      setActionMsg({ text: "সার্ভার এরর", error: true });
    }
  };

  const handleDirectCashIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingDirect(true);
    setActionMsg(null);
    try {
      const res = await fetch("/api/agent/cash-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerPhone: directPhone,
          amount: Number(directAmount),
          note: directNote,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionMsg({ text: data.message });
        setDirectPhone("");
        setDirectAmount("");
        setDirectNote("");
        fetchAgentData();
      } else {
        setActionMsg({ text: data.error || "ক্যাশ-ইন ব্যর্থ হয়েছে", error: true });
      }
    } catch {
      setActionMsg({ text: "সার্ভার এরর", error: true });
    } finally {
      setSubmittingDirect(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-600" />
      </div>
    );
  }

  const pendingRequests = confirmations.filter((c) => c.status === "PENDING");
  const completedRequests = confirmations.filter((c) => c.status !== "PENDING");

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 border border-orange-200 px-3 py-1 rounded-full text-xs font-extrabold mb-2">
            <UserCheck className="w-3.5 h-3.5" />
            <span>জেলা এজেন্ট প্যানেল (District Agent Hub)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            ক্যাশ-ইন অনুমোদন ও কমিশন পরিচালনা
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            আপনার জেলার চাকরিপ্রার্থীদের নগদ টাকায় ওয়ালেট টপ-আপ প্রদান করুন এবং অনুমোদন করুন।
          </p>
        </div>

        <button
          onClick={() => {
            setRefreshing(true);
            fetchAgentData();
          }}
          disabled={refreshing}
          className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-50 transition shadow-xs self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          <span>রিফ্রেশ</span>
        </button>
      </div>

      {actionMsg && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2.5 ${
            actionMsg.error
              ? "bg-red-50 text-red-700 border border-red-200"
              : "bg-emerald-50 text-emerald-800 border border-emerald-200"
          }`}
        >
          {actionMsg.error ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
          <span>{actionMsg.text}</span>
        </div>
      )}

      {/* Agent Overview Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">দায়িত্বপ্রাপ্ত জেলা</div>
            <div className="text-lg font-black text-gray-900 mt-0.5">
              {currentUser?.agent?.district?.nameBn || "ঢাকা"}
            </div>
            <div className="text-xs text-gray-500">
              এজেন্ট কোড: <code className="font-mono font-bold text-gray-800">{currentUser?.agent?.referralCode || currentUser?.referralCode}</code>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold shrink-0">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">কমিশন রেট</div>
            <div className="text-lg font-black text-gray-900 mt-0.5">
              {currentUser?.agent?.commissionRate ?? 10}%
            </div>
            <div className="text-xs text-emerald-600 font-semibold">সক্রিয় ও কার্যকর</div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">অপেক্ষমান রিকোয়েস্ট</div>
            <div className="text-lg font-black text-gray-900 mt-0.5">
              {pendingRequests.length} টি
            </div>
            <div className="text-xs text-gray-500">অনুমোদনের অপেক্ষায়</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Pending Requests Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-500" />
                  <span>গ্রাহকের ক্যাশ-ইন আবেদন ({pendingRequests.length})</span>
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  টাকা নগদ বা সেন্ড মানি মারফত বুঝে নিয়ে তবেই অনুমোদন করুন।
                </p>
              </div>
            </div>

            {pendingRequests.length === 0 ? (
              <div className="p-10 text-center space-y-2 text-gray-400 text-xs">
                <CheckCircle2 className="w-8 h-8 text-gray-300 mx-auto" />
                <p>কোনো অপেক্ষমান ক্যাশ-ইন রিকোয়েস্ট নেই।</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {pendingRequests.map((req) => (
                  <div key={req.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <strong className="text-sm font-black text-gray-900">
                          {req.customer?.user?.name || "গ্রাহক"}
                        </strong>
                        <span className="text-xs text-gray-500 font-mono">
                          ({req.customer?.user?.phone || req.customerId})
                        </span>
                      </div>
                      <div className="text-xs text-gray-600">
                        পরিমাণ: <strong className="text-orange-600 font-extrabold text-sm">৳ {req.amount}</strong>
                      </div>
                      {req.note && (
                        <div className="text-[11px] text-gray-500 italic">
                          নোট: {req.note}
                        </div>
                      )}
                      <div className="text-[10px] text-gray-400">
                        {new Date(req.createdAt).toLocaleString("bn-BD")}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center">
                      <button
                        onClick={() => handleAction(req.id, "CONFIRM")}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>অনুমোদন করুন</span>
                      </button>
                      <button
                        onClick={() => handleAction(req.id, "REJECT")}
                        className="px-3 py-2 bg-gray-100 hover:bg-red-50 hover:text-red-700 text-gray-600 rounded-xl text-xs font-bold transition"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>বাতিল</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Completed History Table */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>সাম্প্রতিক ক্যাশ-ইন ইতিহাস</span>
              </h2>
            </div>

            {completedRequests.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-xs">
                কোনো পূর্ববর্তী লেনদেন নেই।
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-600">
                  <thead className="bg-gray-50/70 text-gray-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-5 py-3">গ্রাহক</th>
                      <th className="px-5 py-3">ফোন নম্বর</th>
                      <th className="px-5 py-3">পরিমাণ</th>
                      <th className="px-5 py-3">স্ট্যাটাস</th>
                      <th className="px-5 py-3">তারিখ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {completedRequests.slice(0, 15).map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50/40">
                        <td className="px-5 py-3 font-bold text-gray-900">
                          {c.customer?.user?.name || "-"}
                        </td>
                        <td className="px-5 py-3 font-mono">{c.customer?.user?.phone || "-"}</td>
                        <td className="px-5 py-3 font-extrabold text-orange-600">৳ {c.amount}</td>
                        <td className="px-5 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              c.status === "CONFIRMED"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-gray-400">
                          {new Date(c.createdAt).toLocaleDateString("bn-BD")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Direct Cash-In Form */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <Send className="w-5 h-5 text-orange-600" />
              <h2 className="text-base font-extrabold text-gray-900">সরাসরি ক্যাশ-ইন করুন</h2>
            </div>
            <p className="text-xs text-gray-500">
              গ্রাহক আপনাকে নগদ টাকা দিলে তার ফোন নম্বর ও টাকার পরিমাণ দিয়ে তাৎক্ষণিক ওয়ালেট ব্যালেন্স যোগ করে দিন।
            </p>

            <form onSubmit={handleDirectCashIn} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  গ্রাহকের ফোন নম্বর *
                </label>
                <input
                  type="text"
                  required
                  placeholder="017xxxxxxxx"
                  value={directPhone}
                  onChange={(e) => setDirectPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:border-orange-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  টাকার পরিমাণ (৳) *
                </label>
                <input
                  type="number"
                  required
                  min={10}
                  placeholder="e.g. 500"
                  value={directAmount}
                  onChange={(e) => setDirectAmount(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  নোট / বিবরণ (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  placeholder="e.g. ক্যাশ পেমেন্ট গ্রহণ করা হয়েছে"
                  value={directNote}
                  onChange={(e) => setDirectNote(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:border-orange-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={submittingDirect}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-extrabold text-xs shadow-md transition disabled:opacity-50"
              >
                {submittingDirect ? "প্রসেস হচ্ছে..." : "ওয়ালেটে টাকা যোগ করুন (টপ-আপ)"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
