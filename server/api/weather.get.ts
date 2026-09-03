const rateBuckets = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 60;
const RATE_WINDOW_MS = 60_000;

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const bucket = rateBuckets.get(ip);
  if (!bucket || now > bucket.resetAt) {
    rateBuckets.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (bucket.count >= RATE_LIMIT) return false;
  bucket.count++;
  return true;
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const config = useRuntimeConfig(event);
  const city = typeof query.city === "string" ? query.city.trim() : "";
  const lat = typeof query.lat === "string" ? query.lat : "";
  const lon = typeof query.lon === "string" ? query.lon : "";

  const ip = getRequestIP(event, { xForwardedFor: true }) || "unknown";
  if (!rateLimit(ip)) {
    throw createError({ statusCode: 429, statusMessage: "Too many requests." });
  }

  if (!config.openWeatherApiKey) {
    throw createError({ statusCode: 500, statusMessage: "Missing API key." });
  }
  if (!city && (!lat || !lon)) {
    throw createError({ statusCode: 400, statusMessage: "City or coordinates required." });
  }
  if (city.length > 100) {
    throw createError({ statusCode: 400, statusMessage: "City name too long." });
  }

  const params: Record<string, string> = {
    units: "metric",
    appid: config.openWeatherApiKey,
  };
  if (city) params.q = city;
  else {
    params.lat = lat;
    params.lon = lon;
  }

  try {
    return await $fetch("https://api.openweathermap.org/data/2.5/weather", { query: params });
  } catch (error: any) {
    throw createError({
      statusCode: error?.response?.status || 502,
      statusMessage: error?.data?.message || "Weather service unavailable.",
    });
  }
});
