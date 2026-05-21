"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSocket } from "@/components/providers/SocketProvider";
import styles from "../../dashboard.module.css";

interface Channel {
  id: string;
  name: string;
  type: "TEXT" | "AUDIO";
  serverId: string;
}

interface ChannelsSidebarListProps {
  channels: Channel[];
  serverId: string;
}

export default function ChannelsSidebarList({ channels, serverId }: ChannelsSidebarListProps) {
  const { socket } = useSocket();
  const [activeVoiceUsers, setActiveVoiceUsers] = useState<Record<string, Array<{ userId: string; userName: string }>>>({});

  useEffect(() => {
    if (!socket) return;

    // Request the initial voice state on mount
    socket.emit("request-voice-state");

    // Listen to changes in the active voice users state
    socket.on("voice-state-update", (state: Record<string, Array<{ userId: string; userName: string }>>) => {
      setActiveVoiceUsers(state);
    });

    return () => {
      socket.off("voice-state-update");
    };
  }, [socket]);

  return (
    <div className={styles.friendsList}>
      {channels.map((channel) => {
        const usersInVoice = activeVoiceUsers[channel.id] || [];

        return (
          <div key={channel.id}>
            <Link href={`/channels/${serverId}/${channel.id}`}>
              <div className={styles.friendItem}>
                {channel.type === "TEXT" ? "#" : "🔊"} {channel.name}
              </div>
            </Link>
            {channel.type === "AUDIO" && usersInVoice.length > 0 && (
              <div className={styles.voiceUsersList}>
                {usersInVoice.map((user) => (
                  <div key={user.userId} className={styles.voiceUserItem}>
                    <div className={styles.voiceUserAvatar}>
                      {user.userName.charAt(0)}
                    </div>
                    <span className={styles.voiceUserName} title={user.userName}>
                      {user.userName}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
