import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN_STAFF")) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const agents = await prisma.agent.findMany({
      include: {
        user: {
          select: { id: true, name: true, phone: true, email: true, status: true },
        },
        district: true,
        channelPartner: {
          include: {
            user: { select: { id: true, name: true, phone: true } },
          },
        },
        _count: {
          select: { customers: true, commissions: true, cashIns: true },
        },
      },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ success: true, agents });
  } catch (error: any) {
    console.error("GET agents error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch agents" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Super Admin required" }, { status: 403 });
    }

    const {
      name,
      phone,
      password,
      districtId,
      commissionRate = 10.0,
      isDefault = false,
      cashInActive = true,
      commissionActive = true,
    } = await req.json();

    if (!name || !phone || !password || !districtId) {
      return NextResponse.json({ error: "Name, phone, password, and district are required" }, { status: 400 });
    }

    const targetDistrictId = Number(districtId);

    // Find CP for this district
    const cp = await prisma.channelPartner.findUnique({
      where: { districtId: targetDistrictId },
    });

    if (!cp) {
      return NextResponse.json(
        { error: "এই জেলায় এখনো কোনো চ্যানেল পার্টনার নিযুক্ত নেই। প্রথমে এই জেলার চ্যানেল পার্টনার তৈরি করুন।" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);
    const referralCode = `AGT-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

    // If setting as default agent, unset existing default
    if (isDefault) {
      await prisma.agent.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    const user = await prisma.user.create({
      data: {
        name,
        phone,
        passwordHash,
        role: "AGENT",
        status: "ACTIVE",
        referralCode,
      },
    });

    await prisma.wallet.create({
      data: { userId: user.id, balance: 0.0 },
    });

    const agent = await prisma.agent.create({
      data: {
        userId: user.id,
        channelPartnerId: cp.id,
        districtId: targetDistrictId,
        referralCode,
        isDefault: Boolean(isDefault),
        commissionRate: Number(commissionRate) || 10.0,
        commissionActive: Boolean(commissionActive),
        cashInActive: Boolean(cashInActive),
        status: "ACTIVE",
      },
      include: { user: true, district: true, channelPartner: true },
    });

    return NextResponse.json({ success: true, agent });
  } catch (error: any) {
    console.error("Create agent error:", error);
    return NextResponse.json({ error: error.message || "Failed to create agent" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Super Admin required" }, { status: 403 });
    }

    const {
      id,
      name,
      phone,
      districtId,
      commissionRate,
      commissionActive,
      cashInActive,
      isDefault,
      status,
    } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Agent ID required" }, { status: 400 });
    }

    const currentAgent = await prisma.agent.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!currentAgent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const data: any = {};

    // If moving to another district, find corresponding CP for that district
    if (districtId !== undefined && Number(districtId) !== currentAgent.districtId) {
      const targetDistrictId = Number(districtId);
      const cp = await prisma.channelPartner.findUnique({
        where: { districtId: targetDistrictId },
      });

      if (!cp) {
        return NextResponse.json(
          { error: "টার্গেট জেলায় কোনো চ্যানেল পার্টনার নেই। এজেন্ট সরানোর পূর্বে চ্যানেল পার্টনার নিশ্চিত করুন।" },
          { status: 400 }
        );
      }

      data.districtId = targetDistrictId;
      data.channelPartnerId = cp.id;
    }

    if (commissionRate !== undefined) data.commissionRate = Number(commissionRate);
    if (commissionActive !== undefined) data.commissionActive = Boolean(commissionActive);
    if (cashInActive !== undefined) data.cashInActive = Boolean(cashInActive);
    if (status !== undefined) {
      data.status = status;
      await prisma.user.update({
        where: { id: currentAgent.userId },
        data: { status },
      });
    }

    // Default Agent toggling
    if (isDefault !== undefined) {
      if (isDefault) {
        // Unset previous default
        await prisma.agent.updateMany({
          where: { isDefault: true },
          data: { isDefault: false },
        });
      }
      data.isDefault = Boolean(isDefault);
    }

    const updated = await prisma.agent.update({
      where: { id },
      data,
      include: { user: true, district: true, channelPartner: true },
    });

    if (name || phone) {
      await prisma.user.update({
        where: { id: currentAgent.userId },
        data: {
          ...(name && { name }),
          ...(phone && { phone }),
        },
      });
    }

    return NextResponse.json({ success: true, agent: updated });
  } catch (error: any) {
    console.error("Update agent error:", error);
    return NextResponse.json({ error: error.message || "Failed to update agent" }, { status: 500 });
  }
}
