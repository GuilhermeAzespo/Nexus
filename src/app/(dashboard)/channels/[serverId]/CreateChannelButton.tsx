"use client";

import React, { useState } from "react";
import styles from "../../dashboard.module.css";
import { useRouter } from "next/navigation";

export default function CreateChannelButton({ serverId }: { serverId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [channelName, setChannelName] = useState("");
  const [channelType, setChannelType] = useState<"TEXT" | "AUDIO">("TEXT");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelName.trim()) return;

    // Convert spaces to hyphens and format name nicely like discord
    const formattedName = channelName
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-");

    try {
      setIsLoading(true);
      const res = await fetch("/api/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formattedName,
          type: channelType,
          serverId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setIsOpen(false);
        setChannelName("");
        setChannelType("TEXT");
        router.refresh();
        router.push(`/channels/${serverId}/${data.id}`);
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Failed to create channel");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button className={styles.addChannelBtn} onClick={() => setIsOpen(true)} title="Create Channel">
        +
      </button>

      {isOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Create Channel</h2>
              <p>Send messages, pictures, opinions, or start a voice conversation.</p>
            </div>
            <form onSubmit={handleCreate}>
              <div className={styles.radioGroup}>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)" }}>CHANNEL TYPE</label>
                
                <label className={styles.radioOption}>
                  <input
                    type="radio"
                    name="channelType"
                    value="TEXT"
                    checked={channelType === "TEXT"}
                    onChange={() => setChannelType("TEXT")}
                  />
                  <div className={styles.radioOptionLabel}>
                    <span># Text</span>
                    <span className={styles.radioOptionDesc}>Post messages, images, opinions, and puns</span>
                  </div>
                </label>

                <label className={styles.radioOption}>
                  <input
                    type="radio"
                    name="channelType"
                    value="AUDIO"
                    checked={channelType === "AUDIO"}
                    onChange={() => setChannelType("AUDIO")}
                  />
                  <div className={styles.radioOptionLabel}>
                    <span>🔊 Voice</span>
                    <span className={styles.radioOptionDesc}>Hang out together with voice and screen share</span>
                  </div>
                </label>
              </div>

              <div className={styles.inputGroup}>
                <label>CHANNEL NAME</label>
                <input
                  type="text"
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                  placeholder="new-channel"
                  required
                />
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={() => setIsOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.createBtn} disabled={isLoading}>
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
