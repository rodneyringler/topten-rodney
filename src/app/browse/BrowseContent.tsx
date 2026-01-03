'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ListCard from '@/components/ListCard';
import CategoryFilter from '@/components/CategoryFilter';
import { Category, TopTenList, Vote } from '@/types';

interface ListsResponse {
  lists: TopTenList[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function BrowseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');

  const [categories, setCategories] = useState<Category[]>([]);
  const [lists, setLists] = useState<TopTenList[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryParam);
  const [userVotes, setUserVotes] = useState<Record<string, Vote>>({});
  const [votingListId, setVotingListId] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.data.categories);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  }, []);

  const fetchLists = useCallback(async (category: string | null, page: number) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      params.set('page', page.toString());
      params.set('limit', '12');

      const res = await fetch(`/api/lists?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        const response = data.data as ListsResponse;
        setLists(response.lists);
        setPagination({
          page: response.pagination.page,
          totalPages: response.pagination.totalPages,
          total: response.pagination.total,
        });
      }
    } catch (error) {
      console.error('Failed to fetch lists:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchUserVotes = useCallback(async () => {
    try {
      const res = await fetch('/api/votes');
      const data = await res.json();
      if (data.success && data.data.votes.length > 0) {
        setIsLoggedIn(true);
        const votesMap: Record<string, Vote> = {};
        data.data.votes.forEach((vote: Vote & { list: { categoryId: string } }) => {
          votesMap[vote.list.categoryId] = vote;
        });
        setUserVotes(votesMap);
      }
    } catch (error) {
      console.error('Failed to fetch votes:', error);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchUserVotes();
    // Check if logged in
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data.user) {
          setIsLoggedIn(true);
        }
      })
      .catch(() => {});
  }, [fetchCategories, fetchUserVotes]);

  useEffect(() => {
    setSelectedCategory(categoryParam);
    fetchLists(categoryParam, 1);
  }, [categoryParam, fetchLists]);

  const handleCategoryChange = (slug: string | null) => {
    const params = new URLSearchParams();
    if (slug) params.set('category', slug);
    router.push(`/browse${slug ? `?${params.toString()}` : ''}`);
  };

  const handleVote = async (listId: string) => {
    if (!isLoggedIn) {
      router.push('/auth/login?redirect=/browse');
      return;
    }

    setVotingListId(listId);
    try {
      const res = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listId }),
      });
      const data = await res.json();
      if (data.success) {
        fetchUserVotes();
        fetchLists(selectedCategory, pagination.page);
      }
    } catch (error) {
      console.error('Vote failed:', error);
    } finally {
      setVotingListId(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    fetchLists(selectedCategory, newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getCategoryVotedListId = (categoryId: string): string | null => {
    return userVotes[categoryId]?.listId || null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Top Ten Lists</h1>
          <p className="text-gray-600">
            Discover amazing lists from our community. Vote for your favorites!
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8 overflow-x-auto pb-2">
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategoryChange}
          />
        </div>

        {/* Results Info */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {pagination.total} {pagination.total === 1 ? 'list' : 'lists'} found
            {selectedCategory && categories.find(c => c.slug === selectedCategory) && (
              <span> in {categories.find(c => c.slug === selectedCategory)?.name}</span>
            )}
          </p>
          {isLoggedIn && (
            <p className="text-sm text-gray-500">
              You can vote once per category
            </p>
          )}
        </div>

        {/* Lists Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-md p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : lists.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No lists found</h3>
            <p className="text-gray-600 mb-6">
              {selectedCategory
                ? 'No lists in this category yet. Be the first to create one!'
                : 'No public lists yet. Be the first to create one!'}
            </p>
            <a
              href="/dashboard/new"
              className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              Create a List
            </a>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lists.map((list) => (
                <ListCard
                  key={list.id}
                  list={list}
                  showVoteButton={isLoggedIn}
                  hasVoted={list.category ? getCategoryVotedListId(list.category.id) === list.id : false}
                  onVote={handleVote}
                  isVoting={votingListId === list.id}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-10 flex justify-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <div className="flex items-center gap-2">
                  {[...Array(pagination.totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => handlePageChange(i + 1)}
                      className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                        pagination.page === i + 1
                          ? 'bg-primary-600 text-white'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
