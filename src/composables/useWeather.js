// src/composables/useWeather.js
import { ref, computed } from "vue";
import { useDebounceFn } from "@vueuse/core";

export function useWeather() {
  const query = ref("");
  const weatherData = ref({});
  const temperatureUnit = ref("Celsius");

  const iconMap = {
    "Clear:clear sky": "day",
    "Clouds:few clouds": "cloudy-day-1",
    "Clouds:scattered clouds": "cloudy-day-2",
    "Clouds:broken clouds": "cloudy-day-3",
    "Clouds:overcast clouds": "cloudy",
    "Rain:light rain": "rainy-1",
    "Rain:moderate rain": "rainy-2",
    "Rain:heavy intensity rain": "rainy-3",
    "Rain:very heavy rain": "rainy-4",
    "Rain:extreme rain": "rainy-5",
    "Rain:freezing rain": "rainy-6",
    "Rain:light intensity shower rain": "rainy-2",
    "Rain:shower rain": "rainy-3",
    "Rain:heavy intensity shower rain": "rainy-5",
    "Rain:ragged shower rain": "rainy-6",
    "Drizzle:light intensity drizzle": "rainy-1",
    "Drizzle:drizzle": "rainy-2",
    "Drizzle:heavy intensity drizzle": "rainy-3",
    "Drizzle:light intensity drizzle rain": "rainy-1",
    "Drizzle:drizzle rain": "rainy-2",
    "Drizzle:heavy intensity drizzle rain": "rainy-3",
    "Drizzle:shower drizzle": "rainy-2",
    "Snow:light snow": "snowy-1",
    "Snow:snow": "snowy-2",
    "Snow:heavy snow": "snowy-3",
    "Snow:sleet": "snowy-4",
    "Snow:light shower sleet": "snowy-5",
    "Snow:shower sleet": "snowy-6",
    "Snow:light rain and snow": "snowy-1",
    "Snow:rain and snow": "snowy-2",
    "Snow:light shower snow": "snowy-3",
    "Snow:shower snow": "snowy-4",
    "Snow:heavy shower snow": "snowy-5",
    "Thunderstorm:thunderstorm": "thunder",
    "Thunderstorm:thunderstorm with light rain": "thunder",
    "Thunderstorm:thunderstorm with rain": "thunder",
    "Thunderstorm:thunderstorm with heavy rain": "thunder",
    "Thunderstorm:light thunderstorm": "thunder",
    "Thunderstorm:heavy thunderstorm": "thunder",
    "Thunderstorm:ragged thunderstorm": "thunder",
    "Thunderstorm:thunderstorm with light drizzle": "thunder",
    "Thunderstorm:thunderstorm with drizzle": "thunder",
    "Thunderstorm:thunderstorm with heavy drizzle": "thunder",
    "Mist:mist": "foggy",
    "Smoke:smoke": "foggy",
    "Haze:haze": "foggy",
    "Dust:dust": "foggy",
    "Fog:fog": "foggy",
    "Sand:sand": "foggy",
    "Ash:volcanic ash": "foggy",
    "Squall:squall": "windy",
    "Tornado:tornado": "windy",
  };

  const isDaytime = computed(() => {
    const now = weatherData.value.dt;
    const sunrise = weatherData.value.sys?.sunrise;
    const sunset = weatherData.value.sys?.sunset;
    return now && sunrise && sunset ? now >= sunrise && now < sunset : true;
  });

  const weatherIconUrl = computed(() => {
    const main = weatherData.value.weather?.[0]?.main || "";
    const description =
      weatherData.value.weather?.[0]?.description?.toLowerCase() || "";
    const key = `${main}:${description}`;
    let iconName = iconMap[key] || "na";
    if (!isDaytime.value && iconName.includes("day")) {
      iconName = iconName.replace("day", "night");
    }
    return `/icons/animated/${iconName}.svg`;
  });

  const fetchWeather = async () => {
    if (!query.value.trim()) return;
    try {
      const response = await fetch(
        `https://weather-rose-chi.vercel.app/api/weather?city=${encodeURIComponent(
          query.value.trim()
        )}`,
        {
          headers: { "Content-Type": "application/json" },
          mode: "cors",
        }
      );
      const result = await response.json();
      weatherData.value = result;
    } catch (error) {
      console.error("Error fetching weather data:", error);
    }
  };

  const debounceFetchWeather = useDebounceFn(fetchWeather, 1500);

  const formattedTemperature = (temp) => {
    if (temp == null) return "N/A";
    return temperatureUnit.value === "Celsius"
      ? `${Math.round(temp)}°C`
      : `${((temp * 9) / 5 + 32).toFixed(0)}°F`;
  };

  const toggleUnits = () => {
    temperatureUnit.value =
      temperatureUnit.value === "Celsius" ? "Fahrenheit" : "Celsius";
  };

  const temperatureClass = computed(() => {
    const temp = weatherData.value.main?.temp;
    if (temp == null) return "";
    if (temp <= 3) return "freezing";
    if (temp <= 16) return "cool";
    if (temp <= 24) return "warm";
    return "hot";
  });

  const location = computed(() => {
    const name = weatherData.value.name || "";
    const country = weatherData.value.sys?.country || "";
    return name && country ? `${name}, ${country}` : name || country || "—";
  });

  const countryCode = computed(() => weatherData.value.sys?.country || "");

  const currentDate = computed(() => {
    const dt = weatherData.value.dt;
    const offset = weatherData.value.timezone || 0;
    if (!dt) return "";
    const localTime = new Date((dt + offset) * 1000);
    return localTime.toLocaleString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  });

  const toggleButtonText = computed(() =>
    temperatureUnit.value === "Celsius" ? "Imperial" : "Metric"
  );

  const weatherCondition = computed(
    () => weatherData.value.weather?.[0]?.main || ""
  );

  const shouldShowWeatherDetails = computed(() =>
    ["Rain", "Snow", "Clouds"].includes(weatherCondition.value)
  );

  const weatherConditionClass = computed(() =>
    weatherCondition.value
      ? `${weatherCondition.value.toLowerCase()}-animation`
      : ""
  );

  const weatherDetails = computed(() => {
    const condition = weatherCondition.value;
    if (condition === "Rain")
      return weatherData.value.rain?.["1h"]
        ? `${weatherData.value.rain["1h"]} mm`
        : "N/A";
    if (condition === "Snow")
      return weatherData.value.snow?.["1h"]
        ? `${weatherData.value.snow["1h"]} mm`
        : "N/A";
    if (condition === "Clouds")
      return `${weatherData.value.clouds?.all ?? "N/A"}%`;
    return "";
  });

  const convertWindDirection = (deg) => {
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    return deg != null ? directions[Math.round(deg / 45) % 8] : "N/A";
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp * 1000).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const weatherDetailsObject = computed(() => {
    const main = weatherData.value.main || {};
    const wind = weatherData.value.wind || {};
    const visibility = weatherData.value.visibility;
    const sys = weatherData.value.sys || {};

    return {
      "Feels Like": formattedTemperature(main.feels_like),
      "Min Temp": formattedTemperature(main.temp_min),
      "Max Temp": formattedTemperature(main.temp_max),
      Humidity: main.humidity != null ? `${main.humidity}%` : "N/A",
      Winds: wind.speed != null ? `${wind.speed.toFixed(0)} MPH` : "N/A",
      "Wind Direction": convertWindDirection(wind.deg),
      Pressure: main.pressure != null ? `${main.pressure} hPa` : "N/A",
      Visibility:
        visibility != null
          ? `${((visibility / 1000) * 0.621371).toFixed(1)} miles`
          : "N/A",
      Sunrise: formatTime(sys.sunrise),
      Sunset: formatTime(sys.sunset),
    };
  });

  const handleKeyPress = (event) => {
    if (event.key === "Enter") fetchWeather();
  };

  return {
    query,
    weatherData,
    formattedTemperature,
    location,
    countryCode,
    currentDate,
    temperatureClass,
    toggleUnits,
    debounceFetchWeather,
    toggleButtonText,
    weatherCondition,
    weatherConditionClass,
    shouldShowWeatherDetails,
    weatherDetails,
    weatherDetailsObject,
    weatherIconUrl,
    handleKeyPress,
  };
}
