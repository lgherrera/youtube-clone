// app/components/Header.tsx
import { Menu, LayoutList } from "lucide-react";
import Link from "next/link";
import styles from "./Header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        
        {/* 1. Left: Hamburger Menu */}
        <button className={styles.iconButton}>
          <Menu 
            size={24} 
            strokeWidth={2} 
            color="white"
          /> 
        </button>

        {/* 2. Middle: Logo */}
        <div className={styles.logoContainer}>
          <Link href="/">
            <img 
              src="/stv_logo.jpg" 
              alt="SEXOTV Logo" 
              className={styles.logo}
            />
          </Link>
        </div>

        {/* 3. Right: Yellow List Icon */}
        <Link href="/categories" className={styles.iconButton}>
          <LayoutList 
            size={24} 
            strokeWidth={2} 
            color="#FFB800"
          />
        </Link>
        
      </div>
    </header>
  );
}