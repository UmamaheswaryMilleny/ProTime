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

      return response.data.choices[0].message.content || 'I apologize, but I am unable to generate a response at the moment.';
    } catch (error: any) {
      console.error('OpenRouter AI Error:', error.response?.data || error.message);
      // Don't leak API details, but provide a clear message for the controller
      throw new Error('AI_SERVICE_UNAVAILABLE');
    }
  }
}
