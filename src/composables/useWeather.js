import { ref, computed } from "vue";
import { useDebounceFn } from "@vueuse/core";

export function useWeather(apiKey) {
  const baseUrl = "https://api.openweathermap.org/data/2.5/";
  const query = ref("");
  const weatherData = ref({});
  const temperatureUnit = ref("Celsius");

  const fetchWeather = async () => {
    if (!query.value.trim()) return;

    try {
      const response = await fetch(
        `${baseUrl}weather?q=${query.value}&units=metric&APPID=${apiKey}`
      );
      weatherData.value = await response.json();
    } catch (error) {
      console.error("Error fetching weather data:", error);
    }
  };

  const debounceFetchWeather = useDebounceFn(fetchWeather, 1500);

  const formattedTemperature = computed(() => {
    const temp = weatherData.value.main?.temp;
    return temperatureUnit.value === "Celsius"
      ? `${Math.round(temp)}°C`
      : `${((temp * 9) / 5 + 32).toFixed(0)}°F`;
  });

  const toggleUnits = () => {
    temperatureUnit.value =
      temperatureUnit.value === "Celsius" ? "Fahrenheit" : "Celsius";
    fetchWeather();
  };

  const temperatureClass = computed(() => {
    const temp = weatherData.value.main?.temp;
    if (temp === undefined) return "";
    if (temp <= 3) return "freezing";
    if (temp <= 16) return "cool";
    if (temp <= 24) return "warm";
    return "hot";
  });

  const location = computed(
    () => `${weatherData.value.name}, ${weatherData.value.sys?.country}`
  );

  const currentDate = computed(() => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    // Get the timezone offset (seconds from UTC)
    const timezoneOffset = weatherData.value.timezone || 0;
    // Convert the UTC timestamp to local time
    const d = new Date((weatherData.value.dt + timezoneOffset) * 1000);

    return `${days[d.getDay()]} ${d.getDate()} ${
      months[d.getMonth()]
    } ${d.getFullYear()} ${d.toLocaleTimeString()}`;
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

  const weatherConditionClass = computed(
    () => `${weatherCondition.value.toLowerCase()}-animation`
  );

  const weatherDetails = computed(() => {
    const condition = weatherData.value.weather?.[0]?.main;
    if (condition === "Rain")
      return weatherData.value.rain?.["1h"]
        ? `${weatherData.value.rain["1h"]} mm`
        : "N/A";
    if (condition === "Snow")
      return weatherData.value.snow?.["1h"]
        ? `${weatherData.value.snow["1h"]} mm`
        : "N/A";
    if (condition === "Clouds") return `${weatherData.value.clouds?.all}%`;
    return "";
  });

  const weatherIconUrl = computed(() => {
    const iconCode = weatherData.value.weather?.[0]?.icon;
    return iconCode
      ? `https://openweathermap.org/img/wn/${iconCode}@4x.png`
      : "";
  });

  const weatherDetailsObject = computed(() => ({
    "Feels Like": formattedTemperature.value,
    Humidity: `${weatherData.value.main?.humidity}%`,
    Winds: `${weatherData.value.wind?.speed.toFixed(0)} MPH`,
    Pressure: `${weatherData.value.main?.pressure} hPa`,
    Visibility: `${weatherData.value.visibility / 1000} km`,
  }));

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      fetchWeather();
    }
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
