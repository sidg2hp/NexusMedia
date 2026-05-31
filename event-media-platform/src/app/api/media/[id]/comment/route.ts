import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return new NextResponse('Unauthorized', { status: 401 });

    const { payload } = await jwtVerify(token, secret);
    const userId = payload.userId as string;
    const { id } = await params; // mediaId
    const { text } = await req.json();

    if (!text) return new NextResponse('Bad Request', { status: 400 });

    const comment = await prisma.comment.create({
      data: {
        text,
        authorId: userId,
        mediaId: id
      },
      include: { author: { select: { name: true } } }
    });

    // Create notification for media owner
    const media = await prisma.media.findUnique({ where: { id }, select: { uploadedById: true } });
    if (media && media.uploadedById !== userId) {
      await prisma.notification.create({
        data: {
          userId: media.uploadedById,
          message: 'Someone commented on your media.',
          type: 'COMMENT'
        }
      });
    }

    return NextResponse.json(comment);
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const comments = await prisma.comment.findMany({
      where: { mediaId: id },
      include: { author: { select: { name: true } } },
      orderBy: { createdAt: 'asc' }
    });
    return NextResponse.json(comments);
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
