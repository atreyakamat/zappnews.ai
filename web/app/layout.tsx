import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ZappNews.ai - AI News Delivered Fresh',
  description: 'Stay ahead with curated AI news from Twitter, LinkedIn, Hacker News, and top tech blogs. Summarized by AI, delivered to your Telegram.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
