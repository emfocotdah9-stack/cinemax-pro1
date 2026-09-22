import { NextResponse } from 'next/server';

const XTREAM_URL = 'http://shangaicb.site:80/player_api.php';
const USERNAME = 'weslleyxc';
const PASSWORD = 'Cliente10';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const category_id = searchParams.get('category_id');

  // Build the target URL
  let targetUrl = `${XTREAM_URL}?username=${USERNAME}&password=${PASSWORD}`;
  
  if (action) {
    targetUrl += `&action=${action}`;
  }
  if (category_id) {
    targetUrl += `&category_id=${category_id}`;
  }

  try {
    const response = await fetch(targetUrl, {
      next: { revalidate: 3600 } // cache for 1 hour to reduce server load
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
