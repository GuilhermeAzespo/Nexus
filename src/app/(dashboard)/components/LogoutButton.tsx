"use client";

import { useRouter } from "next/navigation";
import styles from "../dashboard.module.css";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    // Clear the token cookie
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0";
    router.refresh();
    router.push("/login");
  };

  return (
    <button 
      onClick={handleLogout} 
      className={styles.logoutButton}
      title="Fazer Logoff"
    >
      <svg 
        viewBox="0 0 24 24" 
        width="20" 
        height="20" 
        stroke="currentColor" 
        strokeWidth="2" 
        fill="none" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
        <polyline points="16 17 21 12 16 7"></polyline>
        <line x1="21" y1="12" x2="9" y2="12"></line>
      </svg>
    </button>
  );
}
