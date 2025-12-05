import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { formatTime, getAvailableCities } from '../../utils/helpers';

const CinemaList = ({ 
  showtimes, 
  cinemas, 
  selectedDate, 
  selectedCity, 
  onCityChange,
  selectedShowtime,
  onShowtimeSelect 
}) => {
  const [expandedCinemas, setExpandedCinemas] = useState(new Set());

  // Get showtimes for selected date
  const getShowtimesForDate = useCallback((dateObj) => {
    if (!dateObj) return [];
    return showtimes.filter(st => {
      const stDate = new Date(st.start_time);
      return stDate.toDateString() === dateObj.fullDate.toDateString();
    });
  }, [showtimes]);

  // Group showtimes by cinema, filtered by selected city
  const getShowtimesByCinema = useMemo(() => {
    if (!selectedDate) return {};
    
    const dateShowtimes = getShowtimesForDate(selectedDate);
    const grouped = {};
    
    // Lấy danh sách cinema IDs thuộc thành phố được chọn
    const cinemasInCity = new Set();
    if (selectedCity) {
      cinemas.forEach(cinema => {
        if (cinema.city === selectedCity) {
          cinemasInCity.add(cinema.id);
        }
      });
    }
    
    dateShowtimes.forEach(st => {
      const cinemaId = st.cinema_id_full || st.cinema_id;
      const cinemaName = st.cinema_name;
      
      if (selectedCity && !cinemasInCity.has(cinemaId)) {
        return;
      }
      
      if (cinemaId && cinemaName) {
        if (!grouped[cinemaId]) {
          const cinemaInfo = cinemas.find(c => c.id === cinemaId);
          grouped[cinemaId] = {
            id: cinemaId,
            name: cinemaName,
            address: st.cinema_address || cinemaInfo?.address || '',
            city: cinemaInfo?.city || '',
            showtimes: [],
            screenTypes: new Set()
          };
        }
        grouped[cinemaId].showtimes.push(st);
        if (st.screen_type) {
          grouped[cinemaId].screenTypes.add(st.screen_type);
        }
      }
    });
    
    return grouped;
  }, [selectedDate, getShowtimesForDate, selectedCity, cinemas, showtimes]);

  const availableCities = getAvailableCities(cinemas);

  // Auto-expand all cinemas when date changes
  useEffect(() => {
    const cinemaIds = Object.keys(getShowtimesByCinema);
    if (cinemaIds.length > 0) {
      setExpandedCinemas(new Set(cinemaIds));
    }
  }, [selectedDate, getShowtimesByCinema]);

  if (showtimes.length === 0) return null;

  return (
    <div className="movie-detail-cinemas">
      <div className="cinema-list-header">
        <h2 className="movie-detail-section-header cinema-list-title">DANH SÁCH RẠP</h2>
        <div className="cinema-city-selector">
          <i className="fa-solid fa-location-dot"></i>
          <select
            value={selectedCity}
            onChange={(e) => onCityChange(e.target.value)}
            className="cinema-city-select"
          >
            {availableCities.length > 0 ? (
              availableCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))
            ) : (
              <option value="">Chọn thành phố</option>
            )}
          </select>
          <i className="fa-solid fa-chevron-down"></i>
        </div>
      </div>
      <div className="cinema-list">
        {Object.keys(getShowtimesByCinema).length > 0 ? (
          Object.values(getShowtimesByCinema).map((cinemaData) => {
            const screenType = Array.from(cinemaData.screenTypes)[0] || 'Standard';
            const isExpanded = expandedCinemas.has(cinemaData.id);
            return (
              <div key={cinemaData.id} className={`cinema-item-detail ${!isExpanded ? 'collapsed' : ''}`}>
                <div 
                  className="cinema-item-header"
                  onClick={() => {
                    const newExpanded = new Set(expandedCinemas);
                    if (isExpanded) {
                      newExpanded.delete(cinemaData.id);
                    } else {
                      newExpanded.add(cinemaData.id);
                    }
                    setExpandedCinemas(newExpanded);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <h3 className="cinema-item-name">{cinemaData.name}</h3>
                  <button 
                    className="cinema-toggle-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      const newExpanded = new Set(expandedCinemas);
                      if (isExpanded) {
                        newExpanded.delete(cinemaData.id);
                      } else {
                        newExpanded.add(cinemaData.id);
                      }
                      setExpandedCinemas(newExpanded);
                    }}
                  >
                    <i className={`fa-solid fa-chevron-${isExpanded ? 'up' : 'down'}`}></i>
                  </button>
                </div>
                <div className={`cinema-item-content ${isExpanded ? 'expanded' : 'collapsed'}`}>
                  <div className="cinema-item-info">
                    {cinemaData.address && (
                      <p className="cinema-item-address">{cinemaData.address}</p>
                    )}
                    {screenType && (
                      <span className="cinema-screen-type">{screenType}</span>
                    )}
                  </div>
                  {cinemaData.showtimes.length > 0 ? (
                    <div className="cinema-showtimes">
                      {cinemaData.showtimes
                        .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
                        .map((st, idx) => {
                          const timeStr = formatTime(st.start_time);
                          return (
                            <button 
                              key={st.id || idx} 
                              className={`cinema-showtime-btn ${selectedShowtime?.id === st.id ? 'active' : ''}`}
                              onClick={() => {
                                if (selectedShowtime?.id === st.id) {
                                  onShowtimeSelect(null);
                                } else {
                                  onShowtimeSelect(st);
                                  setTimeout(() => {
                                    const ticketSection = document.querySelector('.ticket-selection-section');
                                    if (ticketSection) {
                                      ticketSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    }
                                  }, 100);
                                }
                              }}
                            >
                              {timeStr}
                            </button>
                          );
                        })}
                    </div>
                  ) : (
                    <p className="cinema-no-showtime">Hiện chưa có lịch chiếu</p>
                  )}
                </div>
              </div>
            );
          })
        ) : selectedDate ? (
          <p style={{ color: '#9ca3af', textAlign: 'center', padding: '40px' }}>
            Không có lịch chiếu cho ngày đã chọn
          </p>
        ) : (
          <p style={{ color: '#9ca3af', textAlign: 'center', padding: '40px' }}>
            Vui lòng chọn ngày để xem lịch chiếu
          </p>
        )}
      </div>
    </div>
  );
};

export default CinemaList;

