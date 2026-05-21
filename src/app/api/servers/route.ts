import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, imageUrl } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Server name is required" }, { status: 400 });
    }

    const server = await prisma.server.create({
      data: {
        name,
        imageUrl,
        inviteCode: crypto.randomUUID(),
        ownerId: session.userId,
        members: {
          create: [
            { userId: session.userId, role: "ADMIN" }
          ]
        },
        channels: {
          create: [
            { name: "geral", type: "TEXT" },
            { name: "Sala de Voz", type: "AUDIO" }
          ]
        }
      }
    });

    return NextResponse.json(server);
  } catch (error) {
    console.error("CREATE_SERVER_ERROR", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
