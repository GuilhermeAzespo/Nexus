"use client";

import { useEffect, useState } from "react";
import { LiveKitRoom, VideoConference, RoomAudioRenderer } from "@livekit/components-react";
import "@livekit/components-styles";
import { useSocket } from "@/components/providers/SocketProvider";

export default function AudioRoom({
  chatId,
  serverId,
}: {
  chatId: string;
  serverId: string;
}) {
  const [token, setToken] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    // Generate a random name for demo purposes, or fetch user profile
    const randomName = `User_${Math.floor(Math.random() * 1000)}`;
    setName(randomName);

    (async () => {
      try {
        const resp = await fetch(
          `/api/livekit?room=${chatId}&username=${randomName}&serverId=${serverId}`
        );
        const data = await resp.json();
        setToken(data.token);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [chatId, serverId]);

  if (token === "") {
    return <div style={{ display: "flex", flex: 1, justifyContent: "center", alignItems: "center" }}>Connecting to Voice...</div>;
  }

  return (
    <LiveKitRoom
      video={false}
      audio={true}
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      data-lk-theme="default"
      style={{ height: "100%", width: "100%" }}
    >
      <VideoConference />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}
