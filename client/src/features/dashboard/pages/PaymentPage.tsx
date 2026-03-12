import React, { useState } from 'react';
import { ArrowLeft, Loader2, CreditCard, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../config/env';
import { subscriptionService } from '../api/subscription-service';
import toast from 'react-hot-toast';

export const PaymentPage: React.FC = () => {
    const [loading, setLoading] = useState(false);

    const handlePayment = async () => {
        try {
            setLoading(true);
            const successUrl = `${window.location.origin}${ROUTES.DASHBOARD_SUBSCRIPTION}?success=true`;
            const cancelUrl = `${window.location.origin}${ROUTES.DASHBOARD_SUBSCRIPTION_PLAN}`;

            const { sessionUrl } = await subscriptionService.createCheckoutSession('PREMIUM', successUrl, cancelUrl);
            // Redirect to Stripe Checkout
            window.location.href = sessionUrl;
        } catch (error: any) {
            console.error('Checkout failed', error);
            toast.error(error.response?.data?.message || 'Failed to initiate payment. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto space-y-8 pb-12">
            <Link to={ROUTES.DASHBOARD_SUBSCRIPTION_PLAN} className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
                <ArrowLeft size={16} /><span>Back to Plan Details</span>
            </Link>

            <div className="bg-zinc-900 rounded-3xl p-8 border border-white/10 shadow-2xl space-y-8">
                <div className="text-center space-y-2">
                    <div className="inline-flex p-3 rounded-full bg-green-500/10 text-green-500 mb-2">
                        <ShieldCheck size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Secure Checkout</h1>
                    <p className="text-zinc-500 text-sm">You're one step away from ProTime Premium</p>
                </div>

                <div className="p-4 bg-zinc-800/50 rounded-2xl border border-white/5 space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-zinc-400">Selected Plan</span>
                        <span className="text-white font-bold">ProTime Premium</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-zinc-400">Billing Cycle</span>
                        <span className="text-white">Monthly</span>
                    </div>
                    <div className="h-px bg-white/5 my-2" />
                    <div className="flex justify-between items-center text-lg">
                        <span className="text-white">Total Amount</span>
                        <span className="text-[blueviolet] font-bold text-2xl">₹499.00</span>
                    </div>
                </div>

                <button
                    onClick={handlePayment}
                    disabled={loading}
                    className="w-full bg-[blueviolet] hover:bg-[#7c2ae8] text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-[blueviolet]/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <Loader2 size={20} className="animate-spin" />
                    ) : (
                        <>
                            <CreditCard size={20} />
                            Pay via Stripe
                        </>
                    )}
                </button>

                <div className="space-y-4">
                    <p className="text-center text-xs text-zinc-500">
                        By proceeding, you agree to our Terms of Service and Privacy Policy. Your subscription will automatically renew unless cancelled.
                    </p>
                    <div className="flex justify-center gap-6 grayscale opacity-40">
                        {/* Simple placeholders for card brand logos if needed, or just text */}
                        <span className="text-[10px] text-white font-bold border border-white/20 px-1 rounded">VISA</span>
                        <span className="text-[10px] text-white font-bold border border-white/20 px-1 rounded">MASTERCARD</span>
                        <span className="text-[10px] text-white font-bold border border-white/20 px-1 rounded">AMEX</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
