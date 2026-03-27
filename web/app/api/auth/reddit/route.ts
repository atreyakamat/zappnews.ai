import { NextResponse } from 'next/server';

// Reddit OAuth 2.0
// Requires: REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET from https://www.reddit.com/prefs/apps

export async function GET() {
  const clientId = process.env.REDDIT_CLIENT_ID;
  
  if (!clientId) {
    return NextResponse.json({ 
      error: 'Reddit not configured', 
      setup: 'Add REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET to your .env file',
      docs: 'https://www.reddit.com/prefs/apps'
    }, { status: 400 });
  }
  
  const state = Math.random().toString(36).substring(7);
  
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    state: state,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/auth/callback/reddit`,
    duration: 'permanent',
    scope: 'read mysubreddits'
  });
  
  const response = NextResponse.redirect(`https://www.reddit.com/api/v1/authorize?${params}`);
  response.cookies.set('reddit_oauth_state', state, { httpOnly: true, maxAge: 600 });
  
  return response;
}
