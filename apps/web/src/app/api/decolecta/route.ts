import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const numero = searchParams.get('numero');

  if (!type || !numero) {
    return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 });
  }

  const endpoint = type === 'dni' 
    ? `https://api.decolecta.com/v1/reniec/dni?numero=${numero}`
    : `https://api.decolecta.com/v1/sunat/ruc?numero=${numero}`;

  try {
    const res = await fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_DECOLECTA_TOKEN || ''}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await res.json();
    
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }
    
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
