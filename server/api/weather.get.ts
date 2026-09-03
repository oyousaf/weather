export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const config = useRuntimeConfig(event);
  const city = typeof query.city === "string" ? query.city.trim() : "";
  const lat = typeof query.lat === "string" ? query.lat : "";
  const lon = typeof query.lon === "string" ? query.lon : "";

  if (!config.openWeatherApiKey) {
    throw createError({ statusCode: 500, statusMessage: "Missing API key." });
  }
  if (!city && (!lat || !lon)) {
    throw createError({ statusCode: 400, statusMessage: "City or coordinates required." });
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
