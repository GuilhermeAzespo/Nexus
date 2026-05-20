import React from "react";
import prisma from "@/lib/prisma";
import ChatArea from "./ChatArea";
import AudioRoom from "./AudioRoom";

export default async function ChannelPage(props: {
  params: Promise<{ serverId: string; channelId: string }>;
}) {
  const params = await props.params;

  const channel = await prisma.channel.findUnique({
    where: { id: params.channelId },
  });

  if (!channel) {
    return <div>Channel not found</div>;
  }

  if (channel.type === "AUDIO") {
    return <AudioRoom chatId={channel.id} serverId={params.serverId} />;
  }

  return (
    <ChatArea channel={channel} serverId={params.serverId} />
  );
}
