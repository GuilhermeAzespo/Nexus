"use client";

import { useEffect, useState } from "react";
import { LiveKitRoom, VideoConference, RoomAudioRenderer } from "@livekit/components-react";
import "@livekit/components-styles";
import { useSocket } from "@/components/providers/SocketProvider";
import { useRouter } from "next/navigation";

export default function AudioRoom({
  chatId,
  serverId,
  userName,
  userId,
}: {
  chatId: string;
  serverId: string;
  userName: string;
  userId: string;
}) {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [serverUrl, setServerUrl] = useState("");
  const [error, setError] = useState("");
  const [errorDetails, setErrorDetails] = useState<{
    hasApiKey?: boolean;
    hasApiSecret?: boolean;
    hasWsUrl?: boolean;
  } | null>(null);

  const { socket } = useSocket();

  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch(
          `/api/livekit?room=${chatId}&username=${encodeURIComponent(userName)}&serverId=${serverId}`
        );
        
        if (!resp.ok) {
          const errData = await resp.json();
          setError(errData.error || "Failed to fetch LiveKit token");
          setErrorDetails(errData.details || null);
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
  }, [chatId, serverId, userName]);

  useEffect(() => {
    if (!socket || !userId) return;

    socket.emit("join-voice", {
      channelId: chatId,
      serverId,
      userId,
      userName,
    });

    return () => {
      socket.emit("leave-voice", {
        channelId: chatId,
        userId,
      });
    };
  }, [socket, chatId, serverId, userId, userName]);

  if (error) {
    return (
      <div style={{ display: "flex", flex: 1, flexDirection: "column", justifyContent: "center", alignItems: "center", color: "#f87171", padding: "20px", textAlign: "center" }}>
        <h3 style={{ fontSize: "20px", fontWeight: "bold" }}>Failed to Connect to Voice</h3>
        <p style={{ marginTop: "8px", color: "var(--text-secondary)" }}>{error}</p>
        
        {errorDetails && (
          <div style={{ 
            marginTop: "16px", 
            padding: "12px 20px", 
            backgroundColor: "rgba(248, 113, 113, 0.1)", 
            borderRadius: "6px", 
            border: "1px solid rgba(248, 113, 113, 0.2)",
            textAlign: "left",
            fontSize: "13px",
            fontFamily: "monospace",
            color: "var(--text-secondary)",
            width: "fit-content",
            maxWidth: "100%"
          }}>
            <div style={{ color: "#ef4444", fontWeight: "bold", marginBottom: "8px" }}>Environment Variable Status:</div>
            <div>LIVEKIT_API_KEY: {errorDetails.hasApiKey ? "✅ Configured" : "❌ MISSING"}</div>
            <div>LIVEKIT_API_SECRET: {errorDetails.hasApiSecret ? "✅ Configured" : "❌ MISSING"}</div>
            <div>LIVEKIT_URL (or NEXT_PUBLIC_LIVEKIT_URL): {errorDetails.hasWsUrl ? "✅ Configured" : "❌ MISSING"}</div>
          </div>
        )}
        
        <p style={{ fontSize: "12px", marginTop: "16px", color: "#9ca3af" }}>Please check your LiveKit environment variables in Easypanel.</p>
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
      onDisconnected={() => {
        router.push(`/channels/${serverId}`);
      }}
    >
      <VideoConference />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}
