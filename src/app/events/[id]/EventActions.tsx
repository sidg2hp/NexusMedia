'use client';
import { useState } from 'react';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

export default function EventActions({ event }: { event: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: event.name,
    description: event.description || '',
    category: event.category || '',
    isPublic: event.isPublic,
    date: event.date ? new Date(event.date).toISOString().split('T')[0] : '', // format for date input
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${event.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsEditing(false);
        router.refresh();
      } else {
        const text = await res.text();
        alert('Failed to update event: ' + text);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) return;
    
    try {
      const res = await fetch(`/api/events/${event.id}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/events');
        router.refresh();
      } else {
        const text = await res.text();
        alert('Failed to delete event: ' + text);
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while deleting the event.');
    }
  };

  return (
    <>
      <div className="flex items-center gap-3">
        <button 
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm"
        >
          <PencilSquareIcon className="w-4 h-4" /> Edit Event
        </button>
        <button 
          onClick={handleDelete}
          className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/40 text-red-200 rounded-lg transition-colors text-sm"
        >
          <TrashIcon className="w-4 h-4" /> Delete Event
        </button>
      </div>

      {isEditing && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="glass-card w-full max-w-lg p-6 relative">
            <h2 className="text-2xl font-bold text-white mb-6">Edit Event</h2>
            
            <form onSubmit={handleUpdate} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Event Name</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-surface border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-primary outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-surface border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-primary outline-none h-24"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Date</label>
                  <input 
                    type="date" 
                    value={formData.date} 
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    className="w-full bg-surface border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-primary outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                  <select 
                    value={formData.category} 
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-surface border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-primary outline-none"
                  >
                    <option value="">None</option>
                    <option value="Social">Social</option>
                    <option value="Academic">Academic</option>
                    <option value="Sports">Sports</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <input 
                  type="checkbox" 
                  id="isPublic"
                  checked={formData.isPublic} 
                  onChange={e => setFormData({...formData, isPublic: e.target.checked})}
                  className="w-4 h-4 rounded bg-surface border-white/20 text-primary focus:ring-primary"
                />
                <label htmlFor="isPublic" className="text-sm font-medium text-gray-300">
                  Public Event (Visible to everyone)
                </label>
              </div>
              <p className="text-xs text-gray-500 mb-4 ml-6">
                If unchecked, the event and its album will only be visible to invited club participants.
              </p>

              <div className="flex justify-end gap-3 mt-4 border-t border-white/10 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
