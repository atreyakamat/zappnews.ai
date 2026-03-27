'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  tag: string;
  cta: string;
  created_at: string;
  saved?: boolean;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'saved'>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');

  useEffect(() => {
    const auth = localStorage.getItem('zappnews_auth');
    if (!auth) {
      router.push('/login');
      return;
    }
    const userData = localStorage.getItem('zappnews_user');
    if (userData) setUser(JSON.parse(userData));
    fetchItems();
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

  const toggleSave = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, saved: !item.saved } : item
    ));
  };

  const logout = () => {
    localStorage.removeItem('zappnews_auth');
    localStorage.removeItem('zappnews_user');
    router.push('/');
  };

  const sources = ['all', ...new Set(items.map(i => i.source))];
  const filteredItems = items
    .filter(i => filter === 'all' || i.saved)
    .filter(i => sourceFilter === 'all' || i.source === sourceFilter);

  const getSourceColor = (source: string) => {
    const colors: Record<string, string> = {
      hackernews: 'source-hackernews',
      reddit: 'source-reddit',
      rss: 'source-rss',
      twitter: 'source-twitter',
      linkedin: 'source-linkedin',
    };
    return colors[source] || 'bg-gray-600';
  };

  const getTagColor = (tag: string) => {
    const colors: Record<string, string> = {
      tool: 'tag-tool',
      project: 'tag-project',
      tutorial: 'tag-tutorial',
      opinion: 'tag-opinion',
      paper: 'tag-paper',
    };
    return colors[tag] || 'bg-gray-600';
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
              <span className="text-xl font-bold hidden sm:block">ZappNews.ai</span>
            </Link>
            <div className="hidden md:flex items-center gap-1">
              <Link href="/dashboard" className="px-4 py-2 rounded-lg bg-white/10 text-white font-medium">
                Dashboard
              </Link>
              <Link href="/feed" className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition">
                Live Feed
              </Link>
              <Link href="/settings" className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition">
                Settings
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/20 border border-green-500/30">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm text-green-400">Live</span>
            </div>
            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-medium">
                  {user?.name?.[0] || 'U'}
                </div>
                <span className="hidden sm:block text-sm">{user?.name || 'User'}</span>
              </button>
              <div className="absolute right-0 top-full mt-2 w-48 py-2 glass rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <Link href="/settings" className="block px-4 py-2 hover:bg-white/10 transition">
                  ⚙️ Settings
                </Link>
                <button onClick={logout} className="w-full text-left px-4 py-2 hover:bg-white/10 transition text-red-400">
                  🚪 Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 pt-28 pb-12">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-fade-in-up">
          {[
            { label: 'Total Items', value: items.length, icon: '📰', color: 'from-blue-500 to-cyan-500' },
            { label: 'Saved', value: items.filter(i => i.saved).length, icon: '💾', color: 'from-green-500 to-emerald-500' },
            { label: 'Sources', value: sources.length - 1, icon: '🔗', color: 'from-purple-500 to-pink-500' },
            { label: 'Today', value: items.filter(i => new Date(i.created_at).toDateString() === new Date().toDateString()).length, icon: '📅', color: 'from-orange-500 to-red-500' },
          ].map((stat, i) => (
            <div key={i} className="glass-card p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{stat.icon}</span>
                <div className={`w-10 h-1 rounded-full bg-gradient-to-r ${stat.color}`} />
              </div>
              <p className="text-3xl font-bold mb-1">{stat.value}</p>
              <p className="text-sm text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-8 animate-fade-in-up animate-delay-1">
          <div className="flex items-center gap-2">
            {['all', 'saved'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f as typeof filter)}
                className={`px-4 py-2 rounded-lg font-medium transition capitalize ${
                  filter === f
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {f === 'saved' ? '💾 Saved' : '📰 All'}
              </button>
            ))}
          </div>
          <div className="h-6 w-px bg-gray-700" />
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {sources.map(source => (
              <button
                key={source}
                onClick={() => setSourceFilter(source)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition whitespace-nowrap capitalize ${
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

        {/* Items Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="spinner" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16 animate-fade-in-up">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold mb-2">No items yet</h3>
            <p className="text-gray-400 mb-6">
              {filter === 'saved' 
                ? "You haven't saved any items yet" 
                : "News will appear here after the next fetch"}
            </p>
            <button 
              onClick={() => fetch('/api/fetch', { method: 'POST' }).then(fetchItems)}
              className="btn-glow"
            >
              Fetch Now 🔄
            </button>
          </div>
        ) : (
          <div className="grid gap-4 animate-fade-in-up animate-delay-2">
            {filteredItems.map((item, i) => (
              <div
                key={item.id}
                className="glass-card p-6 group"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${getSourceColor(item.source)}`}>
                        {item.source}
                      </span>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${getTagColor(item.tag)}`}>
                        {item.tag}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-purple-400 transition">
                      {item.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {item.summary}
                    </p>
                    <div className="flex items-center gap-3">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-glow text-sm py-2 px-4"
                      >
                        {item.cta} →
                      </a>
                      <button
                        onClick={() => toggleSave(item.id)}
                        className={`p-2 rounded-lg transition ${
                          item.saved 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {item.saved ? '✓ Saved' : '💾 Save'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
