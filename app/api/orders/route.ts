import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { Order } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const orderData: Order = await request.json();

    // Insert order into Supabase
    const { data, error } = await supabase
      .from('orders')
      .insert([
        {
          full_name: orderData.full_name,
          email: orderData.email,
          phone: orderData.phone,
          city: orderData.city,
          address: orderData.address,
          notes: orderData.notes || null,
          items: orderData.items,
          subtotal: orderData.subtotal,
          discount: orderData.discount,
          shipping: orderData.shipping,
          total: orderData.total
        }
      ])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to create order', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, order: data?.[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
