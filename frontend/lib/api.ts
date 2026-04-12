const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/backend/api/v1';

type FetchOptions = Omit<RequestInit, 'body'> & {
  body?: BodyInit | Record<string, unknown> | null;
};

export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

  if (!isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body:
      options.body && typeof options.body === 'object' && !isFormData
        ? JSON.stringify(options.body)
        : (options.body as BodyInit | null | undefined),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      (data && typeof data === 'object' && 'detail' in data && String(data.detail)) ||
      'Beklenmeyen bir API hatasi olustu.';
    throw new Error(message);
  }

  return data as T;
}

export { API_BASE_URL };
