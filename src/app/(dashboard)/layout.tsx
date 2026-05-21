import React from "react";
import styles from "./dashboard.module.css";
import Link from "next/link";
import { getServerAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import SidebarAction from "./components/SidebarAction";
import LogoutButton from "./components/LogoutButton";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerAuthSession();

  if (!session) {
    return redirect("/login");
  }

  const servers = await prisma.server.findMany({
    where: {
      members: {
        some: {
          userId: session.userId,
        },
      },
    },
  });

  return (
    <div className={styles.appContainer}>
      <nav className={styles.serverSidebar}>
        <div className={styles.serverIconHome}>
          <Link href="/channels">
            <span className={styles.homeIcon}>N</span>
          </Link>
        </div>
        <div className={styles.separator}></div>
        
        {servers.map((server) => (
          <Link key={server.id} href={`/channels/${server.id}`}>
            <div className={styles.serverIcon} title={server.name}>
              {server.imageUrl ? (
                <img src={server.imageUrl} alt={server.name} />
              ) : (
                <span>{server.name.charAt(0).toUpperCase()}</span>
              )}
            </div>
          </Link>
        ))}

        <SidebarAction />

        <div className={styles.logoutWrapper}>
          <LogoutButton />
        </div>
      </nav>
      <main className={styles.mainContent}>{children}</main>
    </div>
  );
}
