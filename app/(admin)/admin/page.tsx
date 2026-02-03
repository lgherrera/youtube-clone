// app/(admin)/admin/page.tsx
import Link from "next/link";
import { Upload, FolderOpen, Sparkles, Film, PlayCircle, Grid3X3, Heart } from "lucide-react";
import { supabase } from "@/lib/supabase";
import styles from "./page.module.css";

async function getStats() {
  const [videosResult, categoriesResult, girlfriendsResult] = await Promise.all([
    supabase.from("videos").select("id", { count: "exact" }),
    supabase.from("categories").select("id", { count: "exact" }),
    supabase.from("girlfriends").select("id", { count: "exact" }).eq("is_active", true),
  ]);

  const totalVideos = videosResult.count || 0;
  const totalCategories = categoriesResult.count || 0;
  const totalGirlfriends = girlfriendsResult.count || 0;

  return { totalVideos, totalCategories, totalGirlfriends };
}

export default async function AdminDashboard() {
  const { totalVideos, totalCategories, totalGirlfriends } = await getStats();

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Dashboard</h1>
      
      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <PlayCircle size={24} className={styles.statIcon} />
          <span className={styles.statValue}>{totalVideos}</span>
          <span className={styles.statLabel}>Videos</span>
        </div>
        
        <div className={styles.statCard}>
          <Grid3X3 size={24} className={styles.statIcon} />
          <span className={styles.statValue}>{totalCategories}</span>
          <span className={styles.statLabel}>Categories</span>
        </div>
        
        <div className={styles.statCard}>
          <Heart size={24} className={styles.statIcon} />
          <span className={styles.statValue}>{totalGirlfriends}</span>
          <span className={styles.statLabel}>Girlfriends</span>
        </div>
      </div>

      {/* Quick Actions */}
      <h2 className={styles.subtitle}>Quick Actions</h2>
      
      <div className={styles.grid}>
        <Link href="/admin/upload" className={styles.card}>
          <Upload size={32} />
          <span className={styles.cardTitle}>Upload</span>
          <span className={styles.cardDesc}>Add new videos</span>
        </Link>
        
        <Link href="/admin/manage" className={styles.card}>
          <FolderOpen size={32} />
          <span className={styles.cardTitle}>Manage</span>
          <span className={styles.cardDesc}>Edit & delete videos</span>
        </Link>
        
        <Link href="/admin/image-generator" className={styles.card}>
          <Sparkles size={32} />
          <span className={styles.cardTitle}>AI Generator</span>
          <span className={styles.cardDesc}>Create images</span>
        </Link>
        
        <Link href="/gf" className={styles.card}>
          <Heart size={32} />
          <span className={styles.cardTitle}>Girlfriends</span>
          <span className={styles.cardDesc}>AI Girlfriend section</span>
        </Link>
        
        <Link href="/" className={styles.card}>
          <Film size={32} />
          <span className={styles.cardTitle}>View Site</span>
          <span className={styles.cardDesc}>Go to SEXOTV</span>
        </Link>
      </div>
    </div>
  );
}