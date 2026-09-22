export const getCredentials = () => {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('xtream_credentials');
  return stored ? JSON.parse(stored) : null;
};

export const clearCredentials = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('xtream_credentials');
  }
};

export const fetchXtream = async (action, additionalParams = '') => {
  const creds = getCredentials();
  if (!creds) {
    throw new Error('No credentials found');
  }

  const url = `/api/xtream?action=${action}${additionalParams ? `&${additionalParams}` : ''}`;
  
  const response = await fetch(url, {
    headers: {
      'x-xtream-url': creds.url,
      'x-xtream-user': creds.username,
      'x-xtream-pass': creds.password
    }
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearCredentials();
      window.location.href = '/login';
    }
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
};

export const proxyImageUrl = (url) => {
  if (!url) return '';
  // If already HTTPS or data URL, return as-is
  if (url.startsWith('https://') || url.startsWith('data:')) return url;
  // Proxy HTTP images through our API to avoid mixed content blocking
  return `/api/image-proxy?url=${encodeURIComponent(url)}`;
};
