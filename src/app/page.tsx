import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1 className={styles.title}>Imagine a Place...</h1>
        <p className={styles.subtitle}>
          ...where you can belong to a school club, a gaming group, or a worldwide art community. 
          Where just you and a handful of friends can spend time together. A place that makes it easy 
          to talk every day and hang out more often. Welcome to <strong>Nexus</strong>.
        </p>
        <div className={styles.actions}>
          <Link href="/login" className={styles.btnPrimary}>
            Open Nexus
          </Link>
          <Link href="/register" className={styles.btnSecondary}>
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}
