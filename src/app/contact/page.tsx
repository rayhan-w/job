"use client";

import React, { useState } from "react";
import { useLanguage } from "@/components/LanguageContext";
import { Phone, Mail, MapPin, Send, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const { language } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center space-y-3">
        <span className="inline-block bg-orange-50 text-orange-600 text-xs font-bold px-3 py-1 rounded-full border border-orange-200">
          {language === "bn" ? "যোগাযোগ" : "Contact Us"}
        </span>
        <h1 className="text-3xl font-black text-gray-950">
          {language === "bn" ? "আমাদের সাথে যোগাযোগ করুন" : "Get In Touch With Us"}
        </h1>
        <p className="text-gray-500 text-sm max-w-lg mx-auto">
          {language === "bn"
            ? "যেকোনো জিজ্ঞাসা, সহায়তা বা অভিযোগের জন্য আমাদের হেল্পডেস্কে মেসেজ পাঠান।"
            : "Have a query or need technical assistance? Our support team is here to help."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact Info */}
        <div className="bg-white p-8 rounded-3xl border border-gray-200/80 shadow-xs space-y-6">
          <h3 className="font-bold text-gray-900 text-lg">
            {language === "bn" ? "যোগাযোগের ঠিকানা" : "Office & Hotline"}
          </h3>

          <div className="space-y-4 text-sm text-gray-600">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-gray-900">{language === "bn" ? "হটলাইন নম্বর" : "Hotline"}</div>
                <div className="text-xs text-gray-500 mt-0.5">09600-000000, 01700-000000</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-gray-900">{language === "bn" ? "ইমেইল সাপোর্ট" : "Email Support"}</div>
                <div className="text-xs text-gray-500 mt-0.5">support@jobportal.bd</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-gray-900">{language === "bn" ? "অফিসের ঠিকানা" : "Main Office"}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {language === "bn" ? "গুলশান-১, ঢাকা-১২১২, বাংলাদেশ" : "Gulshan-1, Dhaka-1212, Bangladesh"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Message Form */}
        <div className="bg-white p-8 rounded-3xl border border-gray-200/80 shadow-xs">
          {submitted ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-8">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-gray-900 text-base">
                {language === "bn" ? "আপনার বার্তাটি পাঠানো হয়েছে!" : "Message Sent Successfully!"}
              </h4>
              <p className="text-xs text-gray-500">
                {language === "bn" ? "খুব শীঘ্রই আমাদের টিম আপনার সাথে যোগাযোগ করবে।" : "Our team will get back to you shortly."}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {language === "bn" ? "আপনার নাম" : "Your Name"}
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-orange-500 focus:outline-none"
                  placeholder={language === "bn" ? "উদা: রাহাতুল ইসলাম" : "e.g. Rahatul Islam"}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {language === "bn" ? "মোবাইল নম্বর" : "Phone Number"}
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-orange-500 focus:outline-none"
                  placeholder="017XXXXXXXX"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {language === "bn" ? "বার্তা / মন্তব্য" : "Your Message"}
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-orange-500 focus:outline-none"
                  placeholder={language === "bn" ? "আপনার মেসেজ লিখুন..." : "Write your query here..."}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition shadow-sm flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{language === "bn" ? "বার্তা পাঠান" : "Send Message"}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
