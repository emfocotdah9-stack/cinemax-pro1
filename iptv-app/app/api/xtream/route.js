import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  // Extract credentials from headers
  const xtreamUrl = request.headers.get('x-xtream-url');
  const username = request.headers.get('x-xtream-user');
  const password = request.headers.get('x-xtream-pass');

  if (!xtreamUrl || !username || !password) {
    return NextResponse.json({ error: 'Missing Xtream credentials in headers' }, { status: 401 });
  }

  let cleanUrl = xtreamUrl;
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    cleanUrl = `http://${cleanUrl}`;
  }
  
  if (!cleanUrl.endsWith('/player_api.php')) {
    cleanUrl = cleanUrl.endsWith('/') ? `${cleanUrl}player_api.php` : `${cleanUrl}/player_api.php`;
  }

  // Build the target URL
  let targetUrl = `${cleanUrl}?username=${username}&password=${password}`;
  
  searchParams.forEach((value, key) => {
    targetUrl += `&${key}=${value}`;
  });

  try {
    const response = await fetch(targetUrl, {
      cache: 'no-store' // Always fetch fresh data
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch from Xtream API: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
