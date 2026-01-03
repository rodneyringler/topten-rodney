'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ListForm from '@/components/forms/ListForm';

export default function NewListPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.success && data.data.user) {
          setIsAuthenticated(true);
        } else {
          router.push('/auth/login?redirect=/dashboard/new');
        }
      } catch {
        router.push('/auth/login?redirect=/dashboard/new');
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New List</h1>
          <p className="text-gray-600">
            Share your top ten with the world. Fill in the details below.
          </p>
        </div>

        <ListForm mode="create" />
      </div>
    </div>
  );
}
