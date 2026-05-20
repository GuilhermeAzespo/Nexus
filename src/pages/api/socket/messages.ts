import { NextApiRequest } from "next";
import { NextApiResponseServerIo } from "./io";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIo
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "supersecret"
    ) as { userId: string; email: string };

    const { content, serverId, channelId } = req.body;

    if (!content || !serverId || !channelId) {
      return res.status(400).json({ error: "Missing fields" });
    }

    // Verify membership
    const member = await prisma.member.findUnique({
      where: {
        userId_serverId: {
          userId: decoded.userId,
          serverId: serverId as string,
        },
      },
    });

    if (!member) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const message = await prisma.message.create({
      data: {
        content,
        channelId: channelId as string,
        userId: decoded.userId,
      },
      include: {
        user: true,
      },
    });

    const channelKey = `chat:${channelId}:messages`;

    res?.socket?.server?.io?.emit(channelKey, message);

    return res.status(200).json(message);
  } catch (error) {
    console.error("MESSAGES_POST", error);
    return res.status(500).json({ message: "Internal Error" });
  }
}
