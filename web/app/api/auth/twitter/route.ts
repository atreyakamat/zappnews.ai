import { NextResponse } from 'next/server';
import { redirect } from 'next/navigation';

// Twitter OAuth 2.0 with PKCE
// Requires: TWITTER_CLIENT_ID, TWITTER_CLIENT_SECRET from https://developer.twitter.com

export async function GET() {
  const clientId = process.env.TWITTER_CLIENT_ID;
  
  if (!clientId) {
    return NextResponse.json({ 
      error: 'Twitter not configured', 
      setup: 'Add TWITTER_CLIENT_ID and TWITTER_CLIENT_SECRET to your .env file',
      docs: 'https://developer.twitter.com/en/portal/projects-and-apps'
    }, { status: 400 });
  }
  
  const state = Math.random().toString(36).substring(7);
  const codeChallenge = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
  
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/auth/callback/twitter`,
    scope: 'tweet.read users.read offline.access',
    state: state,
    code_challenge: codeChallenge,
    code_challenge_method: 'plain'
  });
  
  // Store state in cookie for verification
  const response = NextResponse.redirect(`https://twitter.com/i/oauth2/authorize?${params}`);
  response.cookies.set('twitter_oauth_state', state, { httpOnly: true, maxAge: 600 });
  response.cookies.set('twitter_code_verifier', codeChallenge, { httpOnly: true, maxAge: 600 });
  
  return response;
}
