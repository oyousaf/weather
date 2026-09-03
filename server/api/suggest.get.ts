export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const input = typeof query.query === "string" ? query.query.trim() : "";
  const config = useRuntimeConfig(event);
  if (input.length < 2) {
    throw createError({ statusCode: 400, statusMessage: "Query must be at least 2 characters." });
  }
  if (input.length > 100) {
    throw createError({ statusCode: 400, statusMessage: "Query too long." });
  }
  if (!config.openWeatherApiKey) {
    throw createError({ statusCode: 500, statusMessage: "Missing API key." });
  }

  try {
    return await $fetch("https://api.openweathermap.org/geo/1.0/direct", {
      query: { q: input, limit: 5, appid: config.openWeatherApiKey },
    });
  } catch {
    throw createError({ statusCode: 502, statusMessage: "Suggestions unavailable." });
  }
});
