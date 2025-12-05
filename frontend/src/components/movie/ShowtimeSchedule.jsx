import React from 'react';
import { getAvailableDates } from '../../utils/helpers';

const ShowtimeSchedule = ({ showtimes, selectedDate, onDateSelect }) => {
  const availableDates = getAvailableDates(showtimes);

  if (showtimes.length === 0) return null;

  return (
    <div className="movie-detail-showtimes">
      <h2 className="movie-detail-section-header">LỊCH CHIẾU</h2>
      {availableDates.length > 0 ? (
        <div className="showtime-dates">
          {availableDates.map((dateObj, index) => (
            <button
              key={index}
              className={`showtime-date-btn ${selectedDate?.dateStr === dateObj.dateStr ? 'active' : ''}`}
              onClick={() => onDateSelect(dateObj)}
            >
              <span className="showtime-date">{dateObj.dateStr}</span>
              <br />
              <span className="showtime-day">{dateObj.dayName}</span>
            </button>
          ))}
        </div>
      ) : (
        <p style={{ color: '#9ca3af', padding: '20px' }}>Không có ngày chiếu nào</p>
      )}
    </div>
  );
};

export default ShowtimeSchedule;

