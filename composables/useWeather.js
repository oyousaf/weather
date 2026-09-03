import { computed, ref } from "vue";

export function useWeather() {
  const query = ref("");
  const selectedLabel = ref("");
  const weatherData = ref({});
  const suggestions = ref([]);
  const showSuggestions = ref(false);
  const highlightedIndex = ref(-1);
  const isLoading = ref(false);
  const errorMessage = ref("");
  const unit = ref("C");
  let searchTimer;
  let suggestionTimer;

  const condition = computed(() => weatherData.value.weather?.[0]?.main || "");
  const description = computed(() => weatherData.value.weather?.[0]?.description || "");
  const location = computed(() => selectedLabel.value || weatherData.value.name || "Your local forecast");
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
    return unit.value === "C" ? `${Math.round(value)}°` : `${Math.round(value * 9 / 5 + 32)}°`;
  };
  const wind = computed(() => {
    const speed = weatherData.value.wind?.speed;
    return speed == null ? "—" : `${Math.round(speed * 2.237)} mph`;
  });
  const formatTime = (value) => value
    ? new Date(value * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "—";
  const details = computed(() => [
    ["Feels like", temperature(weatherData.value.main?.feels_like), "°"],
    ["Humidity", weatherData.value.main?.humidity != null ? `${weatherData.value.main.humidity}%` : "—", "◌"],
    ["Wind", wind.value, "↗"],
    ["Visibility", weatherData.value.visibility ? `${(weatherData.value.visibility / 1609).toFixed(1)} mi` : "—", "◉"],
    ["Pressure", weatherData.value.main?.pressure ? `${weatherData.value.main.pressure} hPa` : "—", "⌁"],
    ["Sunrise", formatTime(weatherData.value.sys?.sunrise), "↗"],
  ]);
  const flag = computed(() => country.value.toUpperCase().replace(/[A-Z]/g, (letter) =>
    String.fromCodePoint(letter.charCodeAt(0) + 127397)));

  const fetchWeather = async (params) => {
    isLoading.value = true;
    errorMessage.value = "";
    try {
      const data = await $fetch("/api/weather", { query: params });
      weatherData.value = data;
      if (params.city) selectedLabel.value = params.city;
      if (import.meta.client) localStorage.setItem("cachedWeather", JSON.stringify(data));
    } catch (error) {
      errorMessage.value = error?.statusMessage || "We couldn't find that forecast.";
      weatherData.value = {};
    } finally {
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
    try {
      suggestions.value = await $fetch("/api/suggest", { query: { query: value } });
      showSuggestions.value = true;
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
    const label = `${city.name}${city.state ? `, ${city.state}` : ""}`;
    query.value = label;
    selectedLabel.value = label;
    suggestions.value = [];
    showSuggestions.value = false;
    fetchWeather({ lat: city.lat, lon: city.lon });
  };
  const handleKeydown = (event) => {
    if (event.key === "ArrowDown") highlightedIndex.value = Math.min(highlightedIndex.value + 1, suggestions.value.length - 1);
    if (event.key === "ArrowUp") highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0);
    if (event.key === "Enter") {
      const city = suggestions.value[highlightedIndex.value];
      city ? selectCity(city) : search();
    }
  };
  const locate = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => fetchWeather({ lat: coords.latitude, lon: coords.longitude }),
      () => fetchWeather({ city: "London" }),
      { timeout: 6000 }
    );
  };

  return {
    query, selectedLabel, weatherData, suggestions, showSuggestions, highlightedIndex,
    isLoading, errorMessage, condition, description, location, country, flag, theme,
    isDay, iconUrl, temperature, wind, details, unit, onInput, selectCity, handleKeydown,
    search, locate,
  };
}
