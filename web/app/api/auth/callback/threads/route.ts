import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';

const CONFIG_FILE = path.join(process.cwd(), '..', 'data', 'config.json');

function updateConfig(updates: any) {
  let config = {};
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
    }
  } catch (error) {}
  
  config = { ...config, ...updates };
  
  const dir = path.dirname(CONFIG_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  
  if (error) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/settings?error=${error}`);
  }
  
  const cookieStore = await cookies();
  const savedState = cookieStore.get('threads_oauth_state')?.value;
  
  if (state !== savedState) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/settings?error=invalid_state`);
  }
  
  try {
    // Exchange code for token (Threads API)
    const tokenResponse = await fetch('https://graph.threads.net/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.META_APP_ID!,
        client_secret: process.env.META_APP_SECRET!,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/auth/callback/threads`,
        code: code!
      })
    });
    
    const tokens = await tokenResponse.json();
    
    if (tokens.access_token) {
      // Get long-lived token
      const longLivedResponse = await fetch(`https://graph.threads.net/access_token?grant_type=th_exchange_token&client_secret=${process.env.META_APP_SECRET}&access_token=${tokens.access_token}`);
      const longLivedTokens = await longLivedResponse.json();
      
      // Get user info
      const userResponse = await fetch(`https://graph.threads.net/me?fields=id,username&access_token=${longLivedTokens.access_token || tokens.access_token}`);
      const userData = await userResponse.json();
      
      // Save to config
      updateConfig({
        threads: {
          accessToken: longLivedTokens.access_token || tokens.access_token,
          userId: userData.id,
          username: userData.username,
          connected: true
        }
      });
      
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/settings?success=threads`);
    } else {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/settings?error=token_failed`);
    }
  } catch (error) {
    console.error('Threads OAuth error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/settings?error=oauth_failed`);
  }
}
