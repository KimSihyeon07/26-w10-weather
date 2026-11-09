import { Calendar, Droplets } from 'lucide-react'
import WeatherIcon from './WeatherIcon'
import { getWeatherInfo } from '../api/weather'

export default function WeeklyForecast({ weatherData }) {
  const daily = weatherData?.daily
  if (!daily || !daily.time || daily.time.length === 0) return null

  const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토']

  // 7일 전체 중 최저 기온과 최고 기온 (게이지 막대 비율 계산용)
  const allMins = daily.temperature_2m_min.slice(0, 7)
  const allMaxs = daily.temperature_2m_max.slice(0, 7)
  const globalMin = Math.min(...allMins)
  const globalMax = Math.max(...allMaxs)
  const totalRange = globalMax === globalMin ? 1 : globalMax - globalMin

  const forecastDays = daily.time.slice(0, 7).map((dateStr, idx) => {
    const dateObj = new Date(dateStr)
    const dayName = daysOfWeek[dateObj.getDay()]
    const month = dateObj.getMonth() + 1
    const date = dateObj.getDate()

    let displayDay = `${dayName}요일`
    if (idx === 0) displayDay = '오늘'
    else if (idx === 1) displayDay = '내일'

    const min = Math.round(daily.temperature_2m_min[idx])
    const max = Math.round(daily.temperature_2m_max[idx])
    const rainProb = daily.precipitation_probability_max ? daily.precipitation_probability_max[idx] : 0
    const code = daily.weather_code[idx]
    const weather = getWeatherInfo(code)

    // 게이지 바 시작 위치 및 너비 백분율
    const leftPercent = Math.max(0, ((min - globalMin) / totalRange) * 100)
    const widthPercent = Math.max(10, ((max - min) / totalRange) * 100)

    return {
      dateStr,
      displayDay,
      dateLabel: `${month}.${date}`,
      min,
      max,
      rainProb,
      weather,
      leftPercent,
      widthPercent
    }
  })

  return (
    <section className="card weekly-forecast-card">
      <div className="card-header">
        <div>
          <span className="location-tag">
            <Calendar size={14} />
            7일간의 날씨 전망
          </span>
          <h2>주간 예보</h2>
        </div>
      </div>

      <div className="weekly-list">
        {forecastDays.map((day) => (
          <div key={day.dateStr} className="weekly-row">
            {/* 요일 및 날짜 */}
            <div className="weekly-day-col">
              <span className="weekly-day-name">{day.displayDay}</span>
              <span className="weekly-date-sub">{day.dateLabel}</span>
            </div>

            {/* 날씨 상태 아이콘 및 라벨 */}
            <div className="weekly-weather-col">
              <WeatherIcon
                iconName={day.weather.icon}
                size={22}
                color={day.weather.color}
              />
              <span className="weekly-weather-label">{day.weather.label}</span>
            </div>

            {/* 강수 확률 */}
            <div className="weekly-rain-col">
              {day.rainProb > 0 ? (
                <span className="weekly-rain-prob">
                  <Droplets size={12} className="rain-icon" />
                  {day.rainProb}%
                </span>
              ) : (
                <span className="weekly-rain-empty">-</span>
              )}
            </div>

            {/* 기온 범위 막대 게이지 */}
            <div className="weekly-temp-bar-col">
              <span className="weekly-temp-low">{day.min}°</span>
              <div className="weekly-bar-track">
                <div
                  className="weekly-bar-fill"
                  style={{
                    left: `${day.leftPercent}%`,
                    width: `${day.widthPercent}%`
                  }}
                />
              </div>
              <span className="weekly-temp-high">{day.max}°</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
