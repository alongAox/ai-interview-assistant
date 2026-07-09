import OpenAI from "openai";
import { fetch as undiciFetch, ProxyAgent } from "undici";

type AIClientConfig = {
  client: OpenAI;
  model: string;
};

function createProxyFetch(proxyUrl: string): typeof fetch {
  const dispatcher = new ProxyAgent(proxyUrl);

  return ((input: RequestInfo | URL, init?: RequestInit) =>
    undiciFetch(input as string | URL, {
      ...(init as Record<string, unknown>),
      dispatcher,
    }) as unknown as Promise<Response>) as typeof fetch;
}

export function createAIClient(): AIClientConfig | null {
  const proxy = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
  const proxyFetch = proxy ? createProxyFetch(proxy) : undefined;

  const openRouterKey = process.env.OPENROUTER_API_KEY;
  if (openRouterKey) {
    return {
      client: new OpenAI({
        apiKey: openRouterKey,
        baseURL: "https://openrouter.ai/api/v1",
        fetch: proxyFetch,
      }),
      model: process.env.OPENROUTER_MODEL ?? "deepseek/deepseek-chat",
    };
  }

  const openAiKey = process.env.OPENAI_API_KEY;
  if (openAiKey) {
    return {
      client: new OpenAI({
        apiKey: openAiKey,
        fetch: proxyFetch,
      }),
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    };
  }

  return null;
}

export function requireAIClient(): AIClientConfig {
  const ai = createAIClient();

  if (!ai) {
    throw new Error(
      "未配置 AI API Key，请在 .env.local 中设置 OPENROUTER_API_KEY 或 OPENAI_API_KEY",
    );
  }

  return ai;
}
