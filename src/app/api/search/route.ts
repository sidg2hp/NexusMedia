import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q')?.toLowerCase() || '';
    const date = searchParams.get('date');

    const mediaFilters: any = { isPublic: true };

    if (query) {
      mediaFilters.OR = [
        // Match by Uploader Name
        { uploadedBy: { name: { contains: query, mode: 'insensitive' } } },
        // Match by Event Name
        { event: { name: { contains: query, mode: 'insensitive' } } },
        // Match by Tags
        { tags: { some: { tag: { name: { contains: query, mode: 'insensitive' } } } } }
      ];
    }

    if (date) {
      // Date filter (e.g. 2026-05-31)
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      
      mediaFilters.createdAt = {
        gte: startDate,
        lt: endDate
      };
    }

    const results = await prisma.media.findMany({
      where: mediaFilters,
      include: {
        uploadedBy: { select: { name: true } },
        event: { select: { name: true } },
        _count: { select: { likes: true, comments: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
