import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN_STAFF")) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const channelPartners = await prisma.channelPartner.findMany({
      include: {
        user: {
          select: { id: true, name: true, phone: true, email: true, status: true },
        },
        district: true,
        _count: {
          select: { agents: true, customers: true, commissions: true },
        },
      },
      orderBy: { districtId: "asc" },
    });

    return NextResponse.json({ success: true, channelPartners });
  } catch (error: any) {
    console.error("GET channel partners error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch channel partners" }, { status: 500 });
  }
}

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

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Super Admin required" }, { status: 403 });
    }

    const { id, districtId, commissionRate, status, name, phone } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Channel Partner ID required" }, { status: 400 });
    }

    const currentCP = await prisma.channelPartner.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!currentCP) {
      return NextResponse.json({ error: "Channel Partner not found" }, { status: 404 });
    }

    // If changing district, verify uniqueness
    if (districtId !== undefined && Number(districtId) !== currentCP.districtId) {
      const targetDistrictId = Number(districtId);
      const existingInTarget = await prisma.channelPartner.findUnique({
        where: { districtId: targetDistrictId },
      });

      if (existingInTarget && existingInTarget.id !== id) {
        return NextResponse.json(
          { error: "টার্গেট জেলায় ইতিমধ্যে অন্য একজন চ্যানেল পার্টনার নিযুক্ত আছেন।" },
          { status: 409 }
        );
      }
    }

    const data: any = {};
    if (districtId !== undefined) data.districtId = Number(districtId);
    if (commissionRate !== undefined) data.commissionRate = Number(commissionRate);
    if (status !== undefined) data.status = status;

    const updated = await prisma.channelPartner.update({
      where: { id },
      data,
      include: { user: true, district: true },
    });

    if (name || phone) {
      await prisma.user.update({
        where: { id: currentCP.userId },
        data: {
          ...(name && { name }),
          ...(phone && { phone }),
        },
      });
    }

    return NextResponse.json({ success: true, channelPartner: updated });
  } catch (error: any) {
    console.error("Update channel partner error:", error);
    return NextResponse.json({ error: error.message || "Failed to update channel partner" }, { status: 500 });
  }
}
