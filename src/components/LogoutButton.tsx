'use client';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    // We can just clear the cookie by making a small request or clearing it directly
    await fetch('/api/auth/logout', { method: 'POST' });
    router.refresh();
    router.push('/');
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
