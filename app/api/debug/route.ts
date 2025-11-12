import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasCredentials: !!process.env.GOOGLE_CREDENTIALS_BASE64,
    credentialsLength: process.env.GOOGLE_CREDENTIALS_BASE64?.length || 0,
    nodeEnv: process.env.NODE_ENV,
    vercel: process.env.VERCEL,
  });
}
