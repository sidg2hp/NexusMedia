'use client';
import { useState } from 'react';
import { CameraIcon, CloudArrowUpIcon, FaceSmileIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

export default function FacialRecognitionPage() {
  const [selfieUrl, setSelfieUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<any[]>([]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    // Simulate uploading selfie and getting matches
    setTimeout(() => {
      setSelfieUrl(URL.createObjectURL(file));
      setPhotos([
        // Mock matches
      ]);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in max-w-5xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-white mb-4 flex items-center justify-center gap-3">
          <FaceSmileIcon className="w-10 h-10 text-secondary" />
          Find Me
        </h1>
        <p className="text-gray-400 text-lg">Upload a selfie to instantly find all your photos from the events.</p>
      </div>

      <div className="glass-card p-12 text-center max-w-2xl mx-auto border-dashed border-2 border-primary/50 relative overflow-hidden group">
        {!selfieUrl ? (
          <>
            <input 
              type="file" 
              accept="image/*" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
              onChange={handleUpload}
            />
            <div className="flex flex-col items-center gap-4 group-hover:scale-105 transition-transform">
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                {loading ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                ) : (
                  <CameraIcon className="w-10 h-10" />
                )}
              </div>
              <p className="text-white text-xl font-medium">Click or Drag & Drop your selfie here</p>
              <p className="text-gray-500 text-sm">We use this only to find your photos. It's securely stored.</p>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center">
            <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-primary mb-6 shadow-[0_0_30px_rgba(99,102,241,0.5)]">
              <img src={selfieUrl} alt="Your selfie" className="object-cover w-full h-full" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Selfie Uploaded!</h2>
            <p className="text-gray-400 mb-6">Scanning database for matches...</p>
            {/* Reset button */}
            <button onClick={() => { setSelfieUrl(null); setPhotos([]); }} className="text-primary hover:text-primary/80 underline text-sm">
              Upload a different selfie
            </button>
          </div>
        )}
      </div>

      {selfieUrl && (
        <div className="mt-16 animate-slide-up">
          <h2 className="text-2xl font-bold text-white mb-8 border-b border-white/10 pb-4">
            Photos You're In <span className="text-primary ml-2">({photos.length})</span>
          </h2>
          
          {photos.length === 0 && !loading ? (
            <div className="glass p-12 text-center rounded-2xl">
              <p className="text-gray-400 text-lg">No matches found yet. We'll notify you if we find new photos of you!</p>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
              {/* Render matched photos here */}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
