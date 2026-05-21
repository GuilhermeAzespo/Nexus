import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/auth";

export default async function ServerPage(props: {
  params: Promise<{ serverId: string }>;
}) {
  const params = await props.params;
  const session = await getServerAuthSession();
  if (!session) return redirect("/login");

  const server = await prisma.server.findUnique({
    where: { id: params.serverId },
    include: {
      channels: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!server) {
    return redirect("/channels");
  }

  const initialChannel = server.channels[0];

  if (initialChannel) {
    return redirect(`/channels/${server.id}/${initialChannel.id}`);
  }

  return redirect("/channels");
}
