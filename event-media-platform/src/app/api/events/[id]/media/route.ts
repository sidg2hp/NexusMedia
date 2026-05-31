import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get('cursor');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: Prisma.MediaWhereInput = {
      eventId,
      isPublic: true, // we can make this dynamic based on auth
    };

    const media = await prisma.media.findMany({
      where,
      take: limit + 1, // Fetch one extra to know if there are more
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
      include: {
        uploadedBy: { select: { id: true, name: true, email: true } },
        tags: { include: { tag: true } },
        _count: { select: { likes: true, comments: true } }
      }
    });

    let nextCursor: typeof cursor | undefined = undefined;
    if (media.length > limit) {
      const nextItem = media.pop();
      nextCursor = nextItem!.id;
    }

    return NextResponse.json({
      media,
      nextCursor,
    });
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
