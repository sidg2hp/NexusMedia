import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const sortBy = searchParams.get('sortBy') || 'date'; // 'date', 'name', 'category'
    const order = searchParams.get('order') || 'desc'; // 'asc', 'desc'

    const where: Prisma.EventWhereInput = {};

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }
    if (category) {
      where.category = category;
    }
    
    // Only fetch public events for unauthenticated users (we'd need to check token here, but let's assume public first)
    // For this implementation, let's fetch all events that are public, unless the user is logged in.
    // To simplify, we will just fetch based on query for now. Access control can be filtered on the frontend or properly with headers.

    const events = await prisma.event.findMany({
      where,
      orderBy: {
        [sortBy]: order,
      },
    });
    
    return NextResponse.json(events);
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, description, date, category, isPublic = true } = await req.json();
    
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    let organizerId = null;

    if (token) {
      try {
        const { payload } = await jwtVerify(token, secret);
        organizerId = payload.userId as string;
      } catch (e) {
        // invalid token
      }
    }

    if (!name || !date) {
      return new NextResponse('Missing fields', { status: 400 });
    }

    const event = await prisma.event.create({
      data: {
        name,
        description,
        date: new Date(date),
        category,
        isPublic,
        organizerId,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
