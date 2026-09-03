export default defineNuxtConfig({
  compatibilityDate: "2026-01-01",
  devtools: { enabled: false },
  css: ["~/src/assets/globals.css"],
  app: {
    head: {
      htmlAttrs: { lang: "en" },
      meta: [
        { name: "color-scheme", content: "dark" },
        { name: "theme-color", content: "#101827" },
      ],
      link: [{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
    },
  },
  runtimeConfig: {
    openWeatherApiKey: process.env.OPENWEATHER_API_KEY ?? "",
    public: { siteUrl: "https://kufi.uk" },
  },
});
