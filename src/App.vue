<template>
  <div
    id="app"
    :class="[
      'min-h-screen bg-gradient-to-br from-blue-600 via-teal-700 to-indigo-800',
      temperatureClass,
    ]"
  >
    <main
      class="flex flex-col items-center justify-start px-4 py-10 text-white font-sans"
    >
      <!-- Search -->
      <div class="w-full max-w-2xl mb-8">
        <input
          v-model="query"
          @input="debounceFetchWeather"
          @keypress="handleKeyPress"
          type="text"
          placeholder="Search for a city..."
          class="w-full p-4 text-lg text-center text-black rounded-2xl bg-white/60 backdrop-blur-sm shadow-xl placeholder:text-gray-700 focus:outline-none focus:ring-4 focus:ring-white transition"
          aria-label="Enter city name"
        />
      </div>

      <!-- Main Weather Card -->
      <section
        v-if="weatherData.main"
        class="glassmorphic-card w-full max-w-5xl text-white p-8 rounded-3xl shadow-2xl space-y-6"
      >
        <!-- Location & Date -->
        <header class="text-center space-y-1">
          <h1 class="text-4xl font-bold tracking-wide">{{ location }}</h1>
          <p class="text-lg font-light">{{ currentDate }}</p>
        </header>

        <!-- Temperature & Condition -->
        <div
          class="flex flex-col md:flex-row items-center justify-center gap-6"
        >
          <div class="flex flex-col items-center space-y-2">
            <img
              v-if="weatherIconUrl"
              :src="weatherIconUrl"
              alt="Weather Icon"
              class="w-32 h-32 drop-shadow-lg"
            />
            <p class="text-3xl font-semibold italic">{{ weatherCondition }}</p>
            <p
              v-if="shouldShowWeatherDetails"
              class="text-md font-light text-teal-200"
            >
              {{ weatherDetails }}
            </p>
          </div>

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
            class="uppercase px-6 py-2 bg-teal-600 hover:bg-teal-400 text-white font-semibold tracking-wider rounded-full transition-all shadow-md"
          >
            Switch to {{ toggleButtonText }}
          </button>
        </div>

        <!-- Details Grid -->
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
    </main>
  </div>
</template>

<script>
import { useWeather } from "./composables/useWeather";

export default {
  name: "App",
  setup() {
    const {
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
    } = useWeather();

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
  },
};
</script>

<style scoped>
.glassmorphic-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
</style>
