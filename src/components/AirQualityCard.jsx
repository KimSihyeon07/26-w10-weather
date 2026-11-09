import { Activity } from 'lucide-react'
import { getAirQualityStatus } from '../api/weather'

export default function AirQualityCard({ airQualityData }) {
  const currentAir = airQualityData?.current
  if (!currentAir) return null

  const pm10 = currentAir.pm10 ?? 0
  const pm25 = currentAir.pm2_5 ?? 0
  const airQualityMeta = getAirQualityStatus(pm10, pm25)

  return (
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
  )
}
