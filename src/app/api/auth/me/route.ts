import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      wallet: true,
      candidateProfile: true,
      referrer: {
        select: { id: true, name: true, phone: true, email: true },
      },
      customer: {
        include: {
          agent: {
            include: {
              user: true,
              channelPartner: {
                include: { user: true, district: true },
              },
            },
          },
        },
      },
      agent: true,
      channelPartner: true,
      institution: true,
    },
  });

  if (!user) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role,
      referralCode: user.referralCode,
      referrer: user.referrer,
      language: user.language,
      avatarUrl: user.avatarUrl,
      wallet: user.wallet,
      candidateProfile: user.candidateProfile,
      customer: user.customer,
      agent: user.agent,
      channelPartner: user.channelPartner,
      institution: user.institution,
      impersonatorId: session.impersonatorId,
      impersonatorRole: session.impersonatorRole,
    },
  });
}
