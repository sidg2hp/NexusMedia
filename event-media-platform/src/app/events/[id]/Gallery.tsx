'use client';
import { useState } from 'react';
import { HeartIcon as HeartOutline, ChatBubbleLeftIcon, ArrowDownTrayIcon, BookmarkIcon as BookmarkOutline, ShareIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid, BookmarkIcon as BookmarkSolid } from '@heroicons/react/24/solid';

import CommentModal from './CommentModal';

export default function Gallery({ initialMedia, eventId }: { initialMedia: any[], eventId: string }) {
  const [mediaList, setMediaList] = useState(initialMedia);
  const [loading, setLoading] = useState(false);
  const [activeCommentMedia, setActiveCommentMedia] = useState<any>(null);

  const loadMore = async () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  const toggleLike = async (mediaId: string, index: number) => {
    try {
      const res = await fetch(`/api/media/${mediaId}/like`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        const newList = [...mediaList];
        const media = newList[index];
        // Optimistic UI update
        media._count.likes += data.liked ? 1 : -1;
        setMediaList(newList);
      } else if (res.status === 401) {
        alert("Please log in to like.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const shareMedia = async (url: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this photo!',
          url: url
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div>
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
        {mediaList.map((media, index) => (
          <div key={media.id} className="relative group break-inside-avoid rounded-xl overflow-hidden glass shadow-lg">
            {media.type?.startsWith('video') ? (
              <video src={media.url} controls className="w-full h-auto object-cover" />
            ) : (
              <img src={media.url} alt="Media" className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105" />
            )}
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
              <div className="flex justify-between items-end">
                <div className="text-white text-sm font-medium truncate pr-2">
                  by {media.uploadedBy?.name || 'Unknown'}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => toggleLike(media.id, index)} className="text-white hover:text-secondary transition-colors group/btn flex flex-col items-center">
                    <HeartOutline className="w-6 h-6 group-hover/btn:hidden" />
                    <HeartSolid className="w-6 h-6 hidden group-hover/btn:block text-secondary" />
                    <span className="text-xs">{media._count?.likes || 0}</span>
                  </button>
                  <button className="text-white hover:text-primary transition-colors flex flex-col items-center" onClick={() => setActiveCommentMedia(media)}>
                    <ChatBubbleLeftIcon className="w-6 h-6" />
                    <span className="text-xs">{media._count?.comments || 0}</span>
                  </button>
                  <button onClick={() => shareMedia(media.url)} className="text-white hover:text-accent transition-colors flex flex-col items-center">
                    <ShareIcon className="w-6 h-6" />
                  </button>
                  <a href={`/api/media/watermark?mediaId=${media.id}`} download className="text-white hover:text-accent transition-colors flex flex-col items-center">
                    <ArrowDownTrayIcon className="w-6 h-6" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {mediaList.length >= 20 && (
        <div className="mt-12 text-center">
          <button onClick={loadMore} disabled={loading} className="px-8 py-3 glass hover:bg-white/10 rounded-full text-white font-medium transition-colors">
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}

      {activeCommentMedia && (
        <CommentModal 
          media={activeCommentMedia} 
          onClose={() => setActiveCommentMedia(null)} 
        />
      )}
    </div>
  );
}
