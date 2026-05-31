import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

async function authenticateAndGetUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret);
    return payload.userId as string;
  } catch (e) {
    return null;
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await authenticateAndGetUserId();
    if (!userId) return new NextResponse('Unauthorized', { status: 401 });

    const { id } = await params;
    const body = await req.json();

    // Check if event exists and if user is the organizer (or an ADMIN)
    const event = await prisma.event.findUnique({ where: { id }, include: { organizer: true } });
    if (!event) return new NextResponse('Not found', { status: 404 });
    
    // Simplification: only the organizer can edit it for now.
    // In a fully role-based system, we'd check if `user.role === 'ADMIN'`
    if (event.organizerId !== userId) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        category: body.category,
        date: body.date ? new Date(body.date) : undefined,
        isPublic: body.isPublic,
      },
    });

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await authenticateAndGetUserId();
    if (!userId) return new NextResponse('Unauthorized', { status: 401 });

    const { id } = await params;

    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) return new NextResponse('Not found', { status: 404 });
    
    if (event.organizerId !== userId) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    await prisma.event.delete({ where: { id } });

    return new NextResponse('Deleted', { status: 200 });
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
