"use client";

import React, { useState } from "react";
import styles from "../../dashboard.module.css";

export default function InviteButton({ inviteCode }: { inviteCode: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    // Determine the base URL dynamically based on where the app is hosted
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const inviteLink = `${baseUrl}/invite/${inviteCode}`;
    
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ padding: "0 16px 16px 16px" }}>
      <button 
        onClick={handleCopy}
        style={{
          width: "100%",
          padding: "8px",
          backgroundColor: "var(--brand)",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontWeight: "bold",
          fontSize: "12px",
          transition: "background-color 0.2s"
        }}
      >
        {copied ? "Copied!" : "Invite People"}
      </button>
    </div>
  );
}
