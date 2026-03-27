import { NextResponse } from 'next/server';

// Threads/Instagram OAuth (via Meta/Facebook)
// Requires: META_APP_ID, META_APP_SECRET from https://developers.facebook.com

export async function GET() {
  const appId = process.env.META_APP_ID;
  
  if (!appId) {
    return NextResponse.json({ 
      error: 'Threads/Meta not configured', 
      setup: 'Add META_APP_ID and META_APP_SECRET to your .env file',
      docs: 'https://developers.facebook.com/docs/threads',
      note: 'Threads API is available via Instagram Graph API'
    }, { status: 400 });
  }
  
  const state = Math.random().toString(36).substring(7);
  
  // Note: Threads uses Instagram's OAuth flow
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/auth/callback/threads`,
    scope: 'threads_basic,threads_content_publish',
    response_type: 'code',
    state: state
  });
  
  const response = NextResponse.redirect(`https://threads.net/oauth/authorize?${params}`);
  response.cookies.set('threads_oauth_state', state, { httpOnly: true, maxAge: 600 });
  
  return response;
}
