"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/components/LanguageContext";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import {
  User,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Plus,
  FileText,
  Printer,
  Save,
  Check,
} from "lucide-react";

export default function ProfilePage() {
  const { language, t } = useLanguage();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [motherName, setMotherName] = useState("");
  const [gender, setGender] = useState("Male");
  const [districtId, setDistrictId] = useState("1");
  const [presentAddress, setPresentAddress] = useState("");
  const [expectedSalary, setExpectedSalary] = useState("");
  const [careerObjective, setCareerObjective] = useState("");
  const [educations, setEducations] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.profile) {
          const p = data.profile;
          setProfileData(p);
          setName(p.name || "");
          const cp = p.candidateProfile || {};
          setFatherName(cp.fatherName || "");
          setMotherName(cp.motherName || "");
          setGender(cp.gender || "Male");
          setDistrictId(String(cp.districtId || "1"));
          setPresentAddress(cp.presentAddress || "");
          setExpectedSalary(cp.expectedSalary || "");
          setCareerObjective(cp.careerObjective || "");
          setEducations(p.educations || []);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          fatherName,
          motherName,
          gender,
          districtId,
          presentAddress,
          expectedSalary,
          careerObjective,
          educations,
        }),
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch {
      //
    } finally {
      setSaving(false);
    }
  };

  const addEducationRow = () => {
    setEducations([
      ...educations,
      {
        exam: "স্নাতক / ডিগ্রি",
        boardOrInstitution: "",
        subjectOrGroup: "",
        result: "",
        passingYear: 2025,
      },
    ]);
  };

  const updateEducation = (index: number, field: string, val: any) => {
    const updated = [...educations];
    updated[index] = { ...updated[index], [field]: val };
    setEducations(updated);
  };

  const hasPhoto = Boolean(profileData?.avatarUrl);
  const hasPersonalInfo = Boolean(fatherName && motherName);
  const hasAddress = Boolean(presentAddress);
  const hasEducation = Boolean(educations && educations.length > 0);
  const hasCareer = Boolean(careerObjective || expectedSalary);

  let calculatedCompleteness = 0;
  if (hasPhoto) calculatedCompleteness += 20;
  if (hasPersonalInfo) calculatedCompleteness += 20;
  if (hasAddress) calculatedCompleteness += 20;
  if (hasEducation) calculatedCompleteness += 20;
  if (hasCareer) calculatedCompleteness += 20;

  const completeness = profileData ? calculatedCompleteness : 0;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
        <DashboardSidebar userRole="CUSTOMER" />
        <div className="flex-1 space-y-6">
          <div className="h-8 w-48 bg-gray-200 animate-pulse rounded-xl" />
          <div className="h-44 bg-gray-100 animate-pulse rounded-3xl" />
          <div className="h-96 bg-gray-100 animate-pulse rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <DashboardSidebar userRole={profileData?.role} />

        <div className="flex-1 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              {language === "bn" ? "আমার প্রোফাইল" : "My Profile"}
            </h1>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50 transition shadow-sm"
            >
              <Printer className="w-4 h-4 text-gray-500" />
              <span>{language === "bn" ? "সিভি প্রিন্ট / ডাউনলোড" : "Print Online CV"}</span>
            </button>
          </div>

          {/* Top Profile Summary Card matching screenshot */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Candidate Info Box */}
            <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-orange-100 border-4 border-white shadow-md flex items-center justify-center text-orange-700 font-extrabold text-3xl overflow-hidden shrink-0">
                {profileData?.avatarUrl ? (
                  <img src={profileData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span>{name ? name[0] : "👤"}</span>
                )}
              </div>

              <div className="text-center sm:text-left space-y-1.5 flex-1">
                <h2 className="text-xl font-black text-gray-900">{name || (language === "bn" ? "নাম প্রদান করুন" : "Set Your Name")}</h2>
                <div className="text-xs font-semibold text-orange-600">
                  {language === "bn" ? "ক্যান্ডিডেট" : "Candidate"}
                </div>
                <div className="pt-2 space-y-1 text-xs text-gray-500">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <span>{profileData?.phone || "-"}</span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    <span>{profileData?.email || (language === "bn" ? "ইমেইল যুক্ত করা হয়নি" : "No email added")}</span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    <span>{presentAddress || (language === "bn" ? "ঠিকানা যুক্ত করা হয়নি" : "Address not added")}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Status Checklist matching screenshot */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-900 text-sm">
                    {language === "bn" ? "প্রোফাইল স্ট্যাটাস" : "Profile Status"}
                  </h3>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {completeness}% {language === "bn" ? "সম্পূর্ণ" : "Complete"}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex items-center justify-between">
                    <span>{language === "bn" ? "ছবি আপলোড" : "Photo Upload"}</span>
                    {hasPhoto ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <span className="w-2 h-2 rounded-full bg-gray-300" />}
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{language === "bn" ? "ব্যক্তিগত তথ্য" : "Personal Info"}</span>
                    {hasPersonalInfo ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <span className="w-2 h-2 rounded-full bg-gray-300" />}
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{language === "bn" ? "ঠিকানা ও জেলা" : "Address & District"}</span>
                    {hasAddress ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <span className="w-2 h-2 rounded-full bg-gray-300" />}
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{language === "bn" ? "শিক্ষাগত যোগ্যতা (১+)" : "Education (1+)"}</span>
                    {hasEducation ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <span className="w-2 h-2 rounded-full bg-gray-300" />}
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{language === "bn" ? "ক্যারিয়ার লক্ষ্য / অভিজ্ঞতা" : "Career Info"}</span>
                    {hasCareer ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <span className="w-2 h-2 rounded-full bg-gray-300" />}
                  </div>
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl text-xs transition shadow-sm flex items-center justify-center gap-1.5"
              >
                {saving ? (
                  <span>{language === "bn" ? "সংরক্ষণ হচ্ছে..." : "Saving..."}</span>
                ) : saveSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>{language === "bn" ? "সংরক্ষিত হয়েছে!" : "Saved Successfully!"}</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>{language === "bn" ? "প্রোফাইল সংরক্ষণ করুন" : "Save Profile"}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Education Table Section matching screenshot */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-black text-gray-900">
                {language === "bn" ? "শিক্ষাগত যোগ্যতা" : "Education Qualifications"}
              </h2>
              <button
                onClick={addEducationRow}
                className="inline-flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold px-3 py-1.5 rounded-xl text-xs border border-gray-200 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{language === "bn" ? "যোগ করুন" : "Add Education"}</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50/70 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">{language === "bn" ? "পরীক্ষা" : "Exam"}</th>
                    <th className="px-6 py-4">{language === "bn" ? "বোর্ড/প্রতিষ্ঠান" : "Board/Institute"}</th>
                    <th className="px-6 py-4">{language === "bn" ? "বিষয়/গ্রুপ" : "Subject/Group"}</th>
                    <th className="px-6 py-4">{language === "bn" ? "ফলাফল" : "Result"}</th>
                    <th className="px-6 py-4">{language === "bn" ? "পাসের বছর" : "Passing Year"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {educations.map((edu, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition">
                      <td className="px-6 py-4 font-bold text-gray-900">
                        <input
                          type="text"
                          value={edu.exam}
                          onChange={(e) => updateEducation(idx, "exam", e.target.value)}
                          className="w-full bg-transparent border-b border-transparent focus:border-emerald-500 focus:outline-none"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={edu.boardOrInstitution}
                          onChange={(e) => updateEducation(idx, "boardOrInstitution", e.target.value)}
                          className="w-full bg-transparent border-b border-transparent focus:border-emerald-500 focus:outline-none"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={edu.subjectOrGroup}
                          onChange={(e) => updateEducation(idx, "subjectOrGroup", e.target.value)}
                          className="w-full bg-transparent border-b border-transparent focus:border-emerald-500 focus:outline-none"
                        />
                      </td>
                      <td className="px-6 py-4 font-semibold text-emerald-700">
                        <input
                          type="text"
                          value={edu.result}
                          onChange={(e) => updateEducation(idx, "result", e.target.value)}
                          className="w-20 bg-transparent border-b border-transparent focus:border-emerald-500 focus:outline-none"
                        />
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        <input
                          type="number"
                          value={edu.passingYear}
                          onChange={(e) => updateEducation(idx, "passingYear", e.target.value)}
                          className="w-20 bg-transparent border-b border-transparent focus:border-emerald-500 focus:outline-none"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
