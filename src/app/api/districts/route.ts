import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const districts = await prisma.district.findMany({
      orderBy: { nameBn: "asc" },
      include: {
        channelPartner: {
          include: {
            user: { select: { id: true, name: true, phone: true } },
          },
        },
      },
    });
    return NextResponse.json({ districts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
