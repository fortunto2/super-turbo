import { NextResponse } from 'next/server';
import { getStripeConfig } from '@turbo-super/shared';

export async function GET() {
  try {
    const config = getStripeConfig();
    
    return NextResponse.json({
      success: true,
      prices: config.prices,
      mode: config.mode,
    });
  } catch (error) {
    console.error('Error fetching Stripe prices:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch prices' },
      { status: 500 }
    );
  }
} 