"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";

export default function QuizPage() {
  const { language, t } = useLanguage();
  const [packages, setPackages] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"packages" | "leaderboard">("packages");

  // Play state
  const [currentAttemptId, setCurrentAttemptId] = useState<string | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // Fetch packages & leaderboard
    fetch("/api/quiz/leaderboard")
      .then((res) => res.json())
      .then((data) => {
        if (data.leaderboard) setLeaderboard(data.leaderboard);
      });
  }, []);

  const handleBuyAndStart = async () => {
    setErrorMsg(null);
    try {
      const res = await fetch("/api/quiz/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId: "mock-or-seed" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(
          data.error ||
            (language === "bn"
              ? "প্যাকেজ কিনতে ব্যর্থ হয়েছে। আপনার ওয়ালেট ব্যালেন্স চেক করুন।"
              : "Failed to purchase package. Please check your wallet balance.")
        );
      }
    } catch {
      setErrorMsg(language === "bn" ? "সার্ভার এরর" : "Server error");
    }
  };

  // Sample package matching screenshot
  const samplePackage = {
    id: "sample-pkg-1",
    nameBn: "সাধারণ জ্ঞান (বাংলাদেশ)",
    nameEn: "General Knowledge (Bangladesh)",
    questionCount: 4,
    timeLimitMinutes: 10,
    price: 50,
    targetScore: 3,
    bonusAmount: 100,
  };

  const startSampleQuiz = () => {
    setCurrentAttemptId("attempt-local-1");
    setTimeLeft(10 * 60);
    setQuizQuestions([
      {
        id: "q1",
        questionBn: "মুজিবনগর সরকার কোন তারিখে শপথ গ্রহণ করে?",
        questionEn: "On which date did the Mujibnagar Government take oath?",
        optionA: language === "bn" ? "১০ এপ্রিল ১৯৭১" : "10 April 1971",
        optionB: language === "bn" ? "১৭ এপ্রিল ১৯৭১" : "17 April 1971",
        optionC: language === "bn" ? "২৬ মার্চ ১৯৭১" : "26 March 1971",
        optionD: language === "bn" ? "১৬ ডিসেম্বর ১৯৭১" : "16 December 1971",
        correct: "B",
      },
      {
        id: "q2",
        questionBn: "বাংলাদেশের সংবিধান কবে গৃহীত হয়?",
        questionEn: "When was the Constitution of Bangladesh adopted?",
        optionA: language === "bn" ? "৪ নভেম্বর ১৯৭২" : "4 November 1972",
        optionB: language === "bn" ? "১৬ ডিসেম্বর ১৯৭২" : "16 December 1972",
        optionC: language === "bn" ? "২৬ মার্চ ১৯৭২" : "26 March 1972",
        optionD: language === "bn" ? "১০ জানুয়ারি ১৯৭২" : "10 January 1972",
        correct: "A",
      },
      {
        id: "q3",
        questionBn: "পদ্মা সেতুর মোট দৈর্ঘ্য কত কিলোমিটার?",
        questionEn: "What is the total length of the Padma Bridge in kilometers?",
        optionA: language === "bn" ? "৬.১৫ কিমি" : "6.15 km",
        optionB: language === "bn" ? "৫.৮০ কিমি" : "5.80 km",
        optionC: language === "bn" ? "৭.২০ কিমি" : "7.20 km",
        optionD: language === "bn" ? "৬.৫০ কিমি" : "6.50 km",
        correct: "A",
      },
      {
        id: "q4",
        questionBn: "জাতীয় স্মৃতিসৌধের স্থপতি কে?",
        questionEn: "Who is the architect of the National Martyrs' Memorial?",
        optionA: language === "bn" ? "সৈয়দ মাইনুল হোসেন" : "Syed Mainul Hossain",
        optionB: language === "bn" ? "হামিদুর রহমান" : "Hamidur Rahman",
        optionC: language === "bn" ? "মাজহারুল ইসলাম" : "Muzharul Islam",
        optionD: language === "bn" ? "এফ আর খান" : "F R Khan",
        correct: "A",
      },
    ]);
  };

  useEffect(() => {
    if (timeLeft > 0 && !quizResult) {
      const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && currentAttemptId && !quizResult) {
      handleSubmitQuiz();
    }
  }, [timeLeft, currentAttemptId, quizResult]);

  const handleSubmitQuiz = async () => {
    setIsSubmitting(true);
    let correct = 0;
    quizQuestions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correct) correct++;
    });

    const passedBonus = correct >= samplePackage.targetScore;

    setQuizResult({
      score: correct,
      total: quizQuestions.length,
      correctCount: correct,
      bonusAwarded: passedBonus,
      bonusAmount: samplePackage.bonusAmount,
    });
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
            {language === "bn" ? "কুইজ প্রতিযোগিতা ও বোনাস পুরস্কার" : "Quiz Contest & Bonus Rewards"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {language === "bn"
              ? "ওয়ালেট থেকে ফি দিয়ে কুইজে অংশ নিন এবং টার্গেট স্কোর অর্জন করলেই নগদ বোনাস জিতুন!"
              : "Participate in quiz with wallet balance and win instant cash bonuses upon reaching target score!"}
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center bg-gray-100 p-1 rounded-2xl text-xs font-bold">
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

      {errorMsg && (
        <div className="p-4 bg-red-50 text-red-700 text-sm rounded-2xl border border-red-200 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* QUIZ PLAY MODAL / SCREEN */}
      {currentAttemptId && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-emerald-100 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg font-black text-gray-900">
                {language === "bn" ? samplePackage.nameBn : samplePackage.nameEn}
              </h2>
              <p className="text-xs text-gray-500">
                {language === "bn"
                  ? `টার্গেট স্কোর: ${samplePackage.targetScore} (বোনাস: ৳${samplePackage.bonusAmount})`
                  : `Target Score: ${samplePackage.targetScore} (Bonus: ৳${samplePackage.bonusAmount})`}
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
                <div key={q.id} className="p-5 rounded-2xl bg-gray-50/70 border border-gray-200 space-y-3">
                  <div className="font-bold text-gray-900 text-sm flex items-start gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs flex items-center justify-center shrink-0">
                      {qIndex + 1}
                    </span>
                    <span>{language === "bn" ? q.questionBn : q.questionEn}</span>
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
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl text-sm transition shadow-md"
              >
                {isSubmitting
                  ? (language === "bn" ? "ফলাফল হিসাব করা হচ্ছে..." : "Evaluating score...")
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
                  ? (language === "bn" ? "অভিনন্দন! আপনি জিতেছেন!" : "Congratulations! You Won!")
                  : (language === "bn" ? "কুইজ সম্পন্ন হয়েছে" : "Quiz Finished")}
              </h3>

              <div className="text-sm text-gray-600">
                {language === "bn" ? "আপনার স্কোর:" : "Your Score:"}{" "}
                <span className="font-bold text-gray-900">
                  {quizResult.score} / {quizResult.total}
                </span>
              </div>

              {quizResult.bonusAwarded && (
                <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 font-semibold text-sm max-w-md mx-auto">
                  🎉 {language === "bn"
                    ? `টার্গেট স্কোর অর্জন করায় আপনার ওয়ালেটে ৳ ${quizResult.bonusAmount} বোনাস যোগ হয়েছে!`
                    : `Target score achieved! ৳ ${quizResult.bonusAmount} bonus added to your wallet!`}
                </div>
              )}

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
          )}
        </div>
      )}

      {/* PACKAGES TAB matching mobile screenshot */}
      {activeTab === "packages" && !currentAttemptId && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition">
            <div>
              <div className="flex items-start justify-between">
                <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200">
                  {language === "bn" ? "সক্রিয় প্রতিযোগিতা" : "Active Contest"}
                </span>
                <span className="font-black text-emerald-600 text-lg">৳ {samplePackage.price}</span>
              </div>

              <h3 className="mt-4 font-black text-gray-900 text-lg leading-tight">
                {language === "bn" ? samplePackage.nameBn : samplePackage.nameEn}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {language === "bn" ? "৫০ প্রশ্ন | ৩০ মিনিট | নেগেটিভ মার্কিং" : "50 Questions | 30 Mins | Negative Marking"}
              </p>

              <div className="mt-5 space-y-2 text-xs text-gray-600 border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between">
                  <span>{language === "bn" ? "টার্গেট স্কোর:" : "Target Score:"}</span>
                  <span className="font-bold text-gray-900">
                    {samplePackage.targetScore} {language === "bn" ? "পয়েন্ট" : "points"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{language === "bn" ? "বোনাস পুরস্কার:" : "Bonus Reward:"}</span>
                  <span className="font-bold text-emerald-600">
                    ৳ {samplePackage.bonusAmount} {language === "bn" ? "ক্যাশ" : "Cash"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{language === "bn" ? "সময়:" : "Duration:"}</span>
                  <span className="font-bold text-gray-900">
                    {samplePackage.timeLimitMinutes} {language === "bn" ? "মিনিট" : "Mins"}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={startSampleQuiz}
              className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-2xl text-sm transition shadow-sm flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{language === "bn" ? "কুইজ শুরু করুন" : "Start Quiz"}</span>
            </button>
          </div>
        </div>
      )}

      {/* LEADERBOARD TAB matching mobile screenshot */}
      {activeTab === "leaderboard" && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden max-w-2xl mx-auto">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50">
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-amber-500" />
              <h3 className="font-black text-gray-900 text-base">
                {language === "bn" ? "শীর্ষস্থান অর্জনকারী (Leaderboard)" : "Top Scorers (Leaderboard)"}
              </h3>
            </div>
            <span className="text-xs font-bold text-gray-500">
              {language === "bn" ? "সাধারণ জ্ঞান" : "General Knowledge"}
            </span>
          </div>

          <div className="divide-y divide-gray-100">
            <div className="p-4 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center">
                  1
                </span>
                <div>
                  <div className="font-bold text-gray-900 text-sm">
                    {language === "bn" ? "মেহেদী হাসান" : "Mehedi Hasan"}
                  </div>
                  <div className="text-xs text-gray-400">
                    {language === "bn" ? "ঢাকা জেলা" : "Dhaka District"}
                  </div>
                </div>
              </div>
              <span className="font-black text-emerald-600 text-base">98%</span>
            </div>

            <div className="p-4 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-gray-200 text-gray-800 font-black text-xs flex items-center justify-center">
                  2
                </span>
                <div>
                  <div className="font-bold text-gray-900 text-sm">
                    {language === "bn" ? "রাহিমা আক্তার" : "Rahima Akter"}
                  </div>
                  <div className="text-xs text-gray-400">
                    {language === "bn" ? "চট্টগ্রাম জেলা" : "Chattogram District"}
                  </div>
                </div>
              </div>
              <span className="font-black text-emerald-600 text-base">96%</span>
            </div>

            <div className="p-4 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-amber-700 text-white font-black text-xs flex items-center justify-center">
                  3
                </span>
                <div>
                  <div className="font-bold text-gray-900 text-sm">
                    {language === "bn" ? "রাহাতুল ইসলাম" : "Rahatul Islam"}
                  </div>
                  <div className="text-xs text-gray-400">
                    {language === "bn" ? "ঢাকা জেলা" : "Dhaka District"}
                  </div>
                </div>
              </div>
              <span className="font-black text-emerald-600 text-base">94%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
