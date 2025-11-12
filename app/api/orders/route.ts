import { NextResponse } from 'next/server';
import { addOrderToSheet, initializeSheet, type OrderData } from '@/lib/googleSheets';

export async function POST(request: Request) {
  try {
    const orderData: OrderData = await request.json();

    // Initialize sheet with headers if needed (first time only)
    await initializeSheet();

    // Add order to Google Sheets
    const result = await addOrderToSheet(orderData);

    return NextResponse.json(
      {
        success: true,
        orderId: result.orderId,
        message: 'Order successfully added to Google Sheets'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Failed to save order. Please try again.' },
      { status: 500 }
    );
  }
}
