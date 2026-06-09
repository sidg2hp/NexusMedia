'use client';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  };

  return (
    <button 
      onClick={handleLogout}
      className="text-sm font-medium px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors duration-200"
    >
      Logout
    </button>
  );
}
