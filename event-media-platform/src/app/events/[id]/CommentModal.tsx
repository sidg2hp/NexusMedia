'use client';
import { useState, useEffect } from 'react';
import { XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

export default function CommentModal({ media, onClose }: { media: any, onClose: () => void }) {
  const [comments, setComments] = useState<any[]>([]);
  const [newText, setNewText] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    fetch(`/api/media/${media.id}/comment`)
      .then(res => res.json())
      .then(data => {
        setComments(data);
        setLoading(false);
      });
  }, [media.id]);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;
    setPosting(true);
    
    try {
      const res = await fetch(`/api/media/${media.id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newText })
      });
      if (res.ok) {
        const comment = await res.json();
        setComments([...comments, comment]);
        setNewText('');
      } else if (res.status === 401) {
        alert("Please log in to comment.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 animate-fade-in">
      <div className="glass-card w-full max-w-2xl h-[80vh] flex flex-col relative overflow-hidden">
        
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-surface/50">
          <h2 className="text-xl font-bold text-white">Comments</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Image Preview */}
          <div className="w-full md:w-1/2 bg-black/50 flex items-center justify-center p-4 h-48 md:h-full">
            {media.type?.startsWith('video') ? (
              <video src={media.url} controls className="max-w-full max-h-full object-contain rounded-lg" />
            ) : (
              <img src={media.url} alt="Media" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
            )}
          </div>

          {/* Comments List */}
          <div className="w-full md:w-1/2 flex flex-col bg-surface/30">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loading ? (
                <div className="text-center text-gray-400 mt-10">Loading comments...</div>
              ) : comments.length === 0 ? (
                <div className="text-center text-gray-500 mt-10">No comments yet. Be the first!</div>
              ) : (
                comments.map((c, i) => (
                  <div key={i} className="flex flex-col">
                    <span className="text-primary font-bold text-sm">{c.author?.name || 'User'}</span>
                    <span className="text-white bg-white/5 rounded-lg rounded-tl-none p-3 mt-1 text-sm inline-block w-fit max-w-[90%]">
                      {c.text}
                    </span>
                  </div>
                ))
              )}
            </div>
            
            <div className="p-4 border-t border-white/10 bg-surface/50">
              <form onSubmit={handlePost} className="flex gap-2">
                <input 
                  type="text" 
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 bg-black/30 border border-white/10 rounded-full px-4 py-2 text-white focus:outline-none focus:border-primary text-sm"
                />
                <button 
                  type="submit" 
                  disabled={posting || !newText.trim()}
                  className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
