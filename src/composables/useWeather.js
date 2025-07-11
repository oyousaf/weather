import { ref, computed } from "vue";
import { useDebounceFn } from "@vueuse/core";

export function useWeather() {
  const query = ref("");
  const weatherData = ref({});
  const temperatureUnit = ref("Celsius");

  const fetchWeather = async () => {
    if (!query.value.trim()) return;

    try {
      const response = await fetch(
        `/api/weather?city=${encodeURIComponent(query.value.trim())}`
      );
      const result = await response.json();
      weatherData.value = result;
    } catch (error) {
      console.error(
        "Error fetching weather data from serverless function:",
        error
      );
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

  const weatherIconUrl = computed(() => {
    const icon = weatherData.value.weather?.[0]?.icon;
    return icon ? `https://openweathermap.org/img/wn/${icon}@4x.png` : "";
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
