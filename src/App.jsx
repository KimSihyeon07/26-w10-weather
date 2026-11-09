import { useState, useEffect, useCallback } from 'react'
import {
  CloudSun,
  RefreshCw,
  AlertCircle,
  MapPin,
  History,
  Trash2
} from 'lucide-react'
import {
  DEFAULT_CITIES,
  fetchWeatherData,
  fetchAirQualityData
} from './api/weather'
import CitySearch from './components/CitySearch'
import CurrentWeather from './components/CurrentWeather'
import AirQualityCard from './components/AirQualityCard'
import HourlyChart from './components/HourlyChart'
import WeeklyForecast from './components/WeeklyForecast'
import './App.css'

const RECENT_CITIES_KEY = 'recent_weather_cities'
const TEMP_UNIT_KEY = 'weather_temp_unit'

export default function App() {
  const [selectedCity, setSelectedCity] = useState(DEFAULT_CITIES[0])
  const [weatherData, setWeatherData] = useState(null)
  const [airQualityData, setAirQualityData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 섭씨(C) / 화씨(F) 단위 상태 (localStorage 유지)
  const [tempUnit, setTempUnit] = useState(() => {
    try {
      return localStorage.getItem(TEMP_UNIT_KEY) || 'C'
    } catch {
      return 'C'
    }
  })

  // 최근 본 도시 목록 (localStorage 유지)
  const [recentCities, setRecentCities] = useState(() => {
    try {
      const saved = localStorage.getItem(RECENT_CITIES_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // 온도 단위 토글
  const toggleTempUnit = () => {
    setTempUnit((prev) => {
      const next = prev === 'C' ? 'F' : 'C'
      try {
        localStorage.setItem(TEMP_UNIT_KEY, next)
      } catch (err) {
        console.error('단위 저장 오류:', err)
      }
      return next
    })
  }

  // 최근 본 도시 목록 추가
  const addToRecentCities = useCallback((city) => {
    setRecentCities((prev) => {
      const filtered = prev.filter((c) => c.name !== city.name)
      const updated = [city, ...filtered].slice(0, 5)
      try {
        localStorage.setItem(RECENT_CITIES_KEY, JSON.stringify(updated))
      } catch (err) {
        console.error('로컬스토리지 저장 실패:', err)
      }
      return updated
    })
  }, [])

  // 최근 본 도시 전체 삭제
  const clearRecentCities = () => {
    setRecentCities([])
    try {
      localStorage.removeItem(RECENT_CITIES_KEY)
    } catch (err) {
      console.error('로컬스토리지 삭제 실패:', err)
    }
  }

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

  // 도시 선택 변경 시 데이터 갱신 및 최근 본 목록 추가
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
          addToRecentCities(selectedCity)
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
  }, [selectedCity, addToRecentCities])

  const handleCitySelect = (newCity) => {
    setSelectedCity(newCity)
  }

  return (
    <div className="weather-app">
      {/* 1. 상단 헤더 & 검색 & 빠른 도시 선택 바 */}
      <header className="app-header">
        <div className="header-title-row">
          <div className="logo-group">
            <CloudSun className="logo-icon" size={30} />
            <h1>실시간 기상 대시보드</h1>
          </div>

          <div className="header-actions">
            {/* 섭씨/화씨 단위 변환 토글 스위치 */}
            <div className="unit-toggle" role="group" aria-label="온도 단위 선택">
              <button
                type="button"
                className={`unit-btn ${tempUnit === 'C' ? 'active' : ''}`}
                onClick={() => tempUnit !== 'C' && toggleTempUnit()}
                title="섭씨(°C)로 보기"
              >
                °C
              </button>
              <button
                type="button"
                className={`unit-btn ${tempUnit === 'F' ? 'active' : ''}`}
                onClick={() => tempUnit !== 'F' && toggleTempUnit()}
                title="화씨(°F)로 보기"
              >
                °F
              </button>
            </div>

            {/* 새로고침 버튼 */}
            <button
              type="button"
              className="refresh-btn"
              onClick={() => loadData(selectedCity)}
              disabled={loading}
              title="새로고침"
            >
              <RefreshCw size={17} className={loading ? 'spin-icon' : ''} />
              <span>새로고침</span>
            </button>
          </div>
        </div>

        {/* 400ms 디바운스 실시간 도시 검색창 */}
        <div className="header-search-row">
          <CitySearch onSelectCity={handleCitySelect} />
        </div>

        {/* 주요 도시 프리셋 칩 목록 */}
        <nav className="city-selector" aria-label="주요 도시 빠른 선택">
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

        {/* 최근 본 도시 뱃지 섹션 (localStorage) */}
        {recentCities.length > 0 && (
          <div className="recent-cities-section">
            <div className="recent-cities-header">
              <span className="recent-title">
                <History size={13} />
                최근 본 도시
              </span>
              <button
                type="button"
                className="recent-clear-btn"
                onClick={clearRecentCities}
                title="최근 기록 전체 삭제"
              >
                <Trash2 size={12} />
                지우기
              </button>
            </div>
            <div className="recent-chips">
              {recentCities.map((city) => {
                const isSelected = selectedCity.name === city.name
                return (
                  <button
                    key={`recent-${city.name}-${city.lat}-${city.lon}`}
                    type="button"
                    className={`recent-chip ${isSelected ? 'active' : ''}`}
                    onClick={() => setSelectedCity(city)}
                  >
                    <span className="recent-dot" />
                    {city.name}
                  </button>
                )
              })}
            </div>
          </div>
        )}
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

        {!loading && !error && weatherData && airQualityData && (
          <div className="dashboard-layout">
            {/* 상단 2열 그리드: 현재 날씨 & 미세먼지 */}
            <div className="top-grid">
              <CurrentWeather
                city={selectedCity}
                weatherData={weatherData}
                tempUnit={tempUnit}
              />
              <AirQualityCard airQualityData={airQualityData} />
            </div>

            {/* 24시간 시간별 기온 차트 */}
            <HourlyChart
              weatherData={weatherData}
              tempUnit={tempUnit}
            />

            {/* 7일간 주간 예보 */}
            <WeeklyForecast
              weatherData={weatherData}
              tempUnit={tempUnit}
            />
          </div>
        )}
      </main>
    </div>
  )
}
