export interface IAIService {
  generateResponse(prompt: string): Promise<string>;
}
