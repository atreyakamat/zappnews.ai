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
  const savedState = cookieStore.get('linkedin_oauth_state')?.value;
  
  if (state !== savedState) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/settings?error=invalid_state`);
  }
  
  try {
    // Exchange code for token
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code!,
        client_id: process.env.LINKEDIN_CLIENT_ID!,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/auth/callback/linkedin`
      })
    });
    
    const tokens = await tokenResponse.json();
    
    if (tokens.access_token) {
      // Get user info
      const userResponse = await fetch('https://api.linkedin.com/v2/me', {
        headers: { 'Authorization': `Bearer ${tokens.access_token}` }
      });
      const userData = await userResponse.json();
      
      // Save to config
      updateConfig({
        linkedin: {
          accessToken: tokens.access_token,
          username: userData.localizedFirstName + ' ' + userData.localizedLastName,
          connected: true
        }
      });
      
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/settings?success=linkedin`);
    } else {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/settings?error=token_failed`);
    }
  } catch (error) {
    console.error('LinkedIn OAuth error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/settings?error=oauth_failed`);
  }
}
