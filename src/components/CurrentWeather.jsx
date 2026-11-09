import { MapPin, Thermometer, Droplets, Wind } from 'lucide-react'
import WeatherIcon from './WeatherIcon'
import { getWeatherInfo } from '../api/weather'

export default function CurrentWeather({ city, weatherData, tempUnit = 'C' }) {
  const current = weatherData?.current
  if (!current) return null

  const weatherMeta = getWeatherInfo(current.weather_code)

  // 섭씨 ↔ 화씨 변환
  const convertTemp = (celsius) => {
    if (celsius == null) return 0
    return tempUnit === 'F' ? Math.round((celsius * 9) / 5 + 32) : Math.round(celsius)
  }

  const currentTemp = convertTemp(current.temperature_2m)
  const apparentTemp = convertTemp(current.apparent_temperature)

  return (
    <section className="card weather-card">
      <div className="card-header">
        <div>
          <span className="location-tag">
            <MapPin size={14} />
            {city.name}
          </span>
          <h2>현재 날씨</h2>
        </div>
        <div
          className="weather-badge"
          style={{
            backgroundColor: `${weatherMeta.color}1a`,
            color: weatherMeta.color
          }}
        >
          {weatherMeta.label}
        </div>
      </div>

      <div className="weather-main-row">
        <div className="icon-wrapper">
          <WeatherIcon
            iconName={weatherMeta.icon}
            size={72}
            color={weatherMeta.color}
          />
        </div>
        <div className="temp-display">
          <span className="temp-value">{currentTemp}</span>
          <span className="temp-unit">°{tempUnit}</span>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-item">
          <Thermometer size={20} className="metric-icon metric-temp" />
          <div className="metric-info">
            <span className="metric-label">체감 온도</span>
            <span className="metric-value">{apparentTemp}°{tempUnit}</span>
          </div>
        </div>

        <div className="metric-item">
          <Droplets size={20} className="metric-icon metric-humidity" />
          <div className="metric-info">
            <span className="metric-label">습도</span>
            <span className="metric-value">{current.relative_humidity_2m}%</span>
          </div>
        </div>

        <div className="metric-item">
          <Wind size={20} className="metric-icon metric-wind" />
          <div className="metric-info">
            <span className="metric-label">풍속</span>
            <span className="metric-value">{current.wind_speed_10m} km/h</span>
          </div>
        </div>
      </div>
    </section>
  )
}
