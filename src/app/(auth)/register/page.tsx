"use client";

import React, { useState } from "react";
import Link from "next/link";
import styles from "../auth.module.css";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement registration logic
    console.log("Register attempt with:", { name, email });
  };

  return (
    <div className={styles.container}>
      <div className={`${styles.card} glass-panel`}>
        <div className={styles.header}>
          <h1 className={styles.title}>Create an account</h1>
          <p className={styles.subtitle}>Join the Nexus community today</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="name">
              Display Name
            </label>
            <input
              id="name"
              type="text"
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

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
            Register
          </button>
        </form>

        <div className={styles.footer}>
          Already have an account?
          <Link href="/login" className={styles.link}>
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
