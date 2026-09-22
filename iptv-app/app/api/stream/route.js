import { getCredentials } from '../../../../utils/apiClient';

export async function GET(request, { params }) {
  const { searchParams } = new URL(request.url);
  
  // Get credentials from headers or query params
  const xtreamUrl = request.headers.get('x-xtream-url') || searchParams.get('server');
  const username = request.headers.get('x-xtream-user') || searchParams.get('user');
  const password = request.headers.get('x-xtream-pass') || searchParams.get('pass');
  const type = searchParams.get('type'); // live, movie, series
  const streamId = searchParams.get('id');
  const ext = searchParams.get('ext') || (type === 'live' ? 'm3u8' : 'mp4');

  if (!xtreamUrl || !username || !password || !type || !streamId) {
    return new Response('Missing parameters', { status: 400 });
  }

  // Build base URL
  let baseUrl = xtreamUrl;
  if (baseUrl.endsWith('/player_api.php')) {
    baseUrl = baseUrl.replace('/player_api.php', '');
  } else if (baseUrl.endsWith('/')) {
    baseUrl = baseUrl.slice(0, -1);
  }

  const streamUrl = `${baseUrl}/${type}/${username}/${password}/${streamId}.${ext}`;

  try {
    const response = await fetch(streamUrl);

    if (!response.ok) {
      throw new Error(`Stream fetch failed: ${response.status}`);
    }

    const contentType = response.headers.get('content-type') || 'video/mp4';
    
    // Stream the response body through
    return new Response(response.body, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache',
      }
    });
  } catch (error) {
    console.error('Stream proxy error:', error);
    return new Response('Stream error', { status: 500 });
  }
}
