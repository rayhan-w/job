import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Only Super Admin can create Channel Partners" }, { status: 403 });
    }

    const { name, phone, password, districtId, commissionRate = 5.0 } = await req.json();

    if (!name || !phone || !password || !districtId) {
      return NextResponse.json({ error: "Name, phone, password, and district ID are required" }, { status: 400 });
    }

    // Check unique constraint on district (Acceptance test 9)
    const existingCpForDistrict = await prisma.channelPartner.findUnique({
      where: { districtId: Number(districtId) },
    });

    if (existingCpForDistrict) {
      return NextResponse.json(
        { error: "Database Unique Constraint: This district already has an assigned Channel Partner. Only ONE is permitted per district." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        phone,
        passwordHash,
        role: "CHANNEL_PARTNER",
      },
    });

    const cp = await prisma.channelPartner.create({
      data: {
        userId: user.id,
        districtId: Number(districtId),
        commissionRate: Number(commissionRate),
      },
    });

    // Initialize wallet
    await prisma.wallet.create({
      data: { userId: user.id, balance: 0.0 },
    });

    return NextResponse.json({ success: true, channelPartner: cp });
  } catch (error: any) {
    console.error("Create Channel Partner error:", error);
    return NextResponse.json({ error: error.message || "Failed to create channel partner" }, { status: 500 });
  }
}
