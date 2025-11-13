import { NextResponse } from 'next/server';
import { addOrderToSheet, initializeSheet, type OrderData } from '@/lib/googleSheets';
import { sendOrderConfirmationEmail, sendAdminNotificationEmail } from '@/lib/resend';

export async function POST(request: Request) {
  try {
    const orderData: OrderData = await request.json();

    // Initialize sheet with headers if needed (first time only)
    await initializeSheet();

    // Add order to Google Sheets
    const result = await addOrderToSheet(orderData);

    // Send confirmation email to customer
    try {
      await sendOrderConfirmationEmail(orderData, result.orderId);
    } catch (emailError) {
      console.error('Failed to send customer email, but order was saved:', emailError);
      // Don't fail the request if email fails
    }

    // Send notification email to admin
    try {
      await sendAdminNotificationEmail(orderData, result.orderId);
    } catch (emailError) {
      console.error('Failed to send admin email, but order was saved:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json(
      {
        success: true,
        orderId: result.orderId,
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
        error: 'Failed to save order',
        details: errorMessage,
        stack: errorStack,
        hasCredentials: !!process.env.GOOGLE_CREDENTIALS_BASE64,
      },
      { status: 500 }
    );
  }
}
