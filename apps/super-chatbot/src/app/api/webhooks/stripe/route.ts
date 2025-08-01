import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { addUserBalance } from '@/lib/utils/tools-balance';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log('🔔 Webhook event received:', event.type);

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    console.log('✅ Checkout completed:', session.id);
    
    const { metadata } = session;
    const userId = metadata?.user_id;
    const paymentType = metadata?.payment_type;
    const creditAmount = metadata?.credit_amount;

    if (!userId) {
      console.error('❌ No user_id in session metadata');
      return;
    }

    if (paymentType === 'credits' && creditAmount) {
      // Add credits to user balance
      const amount = parseInt(creditAmount, 10);
      
      await addUserBalance(
        userId,
        amount,
        'stripe_payment',
        {
          sessionId: session.id,
          paymentIntentId: session.payment_intent as string,
          amount: session.amount_total,
          currency: session.currency,
        }
      );

      console.log(`💰 Added ${amount} credits to user ${userId}`);
    } else if (paymentType === 'video') {
      // Handle video generation payment
      console.log('🎬 Video payment completed, processing video generation...');
      // Здесь можно добавить логику для генерации видео
    }

  } catch (error) {
    console.error('❌ Error handling checkout completion:', error);
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('✅ Payment succeeded:', paymentIntent.id);
  // Дополнительная логика обработки успешного платежа
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('❌ Payment failed:', paymentIntent.id);
  // Логика обработки неудачного платежа
} 