import { ref, computed } from "vue";
import { useDebounceFn } from "@vueuse/core";
import axios from "axios";
import { flagMap } from "../constants/flagMap";

export function useWeather(flagSetter = () => {}) {
  const query = ref("");
  const selectedLabel = ref("");
  const weatherData = ref({});
  const temperatureUnit = ref("Celsius");
  const isLoading = ref(false);
  const suggestions = ref([]);
  const showSuggestions = ref(false);
  const highlightedIndex = ref(-1);

  const recentSearches = ref(
    JSON.parse(localStorage.getItem("recentSearches") || "[]")
  );

  const CACHE_KEY = "cachedWeather";
  const CACHE_TTL_MS = 30 * 60 * 1000;

  const getFlagSvg = (code) => {
    const svg = flagMap[code?.trim()?.toUpperCase()];
    return svg
      ? `<img src="data:image/svg+xml;base64,${btoa(
          svg
        )}" class="w-full h-full object-cover" />`
      : "";
  };

  const saveToRecentSearches = (cityObj) => {
    const entry = {
      name: cityObj.name,
      country: cityObj.country,
      state: cityObj.state,
      lat: cityObj.lat,
      lon: cityObj.lon,
    };

    const key = `${entry.name}-${entry.country}`;
    const existing = recentSearches.value.find(
      (item) => `${item.name}-${item.country}` === key
    );

    if (!existing) {
      recentSearches.value.unshift(entry);
      if (recentSearches.value.length > 5) {
        recentSearches.value.pop();
      }
      localStorage.setItem(
        "recentSearches",
        JSON.stringify(recentSearches.value)
      );
    }
  };

  const cacheWeather = (data) => {
    const cache = {
      data,
      expiresAt: Date.now() + CACHE_TTL_MS,
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  };

  const restoreCachedWeather = () => {
    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
      if (!cached || !cached.data || !cached.expiresAt) return;

      if (Date.now() < cached.expiresAt) {
        weatherData.value = cached.data;
      } else {
        localStorage.removeItem(CACHE_KEY);
      }
    } catch (err) {
      console.warn("❌ Failed to restore cached weather:", err);
    }
  };

  const fetchWeather = async () => {
    const city = query.value.trim();
    if (!city) return;

    isLoading.value = true;
    try {
      const res = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Weather API error:", res.status, errorText);
        weatherData.value = {};
        return;
      }

      const result = await res.json();
      const isValid = result && result.cod !== "404";
      weatherData.value = isValid ? result : {};

      if (isValid) {
        cacheWeather(result);
        if (result.sys?.country && !selectedLabel.value) {
          flagSetter(getFlagSvg(result.sys.country));
        }
      }
    } catch (err) {
      console.error("Weather fetch failed:", err);
      weatherData.value = {};
    } finally {
      isLoading.value = false;
    }
  };

  const fetchWeatherByCoords = async (lat, lon) => {
    isLoading.value = true;
    try {
      const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Coords API error:", res.status, errorText);
        weatherData.value = {};
        return;
      }

      const result = await res.json();
      const isValid = result && result.cod !== "404";
      weatherData.value = isValid ? result : {};

      if (isValid) {
        cacheWeather(result);
      }
    } catch (err) {
      console.error("Weather fetch failed:", err);
      weatherData.value = {};
    } finally {
      isLoading.value = false;
    }
  };

  const debounceFetchWeather = useDebounceFn(fetchWeather, 1500);

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

      const only = data[0];
      if (
        data.length === 1 &&
        only.name.toLowerCase() === input.toLowerCase()
      ) {
        selectCity(only);
      }
    } catch (err) {
      const msg =
        err.response?.data?.error || err.response?.statusText || err.message;
      console.error("Autocomplete fetch failed:", msg);
      suggestions.value = [];
    }
  };

  const debouncedFetchSuggestions = useDebounceFn(fetchSuggestions, 300);

  const selectCity = (city) => {
    const fullLabel = `${city.name}${city.state ? ", " + city.state : ""}`;
    selectedLabel.value = fullLabel;
    query.value = fullLabel;

    flagSetter(getFlagSvg(city.country));

    suggestions.value = [];
    showSuggestions.value = false;
    highlightedIndex.value = -1;

    saveToRecentSearches(city);
    fetchWeatherByCoords(city.lat, city.lon);
  };

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

  const location = computed(
    () => selectedLabel.value || weatherData.value.name || "—"
  );

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
    "Rain:Shower Rain": "rainy-3",
    "Drizzle:Drizzle": "rainy-2",
    "Snow:Snow": "snowy-2",
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

  const isDaytime = computed(() => {
    const now = weatherData.value.dt;
    const { sunrise, sunset } = weatherData.value.sys || {};
    return now && sunrise && sunset ? now >= sunrise && now < sunset : true;
  });

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
      if (
        highlightedIndex.value >= 0 &&
        suggestions.value[highlightedIndex.value]
      ) {
        selectCity(suggestions.value[highlightedIndex.value]);
      } else if (suggestions.value.length === 1) {
        selectCity(suggestions.value[0]);
      } else {
        debounceFetchWeather();
      }
    } else if (e.key === "ArrowDown") {
      if (highlightedIndex.value < suggestions.value.length - 1) {
        highlightedIndex.value++;
      }
    } else if (e.key === "ArrowUp") {
      if (highlightedIndex.value > 0) {
        highlightedIndex.value--;
      }
    }
  };

  return {
    query,
    selectedLabel,
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
    isLoading,
    suggestions,
    showSuggestions,
    fetchSuggestions,
    debouncedFetchSuggestions,
    recentSearches,
    highlightedIndex,
    fetchWeatherByCoords,
    fetchWeather,
    restoreCachedWeather,
  };
}
