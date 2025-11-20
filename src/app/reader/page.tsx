'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import styles from './reader.module.scss';
import customLoader from '../../lib/loader';

interface MangaImage {
  url: string;
  width: number;
  height: number;
}

export default function ReaderPage() {
  const searchParams = useSearchParams();
  const chapter = searchParams.get('chapter');

  const [mangaImages, setMangaImages] = useState<MangaImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchChapterImages() {
      if (!chapter) {
        setError('Chapter name missing from URL.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/manga?chapter=${encodeURIComponent(chapter)}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: MangaImage[] = await response.json();
        setMangaImages(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchChapterImages();
  }, [chapter]);

  if (loading) {
    return <div className={styles.container}>Loading chapter...</div>;
  }

  if (error) {
    return <div className={styles.container}>Error: {error}</div>;
  }

  if (mangaImages.length === 0) {
    return <div className={styles.container}>No images found for this chapter.</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{decodeURIComponent(chapter || '')}</h1>
      <div className={styles.imageContainer}>
        {mangaImages.map((image, index) => (
          <Image
            key={index}
            src={image.url}
            alt={`Page ${index + 1}`}
            width={image.width}
            height={image.height}
            priority={index < 5} // Prioritize loading for the first few images
            loader={customLoader}
          />
        ))}
      </div>
    </div>
  );
}
