type HttpMethod = 'GET' | 'POST';

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  delayMs?: number;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function request<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, delayMs } = options;

  // Check if URL contains 'undefined' (missing environment variable)
  if (url.includes('undefined')) {
    const errorMessage =
      `⚠️ Missing Environment Variables!\n\n` +
      `This app requires backend API URLs to be configured.\n\n` +
      `For local development:\n` +
      `1. Copy env.example to .env.local\n` +
      `2. Run the mock backend servers:\n` +
      `   → npm run mock:step1  (port 4001)\n` +
      `   → npm run mock:step2  (port 4002)\n\n` +
      `If deployed to Vercel/production:\n` +
      `⚠️  This app is designed for LOCAL DEVELOPMENT ONLY.\n` +
      `   It requires json-server running on localhost.\n\n` +
      `See README.md for complete setup instructions.`;
    
    console.error('[API ERROR]', errorMessage);
    throw new Error(errorMessage);
  }

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
      let backendUrl = '';
      let isPort4001 = false;
      let isPort4002 = false;
      
      try {
        backendUrl = new URL(url).origin;
        isPort4001 = backendUrl.includes('4001');
        isPort4002 = backendUrl.includes('4002');
      } catch {
        // Invalid URL, will use default message
      }
      
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
    
    // Re-throw if it's already our custom error
    if (error instanceof Error && error.message.includes('⚠️')) {
      throw error;
    }
    
    // Check if it's a network error (CORS, connection refused, etc.)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      let backendUrl = '';
      let isPort4001 = false;
      let isPort4002 = false;
      
      try {
        backendUrl = new URL(url).origin;
        isPort4001 = backendUrl.includes('4001');
        isPort4002 = backendUrl.includes('4002');
      } catch {
        // Invalid URL, will use default message
      }
      
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
