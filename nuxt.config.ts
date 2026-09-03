export default defineNuxtConfig({
  compatibilityDate: "2026-01-01",
  devtools: { enabled: false },
  css: ["~/src/assets/globals.css"],
  app: {
    head: {
      htmlAttrs: { lang: "en" },
      link: [{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
    },
  },
  runtimeConfig: {
    openWeatherApiKey: process.env.OPENWEATHER_API_KEY || "",
    public: { siteUrl: "https://kufi.uk" },
  },
});
