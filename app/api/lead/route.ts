import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const gasEndpoint = process.env.GAS_LEADS_ENDPOINT;
    
    if (!gasEndpoint) {
      return NextResponse.json(
        { ok: false, error: 'GAS_LEADS_ENDPOINT not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    
    // Sanear longitudes
    const sanitizedData = {
      name: String(body.name || '').substring(0, 120),
      email: String(body.email || '').substring(0, 160),
      phone: String(body.phone || '').substring(0, 60),
      notes: String(body.notes || '').substring(0, 500),
      utm_source: body.utm_source || undefined,
      utm_medium: body.utm_medium || undefined,
      utm_campaign: body.utm_campaign || undefined,
      path: body.path || undefined,
      userAgent: body.userAgent || undefined
    };

    // Reenviar a Google Apps Script
    const response = await fetch(gasEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sanitizedData)
    });

    if (!response.ok) {
      throw new Error(`GAS responded with status: ${response.status}`);
    }

    return NextResponse.json({ ok: true });
    
  } catch (error) {
    console.error('Error in /api/lead:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}