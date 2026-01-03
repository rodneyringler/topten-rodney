import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session';

// GET user's votes
export async function GET() {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({
        success: true,
        data: { votes: [] },
      });
    }

    const votes = await prisma.vote.findMany({
      where: { userId: session.userId },
      include: {
        list: {
          include: {
            category: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: { votes },
    });
  } catch (error) {
    console.error('Get votes error:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred' },
      { status: 500 }
    );
  }
}

// POST vote for a list
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json(
        { success: false, error: 'You must be logged in to vote' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { listId } = body;

    if (!listId) {
      return NextResponse.json(
        { success: false, error: 'List ID is required' },
        { status: 400 }
      );
    }

    // Get the list to verify it exists and get its category
    const list = await prisma.topTenList.findUnique({
      where: { id: listId },
      include: { category: true },
    });

    if (!list) {
      return NextResponse.json(
        { success: false, error: 'List not found' },
        { status: 404 }
      );
    }

    if (!list.isPublic) {
      return NextResponse.json(
        { success: false, error: 'Cannot vote on private lists' },
        { status: 400 }
      );
    }

    // Check if user already voted for a list in this category
    const existingVoteInCategory = await prisma.vote.findFirst({
      where: {
        userId: session.userId,
        list: {
          categoryId: list.categoryId,
        },
      },
      include: {
        list: true,
      },
    });

    if (existingVoteInCategory) {
      // If voting for a different list, remove old vote and add new one
      if (existingVoteInCategory.listId !== listId) {
        await prisma.$transaction([
          prisma.vote.delete({
            where: { id: existingVoteInCategory.id },
          }),
          prisma.vote.create({
            data: {
              userId: session.userId,
              listId,
            },
          }),
        ]);

        return NextResponse.json({
          success: true,
          message: `Vote changed from "${existingVoteInCategory.list.title}" to "${list.title}"`,
          data: { votedListId: listId },
        });
      } else {
        // Already voted for this list
        return NextResponse.json(
          { success: false, error: 'You already voted for this list' },
          { status: 400 }
        );
      }
    }

    // Create new vote
    await prisma.vote.create({
      data: {
        userId: session.userId,
        listId,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Vote recorded successfully',
      data: { votedListId: listId },
    });
  } catch (error) {
    console.error('Vote error:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred' },
      { status: 500 }
    );
  }
}

// DELETE remove vote
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json(
        { success: false, error: 'You must be logged in' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const listId = searchParams.get('listId');

    if (!listId) {
      return NextResponse.json(
        { success: false, error: 'List ID is required' },
        { status: 400 }
      );
    }

    const vote = await prisma.vote.findFirst({
      where: {
        userId: session.userId,
        listId,
      },
    });

    if (!vote) {
      return NextResponse.json(
        { success: false, error: 'Vote not found' },
        { status: 404 }
      );
    }

    await prisma.vote.delete({
      where: { id: vote.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Vote removed successfully',
    });
  } catch (error) {
    console.error('Delete vote error:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred' },
      { status: 500 }
    );
  }
}
