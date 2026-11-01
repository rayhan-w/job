import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const settings = await prisma.setting.findMany();
    const map: Record<string, string> = {
      helpline: "09600-000000",
      supportEmail: "support@wojob.com",
      officeAddress: "Mirpur DOHS, Dhaka, Bangladesh",
      noticeBoard: "WOJOB-এ স্বাগতম! সরকারি ও বেসরকারি চাকরির সঠিক তথ্যের নির্ভরযোগ্য প্ল্যাটফর্ম।",
      bkashNumber: "",
      nagadNumber: "",
      rocketNumber: "",
    };

    for (const s of settings) {
      map[s.key] = s.value;
    }

    return NextResponse.json({ success: true, settings: map });
  } catch (error: any) {
    console.error("Public settings API error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch settings" }, { status: 500 });
  }
}
