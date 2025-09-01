import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Fail-safe: siempre responde 200
  try {
    const gasLogsEndpoint = process.env.GAS_LOGS_ENDPOINT || process.env.GAS_LEADS_ENDPOINT;
    
    if (!gasLogsEndpoint) {
      // Si no hay endpoint configurado, simplemente responde ok
      return NextResponse.json({ ok: true });
    }

    const body = await request.json();
    
    const logData = {
      type: body.type || 'unknown',
      path: body.path || undefined,
      utm_source: body.utm_source || undefined,
      utm_medium: body.utm_medium || undefined,
      utm_campaign: body.utm_campaign || undefined,
      userAgent: body.userAgent || undefined
    };

    // Intentar enviar a Google Apps Script
    await fetch(gasLogsEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(logData)
    });

    // Siempre responde ok, incluso si GAS falla
    return NextResponse.json({ ok: true });
    
  } catch (error) {
    console.error('Error in /api/log (ignored):', error);
    // Fail-safe: siempre responde ok
    return NextResponse.json({ ok: true });
  }
}