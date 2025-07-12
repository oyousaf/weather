import { ref, computed } from "vue";
import { useDebounceFn } from "@vueuse/core";
import axios from "axios";

export function useWeather() {
  const query = ref("");
  const weatherData = ref({});
  const temperatureUnit = ref("Celsius");

  const suggestions = ref([]);
  const showSuggestions = ref(false);

  const fetchWeather = async () => {
    const city = query.value.trim();
    if (!city) return;

    try {
      const res = await fetch(
        `https://weather-rose-chi.vercel.app/api/weather?city=${encodeURIComponent(
          city
        )}`
      );
      const result = await res.json();

      if (result.cod === "404") {
        console.warn("City not found.");
        weatherData.value = {};
      } else {
        weatherData.value = result;
      }
    } catch (err) {
      console.error("Weather fetch failed:", err);
      weatherData.value = {};
    }
  };

  const debounceFetchWeather = useDebounceFn(fetchWeather, 1500);

  // Autocomplete suggestions via proxy API
  const fetchSuggestions = async () => {
    const input = query.value.trim();
    if (input.length < 2) {
      suggestions.value = [];
      showSuggestions.value = false;
      return;
    }

    try {
      const { data } = await axios.get(
        `/api/suggest?query=${encodeURIComponent(input)}`
      );
      suggestions.value = data;
      showSuggestions.value = true;
    } catch (err) {
      console.error("Autocomplete fetch failed:", err);
      suggestions.value = [];
    }
  };

  const debouncedFetchSuggestions = useDebounceFn(fetchSuggestions, 300);

  const formattedTemperature = (temp) => {
    if (temp == null) return "N/A";
    const celsius = Math.round(temp);
    const fahrenheit = ((temp * 9) / 5 + 32).toFixed(0);
    return temperatureUnit.value === "Celsius"
      ? `${celsius}°C`
      : `${fahrenheit}°F`;
  };

  const toggleUnits = () => {
    temperatureUnit.value =
      temperatureUnit.value === "Celsius" ? "Fahrenheit" : "Celsius";
  };

  const toggleButtonText = computed(() =>
    temperatureUnit.value === "Celsius" ? "Imperial" : "Metric"
  );

  const temperatureClass = computed(() => {
    const temp = weatherData.value.main?.temp;
    if (temp == null) return "";
    if (temp <= 3) return "freezing";
    if (temp <= 16) return "cool";
    if (temp <= 24) return "warm";
    return "hot";
  });

  const location = computed(() => weatherData.value.name || "—");
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

  const weatherCondition = computed(
    () => weatherData.value.weather?.[0]?.main || ""
  );

  const shouldShowWeatherDetails = computed(() =>
    ["Rain", "Snow", "Clouds"].includes(weatherCondition.value)
  );

  const weatherDetails = computed(() => {
    const { rain, snow, clouds } = weatherData.value;
    switch (weatherCondition.value) {
      case "Rain":
        return rain?.["1h"] ? `${rain["1h"]} mm` : "N/A";
      case "Snow":
        return snow?.["1h"] ? `${snow["1h"]} mm` : "N/A";
      case "Clouds":
        return `${clouds?.all ?? "N/A"}%`;
      default:
        return "";
    }
  });

  const isDaytime = computed(() => {
    const now = weatherData.value.dt;
    const { sunrise, sunset } = weatherData.value.sys || {};
    return now && sunrise && sunset ? now >= sunrise && now < sunset : true;
  });

  const iconMap = {
    "Clear:Clear Sky": "day",
    "Clouds:Few Clouds": "cloudy-day-1",
    "Clouds:Scattered Clouds": "cloudy-day-2",
    "Clouds:Broken Clouds": "cloudy-day-3",
    "Clouds:Overcast Clouds": "cloudy",
    "Rain:Light Rain": "rainy-1",
    "Rain:Moderate Rain": "rainy-2",
    "Rain:Heavy Intensity Rain": "rainy-3",
    "Rain:Very Heavy Rain": "rainy-4",
    "Rain:Extreme Rain": "rainy-5",
    "Rain:Freezing Rain": "rainy-6",
    "Rain:Light Intensity Shower Rain": "rainy-2",
    "Rain:Shower Rain": "rainy-3",
    "Rain:Heavy Intensity Shower Rain": "rainy-5",
    "Rain:Ragged Shower Rain": "rainy-6",
    "Drizzle:Light Intensity Drizzle": "rainy-1",
    "Drizzle:Drizzle": "rainy-2",
    "Drizzle:Heavy Intensity Drizzle": "rainy-3",
    "Snow:Light Snow": "snowy-1",
    "Snow:Snow": "snowy-2",
    "Snow:Heavy Snow": "snowy-3",
    "Snow:Sleet": "snowy-4",
    "Snow:Light Shower Sleet": "snowy-5",
    "Snow:Shower Sleet": "snowy-6",
    "Thunderstorm:Thunderstorm": "thunder",
    "Mist:Mist": "foggy",
    "Fog:Fog": "foggy",
    "Haze:Haze": "foggy",
    "Dust:Dust": "foggy",
    "Smoke:Smoke": "foggy",
    "Ash:Volcanic Ash": "foggy",
    "Tornado:Tornado": "windy",
    "Squall:Squall": "windy",
  };

  const weatherIconUrl = computed(() => {
    const main = weatherData.value.weather?.[0]?.main || "";
    const desc = weatherData.value.weather?.[0]?.description || "";

    const formattedDesc = desc
      .toLowerCase()
      .replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());

    const key = `${main}:${formattedDesc}`;
    let iconName = iconMap[key] || "na";

    if (!isDaytime.value && iconName.includes("day")) {
      iconName = iconName.replace("day", "night");
    }

    return iconName === "na" ? "" : `/icons/animated/${iconName}.svg`;
  });

  const weatherDetailsObject = computed(() => {
    const main = weatherData.value.main || {};
    const wind = weatherData.value.wind || {};
    const visibility = weatherData.value.visibility;
    const sys = weatherData.value.sys || {};

    const formatTime = (ts) =>
      ts
        ? new Date(ts * 1000).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "N/A";

    const windDirection = (deg) => {
      const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
      return deg != null ? dirs[Math.round(deg / 45) % 8] : "N/A";
    };

    return {
      "Feels Like": formattedTemperature(main.feels_like),
      "Min Temp": formattedTemperature(main.temp_min),
      "Max Temp": formattedTemperature(main.temp_max),
      Humidity: main.humidity != null ? `${main.humidity}%` : "N/A",
      Winds: wind.speed != null ? `${wind.speed.toFixed(0)} MPH` : "N/A",
      "Wind Direction": windDirection(wind.deg),
      Pressure: main.pressure != null ? `${main.pressure} hPa` : "N/A",
      Visibility:
        visibility != null
          ? `${((visibility / 1000) * 0.621371).toFixed(1)} miles`
          : "N/A",
      Sunrise: formatTime(sys.sunrise),
      Sunset: formatTime(sys.sunset),
    };
  });

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      if (suggestions.value.length > 0) {
        selectCity(suggestions.value[0]);
      } else {
        debounceFetchWeather();
      }
    }
  };

  const selectCity = (city) => {
    query.value = `${city.name}, ${city.country}`;
    suggestions.value = [];
    showSuggestions.value = false;
    debounceFetchWeather();
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
    shouldShowWeatherDetails,
    weatherDetails,
    weatherDetailsObject,
    weatherIconUrl,
    handleKeyPress,
    selectCity,

    // Autocomplete
    suggestions,
    showSuggestions,
    fetchSuggestions,
    debouncedFetchSuggestions,
  };
}
