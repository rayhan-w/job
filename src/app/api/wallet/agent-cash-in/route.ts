import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const customer = await prisma.customer.findUnique({
      where: { userId: session.userId },
    });

    if (!customer) {
      return NextResponse.json({ requests: [] });
    }

    const requests = await prisma.agentCashInConfirmation.findMany({
      where: { customerId: customer.id },
      include: {
        agent: {
          include: {
            user: { select: { name: true, phone: true } },
            district: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ requests });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "CUSTOMER") {
      return NextResponse.json({ error: "Customer login required" }, { status: 401 });
    }

    const customer = await prisma.customer.findUnique({
      where: { userId: session.userId },
      include: {
        agent: true,
      },
    });

    if (!customer) {
      return NextResponse.json({ error: "Candidate customer record not found" }, { status: 404 });
    }

    let agentId = customer.agentId;
    if (!agentId) {
      const defAgent = await prisma.agent.findFirst({ where: { isDefault: true } });
      agentId = defAgent?.id || "";
    }

    if (!agentId) {
      const anyAgent = await prisma.agent.findFirst();
      agentId = anyAgent?.id || "";
    }

    if (!agentId) {
      return NextResponse.json({ error: "No district agent available" }, { status: 400 });
    }

    const { amount, note } = await req.json();
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      return NextResponse.json({ error: "সঠিক টাকার পরিমাণ লিখুন" }, { status: 400 });
    }

    const request = await prisma.agentCashInConfirmation.create({
      data: {
        agentId,
        customerId: customer.id,
        amount: numAmount,
        note: note || "Customer request to district agent",
        status: "PENDING",
      },
      include: {
        agent: {
          include: {
            user: { select: { name: true, phone: true } },
            district: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "জেলা এজেন্টের কাছে ক্যাশ-ইন রিকোয়েস্ট সফলভাবে পাঠানো হয়েছে!",
      request,
    });
  } catch (error: any) {
    console.error("Agent cash in request error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
