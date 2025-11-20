'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from '@/styles/reader/reader.module.scss';
import customLoader from '@/lib/loader';

interface MangaImage {
    url: string;
    width: number;
    height: number;
}

interface PaginationInfo {
    currentPage: number;
    pageSize: number;
    totalImages: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
}

interface MangaResponse {
    images: MangaImage[];
    pagination: PaginationInfo;
}

export default function ReaderClient() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const chapter = searchParams.get('chapter');
    const pageParam = searchParams.get('page');

    const [mangaImages, setMangaImages] = useState<MangaImage[]>([]);
    const [paginationInfo, setPaginationInfo] = useState<PaginationInfo | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState<number>(parseInt(pageParam || '1'));

    useEffect(() => {
        async function fetchChapterImages() {
            if (!chapter) {
                setError('Chapter name missing from URL.');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const response = await fetch(`/api/manga?chapter=${encodeURIComponent(chapter)}&page=${currentPage}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data: MangaResponse = await response.json();
                setMangaImages(data.images);
                setPaginationInfo(data.pagination);

                // Scroll to top when page changes
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } catch (e: any) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        }
        fetchChapterImages();
    }, [chapter, currentPage]);

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', newPage.toString());
        router.push(`/reader?${params.toString()}`);
    };

    const PaginationControls = () => {
        if (!paginationInfo || paginationInfo.totalPages <= 1) return null;

        return (
            <div className={styles.paginationControls}>
                <button
                    className={styles.paginationButton}
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!paginationInfo.hasPrevious}
                >
                    ← Previous Page
                </button>
                <span className={styles.paginationInfo}>
                    Page {paginationInfo.currentPage} of {paginationInfo.totalPages}
                    <span className={styles.imageCount}>
                        ({paginationInfo.totalImages} images total)
                    </span>
                </span>
                <button
                    className={styles.paginationButton}
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!paginationInfo.hasNext}
                >
                    Next Page →
                </button>
            </div>
        );
    };

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

            <PaginationControls />

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

            <PaginationControls />
        </div>
    );
}
