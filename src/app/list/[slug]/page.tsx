'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import ShareButton from '@/components/ShareButton';
import { TopTenList, Vote } from '@/types';

interface User {
  id: string;
  username: string;
  email: string;
}

export default function ListDetailPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [list, setList] = useState<TopTenList | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [userVotes, setUserVotes] = useState<Record<string, Vote>>({});
  const [isVoting, setIsVoting] = useState(false);

  const fetchList = useCallback(async () => {
    try {
      const res = await fetch(`/api/lists/${slug}`);
      const data = await res.json();
      if (data.success) {
        setList(data.data.list);
      } else {
        setError(data.error || 'List not found');
      }
    } catch {
      setError('Failed to load list');
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.success && data.data.user) {
        setUser(data.data.user);
      }
    } catch {
      // Not logged in
    }
  }, []);

  const fetchUserVotes = useCallback(async () => {
    try {
      const res = await fetch('/api/votes');
      const data = await res.json();
      if (data.success && data.data.votes.length > 0) {
        const votesMap: Record<string, Vote> = {};
        data.data.votes.forEach((vote: Vote & { list: { categoryId: string } }) => {
          votesMap[vote.list.categoryId] = vote;
        });
        setUserVotes(votesMap);
      }
    } catch {
      // Not logged in or error
    }
  }, []);

  useEffect(() => {
    fetchList();
    fetchUser();
    fetchUserVotes();
  }, [fetchList, fetchUser, fetchUserVotes]);

  const handleVote = async () => {
    if (!user) {
      router.push(`/auth/login?redirect=/list/${slug}`);
      return;
    }

    if (!list) return;

    setIsVoting(true);
    try {
      const res = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listId: list.id }),
      });
      const data = await res.json();
      if (data.success) {
        fetchUserVotes();
        fetchList();
      } else {
        alert(data.error || 'Failed to vote');
      }
    } catch {
      alert('An error occurred');
    } finally {
      setIsVoting(false);
    }
  };

  const hasVotedForThisList = list?.category
    ? userVotes[list.category.id]?.listId === list.id
    : false;

  const hasVotedInCategory = list?.category
    ? !!userVotes[list.category.id]
    : false;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-12 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-full mb-8"></div>
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-md">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">List Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/browse"
            className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors inline-block"
          >
            Browse Lists
          </Link>
        </div>
      </div>
    );
  }

  if (!list) return null;

  const isOwner = user && user.id === list.userId;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center gap-2 text-sm">
            <li>
              <Link href="/browse" className="text-gray-500 hover:text-primary-600">
                Browse
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li>
              <Link
                href={`/browse?category=${list.category?.slug}`}
                className="text-gray-500 hover:text-primary-600"
              >
                {list.category?.name}
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-900 font-medium truncate max-w-[200px]">
              {list.title}
            </li>
          </ol>
        </nav>

        {/* List Header */}
        <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-700">
                  {list.category?.icon} {list.category?.name}
                </span>
                {!list.isPublic && (
                  <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                    Private
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {list.title}
              </h1>
              {list.description && (
                <p className="text-gray-600">{list.description}</p>
              )}
            </div>

            {isOwner && (
              <Link
                href={`/dashboard/edit/${list.id}`}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </Link>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-gray-600">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                {list.user?.username.charAt(0).toUpperCase()}
              </div>
              <span>by {list.user?.username}</span>
            </div>

            <div className="flex items-center gap-1 text-gray-500">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="font-medium">{list._count?.votes || 0} votes</span>
            </div>

            <span className="text-gray-400 text-sm">
              {new Date(list.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>

            <div className="ml-auto flex items-center gap-2">
              <ShareButton title={list.title} slug={list.slug} />

              {user && !isOwner && list.isPublic && (
                <button
                  onClick={handleVote}
                  disabled={isVoting}
                  className={`
                    inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                    ${hasVotedForThisList
                      ? 'bg-primary-600 text-white'
                      : hasVotedInCategory
                        ? 'bg-gray-200 text-gray-600'
                        : 'bg-primary-100 text-primary-700 hover:bg-primary-600 hover:text-white'
                    }
                    disabled:opacity-50
                  `}
                >
                  <svg className="w-4 h-4" fill={hasVotedForThisList ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {isVoting ? 'Voting...' : hasVotedForThisList ? 'Voted!' : hasVotedInCategory ? 'Vote for this instead' : 'Vote'}
                </button>
              )}

              {!user && list.isPublic && (
                <Link
                  href={`/auth/login?redirect=/list/${slug}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-lg font-medium hover:bg-primary-600 hover:text-white transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Log in to Vote
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* List Items */}
        <div className="space-y-4">
          {list.items?.map((item, index) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden"
            >
              <div className="flex">
                <div className="flex-shrink-0 w-16 sm:w-20 bg-gradient-to-br from-primary-500 via-purple-500 to-indigo-500 flex items-center justify-center">
                  <span className="text-2xl sm:text-3xl font-bold text-white">
                    {index + 1}
                  </span>
                </div>
                <div className="flex-1 p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-gray-600">{item.description}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Related Lists CTA */}
        <div className="mt-12 text-center bg-gradient-to-r from-primary-50 to-purple-50 rounded-2xl p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Want to see more {list.category?.name} lists?
          </h2>
          <p className="text-gray-600 mb-4">
            Browse all lists in this category or create your own!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={`/browse?category=${list.category?.slug}`}
              className="px-6 py-3 bg-white text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors border border-gray-200"
            >
              Browse {list.category?.name}
            </Link>
            <Link
              href="/dashboard/new"
              className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              Create Your Own List
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
