'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function EventFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'date');
  const [order, setOrder] = useState(searchParams.get('order') || 'desc');

  const applyFilters = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    params.set('sortBy', sortBy);
    params.set('order', order);
    
    router.push(`/events?${params.toString()}`);
  };

  return (
    <form onSubmit={applyFilters} className="glass p-4 rounded-xl mb-8 flex flex-col md:flex-row gap-4 animate-fade-in">
      <div className="flex-1 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search events by name..."
          className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
        />
      </div>
      
      <div className="flex gap-4">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-surface border border-white/10 rounded-lg text-white px-4 py-2 focus:ring-2 focus:ring-primary outline-none"
        >
          <option value="">All Categories</option>
          <option value="Social">Social</option>
          <option value="Academic">Academic</option>
          <option value="Sports">Sports</option>
          <option value="Cultural">Cultural</option>
          <option value="Other">Other</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-surface border border-white/10 rounded-lg text-white px-4 py-2 focus:ring-2 focus:ring-primary outline-none"
        >
          <option value="date">Sort by Date</option>
          <option value="name">Sort by Name</option>
          <option value="createdAt">Sort by Newest</option>
        </select>
        
        <select
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          className="bg-surface border border-white/10 rounded-lg text-white px-4 py-2 focus:ring-2 focus:ring-primary outline-none"
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>

        <button 
          type="submit" 
          className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
        >
          Apply
        </button>
      </div>
    </form>
  );
}
