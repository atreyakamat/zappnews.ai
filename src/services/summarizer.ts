import OpenAI from 'openai';
import { config } from '../config/index.js';
import { Item, SummaryResult, TagType } from '../types/index.js';
import { logger } from './logger.js';

const openai = new OpenAI({
  apiKey: config.OPENAI_API_KEY
});

const SYSTEM_PROMPT = `You are a concise AI news curator. Given a post or article title and content, output a JSON object with exactly these fields:

1. "summary": A 2-sentence summary for a developer audience. Be specific about what the tool/paper/project does. No hype or marketing speak.
2. "tag": One of exactly: "tool", "paper", "project", "tutorial", "opinion"
3. "cta": A one-line call-to-action like "Try it: [specific action]" or "Read: [what to learn]"

Respond ONLY with valid JSON, no markdown or explanation.

Example output:
{"summary": "Anthropic released Claude 3.5 Sonnet with improved coding abilities and 200K context window. It outperforms GPT-4 on several benchmarks while being faster and cheaper.", "tag": "tool", "cta": "Try it: Test Claude 3.5 on a complex coding task at claude.ai"}`;

export async function summarizeItem(item: Item): Promise<SummaryResult | null> {
  try {
    const userContent = `Title: ${item.title}\n\nContent: ${item.raw_text?.slice(0, 2000) || 'No content available'}\n\nSource: ${item.source}`;
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userContent }
      ],
      temperature: 0.3,
      max_tokens: 300,
      response_format: { type: 'json_object' }
    });
    
    const content = response.choices[0]?.message?.content;
    
    if (!content) {
      logger.error('No content in LLM response');
      return null;
    }
    
    const parsed = JSON.parse(content);
    
    // Validate tag
    const validTags: TagType[] = ['tool', 'paper', 'project', 'tutorial', 'opinion'];
    const tag = validTags.includes(parsed.tag) ? parsed.tag : 'opinion';
    
    return {
      summary: parsed.summary || 'No summary available',
      tag,
      cta: parsed.cta || 'Check it out'
    };
  } catch (error) {
    logger.error(`Error summarizing item ${item.id}:`, error);
    return null;
  }
}

export async function summarizeItems(items: Item[]): Promise<Map<string, SummaryResult>> {
  const results = new Map<string, SummaryResult>();
  
  // Process in batches to avoid rate limits
  const batchSize = 5;
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    
    const batchResults = await Promise.all(
      batch.map(async (item) => {
        const result = await summarizeItem(item);
        return { itemId: item.id, result };
      })
    );
    
    for (const { itemId, result } of batchResults) {
      if (result) {
        results.set(itemId, result);
      }
    }
    
    // Small delay between batches to respect rate limits
    if (i + batchSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  logger.info(`Summarized ${results.size} of ${items.length} items`);
  
  return results;
}
