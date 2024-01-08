export default {
    name: "app",
    data() {
      return {
        api_key: process.env.VUE_APP_WEATHER_API_KEY,
        url_base: "https://api.openweathermap.org/data/2.5/",
        query: "",
        weather: {},
        temperatureUnit: "Celsius",
      };
    },
    computed: {
      isWarm() {
        return (
          typeof this.weather.main !== "undefined" &&
          this.weather.main.temp > 16
        );
      },
    },
    methods: {
      fetchWeather(e) {
        if (e.key == "Enter") {
          fetch(
            `${this.url_base}weather?q=${this.query}&units=metric&APPID=${this.api_key}`
          )
            .then((res) => res.json())
            .then(this.setResults);
        }
      },
      setResults(results) {
        this.weather = results;
      },
      dateBuilder() {
        let d = new Date();
        let months = [
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
        let days = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];
  
        let day = days[d.getDay()];
        let date = d.getDate();
        let month = months[d.getMonth()];
        let year = d.getFullYear();
  
        return `${day} ${date} ${month} ${year}`;
      },
      formatTemperature(value) {
        if (this.temperatureUnit === "Celsius") {
          return `${Math.round(value)}°C`;
        } else {
          return `${(value * 9/5 + 32).toFixed(0)}°F`;
        }
      },
  
      toggleUnits() {
        this.temperatureUnit = this.temperatureUnit === "Celsius" ? "Fahrenheit" : "Celsius";
        this.fetchWeather();
      },
    },
  };
  