'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface SocialAccount {
  platform: string;
  connected: boolean;
  username?: string;
}

interface RSSFeed {
  name: string;
  url: string;
  enabled: boolean;
  category: string;
}

interface Settings {
  telegram: {
    botToken: string;
    chatId: string;
    connected: boolean;
  };
  schedule: {
    fetchCron: string;
    digestCron: string;
  };
  socialAccounts: SocialAccount[];
  rssFeeds: RSSFeed[];
}

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newFeedUrl, setNewFeedUrl] = useState('');
  const [newFeedName, setNewFeedName] = useState('');
  const [activeTab, setActiveTab] = useState<'social' | 'rss' | 'telegram' | 'schedule'>('social');

  useEffect(() => {
    const auth = localStorage.getItem('zappnews_auth');
    if (!auth) {
      router.push('/login');
      return;
    }
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      setSettings(data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectSocial = async (platform: string) => {
    window.location.href = `/api/auth/${platform}`;
  };

  const disconnectSocial = async (platform: string) => {
    try {
      await fetch(`/api/auth/${platform}/disconnect`, { method: 'POST' });
      fetchSettings();
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  };

  const addRSSFeed = async () => {
    if (!newFeedUrl || !newFeedName) return;
    try {
      await fetch('/api/settings/rss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: newFeedUrl, name: newFeedName })
      });
      setNewFeedUrl('');
      setNewFeedName('');
      fetchSettings();
    } catch (error) {
      console.error('Failed to add feed:', error);
    }
  };

  const toggleFeed = async (url: string, enabled: boolean) => {
    try {
      await fetch('/api/settings/rss', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, enabled })
      });
      fetchSettings();
    } catch (error) {
      console.error('Failed to toggle feed:', error);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      alert('Settings saved!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animated-bg" />
        <div className="spinner" />
      </div>
    );
  }

  const socialAccounts = [
    {
      platform: 'twitter',
      connected: settings?.socialAccounts?.find(a => a.platform === 'twitter')?.connected || false,
      username: settings?.socialAccounts?.find(a => a.platform === 'twitter')?.username,
      icon: '𝕏',
      color: 'from-gray-700 to-black',
      description: 'Fetch AI tweets from your timeline'
    },
    {
      platform: 'threads',
      connected: settings?.socialAccounts?.find(a => a.platform === 'threads')?.connected || false,
      username: settings?.socialAccounts?.find(a => a.platform === 'threads')?.username,
      icon: '@',
      color: 'from-purple-500 to-pink-500',
      description: 'Fetch AI-related Threads posts'
    },
    {
      platform: 'linkedin',
      connected: settings?.socialAccounts?.find(a => a.platform === 'linkedin')?.connected || false,
      username: settings?.socialAccounts?.find(a => a.platform === 'linkedin')?.username,
      icon: 'in',
      color: 'from-blue-600 to-blue-800',
      description: 'Fetch AI posts from your LinkedIn'
    },
    {
      platform: 'reddit',
      connected: settings?.socialAccounts?.find(a => a.platform === 'reddit')?.connected || false,
      username: settings?.socialAccounts?.find(a => a.platform === 'reddit')?.username,
      icon: '🤖',
      color: 'from-orange-500 to-red-500',
      description: 'Fetch from AI subreddits'
    }
  ];

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
              <Link href="/dashboard" className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition">
                Dashboard
              </Link>
              <Link href="/feed" className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition">
                Live Feed
              </Link>
              <Link href="/settings" className="px-4 py-2 rounded-lg bg-white/10 text-white font-medium">
                Settings
              </Link>
            </div>
          </div>
          <button
            onClick={saveSettings}
            disabled={saving}
            className="btn-glow text-sm py-2 px-6 disabled:opacity-50"
          >
            {saving ? 'Saving...' : '💾 Save Changes'}
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 pt-28 pb-12">
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-4xl font-bold mb-2">⚙️ Settings</h1>
          <p className="text-gray-400">Configure your news sources and preferences</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 animate-fade-in-up animate-delay-1">
          {[
            { id: 'social', label: '🔗 Social Accounts', icon: '🔗' },
            { id: 'rss', label: '📡 RSS Feeds', icon: '📡' },
            { id: 'telegram', label: '📱 Telegram', icon: '📱' },
            { id: 'schedule', label: '⏰ Schedule', icon: '⏰' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-5 py-3 rounded-xl font-medium transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'glass text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Social Accounts Tab */}
        {activeTab === 'social' && (
          <div className="space-y-6 animate-fade-in-up">
            <p className="text-gray-400">
              Connect your social accounts to fetch AI-related content from your feeds.
            </p>
            
            <div className="grid gap-4 md:grid-cols-2">
              {socialAccounts.map((account, i) => (
                <div
                  key={account.platform}
                  className="glass-card p-6"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${account.color} flex items-center justify-center text-xl font-bold`}>
                        {account.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold capitalize">{account.platform}</h3>
                        {account.connected && account.username && (
                          <p className="text-sm text-gray-400">@{account.username}</p>
                        )}
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      account.connected
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-gray-700/50 text-gray-400'
                    }`}>
                      {account.connected ? '✓ Connected' : 'Not connected'}
                    </div>
                  </div>
                  
                  <p className="text-gray-400 text-sm mb-4">{account.description}</p>
                  
                  {account.connected ? (
                    <button
                      onClick={() => disconnectSocial(account.platform)}
                      className="w-full py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition"
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button
                      onClick={() => connectSocial(account.platform)}
                      className="btn-glow w-full py-2.5"
                    >
                      Connect {account.platform}
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="glass p-6 border-yellow-500/20">
              <h4 className="font-semibold text-yellow-400 mb-2">⚠️ Developer Credentials Required</h4>
              <p className="text-gray-400 text-sm mb-4">
                To connect social accounts, create developer apps on each platform:
              </p>
              <div className="grid gap-2 text-sm">
                {[
                  { name: 'Twitter', url: 'https://developer.twitter.com' },
                  { name: 'Meta (Threads)', url: 'https://developers.facebook.com' },
                  { name: 'LinkedIn', url: 'https://www.linkedin.com/developers' },
                  { name: 'Reddit', url: 'https://www.reddit.com/prefs/apps' },
                ].map(item => (
                  <a
                    key={item.name}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition"
                  >
                    <span>→</span> {item.name}
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* RSS Feeds Tab */}
        {activeTab === 'rss' && (
          <div className="space-y-6 animate-fade-in-up">
            <p className="text-gray-400">
              Manage RSS feeds to fetch AI news from blogs and publications.
            </p>

            {/* Add new feed */}
            <div className="glass p-6">
              <h3 className="font-semibold mb-4">➕ Add Custom Feed</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Feed name"
                  value={newFeedName}
                  onChange={e => setNewFeedName(e.target.value)}
                  className="input-glass flex-1"
                />
                <input
                  type="url"
                  placeholder="RSS feed URL"
                  value={newFeedUrl}
                  onChange={e => setNewFeedUrl(e.target.value)}
                  className="input-glass flex-[2]"
                />
                <button
                  onClick={addRSSFeed}
                  className="btn-glow px-6 whitespace-nowrap"
                >
                  Add Feed
                </button>
              </div>
            </div>

            {/* Feed list */}
            <div className="glass overflow-hidden">
              <div className="grid grid-cols-[1fr,2fr,80px] gap-4 p-4 border-b border-white/5 text-gray-400 text-sm font-medium">
                <span>Name</span>
                <span>URL</span>
                <span>Enabled</span>
              </div>
              <div className="divide-y divide-white/5 max-h-96 overflow-y-auto">
                {(settings?.rssFeeds || []).map((feed, i) => (
                  <div 
                    key={i} 
                    className="grid grid-cols-[1fr,2fr,80px] gap-4 p-4 items-center hover:bg-white/5 transition"
                  >
                    <span className="font-medium truncate">{feed.name}</span>
                    <span className="text-gray-400 text-sm truncate">{feed.url}</span>
                    <button
                      onClick={() => toggleFeed(feed.url, !feed.enabled)}
                      className={`toggle ${feed.enabled ? 'active' : ''}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Telegram Tab */}
        {activeTab === 'telegram' && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="glass p-6">
              <h3 className="font-semibold mb-6">📱 Telegram Bot Configuration</h3>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Bot Token</label>
                  <input
                    type="password"
                    value={settings?.telegram.botToken || ''}
                    onChange={e => setSettings(s => s ? {...s, telegram: {...s.telegram, botToken: e.target.value}} : null)}
                    placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                    className="input-glass"
                  />
                  <p className="text-xs text-gray-500 mt-1">Get this from @BotFather on Telegram</p>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Chat ID</label>
                  <input
                    type="text"
                    value={settings?.telegram.chatId || ''}
                    onChange={e => setSettings(s => s ? {...s, telegram: {...s.telegram, chatId: e.target.value}} : null)}
                    placeholder="1234567890"
                    className="input-glass"
                  />
                  <p className="text-xs text-gray-500 mt-1">Your Telegram user ID or group chat ID</p>
                </div>

                <div className={`p-4 rounded-xl ${
                  settings?.telegram.connected 
                    ? 'bg-green-500/10 border border-green-500/20' 
                    : 'bg-red-500/10 border border-red-500/20'
                }`}>
                  <div className="flex items-center gap-2">
                    <span>{settings?.telegram.connected ? '✅' : '❌'}</span>
                    <span className={settings?.telegram.connected ? 'text-green-400' : 'text-red-400'}>
                      {settings?.telegram.connected ? 'Bot is connected and working' : 'Bot is not connected'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={async () => {
                    const res = await fetch('/api/telegram', { method: 'POST' });
                    const data = await res.json();
                    alert(data.success ? 'Test message sent! Check your Telegram.' : 'Failed: ' + data.error);
                  }}
                  className="btn-secondary"
                >
                  📤 Send Test Message
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="glass p-6">
              <h3 className="font-semibold mb-6">⏰ Fetch & Digest Schedule</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Update Frequency</label>
                  <select
                    value={settings?.schedule.fetchCron || '0 */3 * * *'}
                    onChange={e => setSettings(s => s ? {...s, schedule: {...s.schedule, fetchCron: e.target.value}} : null)}
                    className="input-glass"
                  >
                    <option value="0 * * * *">Every hour</option>
                    <option value="0 */2 * * *">Every 2 hours</option>
                    <option value="0 */3 * * *">Every 3 hours</option>
                    <option value="0 */4 * * *">Every 4 hours</option>
                    <option value="0 */6 * * *">Every 6 hours</option>
                    <option value="0 9 * * *">Once daily at 9 AM</option>
                  </select>
                </div>

                <div className="p-4 rounded-xl bg-white/5">
                  <h4 className="font-medium mb-3">📅 Current Schedule</h4>
                  <p className="text-gray-400 text-sm">
                    Updates at: <span className="text-white">1am, 4am, 7am, 10am, 1pm, 4pm, 7pm, 10pm</span>
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    Telegram digests: <span className="text-white">5 minutes after each update</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="glass p-6">
              <h3 className="font-semibold mb-4">🔧 Manual Actions</h3>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={async () => {
                    const res = await fetch('/api/fetch', { method: 'POST' });
                    const data = await res.json();
                    alert(data.success ? 'Fetch started!' : 'Failed: ' + data.error);
                  }}
                  className="btn-glow"
                >
                  🔄 Fetch Now
                </button>
                <button
                  onClick={async () => {
                    const res = await fetch('/api/digest', { method: 'POST' });
                    const data = await res.json();
                    alert(data.success ? 'Digest sent!' : 'Failed: ' + data.error);
                  }}
                  className="btn-secondary"
                >
                  📨 Send Digest Now
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
