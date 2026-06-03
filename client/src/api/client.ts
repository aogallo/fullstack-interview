// ---------------------------------------------------------------------------
// Native fetch API client — no axios
// ---------------------------------------------------------------------------

const DEFAULT_BASE_URL = 'http://localhost:3001/api';

let baseUrl: string = DEFAULT_BASE_URL;

/** Override the base URL (e.g. for tests or environment config). */
export function setBaseUrl(url: string): void {
  baseUrl = url;
}

/** Reset base URL to default. */
export function resetBaseUrl(): void {
  baseUrl = DEFAULT_BASE_URL;
}

// ---------------------------------------------------------------------------
// Error types
// ---------------------------------------------------------------------------

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** 4xx responses */
export class ClientError extends ApiError {}

/** 5xx responses */
export class ServerError extends ApiError {}

// ---------------------------------------------------------------------------
// Internal request helper
// ---------------------------------------------------------------------------

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${baseUrl}${path}`;

  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!res.ok) {
    let message: string;
    try {
      const body = await res.json();
      message = body.error ?? res.statusText;
    } catch {
      message = res.statusText;
    }

    if (res.status >= 400 && res.status < 500) {
      throw new ClientError(res.status, message);
    }
    throw new ServerError(res.status, message);
  }

  // Handle 204 No Content
  if (res.status === 204) {
    return undefined as T;
  }

  return res.json();
}

// ---------------------------------------------------------------------------
// Public helpers
// ---------------------------------------------------------------------------

export function get<T>(path: string, signal?: AbortSignal): Promise<T> {
  return request<T>(path, { method: 'GET', signal });
}

export function post<T>(path: string, body: unknown, signal?: AbortSignal): Promise<T> {
  return request<T>(path, {
    method: 'POST',
    body: JSON.stringify(body),
    signal,
  });
}
