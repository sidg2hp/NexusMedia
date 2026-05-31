import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { CalendarIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

import EventFilters from './EventFilters';

export default async function EventsPage({ searchParams }: { searchParams: Promise<{ sortBy?: string, order?: string, search?: string, category?: string }> }) {
  const { sortBy = 'date', order = 'desc', search, category } = await searchParams;
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  let userId: string | null = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, secret);
      userId = payload.userId as string;
    } catch (error) {
      console.error('Invalid token', error);
    }
  }

  const whereClause: any = userId 
    ? { OR: [{ isPublic: true }, { organizerId: userId }] }
    : { isPublic: true };

  if (search) {
    // using contains search
    whereClause.name = { contains: search, mode: 'insensitive' };
  }
  if (category) {
    whereClause.category = category;
  }

  const events = await prisma.event.findMany({
    where: whereClause,
    orderBy: { [sortBy]: order },
  });

  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <div className="flex justify-between items-end mb-8 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-4xl font-extrabold text-white mb-2">Explore Events</h1>
          <p className="text-gray-400">Discover all public events and their media.</p>
        </div>
      </div>

      <EventFilters />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {events.map((event) => (
          <Link href={`/events/${event.id}`} key={event.id} className="block group">
            <div className="glass-card p-6 h-full transition-all transform group-hover:-translate-y-2 group-hover:shadow-primary/20">
              <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-primary transition-colors">{event.name}</h2>
              <p className="text-gray-400 mb-6 line-clamp-2">{event.description}</p>
              
              <div className="flex flex-col gap-2 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-primary" />
                  {new Date(event.date).toLocaleDateString()}
                </div>
                {event.category && (
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="w-4 h-4 text-secondary" />
                    {event.category}
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {events.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg">No events found.</p>
        </div>
      )}
    </div>
  );
}
