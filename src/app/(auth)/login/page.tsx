"use client";

import React, { useState } from "react";
import Link from "next/link";
import styles from "../auth.module.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement authentication logic
    console.log("Login attempt with:", email);
  };

  return (
    <div className={styles.container}>
      <div className={`${styles.card} glass-panel`}>
        <div className={styles.header}>
          <h1 className={styles.title}>Welcome back!</h1>
          <p className={styles.subtitle}>We're so excited to see you again!</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className={styles.submitBtn}>
            Log In
          </button>
        </form>

        <div className={styles.footer}>
          Need an account?
          <Link href="/register" className={styles.link}>
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
