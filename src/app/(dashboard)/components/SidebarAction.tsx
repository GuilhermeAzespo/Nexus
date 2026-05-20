"use client";

import React, { useState } from "react";
import styles from "../dashboard.module.css";
import { useRouter } from "next/navigation";

export default function SidebarAction() {
  const [isOpen, setIsOpen] = useState(false);
  const [serverName, setServerName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serverName.trim()) return;

    try {
      setIsLoading(true);
      const res = await fetch("/api/servers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: serverName }),
      });

      if (res.ok) {
        const data = await res.json();
        setIsOpen(false);
        setServerName("");
        router.refresh();
        router.push(`/channels/${data.id}`);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button className={styles.addServerBtn} onClick={() => setIsOpen(true)}>
        +
      </button>

      {isOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Customize your server</h2>
              <p>Give your new server a personality with a name and an icon. You can always change it later.</p>
            </div>
            <form onSubmit={handleCreate}>
              <div className={styles.inputGroup}>
                <label>SERVER NAME</label>
                <input
                  type="text"
                  value={serverName}
                  onChange={(e) => setServerName(e.target.value)}
                  placeholder="My awesome server"
                  required
                />
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={() => setIsOpen(false)}>
                  Back
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
