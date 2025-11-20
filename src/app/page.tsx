'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './page.module.scss';

export default function Home() {
  const [mangaList, setMangaList] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchMangaList() {
      try {
        const response = await fetch('/api/manga');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: string[] = await response.json();
        setMangaList(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchMangaList();
  }, []);

  if (loading) {
    return <div className={styles.container}>Loading manga list...</div>;
  }

  if (error) {
    return <div className={styles.container}>Error: {error}</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Manga Library</h1>
      {mangaList.length === 0 ? (
        <p className={styles.noManga}>No manga folders found in the parent directory.</p>
      ) : (
        <ul className={styles.mangaList}>
          {mangaList.map((manga, index) => (
            <li key={index} className={styles.mangaItem}>
              <Link href={`/reader?chapter=${encodeURIComponent(manga)}`}>
                {manga}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}