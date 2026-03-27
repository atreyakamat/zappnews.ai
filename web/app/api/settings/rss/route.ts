import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const CONFIG_FILE = path.join(process.cwd(), '..', 'data', 'config.json');

function getConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
    }
  } catch (error) {
    console.error('Error reading config:', error);
  }
  return { rssFeeds: [] };
}

function saveConfig(config: any) {
  const dir = path.dirname(CONFIG_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

export async function POST(request: Request) {
  try {
    const { url, name, category = 'custom' } = await request.json();
    const config = getConfig();
    
    if (!config.rssFeeds) {
      config.rssFeeds = [];
    }
    
    // Check if feed already exists
    if (config.rssFeeds.some((f: any) => f.url === url)) {
      return NextResponse.json({ success: false, error: 'Feed already exists' }, { status: 400 });
    }
    
    config.rssFeeds.push({ name, url, enabled: true, category });
    saveConfig(config);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { url, enabled } = await request.json();
    const config = getConfig();
    
    const feed = config.rssFeeds?.find((f: any) => f.url === url);
    if (feed) {
      feed.enabled = enabled;
      saveConfig(config);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { url } = await request.json();
    const config = getConfig();
    
    config.rssFeeds = config.rssFeeds?.filter((f: any) => f.url !== url) || [];
    saveConfig(config);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
