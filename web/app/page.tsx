'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen">
      <div className="animated-bg" />
      
      {/* Floating particles */}
      <div className="particles">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 15}s`,
              animationDuration: `${15 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      {/* Navbar */}
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl">
              ⚡
            </div>
            <span className="text-xl font-bold">ZappNews.ai</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-gray-300 hover:text-white transition px-4 py-2">
              Sign In
            </Link>
            <Link href="/signup" className="btn-glow text-sm px-6 py-3">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="max-w-6xl mx-auto text-center">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm text-gray-300">Powered by AI • Updated every 3 hours</span>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight animate-fade-in-up animate-delay-1">
            Your AI News
            <br />
            <span className="gradient-text">Delivered Fresh</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-12 animate-fade-in-up animate-delay-2">
            Stay ahead with curated AI news from Twitter, LinkedIn, Hacker News, and top tech blogs.
            Summarized by AI, delivered to your Telegram.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animate-delay-3">
            <Link href="/signup" className="btn-glow text-lg px-8 py-4 w-full sm:w-auto">
              Start Free Trial ✨
            </Link>
            <Link href="/feed" className="btn-secondary text-lg px-8 py-4 w-full sm:w-auto">
              View Demo Feed →
            </Link>
          </div>

          {/* Feature cards floating */}
          <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up animate-delay-4">
            {[
              { icon: '🐦', title: 'Twitter/X', desc: 'AI influencer tweets' },
              { icon: '💼', title: 'LinkedIn', desc: 'Industry updates' },
              { icon: '🔥', title: 'Hacker News', desc: 'Tech discussions' },
            ].map((item, i) => (
              <div
                key={i}
                className={`glass-card p-6 ${i === 1 ? 'float' : 'float-delayed'}`}
              >
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="text-xl text-gray-400 text-center mb-16 max-w-2xl mx-auto">
            Simple, automated, and intelligent news curation
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                num: '01',
                title: 'Connect Sources',
                desc: 'Link your Twitter, LinkedIn, and add custom RSS feeds to personalize your news stream.',
                icon: '🔗'
              },
              {
                num: '02',
                title: 'AI Summarizes',
                desc: 'Our AI reads and summarizes content every 3 hours, extracting key insights.',
                icon: '🤖'
              },
              {
                num: '03',
                title: 'Get Notified',
                desc: 'Receive curated digests on Telegram with smart CTAs and save options.',
                icon: '📱'
              }
            ].map((step, i) => (
              <div key={i} className="glass-card p-8 relative overflow-hidden group">
                <div className="absolute -top-6 -right-6 text-8xl font-bold text-white/5 group-hover:text-white/10 transition">
                  {step.num}
                </div>
                <div className="text-4xl mb-6">{step.icon}</div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-gray-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sources showcase */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent" />
        <div className="max-w-6xl mx-auto relative">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            All Your <span className="gradient-text-2">Sources</span> In One Place
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { name: 'Twitter/X', icon: '𝕏', color: 'from-gray-700 to-black' },
              { name: 'LinkedIn', icon: 'in', color: 'from-blue-600 to-blue-800' },
              { name: 'Hacker News', icon: 'Y', color: 'from-orange-500 to-orange-700' },
              { name: 'Reddit', icon: '🤖', color: 'from-orange-600 to-red-600' },
              { name: 'Threads', icon: '@', color: 'from-purple-500 to-pink-500' },
              { name: 'OpenAI', icon: '◯', color: 'from-emerald-500 to-teal-600' },
              { name: 'Anthropic', icon: 'A', color: 'from-amber-500 to-orange-500' },
              { name: 'TechCrunch', icon: 'TC', color: 'from-green-500 to-emerald-600' },
              { name: 'Wired', icon: 'W', color: 'from-gray-600 to-gray-800' },
              { name: 'The Verge', icon: 'V', color: 'from-pink-500 to-rose-600' },
              { name: 'VentureBeat', icon: 'VB', color: 'from-red-500 to-pink-600' },
              { name: '+ More', icon: '+', color: 'from-indigo-500 to-purple-600' },
            ].map((source, i) => (
              <div
                key={i}
                className="glass-card p-4 text-center hover:scale-105 transition cursor-pointer"
              >
                <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${source.color} flex items-center justify-center text-xl font-bold`}>
                  {source.icon}
                </div>
                <p className="text-sm font-medium text-gray-300">{source.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="glass p-12 md:p-16 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-600/20 to-pink-600/20" />
            <div className="relative">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to Stay <span className="gradient-text">Informed</span>?
              </h2>
              <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
                Join thousands of AI enthusiasts getting curated news delivered fresh.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/signup" className="btn-glow text-lg px-10 py-4">
                  Get Started Free
                </Link>
                <p className="text-gray-400 text-sm">No credit card required</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              ⚡
            </div>
            <span className="font-semibold">ZappNews.ai</span>
          </div>
          <p className="text-gray-500 text-sm">
            © 2024 ZappNews.ai. Built with ❤️ for AI enthusiasts.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-gray-400 hover:text-white transition">Privacy</a>
            <a href="#" className="text-gray-400 hover:text-white transition">Terms</a>
            <a href="https://t.me/zappnewsai_bot" className="text-gray-400 hover:text-white transition">Telegram</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
