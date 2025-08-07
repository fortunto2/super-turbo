import type { PaymentTypeEnum } from '../models/PaymentTypeEnum';
import type { CancelablePromise } from '../core/CancelablePromise';
export declare class StripeService {
    /**
     * Stripe Checkout Session
     * @returns any Successful Response
     * @throws ApiError
     */
    static stripeStripeCheckoutSession({ type, }: {
        type: PaymentTypeEnum;
    }): CancelablePromise<any>;
    /**
     * Stripe Webhook
     * @returns any Successful Response
     * @throws ApiError
     */
    static stripeStripeWebhook({ stripeSignature, }: {
        stripeSignature?: string;
    }): CancelablePromise<any>;
}
//# sourceMappingURL=StripeService.d.ts.map