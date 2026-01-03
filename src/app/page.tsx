import Link from 'next/link';
import Logo from '@/components/Logo';

export default function Home() {
  const features = [
    {
      icon: '📝',
      title: 'Create Your Lists',
      description: 'Make top ten lists on any topic you love. Movies, music, books, games, and more!',
    },
    {
      icon: '🌍',
      title: 'Share with Everyone',
      description: 'Share your lists with friends, family, or the whole world. Easy sharing links!',
    },
    {
      icon: '🗳️',
      title: 'Vote for Favorites',
      description: 'Vote once per category to support your favorite lists. Watch them rise to the top!',
    },
    {
      icon: '🔍',
      title: 'Discover New Lists',
      description: 'Browse lists from other users and find new favorites in every category.',
    },
  ];

  const categories = [
    { name: 'Movies', icon: '🎬', slug: 'movies' },
    { name: 'Music', icon: '🎵', slug: 'music' },
    { name: 'Books', icon: '📚', slug: 'books' },
    { name: 'Video Games', icon: '🎮', slug: 'video-games' },
    { name: 'TV Shows', icon: '📺', slug: 'tv-shows' },
    { name: 'Food & Drinks', icon: '🍕', slug: 'food-drinks' },
  ];

  return (
    <div className="bg-gradient-to-b from-white to-primary-50">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <div className="flex justify-center mb-8">
            <Logo size="xl" showText={false} />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Create Your{' '}
            <span className="bg-gradient-to-r from-primary-600 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
              Top Ten
            </span>{' '}
            Lists
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            Share your opinions, discover new favorites, and vote for the best lists.
            Join thousands of list-makers today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="px-8 py-4 bg-primary-600 text-white rounded-xl font-semibold text-lg hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl"
            >
              Get Started Free
            </Link>
            <Link
              href="/browse"
              className="px-8 py-4 bg-white text-gray-700 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-colors border-2 border-gray-200"
            >
              Browse Lists
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why TopTen?
          </h2>
          <p className="text-lg text-gray-600">
            Everything you need to create, share, and discover amazing lists
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Explore Categories
            </h2>
            <p className="text-lg text-gray-600">
              Find lists in your favorite topics
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/browse?category=${category.slug}`}
                className="flex flex-col items-center p-6 bg-gradient-to-br from-primary-50 to-purple-50 rounded-2xl hover:from-primary-100 hover:to-purple-100 transition-colors"
              >
                <span className="text-4xl mb-2">{category.icon}</span>
                <span className="font-medium text-gray-900">{category.name}</span>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/browse"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              View all categories →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary-600 via-purple-600 to-indigo-600 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Create Your First List?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join our community of list-makers and start sharing your top tens today!
          </p>
          <Link
            href="/auth/signup"
            className="inline-block px-8 py-4 bg-white text-primary-600 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg"
          >
            Create Your Account
          </Link>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-2xl font-bold">
              1
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Sign Up</h3>
            <p className="text-gray-600">
              Create your free account in seconds. No credit card required.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-2xl font-bold">
              2
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Create Lists</h3>
            <p className="text-gray-600">
              Pick a category and add your top ten items with descriptions.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-2xl font-bold">
              3
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Share & Vote</h3>
            <p className="text-gray-600">
              Share your lists and vote for others. See which lists are most popular!
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
