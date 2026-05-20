import React from "react";
import styles from "../dashboard.module.css";

export default function ChannelsPage() {
  return (
    <div className={styles.friendsContainer}>
      <div className={styles.friendsSidebar}>
        <div className={styles.searchBar}>Find or start a conversation</div>
        <div className={styles.friendsList}>
          <div className={styles.friendItem}>Friends</div>
          <div className={styles.friendItem}>Nitro</div>
          <h3 className={styles.sectionTitle}>Direct Messages</h3>
          {/* Mock DMs */}
        </div>
      </div>
      <div className={styles.friendsMain}>
        <div className={styles.topBar}>
          <div className={styles.topBarItem}>Friends</div>
          <div className={styles.topBarItem}>Online</div>
          <div className={styles.topBarItem}>All</div>
          <div className={styles.topBarItem}>Pending</div>
          <div className={styles.topBarItem}>Blocked</div>
          <div className={styles.addFriendBtn}>Add Friend</div>
        </div>
        <div className={styles.contentArea}>
          <div className={styles.emptyState}>
            <img src="/window.svg" alt="Empty" width={100} />
            <p>No one's around to play with Wumpus.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
