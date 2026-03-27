'use client';

import { SavedItemView } from '@/lib/supabase';

interface ItemCardProps {
  item: SavedItemView;
  onStatusChange: (savedId: string, status: string) => void;
  onDelete: (savedId: string) => void;
}

const tagEmoji: Record<string, string> = {
  tool: '🔧',
  paper: '📄',
  project: '🚀',
  tutorial: '📚',
  opinion: '💬',
};

const sourceEmoji: Record<string, string> = {
  hackernews: '🟠',
  reddit: '🔴',
  arxiv: '📑',
  youtube: '▶️',
  twitter: '🐦',
  threads: '🧵',
};

const statusColors: Record<string, string> = {
  unread: 'bg-blue-100 text-blue-800',
  tried: 'bg-yellow-100 text-yellow-800',
  done: 'bg-green-100 text-green-800',
};

export function ItemCard({ item, onStatusChange, onDelete }: ItemCardProps) {
  const formattedDate = new Date(item.saved_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{sourceEmoji[item.source] || '📰'}</span>
            <span className={`px-2 py-0.5 rounded text-xs font-medium tag-${item.tag}`}>
              {tagEmoji[item.tag]} {item.tag}
            </span>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[item.status]}`}>
              {item.status}
            </span>
            <span className="text-xs text-gray-500">{formattedDate}</span>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary-600">
              {item.title}
            </a>
          </h3>
          
          <p className="text-gray-600 mb-3">{item.summary}</p>
          
          <p className="text-sm text-primary-600 font-medium">
            💡 {item.cta}
          </p>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
        <div className="flex gap-2">
          {item.status !== 'tried' && (
            <button
              onClick={() => onStatusChange(item.saved_id, 'tried')}
              className="px-3 py-1.5 text-sm font-medium text-yellow-700 bg-yellow-50 rounded-md hover:bg-yellow-100 transition-colors"
            >
              🔄 Mark as Tried
            </button>
          )}
          {item.status !== 'done' && (
            <button
              onClick={() => onStatusChange(item.saved_id, 'done')}
              className="px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 rounded-md hover:bg-green-100 transition-colors"
            >
              ✅ Mark as Done
            </button>
          )}
          {item.status === 'done' && (
            <button
              onClick={() => onStatusChange(item.saved_id, 'unread')}
              className="px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
            >
              ↩️ Reopen
            </button>
          )}
        </div>
        
        <div className="flex gap-2">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            🔗 Open Link
          </a>
          <button
            onClick={() => {
              if (confirm('Remove this item from your library?')) {
                onDelete(item.saved_id);
              }
            }}
            className="px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
          >
            🗑️ Remove
          </button>
        </div>
      </div>
    </div>
  );
}
