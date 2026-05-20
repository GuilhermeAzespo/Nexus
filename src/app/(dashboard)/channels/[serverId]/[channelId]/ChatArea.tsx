"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSocket } from "@/components/providers/SocketProvider";
import styles from "../../../dashboard.module.css";
import { Channel, Message, User } from "@prisma/client";

type MessageWithUser = Message & { user: User };

export default function ChatArea({
  channel,
  serverId,
}: {
  channel: Channel;
  serverId: string;
}) {
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState<MessageWithUser[]>([]);
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch initial messages
    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/messages?channelId=${channel.id}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.items);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMessages();
  }, [channel.id]);

  useEffect(() => {
    if (!socket) return;

    const channelKey = `chat:${channel.id}:messages`;

    socket.on(channelKey, (message: MessageWithUser) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off(channelKey);
    };
  }, [socket, channel.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      const currentContent = content;
      setContent("");
      
      await fetch("/api/socket/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: currentContent,
          serverId,
          channelId: channel.id,
        }),
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatHeader}>
        <span className={styles.hashIcon}>#</span>
        <span className={styles.channelNameHeader}>{channel.name}</span>
        <div style={{ marginLeft: "auto", fontSize: "12px", color: isConnected ? "var(--success)" : "var(--danger)" }}>
          {isConnected ? "Connected" : "Reconnecting..."}
        </div>
      </div>
      <div className={styles.chatMessages} ref={scrollRef}>
        <div className={styles.chatWelcome}>
          <h1>Welcome to #{channel.name}!</h1>
          <p>This is the start of the #{channel.name} channel.</p>
        </div>
        
        {isLoading && <div style={{ textAlign: "center", padding: "20px" }}>Carregando mensagens...</div>}

        {messages.map((msg) => (
          <div key={msg.id} style={{ display: "flex", gap: "16px", padding: "8px 0" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "var(--background-tertiary)", overflow: "hidden" }}>
              {msg.user.imageUrl ? (
                <img src={msg.user.imageUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
                  {msg.user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontWeight: "600", color: "var(--text-primary)" }}>{msg.user.name}</span>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  {new Date(msg.createdAt).toLocaleString()}
                </span>
              </div>
              <p style={{ color: "var(--text-primary)", marginTop: "4px" }}>{msg.content}</p>
            </div>
          </div>
        ))}
      </div>
      <div className={styles.chatInputContainer}>
        <form className={styles.chatForm} onSubmit={onSubmit}>
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`Message #${channel.name}`}
            className={styles.chatInput}
          />
        </form>
      </div>
    </div>
  );
}
