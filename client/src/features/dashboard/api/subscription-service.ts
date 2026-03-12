import { API_ROUTES } from "../../../config/env";
import { ProTimeBackend as api } from "../../../api/instance";

export interface SubscriptionResponse {
    id: string;
    status: string;
    plan: string;
    daysRemaining: number;
    isPremium: boolean;
    currentPeriodEnd: string | null;
}

export const subscriptionService = {
    getSubscription: async (): Promise<SubscriptionResponse> => {
        const response = await api.get(API_ROUTES.SUBSCRIPTION);
        return response.data.data;
    },

    createCheckoutSession: async (plan: string, successUrl: string, cancelUrl: string): Promise<{ sessionUrl: string }> => {
        const response = await api.post(API_ROUTES.SUBSCRIPTION_CHECKOUT, { plan, successUrl, cancelUrl });
        return response.data.data;
    }
};
