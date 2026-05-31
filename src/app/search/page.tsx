'use client';
import { useState, useEffect } from 'react';
import Gallery from '@/app/events/[id]/Gallery';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useSearchParams, useRouter } from 'next/navigation';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const initialQuery = searchParams.get('q') || '';
  const initialDate = searchParams.get('date') || '';

  const [query, setQuery] = useState(initialQuery);
  const [date, setDate] = useState(initialDate);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (initialQuery) params.append('q', initialQuery);
        if (initialDate) params.append('date', initialDate);
        
        const res = await fetch(`/api/search?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [initialQuery, initialDate]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (date) params.append('date', date);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="glass-card p-8 mb-12 relative overflow-hidden text-center">
        <h1 className="text-4xl font-extrabold text-white mb-4">Global Search</h1>
        <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
          Search across all public events by AI Tags, Uploader Name, Event Name, or Date.
        </p>

        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 max-w-3xl mx-auto">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-6 h-6 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by tags (e.g. mountain, crowd), user, or event..."
              className="w-full bg-surface border border-white/10 rounded-full pl-12 pr-4 py-3 text-white focus:ring-primary outline-none"
            />
          </div>
          <div className="w-full md:w-48">
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-surface border border-white/10 rounded-full px-4 py-3 text-white focus:ring-primary outline-none"
            />
          </div>
          <button 
            type="submit"
            className="px-8 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-full transition-colors shadow-lg"
          >
            Search
          </button>
        </form>
      </div>

      <div className="mt-8">
        {loading ? (
          <div className="text-center text-gray-400">Searching...</div>
        ) : results.length > 0 ? (
          <Gallery initialMedia={results} eventId="search" />
        ) : (
          <div className="text-center text-gray-500 mt-12 text-lg">
            No media found matching your search criteria.
          </div>
        )}
      </div>
    </div>
  );
}
