import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { generateUniqueSlug } from '@/lib/auth';

// GET all lists (with optional filters)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get('category');
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;

    const where: {
      isPublic?: boolean;
      userId?: string;
      category?: { slug: string };
    } = {};

    // If not filtering by userId (dashboard), only show public lists
    if (!userId) {
      where.isPublic = true;
    } else {
      where.userId = userId;
    }

    if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    const [lists, total] = await Promise.all([
      prisma.topTenList.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { votes: { _count: 'desc' } },
          { createdAt: 'desc' },
        ],
        include: {
          user: {
            select: { id: true, username: true },
          },
          category: true,
          items: {
            orderBy: { rank: 'asc' },
            take: 3,
          },
          _count: {
            select: { votes: true },
          },
        },
      }),
      prisma.topTenList.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        lists,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get lists error:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred' },
      { status: 500 }
    );
  }
}

// POST create a new list
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json(
        { success: false, error: 'You must be logged in to create a list' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, description, categoryId, isPublic, items } = body;

    // Validate required fields
    if (!title || !categoryId) {
      return NextResponse.json(
        { success: false, error: 'Title and category are required' },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one list item is required' },
        { status: 400 }
      );
    }

    if (items.length > 10) {
      return NextResponse.json(
        { success: false, error: 'Maximum 10 items allowed per list' },
        { status: 400 }
      );
    }

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Invalid category' },
        { status: 400 }
      );
    }

    // Create list with items
    const slug = generateUniqueSlug(title);

    const list = await prisma.topTenList.create({
      data: {
        title,
        description: description || null,
        slug,
        isPublic: isPublic !== false,
        userId: session.userId,
        categoryId,
        items: {
          create: items.map((item: { title: string; description?: string }, index: number) => ({
            rank: index + 1,
            title: item.title,
            description: item.description || null,
          })),
        },
      },
      include: {
        user: {
          select: { id: true, username: true },
        },
        category: true,
        items: {
          orderBy: { rank: 'asc' },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: { list },
      message: 'List created successfully',
    });
  } catch (error) {
    console.error('Create list error:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred' },
      { status: 500 }
    );
  }
}
