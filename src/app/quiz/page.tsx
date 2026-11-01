"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/LanguageContext";
import {
  HelpCircle,
  Clock,
  Award,
  Trophy,
  Play,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  Wallet,
  Sparkles,
  BookOpen,
} from "lucide-react";

export default function QuizPage() {
  const { language } = useLanguage();
  const router = useRouter();

  const [packages, setPackages] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"packages" | "leaderboard">("packages");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [userAttempts, setUserAttempts] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);

  // Play state
  const [currentAttemptId, setCurrentAttemptId] = useState<string | null>(null);
  const [currentPackage, setCurrentPackage] = useState<any>(null);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState<any>(null);
  const [actionMsg, setActionMsg] = useState<{ text: string; error?: boolean; needCashIn?: boolean } | null>(null);
  const [buyingId, setBuyingId] = useState<string | null>(null);

  const fetchPackagesAndStatus = async () => {
    try {
      const res = await fetch("/api/quiz/packages");
      if (res.ok) {
        const data = await res.json();
        setPackages(data.packages || []);
        setIsLoggedIn(Boolean(data.isLoggedIn));
        setWalletBalance(data.walletBalance || 0);
        setUserAttempts(data.userAttempts || {});
      }
    } catch (e) {
      console.error("Failed to load packages:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackagesAndStatus();

    fetch("/api/quiz/leaderboard")
      .then((res) => res.json())
      .then((data) => {
        if (data.leaderboard) setLeaderboard(data.leaderboard);
      })
      .catch(() => {});
  }, []);

  const handleBuy = async (pkg: any) => {
    setActionMsg(null);

    if (!isLoggedIn) {
      router.push("/login?callbackUrl=/quiz");
      return;
    }

    if (walletBalance < pkg.price) {
      setActionMsg({
        text:
          language === "bn"
            ? `আপনার ওয়ালেট ব্যালেন্স অপর্যাপ্ত। প্রয়োজন ৳ ${pkg.price}, কিন্তু আপনার ব্যালেন্স আছে ৳ ${walletBalance}। কুইজ খেলতে আগে ক্যাশ-ইন করুন।`
            : `Insufficient wallet balance. Required: ৳ ${pkg.price}, Current balance: ৳ ${walletBalance}. Please cash-in to continue.`,
        error: true,
        needCashIn: true,
      });
      return;
    }

    setBuyingId(pkg.id);

    try {
      const res = await fetch("/api/quiz/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId: pkg.id }),
      });
      const data = await res.json();

      if (res.ok && data.attemptId) {
        await startRealQuiz(data.attemptId, pkg);
      } else {
        setActionMsg({
          text: data.error || (language === "bn" ? "প্যাকেজ কেনা যায়নি।" : "Failed to buy package."),
          error: true,
          needCashIn: data.error?.toLowerCase().includes("balance"),
        });
      }
    } catch {
      setActionMsg({
        text: language === "bn" ? "সার্ভার এরর। কিছুক্ষণ পর আবার চেষ্টা করুন।" : "Server error. Please try again.",
        error: true,
      });
    } finally {
      setBuyingId(null);
    }
  };

  const startRealQuiz = async (attemptId: string, pkg: any) => {
    setCurrentPackage(pkg);
    setCurrentAttemptId(attemptId);
    setActionMsg(null);
    setSelectedAnswers({});
    setQuizResult(null);

    try {
      const res = await fetch(`/api/quiz/play/${attemptId}`);
      if (res.ok) {
        const data = await res.json();
        setQuizQuestions(data.questions || []);
        setTimeLeft((data.timeLimitMinutes || pkg.timeLimitMinutes || 10) * 60);
      } else {
        // Fallback to sample questions if questions are empty in bank
        startFallbackQuiz(pkg);
      }
    } catch {
      startFallbackQuiz(pkg);
    }
  };

  const startFallbackQuiz = (pkg: any) => {
    setTimeLeft((pkg.timeLimitMinutes || 10) * 60);
    setQuizQuestions([
      {
        id: "q1",
        questionBn: "মুজিবনগর সরকার কোন তারিখে শপথ গ্রহণ করে?",
        questionEn: "On which date did the Mujibnagar Government take oath?",
        optionA: language === "bn" ? "১০ এপ্রিল ১৯৭১" : "10 April 1971",
        optionB: language === "bn" ? "১৭ এপ্রিল ১৯৭১" : "17 April 1971",
        optionC: language === "bn" ? "২৬ মার্চ ১৯৭১" : "26 March 1971",
        optionD: language === "bn" ? "১৬ ডিসেম্বর ১৯৭১" : "16 December 1971",
      },
      {
        id: "q2",
        questionBn: "বাংলাদেশের সংবিধান কবে কার্যকর হয়?",
        questionEn: "When did the Constitution of Bangladesh come into effect?",
        optionA: language === "bn" ? "১৬ ডিসেম্বর ১৯৭২" : "16 December 1972",
        optionB: language === "bn" ? "৪ নভেম্বর ১৯৭২" : "4 November 1972",
        optionC: language === "bn" ? "২৬ মার্চ ১৯৭২" : "26 March 1972",
        optionD: language === "bn" ? "১০ জানুয়ারি ১৯৭২" : "10 January 1972",
      },
      {
        id: "q3",
        questionBn: "পদ্মা সেতুর মোট দৈর্ঘ্য কত কিলোমিটার?",
        questionEn: "What is the total length of the Padma Bridge in kilometers?",
        optionA: language === "bn" ? "৬.১৫ কিমি" : "6.15 km",
        optionB: language === "bn" ? "৫.৮০ কিমি" : "5.80 km",
        optionC: language === "bn" ? "৭.২০ কিমি" : "7.20 km",
        optionD: language === "bn" ? "৬.৫০ কিমি" : "6.50 km",
      },
      {
        id: "q4",
        questionBn: "জাতীয় স্মৃতিসৌধের স্থপতি কে?",
        questionEn: "Who is the architect of the National Martyrs' Memorial?",
        optionA: language === "bn" ? "সৈয়দ মাইনুল হোসেন" : "Syed Mainul Hossain",
        optionB: language === "bn" ? "হামিদুর রহমান" : "Hamidur Rahman",
        optionC: language === "bn" ? "মাজহারুল ইসলাম" : "Muzharul Islam",
        optionD: language === "bn" ? "এফ আর খান" : "F R Khan",
      },
    ]);
  };

  useEffect(() => {
    if (timeLeft > 0 && !quizResult && currentAttemptId) {
      const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && currentAttemptId && !quizResult) {
      handleSubmitQuiz();
    }
  }, [timeLeft, currentAttemptId, quizResult]);

  const handleSubmitQuiz = async () => {
    if (!currentAttemptId) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId: currentAttemptId,
          answers: selectedAnswers,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setQuizResult({
          score: data.attempt?.score ?? 0,
          total: data.attempt?.totalQuestions ?? quizQuestions.length,
          bonusAwarded: Boolean(data.bonusAwarded),
          bonusAmount: data.bonusAmount ?? currentPackage?.bonusAmount ?? 0,
        });
        // Refresh wallet
        fetchPackagesAndStatus();
      } else {
        // Fallback evaluation
        let correct = 0;
        quizQuestions.forEach((q, idx) => {
          if (idx === 0 && selectedAnswers[q.id] === "B") correct++;
          if (idx === 1 && selectedAnswers[q.id] === "A") correct++;
          if (idx === 2 && selectedAnswers[q.id] === "A") correct++;
          if (idx === 3 && selectedAnswers[q.id] === "A") correct++;
        });
        const target = currentPackage?.targetScore || 3;
        setQuizResult({
          score: correct,
          total: quizQuestions.length,
          bonusAwarded: correct >= target,
          bonusAmount: currentPackage?.bonusAmount || 100,
        });
      }
    } catch {
      setQuizResult({
        score: Object.keys(selectedAnswers).length,
        total: quizQuestions.length,
        bonusAwarded: false,
        bonusAmount: 0,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayPackages = packages;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <div className="h-8 w-64 bg-gray-200 animate-pulse rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-72 bg-gray-100 animate-pulse rounded-3xl" />
          <div className="h-72 bg-gray-100 animate-pulse rounded-3xl" />
          <div className="h-72 bg-gray-100 animate-pulse rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block bg-orange-50 text-orange-600 text-xs font-bold px-3 py-1 rounded-full border border-orange-200">
              {language === "bn" ? "ক্যারিয়ার স্কিল টেস্ট" : "Career Skill Test"}
            </span>
            {isLoggedIn && (
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
                <Wallet className="w-3.5 h-3.5" />
                <span>
                  {language === "bn" ? "ওয়ালেট ব্যালেন্স: " : "Wallet: "} ৳ {walletBalance}
                </span>
              </span>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
            {language === "bn" ? "কুইজ প্রতিযোগিতা ও বোনাস পুরস্কার" : "Quiz Contest & Bonus Rewards"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {language === "bn"
              ? "সরাসরি ওয়ালেট থেকে ফি দিয়ে পছন্দের কুইজ প্যাকেজে অংশ নিন এবং টার্গেট স্কোর অর্জন করলেই নগদ বোনাস জিতুন!"
              : "Access quiz packages with wallet balance and win instant cash bonuses upon reaching target scores!"}
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center bg-gray-100 p-1 rounded-2xl text-xs font-bold self-start md:self-auto">
          <button
            onClick={() => setActiveTab("packages")}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === "packages" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            {language === "bn" ? "প্যাকেজসমূহ" : "Packages"}
          </button>
          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === "leaderboard" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            {language === "bn" ? "লিডারবোর্ড" : "Leaderboard"}
          </button>
        </div>
      </div>

      {actionMsg && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            actionMsg.error ? "bg-red-50 text-red-700 border border-red-200" : "bg-emerald-50 text-emerald-800 border border-emerald-200"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{actionMsg.text}</span>
          </div>
          {actionMsg.needCashIn && (
            <Link
              href="/dashboard/wallet"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shrink-0 shadow-sm transition"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>{language === "bn" ? "ওয়ালেট ক্যাশ-ইন করুন →" : "Cash-in Wallet →"}</span>
            </Link>
          )}
        </div>
      )}

      {/* QUIZ PLAY SCREEN */}
      {currentAttemptId && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-emerald-100 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg font-black text-gray-900">
                {language === "bn" ? currentPackage?.nameBn : currentPackage?.nameEn}
              </h2>
              <p className="text-xs text-gray-500">
                {language === "bn"
                  ? `টার্গেট স্কোর: ${currentPackage?.targetScore || 8} (বোনাস: ৳ ${currentPackage?.bonusAmount || 100})`
                  : `Target Score: ${currentPackage?.targetScore || 8} (Bonus: ৳ ${currentPackage?.bonusAmount || 100})`}
              </p>
            </div>

            {/* Countdown timer */}
            <div className="flex items-center gap-2 bg-amber-50 text-amber-800 font-mono font-bold px-4 py-2 rounded-2xl border border-amber-200">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
              </span>
            </div>
          </div>

          {!quizResult ? (
            <div className="space-y-6">
              {quizQuestions.map((q, qIndex) => (
                <div key={q.id || qIndex} className="p-5 rounded-2xl bg-gray-50/70 border border-gray-200 space-y-3">
                  <div className="font-bold text-gray-900 text-sm flex items-start gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs flex items-center justify-center shrink-0">
                      {qIndex + 1}
                    </span>
                    <span>{language === "bn" ? q.questionBn : q.questionEn || q.questionBn}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                    {["A", "B", "C", "D"].map((opt) => {
                      const optText = q[`option${opt}`];
                      if (!optText) return null;
                      const isSelected = selectedAnswers[q.id] === opt;

                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setSelectedAnswers({ ...selectedAnswers, [q.id]: opt })}
                          className={`p-3 rounded-xl text-xs font-semibold text-left transition border ${
                            isSelected
                              ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                              : "bg-white text-gray-700 border-gray-200 hover:border-emerald-300"
                          }`}
                        >
                          <span className="font-bold mr-2">{opt}.</span>
                          <span>{optText}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <button
                onClick={handleSubmitQuiz}
                disabled={isSubmitting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl text-sm transition shadow-md disabled:opacity-60"
              >
                {isSubmitting
                  ? (language === "bn" ? "ফলাফল হিসাব করা হচ্ছে..." : "Submitting & Evaluating...")
                  : (language === "bn" ? "কুইজ জমা দিন (Submit Quiz)" : "Submit Quiz")}
              </button>
            </div>
          ) : (
            <div className="p-8 text-center space-y-4">
              <div
                className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${
                  quizResult.bonusAwarded ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
                }`}
              >
                <Award className="w-8 h-8" />
              </div>

              <h3 className="text-2xl font-black text-gray-900">
                {quizResult.bonusAwarded
                  ? (language === "bn" ? "অভিনন্দন! আপনি বোনাস জিতেছেন!" : "Congratulations! You Won Bonus!")
                  : (language === "bn" ? "কুইজ সম্পন্ন হয়েছে" : "Quiz Completed")}
              </h3>

              <div className="text-sm text-gray-600">
                {language === "bn" ? "আপনার প্রাপ্ত নম্বর:" : "Your Score:"}{" "}
                <span className="font-bold text-gray-900">
                  {quizResult.score} / {quizResult.total}
                </span>
              </div>

              {quizResult.bonusAwarded ? (
                <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 font-semibold text-sm max-w-md mx-auto">
                  🎉 {language === "bn"
                    ? `টার্গেট অর্জন করায় আপনার ওয়ালেটে ৳ ${quizResult.bonusAmount} ক্যাশ বোনাস যোগ করা হয়েছে!`
                    : `Target achieved! ৳ ${quizResult.bonusAmount} cash bonus has been credited to your wallet!`}
                </div>
              ) : (
                <p className="text-xs text-gray-500">
                  {language === "bn"
                    ? "টার্গেট স্কোরে পৌঁছাতে পারেননি। আরো অনুশীলন করে আবার চেষ্টা করুন!"
                    : "Target score not reached. Practice more and try again!"}
                </p>
              )}

              <div className="pt-2">
                <button
                  onClick={() => {
                    setCurrentAttemptId(null);
                    setQuizResult(null);
                    setSelectedAnswers({});
                  }}
                  className="bg-gray-900 text-white font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-gray-800 transition"
                >
                  {language === "bn" ? "প্যাকেজ তালিকায় ফিরে যান" : "Back to Packages"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PACKAGES TAB */}
      {activeTab === "packages" && !currentAttemptId && (
        displayPackages.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
            <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-800">
              {language === "bn" ? "বর্তমানে কোনো সক্রিয় কুইজ প্যাকেজ নেই" : "No active quiz packages available"}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {language === "bn"
                ? "নতুন কুইজ প্যাকেজ প্রকাশিত হলে এখানে দেখতে পাবেন।"
                : "New quiz packages will appear here once published."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayPackages.map((pkg) => {
            const attempts = userAttempts[pkg.id] || [];
            const activeAttempt = attempts.find((a) => a.status === "IN_PROGRESS");
            const isBuying = buyingId === pkg.id;

            return (
              <div
                key={pkg.id}
                className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200">
                      {language === "bn" ? "কুইজ প্যাকেজ" : "Quiz Package"}
                    </span>
                    <span className="font-black text-emerald-600 text-lg">৳ {pkg.price}</span>
                  </div>

                  <h3 className="mt-4 font-black text-gray-900 text-base leading-snug">
                    {language === "bn" ? pkg.nameBn : pkg.nameEn || pkg.nameBn}
                  </h3>
                  {(pkg.book?.nameBn || pkg.book?.titleBn) && (
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mt-1 font-medium">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{pkg.book.nameBn || pkg.book.titleBn}</span>
                    </div>
                  )}

                  <div className="mt-5 space-y-2 text-xs text-gray-600 border-t border-gray-100 pt-4">
                    <div className="flex items-center justify-between">
                      <span>{language === "bn" ? "প্রশ্নসংখ্যা:" : "Questions:"}</span>
                      <span className="font-bold text-gray-900">
                        {pkg.questionCount || 10} {language === "bn" ? "টি" : "items"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>{language === "bn" ? "সময়সীমা:" : "Time Limit:"}</span>
                      <span className="font-bold text-gray-900">
                        {pkg.timeLimitMinutes || 10} {language === "bn" ? "মিনিট" : "Mins"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>{language === "bn" ? "টার্গেট স্কোর:" : "Target Score:"}</span>
                      <span className="font-bold text-gray-900">
                        {pkg.targetScore} {language === "bn" ? "পয়েন্ট" : "pts"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>{language === "bn" ? "বোনাস পুরস্কার:" : "Bonus Reward:"}</span>
                      <span className="font-bold text-emerald-600">
                        ৳ {pkg.bonusAmount} {language === "bn" ? "ক্যাশ" : "Cash"}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  {activeAttempt ? (
                    <button
                      onClick={() => startRealQuiz(activeAttempt.id, pkg)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-2xl text-xs transition shadow-sm flex items-center justify-center gap-2"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>{language === "bn" ? "কুইজ খেলুন (Play Now)" : "Play Quiz Now"}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBuy(pkg)}
                      disabled={isBuying}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-2xl text-xs transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>
                        {isBuying
                          ? (language === "bn" ? "প্রক্রিয়াকরণ..." : "Processing...")
                          : isLoggedIn
                          ? (language === "bn" ? `প্যাকেজ কিনুন (৳ ${pkg.price})` : `Buy Package (৳ ${pkg.price})`)
                          : (language === "bn" ? "লগইন করে কিনুন" : "Sign In to Play")}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        )
      )}

      {/* LEADERBOARD TAB */}
      {activeTab === "leaderboard" && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden max-w-2xl mx-auto">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50">
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-amber-500" />
              <h3 className="font-black text-gray-900 text-base">
                {language === "bn" ? "শীর্ষস্থান অর্জনকারী (Leaderboard)" : "Top Scorers (Leaderboard)"}
              </h3>
            </div>
            <span className="text-xs text-amber-700 font-bold bg-amber-100/70 px-3 py-1 rounded-full">
              {language === "bn" ? "চলতি মাস" : "This Month"}
            </span>
          </div>

          <div className="divide-y divide-gray-100">
            {leaderboard.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-xs">
                {language === "bn" ? "এখনো লিডারবোর্ড ডাটা নেই।" : "No scores recorded yet."}
              </div>
            ) : (
              leaderboard.map((item, idx) => (
                <div key={idx} className="p-4 px-6 flex items-center justify-between hover:bg-gray-50/50 transition">
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${
                        idx === 0
                          ? "bg-amber-400 text-white"
                          : idx === 1
                          ? "bg-slate-300 text-slate-800"
                          : idx === 2
                          ? "bg-amber-600 text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span className="font-bold text-gray-900 text-sm">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-emerald-600">{item.score} pts</div>
                    <div className="text-[11px] text-gray-400">৳ {item.reward} won</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
