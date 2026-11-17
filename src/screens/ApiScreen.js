import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import axios from 'axios';

const API_URL = 'https://api.open-meteo.com/v1/forecast';

function getWeatherDescription(code) {
  if (code === 0) return 'Clear sky';
  if ([1, 2, 3].includes(code)) return 'Partly cloudy or overcast';
  if ([45, 48].includes(code)) return 'Fog';
  if ([51, 53, 55].includes(code)) return 'Drizzle';
  if ([56, 57].includes(code)) return 'Freezing drizzle';
  if ([61, 63, 65].includes(code)) return 'Rain';
  if ([66, 67].includes(code)) return 'Freezing rain';
  if ([71, 73, 75, 77].includes(code)) return 'Snow';
  if ([80, 81, 82].includes(code)) return 'Rain showers';
  if ([85, 86].includes(code)) return 'Snow showers';
  if ([95, 96, 99].includes(code)) return 'Thunderstorm';
  return 'Weather unavailable';
}

export default function WeatherScreen() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchWeather = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.get(API_URL, {
        params: {
          latitude: 31.5204,
          longitude: 74.3587,
          current: [
            'temperature_2m',
            'relative_humidity_2m',
            'apparent_temperature',
            'weather_code',
            'wind_speed_10m',
          ].join(','),
          timezone: 'Asia/Karachi',
        },
        timeout: 12000,
      });

      if (!response.data || !response.data.current) {
        throw new Error('Weather data was not returned.');
      }

      setWeather(response.data.current);
    } catch (err) {
      setError(
        err.message ||
          'Could not load weather. Check your internet connection.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.message}>Loading Lahore weather...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
        <Pressable style={styles.button} onPress={fetchWeather}>
          <Text style={styles.buttonText}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.city}>Lahore, Pakistan</Text>

      <Text style={styles.temperature}>
        {Math.round(weather.temperature_2m)}°C
      </Text>

      <Text style={styles.description}>
        {getWeatherDescription(weather.weather_code)}
      </Text>

      <Text style={styles.details}>
        Feels like: {Math.round(weather.apparent_temperature)}°C
      </Text>

      <Text style={styles.details}>
        Humidity: {weather.relative_humidity_2m}%
      </Text>

      <Text style={styles.details}>
        Wind: {weather.wind_speed_10m} km/h
      </Text>

      <Pressable style={styles.button} onPress={fetchWeather}>
        <Text style={styles.buttonText}>Refresh</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#EFF6FF',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#EFF6FF',
  },
  city: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  temperature: {
    marginTop: 16,
    fontSize: 64,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  description: {
    marginTop: 4,
    fontSize: 20,
    color: '#334155',
  },
  details: {
    marginTop: 10,
    fontSize: 16,
    color: '#475569',
  },
  message: {
    marginTop: 10,
    color: '#475569',
  },
  error: {
    marginBottom: 12,
    color: '#DC2626',
    textAlign: 'center',
  },
  button: {
    marginTop: 24,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#2563EB',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});