import { NextResponse } from 'next/server';

// LinkedIn OAuth 2.0
// Requires: LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET from https://www.linkedin.com/developers

export async function GET() {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  
  if (!clientId) {
    return NextResponse.json({ 
      error: 'LinkedIn not configured', 
      setup: 'Add LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET to your .env file',
      docs: 'https://www.linkedin.com/developers/apps'
    }, { status: 400 });
  }
  
  const state = Math.random().toString(36).substring(7);
  
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/auth/callback/linkedin`,
    scope: 'r_liteprofile r_emailaddress',
    state: state
  });
  
  const response = NextResponse.redirect(`https://www.linkedin.com/oauth/v2/authorization?${params}`);
  response.cookies.set('linkedin_oauth_state', state, { httpOnly: true, maxAge: 600 });
  
  return response;
}
