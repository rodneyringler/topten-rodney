'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ListForm from '@/components/forms/ListForm';
import { TopTenList } from '@/types';

export default function EditListPage() {
  const router = useRouter();
  const params = useParams();
  const listId = params.id as string;

  const [list, setList] = useState<TopTenList | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchList = async () => {
      try {
        // First check auth
        const authRes = await fetch('/api/auth/me');
        const authData = await authRes.json();
        if (!authData.success || !authData.data.user) {
          router.push(`/auth/login?redirect=/dashboard/edit/${listId}`);
          return;
        }

        // Fetch the list
        const res = await fetch(`/api/lists/${listId}`);
        const data = await res.json();

        if (data.success) {
          // Check if user owns this list
          if (data.data.list.userId !== authData.data.user.id) {
            setError('You do not have permission to edit this list');
            return;
          }
          setList(data.data.list);
        } else {
          setError(data.error || 'List not found');
        }
      } catch {
        setError('Failed to load list');
      } finally {
        setIsLoading(false);
      }
    };

    if (listId) {
      fetchList();
    }
  }, [listId, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!list) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit List</h1>
          <p className="text-gray-600">
            Make changes to your top ten list.
          </p>
        </div>

        <ListForm mode="edit" initialData={list} />
      </div>
    </div>
  );
}
