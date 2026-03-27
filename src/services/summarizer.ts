import axios from 'axios';
import OpenAI from 'openai';
import { config } from '../config/index.js';
import { Item, SummaryResult, TagType } from '../types/index.js';
import { logger } from './logger.js';

const SYSTEM_PROMPT = `You are a concise AI news curator. Given a post or article title and content, output a JSON object with exactly these fields:

1. "summary": A 2-sentence summary for a developer audience. Be specific about what the tool/paper/project does. No hype or marketing speak.
2. "tag": One of exactly: "tool", "paper", "project", "tutorial", "opinion"
3. "cta": A one-line call-to-action like "Try it: [specific action]" or "Read: [what to learn]"

Respond ONLY with valid JSON, no markdown or explanation.

Example output:
{"summary": "Anthropic released Claude 3.5 Sonnet with improved coding abilities and 200K context window. It outperforms GPT-4 on several benchmarks while being faster and cheaper.", "tag": "tool", "cta": "Try it: Test Claude 3.5 on a complex coding task at claude.ai"}`;

// OpenRouter client
async function summarizeWithOpenRouter(item: Item): Promise<SummaryResult | null> {
  try {
    const userContent = `Title: ${item.title}\n\nContent: ${item.raw_text?.slice(0, 1500) || 'No content available'}\n\nSource: ${item.source}`;
    
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: config.OPENROUTER_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userContent }
        ],
        temperature: 0.3,
        max_tokens: 300
      },
      {
        headers: {
          'Authorization': `Bearer ${config.OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://zappnews.ai',
          'X-Title': 'ZappNews.ai',
          'Content-Type': 'application/json'
        }
      }
    );
    
    const content = response.data.choices[0]?.message?.content;
    
    if (!content) {
      logger.error('No content in OpenRouter response');
      return null;
    }
    
    // Parse JSON from response (handle potential markdown code blocks)
    let jsonStr = content;
    if (content.includes('```')) {
      jsonStr = content.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    }
    
    const parsed = JSON.parse(jsonStr);
    
    const validTags: TagType[] = ['tool', 'paper', 'project', 'tutorial', 'opinion'];
    const tag = validTags.includes(parsed.tag) ? parsed.tag : 'opinion';
    
    return {
      summary: parsed.summary || 'No summary available',
      tag,
      cta: parsed.cta || 'Check it out'
    };
  } catch (error) {
    logger.error(`Error with OpenRouter for item ${item.id}:`, error);
    return null;
  }
}

// OpenAI client
async function summarizeWithOpenAI(item: Item): Promise<SummaryResult | null> {
  try {
    const openai = new OpenAI({ apiKey: config.OPENAI_API_KEY });
    
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
      logger.error('No content in OpenAI response');
      return null;
    }
    
    const parsed = JSON.parse(content);
    
    const validTags: TagType[] = ['tool', 'paper', 'project', 'tutorial', 'opinion'];
    const tag = validTags.includes(parsed.tag) ? parsed.tag : 'opinion';
    
    return {
      summary: parsed.summary || 'No summary available',
      tag,
      cta: parsed.cta || 'Check it out'
    };
  } catch (error) {
    logger.error(`Error with OpenAI for item ${item.id}:`, error);
    return null;
  }
}

export async function summarizeItem(item: Item): Promise<SummaryResult | null> {
  if (config.LLM_PROVIDER === 'openrouter') {
    return summarizeWithOpenRouter(item);
  } else {
    return summarizeWithOpenAI(item);
  }
}

export async function summarizeItems(items: Item[]): Promise<Map<string, SummaryResult>> {
  const results = new Map<string, SummaryResult>();
  
  logger.info(`Summarizing ${items.length} items using ${config.LLM_PROVIDER}...`);
  
  // Process one at a time for free tier rate limits
  for (const item of items) {
    const result = await summarizeItem(item);
    if (result) {
      results.set(item.id, result);
      logger.debug(`Summarized: ${item.title.slice(0, 50)}...`);
    }
    
    // Delay between requests to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  logger.info(`Summarized ${results.size} of ${items.length} items`);
  
  return results;
}
