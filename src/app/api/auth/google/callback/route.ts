import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { generateUsernameFromGoogle, generateUniqueUsername, slugify } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${request.nextUrl.origin}/api/auth/google/callback`;

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(
        `${request.nextUrl.origin}/auth/login?error=oauth_not_configured`
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const state = searchParams.get('state'); // Contains return URL

    // Get return URL from state or cookie
    const returnUrl = state || request.cookies.get('oauth_return_url')?.value || '/dashboard';

    if (error) {
      return NextResponse.redirect(
        `${request.nextUrl.origin}/auth/login?error=oauth_cancelled`
      );
    }

    if (!code) {
      return NextResponse.redirect(
        `${request.nextUrl.origin}/auth/login?error=oauth_failed`
      );
    }

    // Exchange authorization code for tokens
    const oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUri);
    const { tokens } = await oauth2Client.getToken(code);
    
    if (!tokens.id_token) {
      return NextResponse.redirect(
        `${request.nextUrl.origin}/auth/login?error=oauth_failed`
      );
    }

    // Verify the ID token
    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: clientId,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return NextResponse.redirect(
        `${request.nextUrl.origin}/auth/login?error=oauth_failed`
      );
    }

    const googleId = payload.sub;
    const email = payload.email?.toLowerCase();
    const name = payload.name;
    const picture = payload.picture;

    if (!email || !googleId) {
      return NextResponse.redirect(
        `${request.nextUrl.origin}/auth/login?error=oauth_missing_info`
      );
    }

    // Check if user exists by googleId
    let user = await prisma.user.findUnique({
      where: { googleId },
    });

    // If not found, check by email for account linking
    if (!user) {
      user = await prisma.user.findUnique({
        where: { email },
      });

      if (user) {
        // Link Google account to existing email/password account
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId,
            authProvider: 'both', // User can use both methods
          },
        });
      }
    }

    // Create new user if still not found
    if (!user) {
      // Generate username from Google info
      let baseUsername = generateUsernameFromGoogle(name, email);
      let username = baseUsername;

      // Ensure username is unique
      let attempts = 0;
      while (await prisma.user.findUnique({ where: { username } })) {
        username = generateUniqueUsername(baseUsername);
        attempts++;
        if (attempts > 10) {
          // Fallback to completely random username
          username = generateUniqueUsername('user');
        }
      }

      // Validate username meets requirements
      const usernameSlug = slugify(username);
      if (usernameSlug !== username.toLowerCase() || username.length < 3 || username.length > 30) {
        // If generated username doesn't meet requirements, use fallback
        username = generateUniqueUsername('user');
      }

      user = await prisma.user.create({
        data: {
          email,
          username: username.toLowerCase(),
          googleId,
          password: null,
          authProvider: 'google',
        },
      });
    } else if (!user.googleId) {
      // Update existing user to include googleId if missing
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId,
          authProvider: user.password ? 'both' : 'google',
        },
      });
    }

    // Create session
    const session = await getSession();
    session.userId = user.id;
    session.username = user.username;
    session.email = user.email;
    session.isLoggedIn = true;
    await session.save();

    // Clear OAuth return URL cookie
    const response = NextResponse.redirect(`${request.nextUrl.origin}${returnUrl}`);
    response.cookies.delete('oauth_return_url');
    
    return response;
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(
      `${request.nextUrl.origin}/auth/login?error=oauth_error`
    );
  }
}

