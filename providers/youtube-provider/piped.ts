export async function fetchPipedJson<T = any>(
  path: string,
  params: Record<string, string | number> = {},
  providerContext: any,
  signal?: AbortSignal,
): Promise<T> {
  const endpoints = [
    "https://piped.video",
    "https://pipedapi.adminforge.de",
    "https://pipedapi.kavin.rocks",
  ];

  let lastError: unknown;

  for (const base of endpoints) {
    try {
      const response = await providerContext.axios.get(`${base}${path}`, {
        params,
        signal,
        timeout: 15000,
      });

      if (response && response.data !== undefined) {
        return response.data as T;
      }
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError ?? new Error(`All Piped endpoints failed for ${path}`);
}

export function extractVideoId(value = "") {
  if (!value) return "";
  if (!value.includes("/") && !value.includes("?")) return value;

  try {
    const url = new URL(value, "https://www.youtube.com");
    return url.searchParams.get("v") || url.pathname.split("/").filter(Boolean).pop() || "";
  } catch {
    return value.replace(/^\/watch\?v=/, "").split("&")[0];
  }
}

export function formatDuration(seconds: number | string | undefined) {
  const number = Number(seconds);
  if (!Number.isFinite(number) || number <= 0) return undefined;
  const mins = Math.floor(number / 60);
  const secs = Math.floor(number % 60);
  return `${mins}:${String(secs).padStart(2, "0")}`;
}
