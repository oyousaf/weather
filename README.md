# ✦ Weatherly — Nuxt weather app

Weatherly is a playful, polished weather experience built with **Nuxt 4**. It fetches real-time weather data based on your location or search input and adapts its atmosphere to the conditions outside.

---

## 🧰 Technologies Used

| Category               | Technology                                                             |
| ---------------------- | ---------------------------------------------------------------------- |
| **Frontend Framework** | [Nuxt 4](https://nuxt.com/)                                            |
| **Styling**            | Responsive CSS with weather-reactive gradients                         |
| **Data layer**         | Nuxt server routes + `$fetch`                                          |
| **APIs**               | [OpenWeatherMap API](https://openweathermap.org/)                      |
| **UX**                 | Accessible search, responsive layout, reduced-motion support          |

---

## 🚀 Features

- 📍 Get current weather by geolocation or manual search
- 🌡️ Displays temperature, humidity, wind speed, and various other conditions
- 🎌 Shows country flags using ISO 3166-1 alpha-2 codes
- 🎨 Responsive and mobile-first design
- 🔄 Real-time data fetching from OpenWeatherMap API
- 🌈 Weather-reactive animated atmosphere with reduced-motion support
- 🔎 Keyboard-friendly city search with accessible suggestions

## Setup

Create a `.env` file with `OPENWEATHER_API_KEY`, then run:

```bash
npm install
npm run dev
``` API