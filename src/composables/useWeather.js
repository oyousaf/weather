import { ref, computed } from "vue";
import { useDebounceFn } from "@vueuse/core";

export function useWeather() {
  const query = ref("");
  const weatherData = ref({});
  const temperatureUnit = ref("Celsius");

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

  const fetchWeather = async () => {
    const city = query.value.trim();
    if (!city) return;

    try {
      const response = await fetch(
        `https://weather-rose-chi.vercel.app/api/weather?city=${encodeURIComponent(
          city
        )}`
      );
      const result = await response.json();

      if (result.cod === "404") {
        console.warn("City not found.");
        weatherData.value = {};
        return;
      }

      weatherData.value = result;
    } catch (error) {
      console.error("Error fetching weather data:", error);
      weatherData.value = {};
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

  const toggleButtonText = computed(() =>
    temperatureUnit.value === "Celsius" ? "Imperial" : "Metric"
  );

  const weatherCondition = computed(
    () => weatherData.value.weather?.[0]?.main || ""
  );

  const shouldShowWeatherDetails = computed(() =>
    ["Rain", "Snow", "Clouds"].includes(weatherCondition.value)
  );

  const weatherDetails = computed(() => {
    const condition = weatherCondition.value;
    const { rain, snow, clouds } = weatherData.value;

    if (condition === "Rain") return rain?.["1h"] ? `${rain["1h"]} mm` : "N/A";
    if (condition === "Snow") return snow?.["1h"] ? `${snow["1h"]} mm` : "N/A";
    if (condition === "Clouds") return `${clouds?.all ?? "N/A"}%`;
    return "";
  });

  const isDaytime = computed(() => {
    const now = weatherData.value.dt;
    const sunrise = weatherData.value.sys?.sunrise;
    const sunset = weatherData.value.sys?.sunset;
    return now && sunrise && sunset ? now >= sunrise && now < sunset : true;
  });

  const weatherIconUrl = computed(() => {
    const main = weatherData.value.weather?.[0]?.main || "";
    const description = weatherData.value.weather?.[0]?.description || "";

    const formattedDesc = description
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

    const formatTime = (timestamp) => {
      if (!timestamp) return "N/A";
      return new Date(timestamp * 1000).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    const convertWindDirection = (deg) => {
      const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
      return deg != null ? directions[Math.round(deg / 45) % 8] : "N/A";
    };

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
    shouldShowWeatherDetails,
    weatherDetails,
    weatherDetailsObject,
    weatherIconUrl,
    handleKeyPress,
  };
}
