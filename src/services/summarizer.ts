import axios from 'axios';
import OpenAI from 'openai';
import { config } from '../config/index.js';
import { Item, SummaryResult, TagType } from '../types/index.js';
import { logger } from './logger.js';

const SYSTEM_PROMPT = `You are a concise AI news curator. You will receive multiple news items. For EACH item, output a JSON object with these fields:

1. "id": The item ID provided
2. "summary": A 2-sentence summary for developers. Be specific, no hype.
3. "tag": One of: "tool", "paper", "project", "tutorial", "opinion"
4. "cta": A one-line call-to-action like "Try it: [action]" or "Read: [topic]"

Output a JSON array of objects. Example:
[
  {"id": "abc123", "summary": "New AI tool released...", "tag": "tool", "cta": "Try it: Install via npm"},
  {"id": "def456", "summary": "Research paper shows...", "tag": "paper", "cta": "Read: Key findings on page 5"}
]

Respond ONLY with valid JSON array, no markdown.`;

// BATCH summarize ALL items in ONE request (saves API calls!)
async function batchSummarizeWithOpenRouter(items: Item[]): Promise<Map<string, SummaryResult>> {
  const results = new Map<string, SummaryResult>();
  
  if (items.length === 0) return results;
  
  try {
    // Format all items for one batch request
    const itemsList = items.map((item, i) => 
      `[Item ${i + 1}] ID: ${item.id}\nTitle: ${item.title}\nContent: ${item.raw_text?.slice(0, 500) || 'No content'}\nSource: ${item.source}`
    ).join('\n\n---\n\n');
    
    const userContent = `Summarize these ${items.length} AI news items:\n\n${itemsList}`;
    
    logger.info(`🔄 Making ONE OpenRouter request for ${items.length} items...`);
    
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: config.OPENROUTER_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userContent }
        ],
        temperature: 0.3,
        max_tokens: 4000
      },
      {
        headers: {
          'Authorization': `Bearer ${config.OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://zappnews.ai',
          'X-Title': 'ZappNews.ai',
          'Content-Type': 'application/json'
        },
        timeout: 120000 // 2 minute timeout
      }
    );
    
    logger.debug('OpenRouter response received');
    
    const content = response.data?.choices?.[0]?.message?.content;
    
    if (!content) {
      logger.error('No content in OpenRouter response. Full response:', JSON.stringify(response.data, null, 2));
      return results;
    }
    
    logger.debug(`Got content (${content.length} chars)`);
    
    // Parse JSON from response
    let jsonStr = content;
    if (content.includes('```')) {
      jsonStr = content.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    }
    
    const parsed = JSON.parse(jsonStr);
    const summaries = Array.isArray(parsed) ? parsed : [parsed];
    
    const validTags: TagType[] = ['tool', 'paper', 'project', 'tutorial', 'opinion'];
    
    for (const summary of summaries) {
      if (summary.id) {
        results.set(summary.id, {
          summary: summary.summary || 'No summary available',
          tag: validTags.includes(summary.tag) ? summary.tag : 'opinion',
          cta: summary.cta || 'Check it out'
        });
      }
    }
    
    logger.info(`✅ Got ${results.size} summaries from ONE API request`);
    
  } catch (error: any) {
    logger.error('Error with batch OpenRouter request:', error.response?.data || error.message);
  }
  
  return results;
}

// OpenAI batch summarizer (fallback)
async function batchSummarizeWithOpenAI(items: Item[]): Promise<Map<string, SummaryResult>> {
  const results = new Map<string, SummaryResult>();
  
  if (items.length === 0) return results;
  
  try {
    const openai = new OpenAI({ apiKey: config.OPENAI_API_KEY });
    
    const itemsList = items.map((item, i) => 
      `[Item ${i + 1}] ID: ${item.id}\nTitle: ${item.title}\nContent: ${item.raw_text?.slice(0, 500) || 'No content'}\nSource: ${item.source}`
    ).join('\n\n---\n\n');
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Summarize these ${items.length} AI news items:\n\n${itemsList}` }
      ],
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    });
    
    const content = response.choices[0]?.message?.content;
    if (!content) return results;
    
    const parsed = JSON.parse(content);
    const summaries = Array.isArray(parsed) ? parsed : (parsed.items || [parsed]);
    
    const validTags: TagType[] = ['tool', 'paper', 'project', 'tutorial', 'opinion'];
    
    for (const summary of summaries) {
      if (summary.id) {
        results.set(summary.id, {
          summary: summary.summary || 'No summary available',
          tag: validTags.includes(summary.tag) ? summary.tag : 'opinion',
          cta: summary.cta || 'Check it out'
        });
      }
    }
  } catch (error) {
    logger.error('Error with OpenAI batch:', error);
  }
  
  return results;
}

// Single item summarizer (for backwards compatibility)
export async function summarizeItem(item: Item): Promise<SummaryResult | null> {
  const results = await summarizeItems([item]);
  return results.get(item.id) || null;
}

// Main batch summarizer - ONE request for all items!
export async function summarizeItems(items: Item[]): Promise<Map<string, SummaryResult>> {
  logger.info(`📝 Batch summarizing ${items.length} items using ${config.LLM_PROVIDER}...`);
  
  if (config.LLM_PROVIDER === 'openrouter') {
    return batchSummarizeWithOpenRouter(items);
  } else {
    return batchSummarizeWithOpenAI(items);
  }
}
