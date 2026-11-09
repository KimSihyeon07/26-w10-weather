import { useState, useEffect, useCallback } from 'react'
import {
  Sun,
  SunDim,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  Snowflake,
  CloudLightning,
  Thermometer,
  Droplets,
  Wind,
  RefreshCw,
  AlertCircle,
  MapPin,
  Activity
} from 'lucide-react'
import {
  DEFAULT_CITIES,
  getWeatherInfo,
  getAirQualityStatus,
  fetchWeatherData,
  fetchAirQualityData
} from './api/weather'
import './App.css'

// 날씨 아이콘 맵핑 컴포넌트
function WeatherIcon({ iconName, size = 48, color = '#f59e0b', className = '' }) {
  const iconMap = {
    Sun,
    SunDim,
    CloudSun,
    Cloud,
    CloudFog,
    CloudDrizzle,
    CloudRain,
    Snowflake,
    CloudLightning,
  }

  const IconComponent = iconMap[iconName] || Cloud
  return <IconComponent size={size} color={color} className={className} strokeWidth={2} />
}

export default function App() {
  const [selectedCity, setSelectedCity] = useState(DEFAULT_CITIES[0])
  const [weatherData, setWeatherData] = useState(null)
  const [airQualityData, setAirQualityData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 날씨 및 미세먼지 데이터 통합 조회
  const loadData = useCallback(async (city) => {
    setLoading(true)
    setError(null)

    try {
      const [weatherRes, airQualityRes] = await Promise.all([
        fetchWeatherData(city.lat, city.lon),
        fetchAirQualityData(city.lat, city.lon)
      ])

      setWeatherData(weatherRes)
      setAirQualityData(airQualityRes)
    } catch (err) {
      console.error('데이터 조회 오류:', err)
      setError('기상 및 미세먼지 정보를 불러오지 못했습니다. 네트워크 상태를 확인해주세요.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let ignore = false

    const executeFetch = async () => {
      try {
        setLoading(true)
        setError(null)
        const [weatherRes, airQualityRes] = await Promise.all([
          fetchWeatherData(selectedCity.lat, selectedCity.lon),
          fetchAirQualityData(selectedCity.lat, selectedCity.lon)
        ])
        if (!ignore) {
          setWeatherData(weatherRes)
          setAirQualityData(airQualityRes)
        }
      } catch (err) {
        if (!ignore) {
          console.error('데이터 조회 오류:', err)
          setError('기상 및 미세먼지 정보를 불러오지 못했습니다. 네트워크 상태를 확인해주세요.')
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    executeFetch()

    return () => {
      ignore = true
    }
  }, [selectedCity])

  // 현재 날씨 가공 데이터
  const currentWeather = weatherData?.current
  const weatherMeta = currentWeather ? getWeatherInfo(currentWeather.weather_code) : null

  // 미세먼지 가공 데이터
  const currentAir = airQualityData?.current
  const pm10 = currentAir?.pm10 ?? 0
  const pm25 = currentAir?.pm2_5 ?? 0
  const airQualityMeta = currentAir ? getAirQualityStatus(pm10, pm25) : null

  return (
    <div className="weather-app">
      {/* 1. 상단 헤더 & 빠른 도시 선택 바 */}
      <header className="app-header">
        <div className="header-title-row">
          <div className="logo-group">
            <CloudSun className="logo-icon" size={30} />
            <h1>실시간 날씨 & 미세먼지</h1>
          </div>
          <button
            type="button"
            className="refresh-btn"
            onClick={() => loadData(selectedCity)}
            disabled={loading}
            title="새로고침"
          >
            <RefreshCw size={18} className={loading ? 'spin-icon' : ''} />
            <span>새로고침</span>
          </button>
        </div>

        <nav className="city-selector" aria-label="주요 도시 선택">
          {DEFAULT_CITIES.map((city) => {
            const isSelected = selectedCity.name === city.name
            return (
              <button
                key={city.name}
                type="button"
                className={`city-chip ${isSelected ? 'active' : ''}`}
                onClick={() => setSelectedCity(city)}
              >
                <MapPin size={14} className="pin-icon" />
                {city.name}
              </button>
            )
          })}
        </nav>
      </header>

      {/* 2. 메인 컨텐츠 영역 */}
      <main className="main-content">
        {loading && (
          <div className="state-card loading-card">
            <RefreshCw size={40} className="spin-icon" color="#3b82f6" />
            <p className="state-title">{selectedCity.name}의 실시간 기상 정보를 불러오는 중...</p>
            <p className="state-desc">잠시만 기다려 주세요.</p>
          </div>
        )}

        {error && !loading && (
          <div className="state-card error-card">
            <AlertCircle size={44} color="#ef4444" />
            <p className="state-title">데이터를 불러오는 중 문제가 발생했습니다</p>
            <p className="state-desc">{error}</p>
            <button
              type="button"
              className="retry-btn"
              onClick={() => loadData(selectedCity)}
            >
              다시 시도
            </button>
          </div>
        )}

        {!loading && !error && currentWeather && currentAir && (
          <div className="dashboard-grid">
            {/* 현재 날씨 카드 */}
            <section className="card weather-card">
              <div className="card-header">
                <div>
                  <span className="location-tag">
                    <MapPin size={14} />
                    {selectedCity.name}
                  </span>
                  <h2>현재 날씨</h2>
                </div>
                <div className="weather-badge" style={{ backgroundColor: `${weatherMeta.color}1a`, color: weatherMeta.color }}>
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
                  <span className="temp-value">{Math.round(currentWeather.temperature_2m)}</span>
                  <span className="temp-unit">°C</span>
                </div>
              </div>

              <div className="metrics-grid">
                <div className="metric-item">
                  <Thermometer size={20} className="metric-icon metric-temp" />
                  <div className="metric-info">
                    <span className="metric-label">체감 온도</span>
                    <span className="metric-value">{Math.round(currentWeather.apparent_temperature)}°C</span>
                  </div>
                </div>

                <div className="metric-item">
                  <Droplets size={20} className="metric-icon metric-humidity" />
                  <div className="metric-info">
                    <span className="metric-label">습도</span>
                    <span className="metric-value">{currentWeather.relative_humidity_2m}%</span>
                  </div>
                </div>

                <div className="metric-item">
                  <Wind size={20} className="metric-icon metric-wind" />
                  <div className="metric-info">
                    <span className="metric-label">풍속</span>
                    <span className="metric-value">{currentWeather.wind_speed_10m} km/h</span>
                  </div>
                </div>
              </div>
            </section>

            {/* 미세먼지 카드 */}
            <section className="card air-quality-card">
              <div className="card-header">
                <div>
                  <span className="location-tag">
                    <Activity size={14} />
                    환경부 대기환경 기준
                  </span>
                  <h2>미세먼지 정보</h2>
                </div>
                <div
                  className="aqi-grade-badge"
                  style={{ backgroundColor: airQualityMeta.badgeColor }}
                >
                  {airQualityMeta.status}
                </div>
              </div>

              <div className="air-pollutants-container">
                {/* PM10 미세먼지 */}
                <div className="pollutant-box">
                  <div className="pollutant-header">
                    <span className="pollutant-name">미세먼지 (PM10)</span>
                    <span className="pollutant-number">
                      <strong>{Math.round(pm10)}</strong> <small>μg/m³</small>
                    </span>
                  </div>
                  <div className="progress-bar-bg">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${Math.min(100, (pm10 / 160) * 100)}%`,
                        backgroundColor: airQualityMeta.badgeColor
                      }}
                    />
                  </div>
                  <div className="pollutant-levels">
                    <span>좋음 (0~30)</span>
                    <span>보통 (31~80)</span>
                    <span>나쁨 (81~150)</span>
                  </div>
                </div>

                {/* PM2.5 초미세먼지 */}
                <div className="pollutant-box">
                  <div className="pollutant-header">
                    <span className="pollutant-name">초미세먼지 (PM2.5)</span>
                    <span className="pollutant-number">
                      <strong>{Math.round(pm25)}</strong> <small>μg/m³</small>
                    </span>
                  </div>
                  <div className="progress-bar-bg">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${Math.min(100, (pm25 / 80) * 100)}%`,
                        backgroundColor: airQualityMeta.badgeColor
                      }}
                    />
                  </div>
                  <div className="pollutant-levels">
                    <span>좋음 (0~15)</span>
                    <span>보통 (16~35)</span>
                    <span>나쁨 (36~75)</span>
                  </div>
                </div>
              </div>

              <footer className="card-footer-info">
                <span>* Open-Meteo 실시간 대기질 관측 모델 데이터 기준</span>
              </footer>
            </section>
          </div>
        )}
      </main>
    </div>
  )
}
