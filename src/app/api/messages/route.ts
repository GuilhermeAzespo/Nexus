import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";

const MESSAGES_BATCH = 50;

export async function GET(req: Request) {
  try {
    const session = await getServerAuthSession();
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const channelId = searchParams.get("channelId");

    if (!channelId) {
      return new NextResponse("Channel ID missing", { status: 400 });
    }

    const messages = await prisma.message.findMany({
      take: MESSAGES_BATCH,
      where: {
        channelId,
      },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      items: messages.reverse(),
    });
  } catch (error) {
    console.error("MESSAGES_GET", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
