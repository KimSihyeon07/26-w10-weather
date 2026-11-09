import { Clock } from 'lucide-react'
import WeatherIcon from './WeatherIcon'
import { getWeatherInfo } from '../api/weather'

export default function HourlyChart({ weatherData, tempUnit = 'C' }) {
  const hourly = weatherData?.hourly
  if (!hourly || !hourly.time || hourly.time.length === 0) return null

  // 섭씨 ↔ 화씨 변환
  const convertTemp = (celsius) => {
    if (celsius == null) return 0
    return tempUnit === 'F' ? Math.round((celsius * 9) / 5 + 32) : Math.round(celsius)
  }

  // API 응답의 현재 관측 시각(current.time)을 기준으로 향후 24개 데이터 슬라이싱
  const currentHourPrefix = weatherData?.current?.time?.slice(0, 13)
  
  let startIndex = currentHourPrefix
    ? hourly.time.findIndex((t) => t.startsWith(currentHourPrefix))
    : 0
  if (startIndex === -1) {
    startIndex = 0
  }

  const times = hourly.time.slice(startIndex, startIndex + 24)
  const rawTemps = hourly.temperature_2m.slice(startIndex, startIndex + 24)
  const temps = rawTemps.map(convertTemp)
  const codes = hourly.weather_code.slice(startIndex, startIndex + 24)

  if (temps.length === 0) return null

  const minTemp = Math.min(...temps)
  const maxTemp = Math.max(...temps)
  const tempRange = maxTemp === minTemp ? 1 : maxTemp - minTemp

  // SVG 차트 좌표 설정
  const itemWidth = 56
  const chartWidth = times.length * itemWidth
  const chartHeight = 90
  const paddingTop = 26
  const paddingBottom = 16
  const usableHeight = chartHeight - paddingTop - paddingBottom

  const points = temps.map((temp, i) => {
    const x = i * itemWidth + itemWidth / 2
    const y = chartHeight - paddingBottom - ((temp - minTemp) / tempRange) * usableHeight
    return { x, y, temp, time: times[i], code: codes[i] }
  })

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ')
  const areaPath = `M ${points[0].x},${chartHeight} L ${points.map((p) => `${p.x},${p.y}`).join(' L ')} L ${points[points.length - 1].x},${chartHeight} Z`

  return (
    <section className="card hourly-forecast-card">
      <div className="card-header">
        <div>
          <span className="location-tag">
            <Clock size={14} />
            시간별 변화 추이
          </span>
          <h2>24시간 기온 차트</h2>
        </div>
        <div className="hourly-temp-range">
          최저 <strong className="temp-low">{minTemp}°{tempUnit}</strong> / 최고 <strong className="temp-high">{maxTemp}°{tempUnit}</strong>
        </div>
      </div>

      <div className="hourly-scroll-container">
        <div className="hourly-chart-wrapper" style={{ width: `${chartWidth}px` }}>
          {/* SVG 꺾은선 차트 영역 */}
          <svg
            className="hourly-svg"
            width={chartWidth}
            height={chartHeight}
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          >
            <defs>
              <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* 영역 채우기 */}
            <path d={areaPath} fill="url(#tempGradient)" />

            {/* 꺾은선 */}
            <polyline
              fill="none"
              stroke="#3b82f6"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={polylinePoints}
            />

            {/* 각 데이터 포인트 및 기온 레이블 */}
            {points.map((p, idx) => (
              <g key={`point-${idx}`}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="4"
                  fill="#ffffff"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                />
                <text
                  x={p.x}
                  y={p.y - 10}
                  textAnchor="middle"
                  className="chart-temp-label"
                >
                  {p.temp}°
                </text>
              </g>
            ))}
          </svg>

          {/* 하단 날씨 아이콘 & 시간 표시 행 */}
          <div className="hourly-meta-row">
            {points.map((p, idx) => {
              const hour = parseInt(p.time.slice(11, 13), 10)
              const isNow = idx === 0
              const weather = getWeatherInfo(p.code)

              return (
                <div
                  key={`meta-${idx}`}
                  className={`hourly-meta-item ${isNow ? 'is-now' : ''}`}
                  style={{ width: `${itemWidth}px` }}
                >
                  <div className="hourly-icon-wrap" title={weather.label}>
                    <WeatherIcon
                      iconName={weather.icon}
                      size={20}
                      color={weather.color}
                    />
                  </div>
                  <span className="hourly-time-label">
                    {isNow ? '지금' : `${hour}시`}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
