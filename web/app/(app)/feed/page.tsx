'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  tag: string;
  cta: string;
  created_at: string;
}

export default function FeedPage() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');

  useEffect(() => {
    fetchItems();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchItems, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/items');
      const data = await res.json();
      setItems(data.items || []);
    } catch (error) {
      console.error('Failed to fetch items:', error);
    } finally {
      setLoading(false);
    }
  };

  const sources = ['all', ...new Set(items.map(i => i.source))];
  const tags = ['all', ...new Set(items.map(i => i.tag))];
  
  const filteredItems = items
    .filter(i => sourceFilter === 'all' || i.source === sourceFilter)
    .filter(i => tagFilter === 'all' || i.tag === tagFilter);

  const getSourceColor = (source: string) => {
    const colors: Record<string, string> = {
      hackernews: 'from-orange-500 to-orange-700',
      reddit: 'from-orange-600 to-red-600',
      rss: 'from-purple-500 to-pink-500',
      twitter: 'from-blue-400 to-blue-600',
      linkedin: 'from-blue-600 to-blue-800',
    };
    return colors[source] || 'from-gray-500 to-gray-700';
  };

  const getTagEmoji = (tag: string) => {
    const emojis: Record<string, string> = {
      tool: '🛠️',
      project: '🚀',
      tutorial: '📚',
      opinion: '💭',
      paper: '📄',
    };
    return emojis[tag] || '📰';
  };

  return (
    <div className="min-h-screen">
      <div className="animated-bg" />

      {/* Navbar */}
      <nav className="navbar">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl">
                ⚡
              </div>
              <span className="text-xl font-bold">ZappNews.ai</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/20 border border-green-500/30">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm text-green-400">Live Feed</span>
            </div>
            <Link href="/login" className="btn-secondary text-sm px-4 py-2">
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-28 pb-12">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Live <span className="gradient-text">AI News</span> Feed
          </h1>
          <p className="text-xl text-gray-400">
            {filteredItems.length} items • Updated every 3 hours
          </p>
        </div>

        {/* Filters */}
        <div className="glass p-4 mb-8 animate-fade-in-up animate-delay-1">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Source:</span>
              <div className="flex flex-wrap gap-2">
                {sources.map(source => (
                  <button
                    key={source}
                    onClick={() => setSourceFilter(source)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition capitalize ${
                      sourceFilter === source
                        ? 'bg-white/10 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {source}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-6 w-px bg-gray-700 hidden md:block" />
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Type:</span>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setTagFilter(tag)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition capitalize ${
                      tagFilter === tag
                        ? 'bg-white/10 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {tag !== 'all' && getTagEmoji(tag)} {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Feed */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="spinner" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16 glass animate-fade-in-up">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold mb-2">No items found</h3>
            <p className="text-gray-400">Try adjusting your filters or wait for the next fetch</p>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in-up animate-delay-2">
            {filteredItems.map((item, i) => (
              <div
                key={item.id}
                className="glass-card p-6 group"
                style={{ animationDelay: `${i * 0.03}s` }}
              >
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  {/* Source icon */}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getSourceColor(item.source)} flex items-center justify-center text-xl font-bold shrink-0`}>
                    {item.source === 'hackernews' ? 'Y' : 
                     item.source === 'reddit' ? '🤖' :
                     item.source === 'twitter' ? '𝕏' :
                     item.source === 'linkedin' ? 'in' : '📡'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-sm text-gray-500 capitalize">{item.source}</span>
                      <span className="text-gray-600">•</span>
                      <span className="text-sm">
                        {getTagEmoji(item.tag)} {item.tag}
                      </span>
                      <span className="text-gray-600">•</span>
                      <span className="text-sm text-gray-500">
                        {new Date(item.created_at).toLocaleString()}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-purple-400 transition">
                      {item.title}
                    </h3>
                    
                    <p className="text-gray-400 text-sm mb-4">
                      {item.summary}
                    </p>
                    
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition font-medium"
                    >
                      {item.cta} →
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 text-center animate-fade-in-up">
          <div className="glass p-8 inline-block">
            <h3 className="text-2xl font-bold mb-4">Want personalized digests?</h3>
            <p className="text-gray-400 mb-6">Sign up to get AI news delivered to your Telegram</p>
            <Link href="/signup" className="btn-glow">
              Get Started Free ✨
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
