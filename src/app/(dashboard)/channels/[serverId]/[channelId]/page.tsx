import React from "react";
import prisma from "@/lib/prisma";
import styles from "../../../dashboard.module.css";

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

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatHeader}>
        <span className={styles.hashIcon}>#</span>
        <span className={styles.channelNameHeader}>{channel.name}</span>
      </div>
      <div className={styles.chatMessages}>
        <div className={styles.chatWelcome}>
          <h1>Welcome to #{channel.name}!</h1>
          <p>This is the start of the #{channel.name} channel.</p>
        </div>
        {/* Messages will go here */}
      </div>
      <div className={styles.chatInputContainer}>
        <form className={styles.chatForm}>
          <input
            type="text"
            placeholder={`Message #${channel.name}`}
            className={styles.chatInput}
          />
        </form>
      </div>
    </div>
  );
}
