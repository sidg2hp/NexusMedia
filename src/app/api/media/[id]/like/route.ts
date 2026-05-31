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

    // Check if like exists
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_mediaId: { userId, mediaId: id }
      }
    });

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: { id: existingLike.id }
      });
      return NextResponse.json({ liked: false });
    } else {
      // Like
      await prisma.like.create({
        data: { userId, mediaId: id }
      });

      // Create notification for media owner
      const media = await prisma.media.findUnique({ where: { id }, select: { uploadedById: true } });
      if (media && media.uploadedById !== userId) {
        await prisma.notification.create({
          data: {
            userId: media.uploadedById,
            message: 'Someone liked your media.',
            type: 'LIKE'
          }
        });
      }

      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
