import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create client only if credentials are available
const createSupabaseClient = (): SupabaseClient | null => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not configured');
    return null;
  }
  return createClient(supabaseUrl, supabaseAnonKey);
};

export const supabase = createSupabaseClient();

export interface SavedItemView {
  saved_id: string;
  status: 'unread' | 'tried' | 'done';
  saved_at: string;
  notes: string | null;
  user_id: string;
  title: string;
  url: string;
  source: string;
  summary: string;
  tag: string;
  cta: string;
}

export async function getSavedItems(status?: string): Promise<SavedItemView[]> {
  if (!supabase) return [];
  
  let query = supabase
    .from('saved_items_view')
    .select('*')
    .order('saved_at', { ascending: false });
  
  if (status && status !== 'all') {
    query = query.eq('status', status);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching saved items:', error);
    return [];
  }
  
  return data || [];
}

export async function updateItemStatus(savedId: string, status: string): Promise<boolean> {
  if (!supabase) return false;
  
  const { error } = await supabase
    .from('saved')
    .update({ status })
    .eq('id', savedId);
  
  if (error) {
    console.error('Error updating item status:', error);
    return false;
  }
  
  return true;
}

export async function deleteItem(savedId: string): Promise<boolean> {
  if (!supabase) return false;
  
  const { error } = await supabase
    .from('saved')
    .delete()
    .eq('id', savedId);
  
  if (error) {
    console.error('Error deleting item:', error);
    return false;
  }
  
  return true;
}
