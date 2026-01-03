import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  { name: 'Movies', slug: 'movies', description: 'Top ten lists about movies, films, and cinema', icon: '🎬' },
  { name: 'Music', slug: 'music', description: 'Top ten lists about songs, albums, artists, and bands', icon: '🎵' },
  { name: 'Books', slug: 'books', description: 'Top ten lists about books, novels, and literature', icon: '📚' },
  { name: 'TV Shows', slug: 'tv-shows', description: 'Top ten lists about television series and shows', icon: '📺' },
  { name: 'Video Games', slug: 'video-games', description: 'Top ten lists about video games and gaming', icon: '🎮' },
  { name: 'Food & Drinks', slug: 'food-drinks', description: 'Top ten lists about food, restaurants, and beverages', icon: '🍕' },
  { name: 'Sports', slug: 'sports', description: 'Top ten lists about sports, athletes, and teams', icon: '⚽' },
  { name: 'Travel', slug: 'travel', description: 'Top ten lists about travel destinations and places', icon: '✈️' },
  { name: 'Technology', slug: 'technology', description: 'Top ten lists about tech, gadgets, and innovation', icon: '💻' },
  { name: 'Fashion', slug: 'fashion', description: 'Top ten lists about fashion, style, and trends', icon: '👗' },
  { name: 'Animals', slug: 'animals', description: 'Top ten lists about animals and wildlife', icon: '🐾' },
  { name: 'History', slug: 'history', description: 'Top ten lists about historical events and figures', icon: '🏛️' },
  { name: 'Science', slug: 'science', description: 'Top ten lists about science and discoveries', icon: '🔬' },
  { name: 'Art', slug: 'art', description: 'Top ten lists about art, artists, and creativity', icon: '🎨' },
  { name: 'Other', slug: 'other', description: 'Top ten lists that don\'t fit other categories', icon: '📋' },
];

async function main() {
  console.log('Starting seed...');

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }

  console.log('Seed completed. Categories created:', categories.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
