import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class StripeService {
    /**
     * Stripe Checkout Session
     * @returns any Successful Response
     * @throws ApiError
     */
    static stripeStripeCheckoutSession({ type, }) {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/stripe/payment-link/{type}',
            path: {
                'type': type,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Stripe Webhook
     * @returns any Successful Response
     * @throws ApiError
     */
    static stripeStripeWebhook({ stripeSignature, }) {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/stripe/webhook',
            headers: {
                'stripe-signature': stripeSignature,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
//# sourceMappingURL=StripeService.js.map