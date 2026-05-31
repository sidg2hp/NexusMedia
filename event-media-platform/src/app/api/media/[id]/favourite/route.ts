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

    const existingFav = await prisma.favourite.findUnique({
      where: {
        userId_mediaId: { userId, mediaId: id }
      }
    });

    if (existingFav) {
      await prisma.favourite.delete({ where: { id: existingFav.id } });
      return NextResponse.json({ favourited: false });
    } else {
      await prisma.favourite.create({
        data: { userId, mediaId: id }
      });
      return NextResponse.json({ favourited: true });
    }
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
