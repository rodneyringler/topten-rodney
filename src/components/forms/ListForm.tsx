'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import { Category, TopTenList, ListItem } from '@/types';

interface ListFormProps {
  mode: 'create' | 'edit';
  initialData?: TopTenList;
}

interface ListItemInput {
  rank: number;
  title: string;
  description: string;
}

export default function ListForm({ mode, initialData }: ListFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    categoryId: initialData?.categoryId || '',
    isPublic: initialData?.isPublic !== false,
  });

  const [items, setItems] = useState<ListItemInput[]>(
    initialData?.items?.map((item: ListItem) => ({
      rank: item.rank,
      title: item.title,
      description: item.description || '',
    })) || Array.from({ length: 10 }, (_, i) => ({ rank: i + 1, title: '', description: '' }))
  );

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.data.categories);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Validate
    if (!formData.title.trim()) {
      setError('Title is required');
      setIsSubmitting(false);
      return;
    }

    if (!formData.categoryId) {
      setError('Please select a category');
      setIsSubmitting(false);
      return;
    }

    const validItems = items.filter((item) => item.title.trim());
    if (validItems.length === 0) {
      setError('At least one list item is required');
      setIsSubmitting(false);
      return;
    }

    try {
      const url = mode === 'create' ? '/api/lists' : `/api/lists/${initialData?.id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          items: validItems.map((item, index) => ({
            title: item.title.trim(),
            description: item.description.trim(),
          })),
        }),
      });

      const data = await res.json();

      if (data.success) {
        router.push(`/list/${data.data.list.slug}`);
        router.refresh();
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateItem = (index: number, field: 'title' | 'description', value: string) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">{error}</div>
      )}

      <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
        <h2 className="text-lg font-semibold text-gray-900">List Details</h2>

        <Input
          label="Title"
          name="title"
          placeholder="e.g., Best Movies of All Time"
          value={formData.title}
          onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
          required
        />

        <Textarea
          label="Description (optional)"
          name="description"
          placeholder="Describe what your list is about..."
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          rows={3}
        />

        <Select
          label="Category"
          name="categoryId"
          value={formData.categoryId}
          onChange={(e) => setFormData((prev) => ({ ...prev, categoryId: e.target.value }))}
          options={categories.map((cat) => ({
            value: cat.id,
            label: `${cat.icon} ${cat.name}`,
          }))}
          placeholder="Select a category"
          required
        />

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isPublic"
            checked={formData.isPublic}
            onChange={(e) => setFormData((prev) => ({ ...prev, isPublic: e.target.checked }))}
            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
          <label htmlFor="isPublic" className="text-sm text-gray-700">
            Make this list public (visible to everyone)
          </label>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
        <h2 className="text-lg font-semibold text-gray-900">List Items</h2>
        <p className="text-sm text-gray-500">
          Add up to 10 items. Only items with titles will be saved.
        </p>

        <div className="space-y-4">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 text-white font-bold flex items-center justify-center">
                {index + 1}
              </div>
              <div className="flex-1 space-y-3">
                <Input
                  placeholder={`Item #${index + 1} title`}
                  value={item.title}
                  onChange={(e) => updateItem(index, 'title', e.target.value)}
                />
                <Input
                  placeholder="Description (optional)"
                  value={item.description}
                  onChange={(e) => updateItem(index, 'description', e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-4 justify-end">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {mode === 'create' ? 'Create List' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
