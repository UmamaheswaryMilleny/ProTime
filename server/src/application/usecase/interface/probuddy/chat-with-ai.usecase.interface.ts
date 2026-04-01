export interface IChatWithAiUsecase {
  execute(userId: string, prompt: string): Promise<string>;
}
