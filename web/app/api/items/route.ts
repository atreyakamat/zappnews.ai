import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Fetch from backend API
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
    
    // For now, return items from the backend database via API
    // This connects to the main ZappNews backend
    const response = await fetch(`${backendUrl}/api/items`, {
      headers: { 'Content-Type': 'application/json' }
    }).catch(() => null);

    if (response && response.ok) {
      const data = await response.json();
      return NextResponse.json(data);
    }

    // If backend is not available or no items endpoint, read from SQLite directly
    // This is a fallback for the frontend demo
    try {
      const Database = (await import('better-sqlite3')).default;
      const path = await import('path');
      
      const dbPath = path.join(process.cwd(), '..', 'data', 'zappnews.db');
      
      const db = new Database(dbPath, { readonly: true });
      
      const items = db.prepare(`
        SELECT 
          s.id,
          i.title,
          s.summary,
          i.url,
          i.source,
          s.tag,
          s.cta,
          s.created_at
        FROM summaries s
        JOIN items i ON s.item_id = i.id
        ORDER BY s.created_at DESC
        LIMIT 100
      `).all();
      
      db.close();
      
      return NextResponse.json({ items });
    } catch (dbError) {
      // Return empty if database not available
      return NextResponse.json({ items: [] });
    }
  } catch (error) {
    console.error('Error fetching items:', error);
    return NextResponse.json({ items: [], error: String(error) }, { status: 500 });
  }
}
