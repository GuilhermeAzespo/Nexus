import React from "react";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/auth";
import styles from "../../dashboard.module.css";
import Link from "next/link";
import InviteButton from "./InviteButton";

export default async function ServerLayout(props: {
  children: React.ReactNode;
  params: Promise<{ serverId: string }>;
}) {
  const { children } = props;
  const params = await props.params;
  const session = await getServerAuthSession();
  if (!session) return redirect("/login");

  const server = await prisma.server.findUnique({
    where: { id: params.serverId },
    include: {
      channels: true,
    },
  });

  if (!server) {
    return redirect("/channels");
  }

  // Verify membership
  const member = await prisma.member.findUnique({
    where: {
      userId_serverId: {
        userId: session.userId,
        serverId: server.id,
      },
    },
  });

  if (!member) {
    return redirect("/channels");
  }

  return (
    <div className={styles.friendsContainer}>
      <div className={styles.friendsSidebar}>
        <div className={styles.serverHeader}>
          <h3>{server.name}</h3>
        </div>
        <InviteButton inviteCode={server.inviteCode} />
        <div className={styles.friendsList}>
          {server.channels.map((channel) => (
            <Link key={channel.id} href={`/channels/${server.id}/${channel.id}`}>
              <div className={styles.friendItem}>
                # {channel.name}
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className={styles.friendsMain}>{children}</div>
    </div>
  );
}
