'use client';

interface FilterBarProps {
  statusFilter: string;
  tagFilter: string;
  onStatusFilterChange: (filter: string) => void;
  onTagFilterChange: (filter: string) => void;
  statusCounts: {
    all: number;
    unread: number;
    tried: number;
    done: number;
  };
}

const statusOptions = [
  { value: 'all', label: 'All', emoji: '📋' },
  { value: 'unread', label: 'Unread', emoji: '📌' },
  { value: 'tried', label: 'In Progress', emoji: '🔄' },
  { value: 'done', label: 'Done', emoji: '✅' },
];

const tagOptions = [
  { value: 'all', label: 'All Tags', emoji: '🏷️' },
  { value: 'tool', label: 'Tools', emoji: '🔧' },
  { value: 'paper', label: 'Papers', emoji: '📄' },
  { value: 'project', label: 'Projects', emoji: '🚀' },
  { value: 'tutorial', label: 'Tutorials', emoji: '📚' },
  { value: 'opinion', label: 'Opinions', emoji: '💬' },
];

export function FilterBar({ 
  statusFilter, 
  tagFilter, 
  onStatusFilterChange, 
  onTagFilterChange,
  statusCounts 
}: FilterBarProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex flex-wrap gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <div className="flex gap-2">
            {statusOptions.map(option => (
              <button
                key={option.value}
                onClick={() => onStatusFilterChange(option.value)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  statusFilter === option.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.emoji} {option.label}
                {option.value !== 'all' && (
                  <span className="ml-1.5 text-xs opacity-75">
                    ({statusCounts[option.value as keyof typeof statusCounts]})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tag</label>
          <div className="flex gap-2 flex-wrap">
            {tagOptions.map(option => (
              <button
                key={option.value}
                onClick={() => onTagFilterChange(option.value)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  tagFilter === option.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.emoji} {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
