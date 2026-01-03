import Link from 'next/link';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Logo size="md" />
            <p className="mt-4 text-sm text-gray-400 max-w-md">
              Create and share your top ten lists on any topic. Vote for your favorites and discover
              what others think are the best in every category.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/browse" className="text-sm hover:text-primary-400 transition-colors">
                  Browse Lists
                </Link>
              </li>
              <li>
                <Link href="/auth/signup" className="text-sm hover:text-primary-400 transition-colors">
                  Create Account
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="text-sm hover:text-primary-400 transition-colors">
                  Log In
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/browse?category=movies" className="text-sm hover:text-primary-400 transition-colors">
                  Movies
                </Link>
              </li>
              <li>
                <Link href="/browse?category=music" className="text-sm hover:text-primary-400 transition-colors">
                  Music
                </Link>
              </li>
              <li>
                <Link href="/browse?category=books" className="text-sm hover:text-primary-400 transition-colors">
                  Books
                </Link>
              </li>
              <li>
                <Link href="/browse?category=video-games" className="text-sm hover:text-primary-400 transition-colors">
                  Video Games
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} TopTen. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
