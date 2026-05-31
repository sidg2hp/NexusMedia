import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Gallery from './Gallery';
import MediaUploader from '@/components/MediaUploader';
import { CalendarIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { cookies } from 'next/headers';

import { jwtVerify } from 'jose';
import EventActions from './EventActions';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const event = await prisma.event.findUnique({
    where: { id },
  });

  if (!event) return notFound();

  // Initial fetch for Gallery
  const media = await prisma.media.findMany({
    where: { eventId: event.id, isPublic: true },
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: {
      uploadedBy: { select: { name: true } },
      _count: { select: { likes: true, comments: true } }
    }
  });

  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const isLoggedIn = !!token;
  let isOrganizer = false;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, secret);
      if (payload.userId === event.organizerId) {
        isOrganizer = true;
      }
    } catch (e) {}
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="glass-card p-8 mb-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-secondary"></div>
        
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-4xl font-extrabold text-white">{event.name}</h1>
          {isOrganizer && <EventActions event={event} />}
        </div>
        <p className="text-lg text-gray-300 mb-6">{event.description}</p>
        <div className="flex gap-6 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary" />
            {new Date(event.date).toLocaleDateString()}
          </div>
          {event.category && (
            <div className="flex items-center gap-2">
              <MapPinIcon className="w-5 h-5 text-secondary" />
              {event.category}
            </div>
          )}
        </div>
      </div>

      {isLoggedIn && (
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6">Upload Media</h2>
          <MediaUploader eventId={event.id} />
        </div>
      )}

      <h2 className="text-2xl font-bold text-white mb-6">Event Gallery</h2>
      <Gallery initialMedia={media} eventId={event.id} />
    </div>
  );
}
