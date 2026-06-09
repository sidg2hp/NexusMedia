import Link from 'next/link';
import NotificationBell from './NotificationBell';
import { cookies } from 'next/headers';
import LogoutButton from './LogoutButton';

const Header = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');
  const isLoggedIn = !!token;

  return (
    <header className="sticky top-0 z-50 glass border-b border-white/10">
      <div className="container mx-auto flex justify-between items-center p-4">
        <Link href="/" className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/50">
            <span className="text-white text-lg">N</span>
          </div>
          NexusMedia
        </Link>
        <nav>
          <ul className="flex space-x-8 items-center">
            <li>
              <Link href="/events" className="text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200">
                Explore
              </Link>
            </li>
            <li>
              <Link href="/search" className="text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200">
                Search
              </Link>
            </li>
            <li>
              <Link href="/events/create" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors duration-200">
                + Create Event
              </Link>
            </li>
            <li>
              <Link href="/find-me" className="text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200">
                Find Me
              </Link>
            </li>
            <li>
              <NotificationBell />
            </li>
            <li className="pl-4 border-l border-white/10 flex items-center gap-4">
              {isLoggedIn ? (
                <LogoutButton />
              ) : (
                <>
                  <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200">
                    Sign In
                  </Link>
                  <Link href="/register" className="text-sm font-medium px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors duration-200">
                    Sign Up
                  </Link>
                </>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
