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
} from 'lucide-react'

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

export default function WeatherIcon({ iconName, size = 24, color = '#f59e0b', className = '' }) {
  const IconComponent = iconMap[iconName] || Cloud
  return <IconComponent size={size} color={color} className={className} strokeWidth={2} />
}

