export interface IInitializeSubscriptionUsecase {
    execute(userId: string): Promise<void>;
}
