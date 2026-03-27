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
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
