import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { headers } from 'next/headers';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const headersList = headers();
    const userId = headersList.get('x-user-id');
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const eventId = formData.get('eventId') as string;
    const isPublic = formData.get('isPublic') === 'true';

    if (!file || !eventId) {
      return new NextResponse('Missing fields', { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const ext = file.name.split('.').pop();
    const uniqueFilename = `${crypto.randomUUID()}.${ext}`;
    
    // Ensure upload directory exists
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (e) {
      // Ignore if exists
    }

    const filepath = join(uploadDir, uniqueFilename);
    await writeFile(filepath, buffer);

    const url = `/uploads/${uniqueFilename}`;

    // Create media record in DB
    const media = await prisma.media.create({
      data: {
        url,
        type: file.type,
        isPublic,
        uploadedById: userId,
        eventId,
        key: uniqueFilename, // Local key
      },
    });

    return NextResponse.json(media, { status: 201 });
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
