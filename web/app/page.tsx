'use client';

import { useState, useEffect } from 'react';
import { SavedItemView, getSavedItems, updateItemStatus, deleteItem } from '@/lib/supabase';
import { ItemCard } from '@/components/ItemCard';
import { FilterBar } from '@/components/FilterBar';

export default function Home() {
  const [items, setItems] = useState<SavedItemView[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('all');

  useEffect(() => {
    loadItems();
  }, [filter]);

  async function loadItems() {
    setLoading(true);
    const data = await getSavedItems(filter);
    setItems(data);
    setLoading(false);
  }

  async function handleStatusChange(savedId: string, newStatus: string) {
    const success = await updateItemStatus(savedId, newStatus);
    if (success) {
      setItems(items.map(item => 
        item.saved_id === savedId ? { ...item, status: newStatus as any } : item
      ));
    }
  }

  async function handleDelete(savedId: string) {
    const success = await deleteItem(savedId);
    if (success) {
      setItems(items.filter(item => item.saved_id !== savedId));
    }
  }

  const filteredItems = tagFilter === 'all' 
    ? items 
    : items.filter(item => item.tag === tagFilter);

  const statusCounts = {
    all: items.length,
    unread: items.filter(i => i.status === 'unread').length,
    tried: items.filter(i => i.status === 'tried').length,
    done: items.filter(i => i.status === 'done').length,
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your AI Library</h2>
        <p className="text-gray-600">
          {items.length} saved items • {statusCounts.unread} unread • {statusCounts.tried} in progress
        </p>
      </div>

      <FilterBar 
        statusFilter={filter}
        tagFilter={tagFilter}
        onStatusFilterChange={setFilter}
        onTagFilterChange={setTagFilter}
        statusCounts={statusCounts}
      />

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <span className="text-4xl mb-4 block">📭</span>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
          <p className="text-gray-600">
            {filter === 'all' 
              ? 'Save items from your Telegram daily digest to see them here.'
              : 'No items with this filter. Try changing the filter.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredItems.map(item => (
            <ItemCard 
              key={item.saved_id} 
              item={item}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
