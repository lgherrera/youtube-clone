// components/AdminHeader.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ArrowLeft } from "lucide-react";
import styles from "./AdminHeader.module.css";

export default function AdminHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link href="/admin" className={styles.iconButton}>
            <ArrowLeft size={24} />
          </Link>
          
          <div className={styles.logoContainer}>
            <img
              src="/admin_logo.jpg"
              alt="Admin"
              className={styles.logo}
            />
          </div>
          
          <button 
            className={styles.iconButton}
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* Sidebar Menu */}
      <div 
        className={`${styles.overlay} ${isMenuOpen ? styles.overlayVisible : ""}`}
        onClick={() => setIsMenuOpen(false)}
      />
      
      <div className={`${styles.sidebar} ${isMenuOpen ? styles.sidebarOpen : ""}`}>
        <div className={styles.sidebarHeader}>
          <span className={styles.sidebarTitle}>Admin Menu</span>
          <button 
            className={styles.iconButton}
            onClick={() => setIsMenuOpen(false)}
          >
            <X size={24} />
          </button>
        </div>
        
        <nav className={styles.sidebarNav}>
          <Link 
            href="/admin" 
            className={styles.sidebarLink}
            onClick={() => setIsMenuOpen(false)}
          >
            Dashboard
          </Link>
          <Link 
            href="/admin/upload" 
            className={styles.sidebarLink}
            onClick={() => setIsMenuOpen(false)}
          >
            Upload
          </Link>
          <Link 
            href="/admin/manage" 
            className={styles.sidebarLink}
            onClick={() => setIsMenuOpen(false)}
          >
            Manage
          </Link>
          <Link 
            href="/admin/image-generator" 
            className={styles.sidebarLink}
            onClick={() => setIsMenuOpen(false)}
          >
            AI Image Generator
          </Link>
          <Link 
            href="/" 
            className={styles.sidebarLink}
            onClick={() => setIsMenuOpen(false)}
          >
            Exit to Site
          </Link>
        </nav>
      </div>
    </>
  );
}