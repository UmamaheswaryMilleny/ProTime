export interface IMarkAsReadUsecase {
    execute(
        userId: string,
        conversationId: string,
    ): Promise<void>;
}