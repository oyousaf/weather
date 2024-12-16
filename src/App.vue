<template>
  <div id="app" :class="temperatureClass">
    <main class="items-center text-center">
      <!-- Cotainer -->
      <div class="max-w-7xl mx-auto relative">
        <!-- Search Bar -->
        <div class="mb-8">
          <input
            id="input"
            type="text"
            class="w-full p-4 text-teal-700 text-xl text-center outline-none bg-white/70 focus:bg-white transition-all duration-300 shadow-md rounded-full focus:ring-4 focus:ring-teal-600 focus:border-transparent"
            placeholder="Enter location..."
            v-model="query"
            @keypress="handleKeyPress"
            @input="debounceFetchWeather"
          />
        </div>

        <!-- Weather Display -->
        <div v-if="weatherData.main" class="text-white">
          <!-- Location and Date -->
          <div class="mb-4">
            <h1 class="text-3xl font-medium drop-shadow-md">{{ location }}</h1>
            <p class="text-2xl mt-2 font-light italic drop-shadow-lg">
              {{ currentDate }}
            </p>
          </div>

          <!-- Temperature -->
          <div
            class="inline-block items-center justify-center p-4 text-7xl font-bold drop-shadow-lg bg-white/25 rounded-2xl my-8 shadow-lg"
          >
            {{ formattedTemperature }}
          </div>

          <!-- Toggle Units Button -->
          <button
            @click="toggleUnits"
            class="flex uppercase text-2xl mx-auto m-4 p-2 font-bold bg-teal-700 shadow-teal-700 rounded-md hover:bg-teal-500 transition-all duration-300"
          >
            {{ toggleButtonText }}
          </button>

          <!-- Weather Condition -->
          <div class="p-4 text-5xl font-bold italic drop-shadow-lg">
            <transition name="fade">
              <img
                :src="weatherIconUrl"
                alt="Weather Icon"
                v-if="weatherCondition"
                class="mx-auto mt-8 w-32 h-32"
              />
            </transition>
            {{ weatherCondition }}
          </div>

          <!-- Additional Weather Details -->
          <div
            className="grid md:grid-cols-5 grid-cols-3 gap-4 text-center mt-8"
          >
            <div
              v-for="(detail, label) in weatherDetailsObject"
              :key="label"
              class="p-4 text-2xl font-bold bg-white/25 rounded-2xl shadow-lg"
            >
              <div class="text-xl text-teal-500 font-semibold">{{ label }}</div>
              <div>{{ detail }}</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { useWeather } from "./composables/useWeather";

export default {
  name: "App",
  setup() {
    const apiKey = process.env.VUE_APP_WEATHER_API_KEY;
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
    } = useWeather(apiKey);

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
