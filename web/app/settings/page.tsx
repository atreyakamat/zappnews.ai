'use client';

import { useState, useEffect } from 'react';

interface SocialAccount {
  platform: string;
  connected: boolean;
  username?: string;
  icon: string;
  color: string;
  description: string;
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
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newFeedUrl, setNewFeedUrl] = useState('');
  const [newFeedName, setNewFeedName] = useState('');
  const [activeTab, setActiveTab] = useState<'social' | 'rss' | 'telegram' | 'schedule'>('social');

  useEffect(() => {
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
    // Redirect to OAuth flow
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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading settings...</div>
      </div>
    );
  }

  const socialAccounts: SocialAccount[] = [
    {
      platform: 'twitter',
      connected: settings?.socialAccounts?.find(a => a.platform === 'twitter')?.connected || false,
      username: settings?.socialAccounts?.find(a => a.platform === 'twitter')?.username,
      icon: '𝕏',
      color: 'bg-black',
      description: 'Fetch AI tweets from your timeline and lists'
    },
    {
      platform: 'threads',
      connected: settings?.socialAccounts?.find(a => a.platform === 'threads')?.connected || false,
      username: settings?.socialAccounts?.find(a => a.platform === 'threads')?.username,
      icon: '🧵',
      color: 'bg-gradient-to-r from-purple-500 to-pink-500',
      description: 'Fetch AI-related Threads posts'
    },
    {
      platform: 'linkedin',
      connected: settings?.socialAccounts?.find(a => a.platform === 'linkedin')?.connected || false,
      username: settings?.socialAccounts?.find(a => a.platform === 'linkedin')?.username,
      icon: 'in',
      color: 'bg-blue-700',
      description: 'Fetch AI posts from your LinkedIn feed'
    },
    {
      platform: 'reddit',
      connected: settings?.socialAccounts?.find(a => a.platform === 'reddit')?.connected || false,
      username: settings?.socialAccounts?.find(a => a.platform === 'reddit')?.username,
      icon: '🤖',
      color: 'bg-orange-600',
      description: 'Fetch posts from AI subreddits'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="text-gray-400 hover:text-white">← Back</a>
            <h1 className="text-2xl font-bold">⚙️ Settings</h1>
          </div>
          <button
            onClick={saveSettings}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-700 pb-4">
          {[
            { id: 'social', label: '🔗 Social Accounts' },
            { id: 'rss', label: '📡 RSS Feeds' },
            { id: 'telegram', label: '📱 Telegram' },
            { id: 'schedule', label: '⏰ Schedule' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Social Accounts Tab */}
        {activeTab === 'social' && (
          <div className="space-y-4">
            <p className="text-gray-400 mb-6">
              Connect your social accounts to fetch AI-related content from your feeds.
            </p>
            
            <div className="grid gap-4 md:grid-cols-2">
              {socialAccounts.map(account => (
                <div
                  key={account.platform}
                  className="bg-gray-800 rounded-xl p-6 border border-gray-700"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 ${account.color} rounded-xl flex items-center justify-center text-xl font-bold`}>
                        {account.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold capitalize">{account.platform}</h3>
                        {account.connected && account.username && (
                          <p className="text-sm text-gray-400">@{account.username}</p>
                        )}
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm ${
                      account.connected
                        ? 'bg-green-900 text-green-300'
                        : 'bg-gray-700 text-gray-400'
                    }`}>
                      {account.connected ? '✓ Connected' : 'Not connected'}
                    </div>
                  </div>
                  
                  <p className="text-gray-400 text-sm mb-4">{account.description}</p>
                  
                  {account.connected ? (
                    <button
                      onClick={() => disconnectSocial(account.platform)}
                      className="w-full bg-red-900 hover:bg-red-800 text-red-300 py-2 rounded-lg transition"
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button
                      onClick={() => connectSocial(account.platform)}
                      className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg transition"
                    >
                      Connect {account.platform}
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 bg-yellow-900/30 border border-yellow-700 rounded-xl p-4">
              <h4 className="font-semibold text-yellow-300 mb-2">⚠️ Developer Credentials Required</h4>
              <p className="text-yellow-200/80 text-sm">
                To connect social accounts, you need to create developer apps on each platform:
              </p>
              <ul className="text-yellow-200/80 text-sm mt-2 space-y-1 list-disc list-inside">
                <li><a href="https://developer.twitter.com" target="_blank" className="underline">Twitter Developer Portal</a> - Create an app with OAuth 2.0</li>
                <li><a href="https://developers.facebook.com" target="_blank" className="underline">Meta for Developers</a> - For Threads (Instagram API)</li>
                <li><a href="https://www.linkedin.com/developers" target="_blank" className="underline">LinkedIn Developer Portal</a> - Create an app with Sign In</li>
                <li><a href="https://www.reddit.com/prefs/apps" target="_blank" className="underline">Reddit Apps</a> - Create a script or web app</li>
              </ul>
            </div>
          </div>
        )}

        {/* RSS Feeds Tab */}
        {activeTab === 'rss' && (
          <div className="space-y-6">
            <p className="text-gray-400">
              Manage RSS feeds to fetch AI news from blogs and publications.
            </p>

            {/* Add new feed */}
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <h3 className="font-semibold mb-4">➕ Add Custom Feed</h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Feed name"
                  value={newFeedName}
                  onChange={e => setNewFeedName(e.target.value)}
                  className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400"
                />
                <input
                  type="url"
                  placeholder="RSS feed URL"
                  value={newFeedUrl}
                  onChange={e => setNewFeedUrl(e.target.value)}
                  className="flex-2 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400"
                />
                <button
                  onClick={addRSSFeed}
                  className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg font-medium"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Feed list */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              <div className="grid grid-cols-[1fr,2fr,auto] gap-4 p-4 border-b border-gray-700 text-gray-400 text-sm font-medium">
                <span>Name</span>
                <span>URL</span>
                <span>Enabled</span>
              </div>
              <div className="divide-y divide-gray-700 max-h-96 overflow-y-auto">
                {(settings?.rssFeeds || []).map((feed, i) => (
                  <div key={i} className="grid grid-cols-[1fr,2fr,auto] gap-4 p-4 items-center hover:bg-gray-700/50">
                    <span className="font-medium">{feed.name}</span>
                    <span className="text-gray-400 text-sm truncate">{feed.url}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={feed.enabled}
                        onChange={e => toggleFeed(feed.url, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Telegram Tab */}
        {activeTab === 'telegram' && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="font-semibold mb-4">📱 Telegram Bot Configuration</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Bot Token</label>
                  <input
                    type="password"
                    value={settings?.telegram.botToken || ''}
                    onChange={e => setSettings(s => s ? {...s, telegram: {...s.telegram, botToken: e.target.value}} : null)}
                    placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500"
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
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Your Telegram user ID or group chat ID</p>
                </div>

                <div className={`p-4 rounded-lg ${settings?.telegram.connected ? 'bg-green-900/30 border border-green-700' : 'bg-red-900/30 border border-red-700'}`}>
                  <div className="flex items-center gap-2">
                    <span>{settings?.telegram.connected ? '✅' : '❌'}</span>
                    <span>{settings?.telegram.connected ? 'Bot is connected and working' : 'Bot is not connected - check your credentials'}</span>
                  </div>
                </div>

                <button
                  onClick={async () => {
                    const res = await fetch('/api/telegram/test', { method: 'POST' });
                    const data = await res.json();
                    alert(data.success ? 'Test message sent!' : 'Failed: ' + data.error);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
                >
                  Send Test Message
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="font-semibold mb-4">⏰ Fetch & Digest Schedule</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Fetch Schedule (Cron)</label>
                  <select
                    value={settings?.schedule.fetchCron || '0 */3 * * *'}
                    onChange={e => setSettings(s => s ? {...s, schedule: {...s.schedule, fetchCron: e.target.value}} : null)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                  >
                    <option value="0 * * * *">Every hour</option>
                    <option value="0 */2 * * *">Every 2 hours</option>
                    <option value="0 */3 * * *">Every 3 hours</option>
                    <option value="0 */4 * * *">Every 4 hours</option>
                    <option value="0 */6 * * *">Every 6 hours</option>
                    <option value="0 */12 * * *">Every 12 hours</option>
                    <option value="0 9 * * *">Once daily at 9 AM</option>
                  </select>
                </div>

                <div className="bg-gray-700/50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Current Schedule</h4>
                  <p className="text-gray-400">
                    Fetching at: <span className="text-white">1am, 4am, 7am, 10am, 1pm, 4pm, 7pm, 10pm</span>
                  </p>
                  <p className="text-gray-400">
                    Digests sent: <span className="text-white">5 minutes after each fetch</span>
                  </p>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Items per digest</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    defaultValue={5}
                    className="w-32 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="font-semibold mb-4">🔧 Manual Actions</h3>
              <div className="flex gap-4">
                <button
                  onClick={async () => {
                    const res = await fetch('/api/fetch', { method: 'POST' });
                    alert((await res.json()).message);
                  }}
                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg"
                >
                  🔄 Fetch Now
                </button>
                <button
                  onClick={async () => {
                    const res = await fetch('/api/digest/daily', { method: 'POST' });
                    alert((await res.json()).message);
                  }}
                  className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg"
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
