import { useState, useEffect, useRef } from 'react'
import { Search, Loader2, MapPin, X } from 'lucide-react'
import { searchCities } from '../api/weather'

export default function CitySearch({ onSelectCity }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const searchContainerRef = useRef(null)

  // 400ms 디바운스(Debounce) 적용 검색
  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < 2) return

    const handler = setTimeout(async () => {
      try {
        setIsSearching(true)
        const searchRes = await searchCities(trimmed)
        setResults(searchRes || [])
      } catch (err) {
        console.error('도시 검색 중 오류 발생:', err)
        setResults([])
      } finally {
        setIsSearching(false)
      }
    }, 400)

    return () => {
      clearTimeout(handler)
    }
  }, [query])

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleInputChange = (e) => {
    const val = e.target.value
    setQuery(val)
    setIsOpen(true)
    if (!val || val.trim().length < 2) {
      setResults([])
      setIsSearching(false)
    }
  }

  const handleSelect = (city) => {
    // 도시명 표기 정리 (예: 서울, 서울특별시, 대한민국)
    const displayName = city.name
    onSelectCity({
      name: displayName,
      lat: city.latitude,
      lon: city.longitude,
      country: city.country,
      admin1: city.admin1
    })
    setIsOpen(false)
    setQuery('')
  }

  const handleClear = () => {
    setQuery('')
    setResults([])
    setIsOpen(false)
  }

  return (
    <div className="city-search-container" ref={searchContainerRef}>
      <div className="search-input-wrapper">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="도시 이름으로 검색 (예: Seoul, Tokyo, Paris, 대전...)"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true)
          }}
        />
        {isSearching && <Loader2 size={16} className="spin-icon search-loader" />}
        {query && !isSearching && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={handleClear}
            title="검색어 지우기"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {isOpen && query.trim().length >= 2 && (
        <div className="search-dropdown">
          {isSearching && results.length === 0 && (
            <div className="search-status-item">
              <Loader2 size={16} className="spin-icon" />
              <span>도시를 검색하고 있습니다...</span>
            </div>
          )}

          {!isSearching && results.length === 0 && (
            <div className="search-status-item no-result">
              <span>일치하는 도시를 찾을 수 없습니다. (영문 도시명으로 시도해보세요)</span>
            </div>
          )}

          {results.map((item) => (
            <button
              key={`${item.id}-${item.latitude}-${item.longitude}`}
              type="button"
              className="search-result-item"
              onClick={() => handleSelect(item)}
            >
              <MapPin size={16} className="item-pin" />
              <div className="item-text">
                <span className="item-title">{item.name}</span>
                <span className="item-sub">
                  {[item.admin1, item.country].filter(Boolean).join(', ')}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

