// app/admin/manage/page.tsx
'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import styles from './manage.module.css';

interface UpdateResult {
  message: string;
  total: number;
  updated: number;
  failed: number;
  stillProcessing: number;
  details: {
    success: string[];
    failed: string[];
    stillProcessing: string[];
  };
}

export default function AdminManagePage() {
  const [updating, setUpdating] = useState(false);
  const [result, setResult] = useState<UpdateResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpdateDurations = async () => {
    setUpdating(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/update-video-durations', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to update video durations');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error('Error updating durations:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Video Management</h1>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Update Video Durations</h2>
        <p className={styles.description}>
          Updates duration for all videos that have duration_seconds = 0.
          This fetches the actual duration from Cloudflare Stream.
        </p>

        <button
          onClick={handleUpdateDurations}
          disabled={updating}
          className={styles.updateButton}
        >
          {updating ? (
            <>
              <RefreshCw className="animate-spin" size={20} />
              Updating...
            </>
          ) : (
            <>
              <RefreshCw size={20} />
              Update Durations
            </>
          )}
        </button>

        {error && (
          <div className={styles.errorBox}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {result && (
          <div className={styles.resultBox}>
            <h3 className={styles.resultTitle}>{result.message}</h3>
            <div className={styles.stats}>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Total Videos Checked:</span>
                <span className={styles.statValue}>{result.total}</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Successfully Updated:</span>
                <span className={styles.statValue}>{result.updated}</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Still Processing:</span>
                <span className={styles.statValue}>{result.stillProcessing}</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Failed:</span>
                <span className={styles.statValue}>{result.failed}</span>
              </div>
            </div>

            {result.details.success.length > 0 && (
              <div className={styles.detailSection}>
                <h4 className={styles.detailTitle}>✓ Updated Videos:</h4>
                <ul className={styles.videoList}>
                  {result.details.success.map((title, index) => (
                    <li key={index}>{title}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.details.stillProcessing.length > 0 && (
              <div className={styles.detailSection}>
                <h4 className={styles.detailTitle}>⏳ Still Processing:</h4>
                <ul className={styles.videoList}>
                  {result.details.stillProcessing.map((title, index) => (
                    <li key={index}>{title}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.details.failed.length > 0 && (
              <div className={styles.detailSection}>
                <h4 className={styles.detailTitle}>✗ Failed:</h4>
                <ul className={styles.videoList}>
                  {result.details.failed.map((title, index) => (
                    <li key={index}>{title}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}