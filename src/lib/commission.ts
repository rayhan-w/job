import { prisma } from "./prisma";
import { creditWallet, debitWallet } from "./wallet";

export async function processOrderCommission(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: { product: true },
      },
      user: {
        include: {
          customer: {
            include: {
              agent: {
                include: { channelPartner: true },
              },
            },
          },
        },
      },
    },
  });

  if (!order || !order.user.customer) {
    return { success: false, reason: "No customer profile found for order" };
  }

  const customer = order.user.customer;
  const agent = customer.agent;
  const channelPartner = agent.channelPartner;

  // Check global commission setting
  const globalSetting = await prisma.setting.findUnique({
    where: { key: "COMMISSION_ENABLED" },
  });
  const isGlobalEnabled = globalSetting ? globalSetting.value === "true" : true;

  if (!isGlobalEnabled) {
    await prisma.auditLog.create({
      data: {
        action: "COMMISSION_SKIPPED",
        details: JSON.stringify({ orderId, reason: "Global commission turned OFF by Super Admin" }),
      },
    });
    return { success: false, reason: "Global commission turned OFF" };
  }

  // Check agent commission switch
  if (!agent.commissionActive) {
    await prisma.auditLog.create({
      data: {
        action: "COMMISSION_SKIPPED",
        details: JSON.stringify({ orderId, agentId: agent.id, reason: "Agent commission inactive" }),
      },
    });
    return { success: false, reason: "Agent commission disabled" };
  }

  let totalAgentCommission = 0;
  let totalCpCommission = 0;

  for (const item of order.items) {
    if (!item.product.commissionEligible) continue;

    const profit = Math.max(0, item.totalSale - item.totalCost);
    if (profit <= 0) continue;

    // Check product specific rule first, then category rule, then agent/global rates
    const productRule = await prisma.commissionRule.findFirst({
      where: { productId: item.productId, isActive: true },
    });

    const categoryRule = !productRule
      ? await prisma.commissionRule.findFirst({
          where: { category: item.product.category, isActive: true },
        })
      : null;

    const agentRate = productRule?.agentPercentage ?? categoryRule?.agentPercentage ?? agent.commissionRate ?? 10.0;
    const cpRate = productRule?.cpPercentage ?? categoryRule?.cpPercentage ?? channelPartner.commissionRate ?? 5.0;

    const agentAmount = (profit * agentRate) / 100;
    const cpAmount = (profit * cpRate) / 100;

    totalAgentCommission += agentAmount;
    totalCpCommission += cpAmount;

    const ruleSnapshot = JSON.stringify({
      agentRate,
      cpRate,
      profit,
      ruleSource: productRule ? "product" : categoryRule ? "category" : "default",
    });

    await prisma.commission.create({
      data: {
        orderId: order.id,
        orderItemId: item.id,
        agentId: agent.id,
        channelPartnerId: channelPartner.id,
        agentAmount,
        cpAmount,
        ruleSnapshot,
        status: "PAID",
      },
    });
  }

  // Credit to Agent wallet
  if (totalAgentCommission > 0) {
    await creditWallet({
      userId: agent.userId,
      amount: totalAgentCommission,
      type: "COMMISSION",
      referenceType: "Order",
      referenceId: order.id,
      note: `Lifetime referral commission from order #${order.id.slice(0, 8)}`,
      createdBy: "SYSTEM",
    });
  }

  // Credit to Channel Partner wallet
  if (totalCpCommission > 0) {
    await creditWallet({
      userId: channelPartner.userId,
      amount: totalCpCommission,
      type: "COMMISSION",
      referenceType: "Order",
      referenceId: order.id,
      note: `District channel partner commission from order #${order.id.slice(0, 8)}`,
      createdBy: "SYSTEM",
    });
  }

  return {
    success: true,
    totalAgentCommission,
    totalCpCommission,
  };
}

export async function reverseOrderCommission(orderId: string) {
  const commissions = await prisma.commission.findMany({
    where: { orderId, status: "PAID" },
    include: {
      agent: true,
      channelPartner: true,
    },
  });

  for (const comm of commissions) {
    if (comm.agentAmount > 0) {
      await debitWallet({
        userId: comm.agent.userId,
        amount: comm.agentAmount,
        type: "REFUND",
        referenceType: "CommissionReversal",
        referenceId: comm.id,
        note: `Reversed commission for cancelled order #${orderId.slice(0, 8)}`,
        createdBy: "SYSTEM",
      });
    }

    if (comm.cpAmount > 0) {
      await debitWallet({
        userId: comm.channelPartner.userId,
        amount: comm.cpAmount,
        type: "REFUND",
        referenceType: "CommissionReversal",
        referenceId: comm.id,
        note: `Reversed district commission for cancelled order #${orderId.slice(0, 8)}`,
        createdBy: "SYSTEM",
      });
    }

    await prisma.commission.update({
      where: { id: comm.id },
      data: { status: "REVERSED" },
    });
  }

  return { success: true, count: commissions.length };
}
