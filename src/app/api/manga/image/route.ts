import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import mime from 'mime-types';

const mangaDirectory = path.join(process.cwd(), '..');

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chapter = searchParams.get('chapter');
  const image = searchParams.get('image');

  if (!chapter || !image) {
    return NextResponse.json({ error: 'Missing chapter or image parameter' }, { status: 400 });
  }

  try {
    const imagePath = path.join(mangaDirectory, chapter, image);

    // Basic security check to prevent path traversal
    const resolvedPath = path.resolve(imagePath);
    const resolvedMangaDir = path.resolve(mangaDirectory);
    if (!resolvedPath.startsWith(resolvedMangaDir)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const fileBuffer = await fs.readFile(imagePath);
    const contentType = mime.lookup(imagePath) || 'application/octet-stream';

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Image not found' }, { status: 404 });
  }
}