import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { creditWallet } from "@/lib/wallet";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let agentId: string | null = null;
    if (session.role === "AGENT") {
      const agent = await prisma.agent.findUnique({
        where: { userId: session.userId },
      });
      if (!agent) {
        return NextResponse.json({ error: "Agent record not found" }, { status: 404 });
      }
      agentId = agent.id;
    } else if (session.role === "SUPER_ADMIN" || session.role === "ADMIN_STAFF") {
      // Super admin can inspect all
    } else {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const whereClause: any = {};
    if (agentId) {
      whereClause.agentId = agentId;
    }

    const confirmations = await prisma.agentCashInConfirmation.findMany({
      where: whereClause,
      include: {
        agent: { include: { user: true, district: true } },
        customer: { include: { user: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ success: true, confirmations });
  } catch (error: any) {
    console.error("Fetch agent cash-in error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "AGENT" && session.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Only authorized Agents or Admins can confirm cash-in" }, { status: 403 });
    }

    const body = await req.json();
    const { confirmationId, customerPhone, customerId, amount, note, action = "CONFIRM" } = body;

    let targetAgent = null;
    if (session.role === "AGENT") {
      targetAgent = await prisma.agent.findUnique({
        where: { userId: session.userId },
        include: { user: true },
      });
      if (!targetAgent) {
        return NextResponse.json({ error: "Agent profile not found" }, { status: 404 });
      }
    } else {
      // Super admin acting as default agent or specified agent
      targetAgent = await prisma.agent.findFirst({ include: { user: true } });
    }

    if (!targetAgent) {
      return NextResponse.json({ error: "No agent assigned to handle transaction" }, { status: 400 });
    }

    // If confirmationId is provided: approve existing request
    if (confirmationId) {
      const confirmation = await prisma.agentCashInConfirmation.findUnique({
        where: { id: confirmationId },
        include: { customer: { include: { user: true } } },
      });

      if (!confirmation) {
        return NextResponse.json({ error: "Cash-in request not found" }, { status: 404 });
      }

      if (confirmation.status === "CONFIRMED") {
        return NextResponse.json({ error: "Request is already confirmed" }, { status: 400 });
      }

      if (action === "REJECT") {
        await prisma.agentCashInConfirmation.update({
          where: { id: confirmationId },
          data: { status: "REJECTED", note: note || "Rejected by agent" },
        });
        return NextResponse.json({ success: true, message: "Request rejected" });
      }

      // Credit Customer Wallet
      await creditWallet({
        userId: confirmation.customer.userId,
        amount: confirmation.amount,
        type: "CASH_IN",
        referenceType: "AGENT_CASH_IN",
        referenceId: targetAgent.id,
        note: `এজেন্ট ক্যাশ-ইন অনুমোদন: ${targetAgent.user.name} (${targetAgent.user.phone})`,
        createdBy: session.userId,
      });

      // Update status
      const updated = await prisma.agentCashInConfirmation.update({
        where: { id: confirmationId },
        data: {
          status: "CONFIRMED",
          note: note ? `${confirmation.note || ""} [Agent: ${note}]` : confirmation.note,
        },
      });

      // Audit Log
      await prisma.auditLog.create({
        data: {
          userId: session.userId,
          role: session.role,
          action: "AGENT_CASH_IN_CONFIRM",
          targetType: "Customer",
          targetId: confirmation.customerId,
          details: JSON.stringify({
            confirmationId,
            agentId: targetAgent.id,
            amount: confirmation.amount,
            customerPhone: confirmation.customer.user.phone,
          }),
        },
      });

      return NextResponse.json({
        success: true,
        message: `৳ ${confirmation.amount} গ্রাহকের ওয়ালেটে সফলভাবে জমা হয়েছে!`,
        confirmation: updated,
      });
    }

    // Direct Cash-in by Customer Phone or ID
    let targetCustomer = null;
    if (customerPhone) {
      const u = await prisma.user.findUnique({
        where: { phone: customerPhone.trim() },
        include: { customer: true },
      });
      if (u?.customer) targetCustomer = u.customer;
    } else if (customerId) {
      targetCustomer = await prisma.customer.findUnique({
        where: { id: customerId },
        include: { user: true },
      });
    }

    if (!targetCustomer) {
      return NextResponse.json({ error: "গ্রাহক খুঁজে পাওয়া যায়নি (Invalid customer phone/id)" }, { status: 404 });
    }

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      return NextResponse.json({ error: "টাকার পরিমাণ সঠিক নয় (Amount must be > 0)" }, { status: 400 });
    }

    // Credit Customer Wallet
    await creditWallet({
      userId: targetCustomer.userId,
      amount: numAmount,
      type: "CASH_IN",
      referenceType: "AGENT_CASH_IN",
      referenceId: targetAgent.id,
      note: `এজেন্ট সরাসরি ক্যাশ-ইন: ${targetAgent.user.name} (${targetAgent.user.phone})`,
      createdBy: session.userId,
    });

    // Create Confirmation Record
    const confirmation = await prisma.agentCashInConfirmation.create({
      data: {
        agentId: targetAgent.id,
        customerId: targetCustomer.id,
        amount: numAmount,
        note: note || "Direct Agent Top-up",
        status: "CONFIRMED",
      },
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        role: session.role,
        action: "AGENT_CASH_IN_CONFIRM",
        targetType: "Customer",
        targetId: targetCustomer.id,
        details: JSON.stringify({
          agentId: targetAgent.id,
          amount: numAmount,
          customerPhone: customerPhone || targetCustomer.id,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: `৳ ${numAmount} গ্রাহক (${customerPhone || targetCustomer.id})-এর ওয়ালেটে সফলভাবে জমা হয়েছে!`,
      confirmation,
    });
  } catch (error: any) {
    console.error("Agent cash in confirm error:", error);
    return NextResponse.json({ error: error.message || "Failed to process cash-in" }, { status: 500 });
  }
}
