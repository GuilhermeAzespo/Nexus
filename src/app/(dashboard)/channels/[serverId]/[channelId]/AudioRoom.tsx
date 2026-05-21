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
  const [serverUrl, setServerUrl] = useState("");
  const [error, setError] = useState("");
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
        
        if (!resp.ok) {
          const errData = await resp.json();
          setError(errData.error || "Failed to fetch LiveKit token");
          return;
        }

        const data = await resp.json();
        setToken(data.token);
        setServerUrl(data.serverUrl);
      } catch (e) {
        console.error(e);
        setError("Network error connecting to the authentication server.");
      }
    })();
  }, [chatId, serverId]);

  if (error) {
    return (
      <div style={{ display: "flex", flex: 1, flexDirection: "column", justifyContent: "center", alignItems: "center", color: "#f87171", padding: "20px", textAlign: "center" }}>
        <h3 style={{ fontSize: "20px", fontWeight: "bold" }}>Failed to Connect to Voice</h3>
        <p style={{ marginTop: "8px", color: "var(--text-secondary)" }}>{error}</p>
        <p style={{ fontSize: "12px", marginTop: "12px", color: "#9ca3af" }}>Please check your LiveKit environment variables in Easypanel.</p>
      </div>
    );
  }

  if (token === "" || serverUrl === "") {
    return <div style={{ display: "flex", flex: 1, justifyContent: "center", alignItems: "center", color: "var(--text-secondary)" }}>Connecting to Voice...</div>;
  }

  return (
    <LiveKitRoom
      video={false}
      audio={true}
      token={token}
      serverUrl={serverUrl}
      data-lk-theme="default"
      style={{ height: "100%", width: "100%" }}
    >
      <VideoConference />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}
