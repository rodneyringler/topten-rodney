export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
}

export interface ListItem {
  id: string;
  rank: number;
  title: string;
  description: string | null;
  imageUrl: string | null;
}

export interface TopTenList {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  categoryId: string;
  user?: {
    id: string;
    username: string;
  };
  category?: Category;
  items?: ListItem[];
  _count?: {
    votes: number;
  };
}

export interface Vote {
  id: string;
  userId: string;
  listId: string;
  createdAt: Date;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ListFormData {
  title: string;
  description: string;
  categoryId: string;
  isPublic: boolean;
  items: {
    rank: number;
    title: string;
    description: string;
  }[];
}
