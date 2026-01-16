type HttpMethod = 'GET' | 'POST';

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  delayMs?: number;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function request<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, delayMs } = options;

  try {
    if (delayMs) {
      await delay(delayMs);
    }

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    return res.json();
  } catch (error) {
    console.error('[API ERROR]', url, error);
    throw error;
  }
}
