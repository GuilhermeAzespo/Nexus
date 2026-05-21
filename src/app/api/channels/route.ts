import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, type, serverId } = await req.json();

    if (!name || !type || !serverId) {
      return NextResponse.json({ error: "Name, type, and serverId are required" }, { status: 400 });
    }

    if (name.toLowerCase() === "geral") {
      return NextResponse.json({ error: "Channel name 'geral' is reserved" }, { status: 400 });
    }

    // Verify user is member and has admin or moderator privileges
    const member = await prisma.member.findFirst({
      where: {
        serverId,
        userId: session.userId,
        role: {
          in: ["ADMIN", "MODERATOR"]
        }
      }
    });

    if (!member) {
      return NextResponse.json({ error: "Forbidden: Only admins or moderators can create channels" }, { status: 403 });
    }

    const channel = await prisma.channel.create({
      data: {
        name,
        type,
        serverId
      }
    });

    return NextResponse.json(channel);
  } catch (error) {
    console.error("CREATE_CHANNEL_ERROR", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
