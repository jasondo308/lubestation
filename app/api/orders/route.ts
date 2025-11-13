import { NextResponse } from 'next/server';
import { sendOrderConfirmationEmail, sendAdminNotificationEmail } from '@/lib/resend';

interface OrderItem {
  productName: string;
  size: string;
  quantity: number;
  price: number;
}

interface OrderData {
  full_name: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  notes?: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
}

export async function POST(request: Request) {
  try {
    const orderData: OrderData = await request.json();

    // Generate order ID
    const orderId = `ORD-${Date.now()}`;

    // Send confirmation email to customer
    try {
      await sendOrderConfirmationEmail(orderData, orderId);
    } catch (emailError) {
      console.error('Failed to send customer email:', emailError);
      // Continue even if customer email fails
    }

    // Send notification email to admin
    try {
      await sendAdminNotificationEmail(orderData, orderId);
    } catch (emailError) {
      console.error('Failed to send admin email:', emailError);
      // Continue even if admin email fails
    }

    return NextResponse.json(
      {
        success: true,
        orderId: orderId,
        message: 'Order successfully placed! Check your email for confirmation.'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Server error:', error);

    // Return detailed error info for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    return NextResponse.json(
      {
        error: 'Failed to process order',
        details: errorMessage,
        stack: errorStack,
      },
      { status: 500 }
    );
  }
}
