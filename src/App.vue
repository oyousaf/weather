<template>
  <div
    id="app"
    :class="[
      'min-h-screen bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800',
      temperatureClass,
    ]"
  >
    <main class="flex flex-col items-center px-4 py-10 text-white font-sans">
      <!-- Search Bar with Autocomplete -->
      <div class="w-full max-w-2xl mb-8 relative">
        <input
          v-model="query"
          name="query"
          @input="onInput"
          @keydown.enter="handleKeyPress"
          @blur="handleBlur"
          type="text"
          placeholder="Search for a city..."
          class="w-full p-4 text-lg text-center text-teal-700 rounded-2xl bg-white/60 backdrop-blur-sm shadow-xl placeholder:text-teal-800 focus:outline-none focus:ring-4 focus:ring-white transition"
          aria-label="Enter city name"
        />

        <transition name="fade">
          <ul
            v-if="suggestions.length && showSuggestions"
            class="absolute z-10 w-full bg-white text-teal-900 rounded-xl mt-1 shadow-lg overflow-hidden"
          >
            <li
              v-for="(city, index) in suggestions"
              :key="index"
              @click="selectCity(city)"
              class="px-4 py-2 hover:bg-teal-100 cursor-pointer transition flex items-center gap-2"
            >
              <span
                v-html="getFlagSvg(city.country)"
                class="w-5 h-4 rounded-sm overflow-hidden"
              ></span>
              <span>
                {{ city.name }}{{ city.state ? ", " + city.state : "" }}
              </span>
            </li>
          </ul>
        </transition>
      </div>

      <!-- Loader -->
      <transition name="fade">
        <div
          v-if="isLoading"
          class="flex items-center gap-3 text-white text-lg font-medium tracking-wide my-6"
        >
          <svg
            class="animate-spin h-6 w-6 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        </div>
      </transition>

      <!-- Weather Display -->
      <transition name="fade">
        <section
          v-if="weatherData.main && !isLoading"
          class="glassmorphic-card w-full max-w-5xl p-8 rounded-3xl shadow-2xl space-y-6"
        >
          <!-- Location + Flag + Date -->
          <header class="text-center space-y-1">
            <div class="flex justify-center items-center gap-2">
              <span class="text-4xl font-bold tracking-wide">
                {{ location }}
              </span>
              <span
                v-if="svgFlag"
                class="w-10 h-7 rounded-md overflow-hidden shadow ring-1 ring-white/30 inline-flex items-center justify-center translate-y-[1px]"
                v-html="svgFlag"
                aria-label="Country flag"
              ></span>
            </div>
            <p class="text-lg font-light">{{ currentDate }}</p>
          </header>

          <!-- Weather Icon & Description -->
          <div
            class="flex flex-col md:flex-row items-center justify-center gap-6"
          >
            <div class="flex flex-col items-center space-y-2">
              <transition name="fade">
                <img
                  v-if="weatherIconUrl"
                  :src="weatherIconUrl"
                  :alt="weatherCondition"
                  class="w-32 h-32 drop-shadow-lg"
                />
              </transition>
              <p class="text-3xl font-semibold italic">
                {{ weatherCondition }}
              </p>
              <p
                v-if="shouldShowWeatherDetails"
                class="text-md font-light text-teal-200"
              >
                {{ weatherDetails }}
              </p>
            </div>

            <!-- Temperature -->
            <div
              class="bg-white/20 backdrop-blur-md rounded-2xl p-8 text-6xl font-extrabold shadow-inner text-center"
            >
              {{ formattedTemperature(weatherData.main?.temp) }}
            </div>
          </div>

          <!-- Unit Toggle -->
          <div class="flex justify-center">
            <button
              @click="toggleUnits"
              class="uppercase px-6 py-2 bg-teal-600 hover:bg-teal-400 text-white font-semibold tracking-wider rounded-full transition-all shadow"
            >
              Switch to {{ toggleButtonText }}
            </button>
          </div>

          <!-- Weather Details Grid -->
          <div
            class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 mt-6 text-center"
          >
            <div
              v-for="(value, label) in weatherDetailsObject"
              :key="label"
              class="flex flex-col items-center justify-center p-4 bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg hover:scale-105 transition-all"
            >
              <div class="text-sm text-teal-200 uppercase font-semibold">
                {{ label }}
              </div>
              <div class="text-lg font-bold mt-1">{{ value }}</div>
            </div>
          </div>
        </section>
      </transition>
    </main>
  </div>
</template>

<script setup>
import { useWeather } from "./composables/useWeather";
import { useFlag } from "./composables/useFlag";
import { flagMap } from "./constants/flagMap";

// Weather state and helpers
const {
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
  handleKeyPress,
  weatherIconUrl,
  selectCity,
  isLoading,
  suggestions,
  showSuggestions,
  debouncedFetchSuggestions,
} = useWeather();

// Flag for the selected weather result
const { svgFlag } = useFlag(countryCode);

// Input + Suggestion Logic
const onInput = () => {
  debounceFetchWeather();
  debouncedFetchSuggestions();
};

const handleBlur = () => {
  setTimeout(() => {
    showSuggestions.value = false;
  }, 150);
};

// Encode any flag to base64 img tag
const getFlagSvg = (code) => {
  const svg = flagMap[code?.trim()?.toUpperCase()];
  return svg
    ? `<img src="data:image/svg+xml;base64,${btoa(
        svg
      )}" class="w-full h-full object-cover" />`
    : "";
};
</script>

<style scoped>
.glassmorphic-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
