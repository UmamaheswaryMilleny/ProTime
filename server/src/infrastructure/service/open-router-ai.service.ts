import axios from 'axios';
import { injectable } from 'tsyringe';
import { IAIService } from '../../application/service_interface/ai-service.interface';

@injectable()
export class OpenRouterAIService implements IAIService {
  private readonly apiKey: string;
  private readonly apiUrl: string = 'https://openrouter.ai/api/v1/chat/completions';
  private readonly model: string = 'openrouter/free';

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || '';
    if (!this.apiKey) {
      console.warn('OPENROUTER_API_KEY is not defined in environment variables');
    }
  }

  async generateResponse(prompt: string): Promise<string> {
    try {
      const response = await axios.post(
        this.apiUrl,
        {
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are ProBuddy, a helpful and encouraging productivity assistant. Keep your responses extremely concise, brief, and punchy (1-2 short paragraphs max) to ensure fast replies. Use emojis occasionally.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: 150,
          temperature: 0.6,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://probuddy.com', // Optional, for OpenRouter rankings
            'X-Title': 'ProBuddy', // Optional, for OpenRouter rankings
          },
        }
      );

      const content = response.data?.choices?.[0]?.message?.content;
      if (!content) {
        // Empty response from the model — treat same as a service failure
        throw new Error('AI_SERVICE_UNAVAILABLE');
      }
      return content;
    } catch (error: any) {
      // Re-throw our own sentinel so callers don't have to inspect raw axios errors
      if (error.message === 'AI_SERVICE_UNAVAILABLE') throw error;
      console.error('OpenRouter AI Error:', error.response?.data || error.message);
      throw new Error('AI_SERVICE_UNAVAILABLE');
    }
  }
}
