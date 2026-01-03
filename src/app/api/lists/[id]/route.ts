import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session';

// GET single list
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const list = await prisma.topTenList.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        user: {
          select: { id: true, username: true },
        },
        category: true,
        items: {
          orderBy: { rank: 'asc' },
        },
        _count: {
          select: { votes: true },
        },
      },
    });

    if (!list) {
      return NextResponse.json(
        { success: false, error: 'List not found' },
        { status: 404 }
      );
    }

    // Check if list is private and user is not the owner
    const session = await getSession();
    if (!list.isPublic && (!session.isLoggedIn || session.userId !== list.userId)) {
      return NextResponse.json(
        { success: false, error: 'List not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { list },
    });
  } catch (error) {
    console.error('Get list error:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred' },
      { status: 500 }
    );
  }
}

// PUT update list
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json(
        { success: false, error: 'You must be logged in' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Check if list exists and belongs to user
    const existingList = await prisma.topTenList.findUnique({
      where: { id },
    });

    if (!existingList) {
      return NextResponse.json(
        { success: false, error: 'List not found' },
        { status: 404 }
      );
    }

    if (existingList.userId !== session.userId) {
      return NextResponse.json(
        { success: false, error: 'You can only edit your own lists' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, description, categoryId, isPublic, items } = body;

    // Validate items
    if (items && items.length > 10) {
      return NextResponse.json(
        { success: false, error: 'Maximum 10 items allowed per list' },
        { status: 400 }
      );
    }

    // Update list and items
    const list = await prisma.$transaction(async (tx) => {
      // Update list
      const updatedList = await tx.topTenList.update({
        where: { id },
        data: {
          title: title || existingList.title,
          description: description !== undefined ? description : existingList.description,
          categoryId: categoryId || existingList.categoryId,
          isPublic: isPublic !== undefined ? isPublic : existingList.isPublic,
        },
      });

      // Update items if provided
      if (items && Array.isArray(items)) {
        // Delete existing items
        await tx.listItem.deleteMany({
          where: { listId: id },
        });

        // Create new items
        await tx.listItem.createMany({
          data: items.map((item: { title: string; description?: string }, index: number) => ({
            listId: id,
            rank: index + 1,
            title: item.title,
            description: item.description || null,
          })),
        });
      }

      return updatedList;
    });

    // Fetch updated list with relations
    const fullList = await prisma.topTenList.findUnique({
      where: { id },
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
      data: { list: fullList },
      message: 'List updated successfully',
    });
  } catch (error) {
    console.error('Update list error:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred' },
      { status: 500 }
    );
  }
}

// DELETE list
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json(
        { success: false, error: 'You must be logged in' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Check if list exists and belongs to user
    const list = await prisma.topTenList.findUnique({
      where: { id },
    });

    if (!list) {
      return NextResponse.json(
        { success: false, error: 'List not found' },
        { status: 404 }
      );
    }

    if (list.userId !== session.userId) {
      return NextResponse.json(
        { success: false, error: 'You can only delete your own lists' },
        { status: 403 }
      );
    }

    // Delete list (cascade will delete items and votes)
    await prisma.topTenList.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'List deleted successfully',
    });
  } catch (error) {
    console.error('Delete list error:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred' },
      { status: 500 }
    );
  }
}
