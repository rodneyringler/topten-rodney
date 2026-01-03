'use client';

import Link from 'next/link';
import { TopTenList } from '@/types';

interface ListCardProps {
  list: TopTenList;
  showVoteButton?: boolean;
  hasVoted?: boolean;
  onVote?: (listId: string) => void;
  isVoting?: boolean;
}

export default function ListCard({ list, showVoteButton, hasVoted, onVote, isVoting }: ListCardProps) {
  const voteCount = list._count?.votes || 0;

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
            {list.category?.icon} {list.category?.name}
          </span>
          <div className="flex items-center gap-1 text-gray-500">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm font-medium">{voteCount}</span>
          </div>
        </div>

        <Link href={`/list/${list.slug}`}>
          <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors mb-2 line-clamp-2">
            {list.title}
          </h3>
        </Link>

        {list.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{list.description}</p>
        )}

        {list.items && list.items.length > 0 && (
          <div className="space-y-2 mb-4">
            {list.items.slice(0, 3).map((item, index) => (
              <div key={item.id} className="flex items-center gap-2 text-sm">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 text-white text-xs font-bold flex items-center justify-center">
                  {index + 1}
                </span>
                <span className="text-gray-700 truncate">{item.title}</span>
              </div>
            ))}
            {list.items.length > 3 && (
              <p className="text-gray-400 text-xs pl-8">+{list.items.length - 3} more items</p>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <Link
            href={`/list/${list.slug}`}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            View Full List →
          </Link>

          {showVoteButton && onVote && (
            <button
              onClick={() => onVote(list.id)}
              disabled={isVoting}
              className={`
                px-4 py-1.5 rounded-lg text-sm font-medium transition-all
                ${hasVoted
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-primary-100 hover:text-primary-700'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {isVoting ? '...' : hasVoted ? 'Voted!' : 'Vote'}
            </button>
          )}
        </div>

        <div className="mt-3 text-xs text-gray-400">
          by {list.user?.username} • {new Date(list.createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
