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
      // Create a helpful error message for HTTP errors (404, 500, etc.)
      const backendUrl = new URL(url).origin;
      const isPort4001 = backendUrl.includes('4001');
      const isPort4002 = backendUrl.includes('4002');
      
      throw new Error(
        `⚠️ Backend server is not responding (HTTP ${res.status})!\n\n` +
        `This app requires json-server to be running locally.\n\n` +
        `Please run the mock backend servers:\n\n` +
        (isPort4001 ? `→ npm run mock:step1  (for port 4001 - departments & basic info)\n` : '') +
        (isPort4002 ? `→ npm run mock:step2  (for port 4002 - locations & details)\n` : '') +
        (!isPort4001 && !isPort4002 ? `→ npm run mock:step1  (for port 4001)\n→ npm run mock:step2  (for port 4002)\n` : '') +
        `\nSee README.md for complete setup instructions.`
      );
    }

    return res.json();
  } catch (error) {
    console.error('[API ERROR]', url, error);
    
    // Check if it's a network error (CORS, connection refused, etc.)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      const backendUrl = new URL(url).origin;
      const isPort4001 = backendUrl.includes('4001');
      const isPort4002 = backendUrl.includes('4002');
      
      throw new Error(
        `⚠️ Cannot connect to backend server!\n\n` +
        `This app requires json-server to be running locally.\n\n` +
        `Please run the mock backend servers:\n\n` +
        (isPort4001 ? `→ npm run mock:step1  (for port 4001 - departments & basic info)\n` : '') +
        (isPort4002 ? `→ npm run mock:step2  (for port 4002 - locations & details)\n` : '') +
        (!isPort4001 && !isPort4002 ? `→ npm run mock:step1  (for port 4001)\n→ npm run mock:step2  (for port 4002)\n` : '') +
        `\nSee README.md for complete setup instructions.`
      );
    }
    
    throw error;
  }
}
