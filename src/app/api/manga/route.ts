import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import sizeOf from 'image-size';

const mangaDirectory = path.join(process.cwd(), '..');
const projectFolderName = path.basename(process.cwd());

// Helper function to check if a path is a directory
async function isDirectory(filePath: string) {
  try {
    const stat = await fs.stat(filePath);
    return stat.isDirectory();
  } catch (error) {
    return false;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chapter = searchParams.get('chapter');

  try {
    if (chapter) {
      // Logic to get images for a specific chapter with pagination
      const chapterPath = path.join(mangaDirectory, chapter);

      if (!(await isDirectory(chapterPath))) {
        return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
      }

      // Get pagination parameters
      const page = parseInt(searchParams.get('page') || '1');
      const pageSize = parseInt(searchParams.get('pageSize') || '50');

      const files = await fs.readdir(chapterPath);
      const imageFiles = files
        .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

      // Calculate pagination
      const totalImages = imageFiles.length;
      const totalPages = Math.ceil(totalImages / pageSize);
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedFiles = imageFiles.slice(startIndex, endIndex);

      // Process only the paginated images
      const images = await Promise.all(paginatedFiles.map(async (file) => {
        try {
          const filePath = path.join(chapterPath, file);
          const dimensions = sizeOf(filePath);

          // Handle case where sizeOf returns undefined
          if (!dimensions || !dimensions.width || !dimensions.height) {
            console.warn(`Could not get dimensions for ${file}, using defaults`);
            return {
              url: `/api/manga/image/${encodeURIComponent(chapter)}/${encodeURIComponent(file)}`,
              width: 800,
              height: 1200,
            };
          }

          return {
            url: `/api/manga/image/${encodeURIComponent(chapter)}/${encodeURIComponent(file)}`,
            width: dimensions.width,
            height: dimensions.height,
          };
        } catch (error) {
          console.error(`Error processing image ${file}:`, error);
          // Return default dimensions if image processing fails
          return {
            url: `/api/manga/image/${encodeURIComponent(chapter)}/${encodeURIComponent(file)}`,
            width: 800,
            height: 1200,
          };
        }
      }));

      return NextResponse.json({
        images,
        pagination: {
          currentPage: page,
          pageSize: pageSize,
          totalImages: totalImages,
          totalPages: totalPages,
          hasNext: endIndex < totalImages,
          hasPrevious: page > 1,
        }
      });
    } else {
      // Logic to get the list of all manga folders
      const entries = await fs.readdir(mangaDirectory);
      const directories = [];
      for (const entry of entries) {
        if (entry === projectFolderName) continue;

        const fullPath = path.join(mangaDirectory, entry);
        if (await isDirectory(fullPath)) {
          directories.push(entry);
        }
      }
      return NextResponse.json(directories);
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to read manga directory' }, { status: 500 });
  }
}
