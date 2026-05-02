const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function apiGet(path: string, options?: { cookies?: string }) {
  const headers: Record<string, string> = {};
  if (options?.cookies) {
    headers['Cookie'] = options.cookies;
  }
  
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'GET',
    headers,
    credentials: 'include',
    cache: 'no-store',
  });
  return res.json();
}

export async function apiPost(path: string, body: any, options?: { cookies?: string }) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (options?.cookies) {
    headers['Cookie'] = options.cookies;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    credentials: 'include',
    cache: 'no-store',
  });
  return res.json();
}

export async function apiPatch(path: string, body: any, options?: { cookies?: string }) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (options?.cookies) {
    headers['Cookie'] = options.cookies;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(body),
    credentials: 'include',
    cache: 'no-store',
  });
  return res.json();
}

export async function apiPut(path: string, body: any, options?: { cookies?: string }) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (options?.cookies) {
    headers['Cookie'] = options.cookies;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
    credentials: 'include',
    cache: 'no-store',
  });
  return res.json();
}

export { API_BASE };
