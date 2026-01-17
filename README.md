# TopTen

A web application that allows users to create and manage their own top ten lists. Users can browse, share, and vote for their favorite lists organized by categories.

## Features

- **User Authentication**: Create accounts with username/email, secure password requirements, password reset functionality, and Google OAuth sign-in
- **Create Lists**: Users can create top ten lists in various categories with titles and descriptions for each item
- **Browse & Discover**: Browse all public lists, filter by category, and see vote counts
- **Voting System**: Logged-in users can vote once per category for their favorite list
- **Share Lists**: Easy sharing functionality with copy-to-clipboard and native share support
- **Dashboard**: Personal dashboard to manage your lists (create, edit, delete)
- **Categories**: Pre-defined categories including Movies, Music, Books, TV Shows, Video Games, Food & Drinks, Sports, Travel, Technology, Fashion, Animals, History, Science, Art, and Other

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: MariaDB
- **ORM**: Prisma
- **Authentication**: Custom session-based auth with bcryptjs and Google OAuth

## Prerequisites

- Node.js 18+
- MariaDB 10.5+ running locally
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/rodneyringler/topten.git
   cd topten
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the root directory:
   ```env
   # Database connection for MariaDB
   DATABASE_URL="mysql://topten:topten123@localhost:3306/topten"

   # Session secret for authentication (change this in production)
   SESSION_SECRET="your-super-secret-session-key-change-in-production-32-chars"

   # App URL
   NEXT_PUBLIC_APP_URL="http://localhost:3000"

   # Google OAuth (optional - for Google sign-in)
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/google/callback"
   ```

   **Note:** For Google OAuth, you'll need to:
   1. Create a project in [Google Cloud Console](https://console.cloud.google.com/)
   2. Enable the Google+ API
   3. Create OAuth 2.0 credentials
   4. Add authorized redirect URIs (e.g., `http://localhost:3000/api/auth/google/callback` for dev, your production URL for prod)

4. **Set up the database**

   Create the database and user in MariaDB:
   ```sql
   CREATE DATABASE topten;
   CREATE USER 'topten'@'localhost' IDENTIFIED BY 'topten123';
   GRANT ALL PRIVILEGES ON topten.* TO 'topten'@'localhost';
   FLUSH PRIVILEGES;
   ```

5. **Run database migrations**
   ```bash
   npx prisma migrate deploy
   ```

6. **Seed the database with categories**
   ```bash
   npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
   ```

7. **Start the development server**
   ```bash
   npm run dev
   ```

8. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
topten/
├── prisma/
│   ├── schema.prisma      # Database schema
│   ├── seed.ts            # Seed data for categories
│   └── migrations/        # Database migrations
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   │   ├── auth/      # Authentication endpoints
│   │   │   ├── categories/# Categories endpoint
│   │   │   ├── lists/     # Lists CRUD endpoints
│   │   │   └── votes/     # Voting endpoints
│   │   ├── auth/          # Auth pages (login, signup, reset-password)
│   │   ├── browse/        # Browse lists page
│   │   ├── dashboard/     # User dashboard & list management
│   │   ├── list/          # Individual list view page
│   │   ├── layout.tsx     # Root layout
│   │   └── page.tsx       # Landing page
│   ├── components/
│   │   ├── forms/         # Form components
│   │   ├── ui/            # UI components (Button, Input, etc.)
│   │   ├── CategoryFilter.tsx
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   ├── ListCard.tsx
│   │   ├── Logo.tsx
│   │   └── ShareButton.tsx
│   ├── lib/
│   │   ├── auth.ts        # Auth utilities
│   │   ├── prisma.ts      # Prisma client
│   │   └── session.ts     # Session management
│   └── types/
│       └── index.ts       # TypeScript types
├── public/                # Static assets
├── tailwind.config.js     # Tailwind configuration
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Log in with email/password
- `GET /api/auth/google/initiate` - Initiate Google OAuth flow
- `GET /api/auth/google/callback` - Google OAuth callback handler
- `POST /api/auth/logout` - Log out
- `GET /api/auth/me` - Get current user
- `POST /api/auth/reset-password` - Request password reset
- `POST /api/auth/reset-password-confirm` - Confirm password reset

### Lists
- `GET /api/lists` - Get all lists (with optional filters)
- `POST /api/lists` - Create new list
- `GET /api/lists/[id]` - Get single list (by ID or slug)
- `PUT /api/lists/[id]` - Update list
- `DELETE /api/lists/[id]` - Delete list

### Categories
- `GET /api/categories` - Get all categories

### Votes
- `GET /api/votes` - Get user's votes
- `POST /api/votes` - Vote for a list
- `DELETE /api/votes?listId=xxx` - Remove vote

## Password Requirements

Passwords must meet the following requirements:
- Minimum 8 characters
- At least 1 capital letter
- At least 1 number
- At least 1 special character (!@#$%^&*()_+-=[]{}|;':",./<>?)

## Assumptions & Design Decisions

1. **Session-based Authentication**: Using iron-session for secure, encrypted sessions stored in HTTP-only cookies instead of JWT tokens for better security.

2. **One Vote Per Category**: Users can only vote for one list per category. Voting for a different list in the same category automatically removes the previous vote.

3. **Soft Public/Private**: Lists can be marked as private, which hides them from browse but the owner can still share the direct link.

4. **Categories Admin**: Categories are managed in the database. New categories can be added directly to the database by an admin.

5. **List Slugs**: Each list gets a unique slug generated from its title for SEO-friendly URLs.

6. **Responsive Design**: The application is fully responsive and works on mobile, tablet, and desktop devices.

## Development

### Running in development mode
```bash
npm run dev
```

### Building for production
```bash
npm run build
npm start
```

### Running Prisma Studio (Database GUI)
```bash
npx prisma studio
```

### Generating Prisma Client
```bash
npx prisma generate
```

## License

MIT
