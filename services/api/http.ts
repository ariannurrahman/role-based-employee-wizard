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
    
    // Check if it's a network error (backend not running)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(
        `⚠️ Backend server is not running!\n\n` +
        `Please run the json-server locally:\n\n` +
        `For Step 1 ('port 4001'):\n` +
        `  npm run mock:step1\n\n` +
        `For Step 2 ('port 4002'):\n` +
        `  npm run mock:step2\n\n` +
        `See README.md for more details.`
      );
    }
    
    throw error;
  }
}
