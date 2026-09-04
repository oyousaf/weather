import { computed, ref } from "vue";
import { useLocalStorage } from "@vueuse/core";

export function useWeather() {
  const query = ref("");
  const selectedLabel = ref("");
  const weatherData = useLocalStorage(
    "weatherly:cachedWeather",
    {},
    {
      serializer: {
        read: (raw) => (raw ? JSON.parse(raw) : {}),
        write: (value) => JSON.stringify(value),
      },
    },
  );
  const suggestions = ref([]);
  const showSuggestions = ref(false);
  const highlightedIndex = ref(-1);
  const isLoading = ref(false);
  const isLocating = ref(false);
  const isFetching = ref(false);
  const errorMessage = ref("");
  const unit = useLocalStorage("weatherly:unit", "C");
  let searchTimer;
  let suggestionTimer;

  if (import.meta.client) {
    const CACHE_MAX_AGE_MS = 30 * 60 * 1000;
    const cached = weatherData.value;
    if (cached?.dt) {
      const fetchedAt = cached.dt * 1000;
      if (Date.now() - fetchedAt > CACHE_MAX_AGE_MS) {
        weatherData.value = {};
      }
    }
  }

  const condition = computed(() => weatherData.value.weather?.[0]?.main || "");
  const description = computed(
    () => weatherData.value.weather?.[0]?.description || "",
  );const titleCase = (s) =>
  s
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\b(of|de|la|el|los|las|da|do|das|di|du|le|the|and|in|on|at|to|from|by|for|with|st|saint)\b/g, (m) => m.toLowerCase());
  const location = computed(
    () => titleCase(selectedLabel.value || weatherData.value.name || "Your local forecast"),
  );
  const country = computed(() => weatherData.value.sys?.country || "");
  const theme = computed(() => {
    const id = weatherData.value.weather?.[0]?.id || 800;
    if (id >= 200 && id < 300) return "storm";
    if (id >= 300 && id < 600) return "rain";
    if (id >= 600 && id < 700) return "snow";
    if (id >= 700 && id < 800) return "mist";
    if (id === 800) return "clear";
    return "clouds";
  });
  const tempTint = computed(() => {
    const raw = weatherData.value.main?.temp;
    if (raw == null) return null;
    const temp = Math.max(-20, Math.min(45, raw));
    let hue;
    if (temp <= 25) {
      const norm = (temp + 20) / 45;
      hue = 210 - norm * 180;
    } else {
      const norm = (temp - 25) / 20;
      hue = 30 - norm * 22;
    }
    const heat = Math.max(0, (temp - 25) / 20);
    const sat = 65 + heat * 30;
    const light = 58 - heat * 8;
    const accentHue = temp >= 25 ? Math.max(0, hue - 12) : hue + 12;
    return { hue, sat, light, accentHue };
  });
  const tempStyle = computed(() => {
    const t = tempTint.value;
    if (!t) return {};
    return {
      "--temp-tint": `hsl(${t.hue.toFixed(1)} ${t.sat.toFixed(1)}% ${t.light.toFixed(1)}%)`,
      "--temp-accent": `hsl(${t.accentHue.toFixed(1)} ${t.sat.toFixed(1)}% ${Math.min(72, t.light + 10).toFixed(1)}%)`,
      "--temp-tint-opacity": (Math.min(1, Math.abs(t.accentHue - 75) / 80) * 0.5).toFixed(3),
    };
  });
  const isDay = computed(() => {
    const now = weatherData.value.dt;
    const { sunrise, sunset } = weatherData.value.sys || {};
    return !now || !sunrise || !sunset || (now >= sunrise && now < sunset);
  });
  const iconUrl = computed(() => {
    const icon = weatherData.value.weather?.[0]?.icon;
    return icon ? `https://openweathermap.org/img/wn/${icon}@4x.png` : "";
  });
  const temperature = (value) => {
    if (value == null) return "—";
    return unit.value === "C"
      ? `${Math.round(value)}°`
      : `${Math.round((value * 9) / 5 + 32)}°`;
  };
  const wind = computed(() => {
    const speed = weatherData.value.wind?.speed;
    return speed == null ? "—" : `${Math.round(speed * 2.237)} mph`;
  });
  const formatTime = (value) =>
    value
      ? new Date(value * 1000).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—";
  const details = computed(() => [
    ["Feels like", temperature(weatherData.value.main?.feels_like), "°"],
    [
      "Humidity",
      weatherData.value.main?.humidity != null
        ? `${weatherData.value.main.humidity}%`
        : "—",
      "◌",
    ],
    ["Wind", wind.value, "↗"],
    [
      "Visibility",
      weatherData.value.visibility
        ? `${(weatherData.value.visibility / 1609).toFixed(1)} mi`
        : "—",
      "◉",
    ],
    [
      "Pressure",
      weatherData.value.main?.pressure
        ? `${weatherData.value.main.pressure} hPa`
        : "—",
      "⌁",
    ],
    ["Sunrise", formatTime(weatherData.value.sys?.sunrise), "↗"],
  ]);
  const flag = computed(() => {
    const code = country.value;
    if (!code || code.length !== 2) return "";
    return code
      .toUpperCase()
      .replace(/[A-Z]/g, (letter) =>
        String.fromCodePoint(letter.charCodeAt(0) + 127397),
      );
  });
  const localDate = computed(() => {
    const dt = weatherData.value.dt;
    if (!dt) return "";
    return new Date(
      (dt + (weatherData.value.timezone || 0)) * 1000,
    ).toLocaleString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
  });
  const lastUpdated = computed(() => {
    const dt = weatherData.value.dt;
    if (!dt) return "";
    const diffMs = Date.now() - dt * 1000;
    const minutes = Math.max(0, Math.round(diffMs / 60000));
    if (minutes < 1) return "Updated just now";
    if (minutes === 1) return "Updated 1 min ago";
    if (minutes < 60) return `Updated ${minutes} min ago`;
    const hours = Math.round(minutes / 60);
    return hours === 1 ? "Updated 1 hour ago" : `Updated ${hours} hours ago`;
  });

  const fetchWeather = async (params) => {
    isFetching.value = true;
    isLoading.value = true;
    errorMessage.value = "";
    try {
      const data = await $fetch("/api/weather", { query: params });
      weatherData.value = data;
      if (params.city) selectedLabel.value = params.city;
    } catch (error) {
      const status = error?.response?.status;
      const message = error?.data?.statusMessage || error?.statusMessage;
      if (!status && /fetch|network/i.test(error?.message || "")) {
        errorMessage.value = "You're offline. Check your connection.";
      } else if (status === 404) {
        errorMessage.value = "We couldn't find that place.";
      } else if (message) {
        errorMessage.value = message;
      } else {
        errorMessage.value = "We couldn't find that forecast.";
      }
      if (status === 404) weatherData.value = {};
    } finally {
      isFetching.value = false;
      isLoading.value = false;
    }
  };
  const search = () => {
    const value = query.value.trim();
    if (value) fetchWeather({ city: value });
    showSuggestions.value = false;
  };
  const fetchSuggestions = async () => {
    const value = query.value.trim();
    if (value.length < 2) {
      suggestions.value = [];
      showSuggestions.value = false;
      return;
    }
    showSuggestions.value = true;
    try {
      suggestions.value = await $fetch("/api/suggest", {
        query: { query: value },
      });
    } catch {
      suggestions.value = [];
    }
  };
  const onInput = () => {
    clearTimeout(searchTimer);
    clearTimeout(suggestionTimer);
    suggestionTimer = setTimeout(fetchSuggestions, 250);
    searchTimer = setTimeout(search, 1300);
  };
  const selectCity = (city) => {
    clearTimeout(searchTimer);
    clearTimeout(suggestionTimer);
    const label = `${city.name}${city.state ? `, ${city.state}` : ""}`;
    query.value = label;
    selectedLabel.value = label;
    suggestions.value = [];
    showSuggestions.value = false;
    fetchWeather({ lat: city.lat, lon: city.lon });
  };
  const handleKeydown = (event) => {
    if (event.key === "ArrowDown")
      highlightedIndex.value = Math.min(
        highlightedIndex.value + 1,
        suggestions.value.length - 1,
      );
    if (event.key === "ArrowUp")
      highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0);
    if (event.key === "Enter") {
      const city = suggestions.value[highlightedIndex.value];
      city ? selectCity(city) : search();
    }
  };

  const locateByIp = async () => {
    const lastAttempt = localStorage.getItem("weatherly:ipLookupAt");
    const ONE_DAY = 24 * 60 * 60 * 1000;
    if (lastAttempt && Date.now() - Number(lastAttempt) < ONE_DAY) return;
    isFetching.value = true;
    isLoading.value = true;
    try {
      const data = await $fetch("/api/geo");
      if (data && data.lat != null && data.lon != null) {
        if (data.city) selectedLabel.value = data.city;
        fetchWeather({ lat: String(data.lat), lon: String(data.lon) });
      }
      localStorage.setItem("weatherly:ipLookupAt", String(Date.now()));
    } catch {} finally {
      isFetching.value = false;
      isLoading.value = false;
    }
  };
  const locate = () => {
    if (!navigator.geolocation) {
      errorMessage.value =
        "Your browser doesn't support location services — try searching for a city.";
      return;
    }
    isLocating.value = true;
    isLoading.value = true;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        isLocating.value = false;
        fetchWeather({ lat: coords.latitude, lon: coords.longitude });
      },
      (err) => {
        isLocating.value = false;
        isLoading.value = false;
        if (err.code === err.PERMISSION_DENIED) {
          errorMessage.value =
            "Location access denied — search for a city instead.";
        } else if (err.code === err.TIMEOUT) {
          errorMessage.value =
            "Location request timed out — search for a city instead.";
        } else {
          errorMessage.value =
            "We couldn't get your location — search for a city instead.";
        }
      },
      { timeout: 6000 },
    );
  };

  return {
    query,
    selectedLabel,
    weatherData,
    suggestions,
    showSuggestions,
    highlightedIndex,
    isLoading,
    isLocating,
    isFetching,
    errorMessage,
    condition,
    description,
    location,
    country,
    flag,
    theme,
    tempTint,
    tempStyle,
    isDay,
    iconUrl,
    temperature,
    wind,
    details,
    localDate,
    lastUpdated,
    unit,
    onInput,
    selectCity,
    handleKeydown,
    search,
    locate,
    locateByIp,
  };
}
