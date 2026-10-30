import { prisma } from "./prisma";

export type WalletTxTypeString =
  | "CASH_IN"
  | "CASH_OUT_HOLD"
  | "CASH_OUT_RELEASE"
  | "CASH_OUT_DEDUCT"
  | "PURCHASE"
  | "REFUND"
  | "COMMISSION"
  | "QUIZ_BONUS"
  | "ADMIN_ADJUSTMENT";

export async function ensureWallet(userId: string) {
  let wallet = await prisma.wallet.findUnique({
    where: { userId },
  });
  if (!wallet) {
    wallet = await prisma.wallet.create({
      data: {
        userId,
        balance: 0.0,
        heldBalance: 0.0,
      },
    });
  }
  return wallet;
}

export async function creditWallet({
  userId,
  amount,
  type,
  referenceType,
  referenceId,
  note,
  createdBy,
}: {
  userId: string;
  amount: number;
  type: WalletTxTypeString | string;
  referenceType?: string;
  referenceId?: string;
  note?: string;
  createdBy?: string;
}) {
  if (amount <= 0) throw new Error("Credit amount must be greater than zero");

  return await prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.upsert({
      where: { userId },
      create: { userId, balance: 0.0, heldBalance: 0.0 },
      update: {},
    });

    const newBalance = wallet.balance + amount;

    await tx.wallet.update({
      where: { id: wallet.id },
      data: { balance: newBalance },
    });

    const transaction = await tx.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type,
        amount,
        balanceAfter: newBalance,
        referenceType,
        referenceId,
        note,
        createdBy,
      },
    });

    return { wallet, transaction, newBalance };
  });
}

export async function debitWallet({
  userId,
  amount,
  type,
  referenceType,
  referenceId,
  note,
  createdBy,
}: {
  userId: string;
  amount: number;
  type: WalletTxTypeString | string;
  referenceType?: string;
  referenceId?: string;
  note?: string;
  createdBy?: string;
}) {
  if (amount <= 0) throw new Error("Debit amount must be greater than zero");

  return await prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.findUnique({
      where: { userId },
    });

    if (!wallet || wallet.balance < amount) {
      throw new Error("Insufficient wallet balance");
    }

    const newBalance = wallet.balance - amount;

    await tx.wallet.update({
      where: { id: wallet.id },
      data: { balance: newBalance },
    });

    const transaction = await tx.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type,
        amount: -amount,
        balanceAfter: newBalance,
        referenceType,
        referenceId,
        note,
        createdBy,
      },
    });

    return { wallet, transaction, newBalance };
  });
}

export async function holdCashOut({
  userId,
  amount,
  referenceId,
  createdBy,
}: {
  userId: string;
  amount: number;
  referenceId: string;
  createdBy?: string;
}) {
  return await prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.findUnique({
      where: { userId },
    });

    if (!wallet || wallet.balance < amount) {
      throw new Error("Insufficient wallet balance to hold");
    }

    const newBalance = wallet.balance - amount;
    const newHeld = wallet.heldBalance + amount;

    await tx.wallet.update({
      where: { id: wallet.id },
      data: { balance: newBalance, heldBalance: newHeld },
    });

    const transaction = await tx.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: "CASH_OUT_HOLD",
        amount: -amount,
        balanceAfter: newBalance,
        referenceType: "CashOutRequest",
        referenceId,
        note: `Held for cash-out request #${referenceId}`,
        createdBy,
      },
    });

    return { wallet, transaction };
  });
}

export async function releaseCashOutHold({
  userId,
  amount,
  referenceId,
  createdBy,
}: {
  userId: string;
  amount: number;
  referenceId: string;
  createdBy?: string;
}) {
  return await prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.findUnique({
      where: { userId },
    });

    if (!wallet || wallet.heldBalance < amount) {
      throw new Error("Invalid held balance state");
    }

    const newBalance = wallet.balance + amount;
    const newHeld = wallet.heldBalance - amount;

    await tx.wallet.update({
      where: { id: wallet.id },
      data: { balance: newBalance, heldBalance: newHeld },
    });

    const transaction = await tx.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: "CASH_OUT_RELEASE",
        amount: amount,
        balanceAfter: newBalance,
        referenceType: "CashOutRequest",
        referenceId,
        note: `Released held balance from rejected cash-out #${referenceId}`,
        createdBy,
      },
    });

    return { wallet, transaction };
  });
}

export async function completeCashOutPayout({
  userId,
  amount,
  referenceId,
  createdBy,
}: {
  userId: string;
  amount: number;
  referenceId: string;
  createdBy?: string;
}) {
  return await prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.findUnique({
      where: { userId },
    });

    if (!wallet || wallet.heldBalance < amount) {
      throw new Error("Invalid held balance state for payout");
    }

    const newHeld = wallet.heldBalance - amount;

    await tx.wallet.update({
      where: { id: wallet.id },
      data: { heldBalance: newHeld },
    });

    const transaction = await tx.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: "CASH_OUT_DEDUCT",
        amount: 0,
        balanceAfter: wallet.balance,
        referenceType: "CashOutRequest",
        referenceId,
        note: `Completed payout for cash-out #${referenceId}`,
        createdBy,
      },
    });

    return { wallet, transaction };
  });
}
