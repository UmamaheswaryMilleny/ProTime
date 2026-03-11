export interface IHandleStripeWebhookUsecase {
  // rawBody must be the raw Buffer — Stripe requires it for signature verification
  // signature is the value of the Stripe-Signature header
  execute(rawBody: Buffer, signature: string): Promise<void>;
}