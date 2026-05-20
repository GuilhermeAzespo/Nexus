import React from "react";
import styles from "./dashboard.module.css";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.appContainer}>
      <nav className={styles.serverSidebar}>
        <div className={styles.serverIconHome}>
          <Link href="/channels/@me">
            <span className={styles.homeIcon}>N</span>
          </Link>
        </div>
        <div className={styles.separator}></div>
        {/* Mock Servers */}
        <div className={styles.serverIcon}>
          <img src="https://via.placeholder.com/48" alt="Server 1" />
        </div>
        <div className={styles.serverIcon}>
          <img src="https://via.placeholder.com/48" alt="Server 2" />
        </div>
        <button className={styles.addServerBtn}>+</button>
      </nav>
      <main className={styles.mainContent}>{children}</main>
    </div>
  );
}
