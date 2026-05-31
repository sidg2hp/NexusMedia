'use client';
import { useState, useEffect } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    fetch('/api/notifications')
      .then(r => r.ok ? r.json() : [])
      .then(setNotifications)
      .catch(console.error);
  }, []);

  const handleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      // mark as read
      fetch('/api/notifications', { method: 'PUT' }).catch(console.error);
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={handleOpen}
        className="p-2 rounded-full hover:bg-white/10 transition-colors relative text-gray-300 hover:text-white"
      >
        <BellIcon className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-secondary rounded-full border-2 border-[#1A1C29]"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 glass-card p-4 z-50 animate-fade-in origin-top-right">
          <h3 className="text-white font-bold mb-3 border-b border-white/10 pb-2">Notifications</h3>
          <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-gray-400 text-sm py-4 text-center">No new notifications</p>
            ) : (
              notifications.map((n, i) => (
                <div key={i} className={`p-3 rounded-lg text-sm ${n.isRead ? 'opacity-70' : 'bg-white/5 border-l-2 border-primary'}`}>
                  <p className="text-white">{n.message}</p>
                  <p className="text-gray-500 text-xs mt-1">Just now</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
