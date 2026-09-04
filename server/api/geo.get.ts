const rateBuckets = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 60_000;
const ipCache = new Map<string, { data: any; expiresAt: number }>();
const IP_CACHE_TTL_MS = 10 * 60 * 1000;
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
  const ip = getRequestIP(event, {xForwardedFor: true}) || "unknown";
  if (!rateLimit(ip)) {
    throw createError({ statusCode: 429, statusMessage: "Too many requests." });
  }
  const isLocal =
    ip === "unknown" || ip === "127.0.0.1" || ip === "::1" || ip.startsWith("::ffff:127.");
  if (isLocal) {
    throw createError({
      statusCode: 400,
      statusMessage: "IP-based geolocation unavailable in local development.",
    });
  }
  const cached = ipCache.get(ip);
  if (cached && Date.now() < cached.expiresAt) {
    event.node.res.setHeader("X-Cache", "HIT");
    return cached.data;
  }
  try {
    const data: any = await $fetch(`https://ipwho.is/${ip}`);
    if (!data || data.success === false) {
      throw createError({ statusCode: 502, statusMessage: "IP lookup failed." });
    }
    const slim = {
      lat: data.latitude,
      lon: data.longitude,
      city: data.city,
      country: data.country_code,
    };
    ipCache.set(ip, { data: slim, expiresAt: Date.now() + IP_CACHE_TTL_MS });
    event.node.res.setHeader("X-Cache", "MISS");
    return slim;
  } catch (error: any) {
    throw createError({
      statusCode: error?.response?.status || 502,
      statusMessage: error?.data?.message || "IP lookup service unavailable.",
    });
  }
});