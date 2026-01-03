'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Category, TopTenList } from '@/types';

interface UserListsResponse {
  lists: TopTenList[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [lists, setLists] = useState<TopTenList[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.success && data.data.user) {
        setUserId(data.data.user.id);
        return data.data.user.id;
      } else {
        router.push('/auth/login?redirect=/dashboard');
        return null;
      }
    } catch {
      router.push('/auth/login?redirect=/dashboard');
      return null;
    }
  }, [router]);

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

  const fetchLists = useCallback(async (uid: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/lists?userId=${uid}`);
      const data = await res.json();
      if (data.success) {
        const response = data.data as UserListsResponse;
        setLists(response.lists);
      }
    } catch (error) {
      console.error('Failed to fetch lists:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await fetchCategories();
      const uid = await fetchUser();
      if (uid) {
        fetchLists(uid);
      }
    };
    init();
  }, [fetchCategories, fetchUser, fetchLists]);

  const handleDelete = async (listId: string, listTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${listTitle}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(listId);
    try {
      const res = await fetch(`/api/lists/${listId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setLists((prev) => prev.filter((list) => list.id !== listId));
      } else {
        alert(data.error || 'Failed to delete list');
      }
    } catch {
      alert('An error occurred while deleting');
    } finally {
      setDeletingId(null);
    }
  };

  // Group lists by category
  const listsByCategory = lists.reduce<Record<string, TopTenList[]>>((acc, list) => {
    const catId = list.categoryId;
    if (!acc[catId]) {
      acc[catId] = [];
    }
    acc[catId].push(list);
    return acc;
  }, {});

  // Filter categories that have lists or show all if filtering
  const categoriesWithLists = categories.filter(
    (cat) => listsByCategory[cat.id]?.length > 0
  );

  const filteredLists = selectedCategory
    ? lists.filter((list) => list.category?.slug === selectedCategory)
    : lists;

  const displayCategories = selectedCategory
    ? categories.filter((cat) => cat.slug === selectedCategory)
    : categoriesWithLists;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Dashboard</h1>
            <p className="text-gray-600">
              Manage your top ten lists
            </p>
          </div>
          <Link
            href="/dashboard/new"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New List
          </Link>
        </div>

        {/* Category Filter */}
        <div className="mb-8 overflow-x-auto pb-2">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                !selectedCategory
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({lists.length})
            </button>
            {categoriesWithLists.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.slug)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1 ${
                  selectedCategory === category.slug
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
                <span className="ml-1 text-xs opacity-75">
                  ({listsByCategory[category.id]?.length || 0})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="space-y-8">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="bg-white rounded-xl shadow-md p-6">
                      <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                      <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : lists.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16 bg-white rounded-2xl shadow-md">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No lists yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              You haven&apos;t created any top ten lists yet. Get started by creating your first list!
            </p>
            <Link
              href="/dashboard/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Your First List
            </Link>
          </div>
        ) : (
          /* Lists by Category */
          <div className="space-y-10">
            {displayCategories.map((category) => {
              const categoryLists = selectedCategory
                ? filteredLists.filter((l) => l.categoryId === category.id)
                : listsByCategory[category.id] || [];

              if (categoryLists.length === 0) return null;

              return (
                <div key={category.id}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">{category.icon}</span>
                    <h2 className="text-xl font-semibold text-gray-900">{category.name}</h2>
                    <span className="text-sm text-gray-500">({categoryLists.length})</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryLists.map((list) => (
                      <div
                        key={list.id}
                        className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <Link
                            href={`/list/${list.slug}`}
                            className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors line-clamp-2"
                          >
                            {list.title}
                          </Link>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              list.isPublic
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {list.isPublic ? 'Public' : 'Private'}
                          </span>
                        </div>

                        {list.description && (
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {list.description}
                          </p>
                        )}

                        {list.items && list.items.length > 0 && (
                          <div className="mb-4">
                            <p className="text-xs text-gray-500 mb-1">Preview:</p>
                            <p className="text-sm text-gray-700">
                              1. {list.items[0].title}
                              {list.items.length > 1 && ` • 2. ${list.items[1].title}`}
                              {list.items.length > 2 && ` ...`}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-1 text-gray-500">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-sm">{list._count?.votes || 0} votes</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/dashboard/edit/${list.id}`}
                              className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </Link>
                            <button
                              onClick={() => handleDelete(list.id, list.title)}
                              disabled={deletingId === list.id}
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Delete"
                            >
                              {deletingId === list.id ? (
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="mt-2 text-xs text-gray-400">
                          Updated {new Date(list.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
