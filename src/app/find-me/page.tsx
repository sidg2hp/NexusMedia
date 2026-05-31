'use client';
import { useState, useEffect } from 'react';
import Gallery from '@/app/events/[id]/Gallery';

export default function FindMePage() {
  const [selfie, setSelfie] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [loadingFaces, setLoadingFaces] = useState(true);

  useEffect(() => {
    fetch('/api/media/search-faces')
      .then(res => {
        if (res.ok) return res.json();
        return [];
      })
      .then(data => {
        setMediaList(data);
        setLoadingFaces(false);
      })
      .catch(() => setLoadingFaces(false));
  }, []);

  const handleSelfieUpload = async () => {
    if (!selfie) return;
    setUploading(true);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(selfie);
      reader.onloadend = async () => {
        const base64Image = reader.result;
        const res = await fetch('/api/auth/selfie', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ base64Image })
        });

        if (res.ok) {
          alert('Selfie uploaded and indexed! We will now find your photos.');
          window.location.reload();
        } else {
          const err = await res.text();
          alert(`Error: ${err}`);
        }
        setUploading(false);
      };
    } catch (e) {
      console.error(e);
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <h1 className="text-4xl font-extrabold text-white mb-2">Find Me</h1>
      <p className="text-gray-400 mb-12">Upload a selfie to instantly find all photos of you across all events using AI Facial Recognition.</p>

      <div className="glass-card p-8 max-w-xl mx-auto mb-16 text-center">
        <h2 className="text-xl font-bold text-white mb-4">Reference Selfie</h2>
        <input 
          type="file" 
          accept="image/*" 
          onChange={(e) => setSelfie(e.target.files?.[0] || null)}
          className="mb-4 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
        />
        <br />
        <button 
          onClick={handleSelfieUpload}
          disabled={!selfie || uploading}
          className="px-6 py-2 bg-secondary text-[#1A1C29] font-bold rounded-full disabled:opacity-50"
        >
          {uploading ? 'Processing...' : 'Upload & Scan'}
        </button>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-4">Your Photos</h2>
        {loadingFaces ? (
          <p className="text-gray-400">Scanning events for your face...</p>
        ) : mediaList.length > 0 ? (
          <Gallery initialMedia={mediaList} eventId="find-me" />
        ) : (
          <p className="text-gray-400">No photos found. Upload a selfie above, or attend more events!</p>
        )}
      </div>
    </div>
  );
}
