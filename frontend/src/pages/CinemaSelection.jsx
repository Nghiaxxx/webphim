import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../utils/translations';
import { publicAPI } from '../services/api';
import '../styles/pages/CinemaSelection.css';

// Utility function to create slug from cinema name
const createSlug = (name) => {
  if (!name) return '';
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

function CinemaSelection() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = (key) => getTranslation(key, language);
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCinemas = async () => {
      try {
        setLoading(true);
        const data = await publicAPI.cinemas.getAll();
        setCinemas(data || []);
      } catch (error) {
        console.error('Lỗi khi tải danh sách rạp:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCinemas();
  }, []);

  const handleCinemaClick = (cinema) => {
    const slug = createSlug(cinema.name);
    navigate(`/book-tickets/${slug}`);
  };

  // Group cinemas by city
  const cinemasByCity = cinemas.reduce((acc, cinema) => {
    const city = cinema.city || 'Khác';
    if (!acc[city]) {
      acc[city] = [];
    }
    acc[city].push(cinema);
    return acc;
  }, {});

  // Filter cinemas by search term
  const filteredCinemasByCity = Object.keys(cinemasByCity).reduce((acc, city) => {
    const filtered = cinemasByCity[city].filter(cinema =>
      cinema.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cinema.address && cinema.address.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    if (filtered.length > 0) {
      acc[city] = filtered;
    }
    return acc;
  }, {});

  return (
    <div className="app-root">
      <Header />
      
      <main className="cinema-selection-main">
        <div className="cinema-selection-container">
          <h1 className="cinema-selection-title">Chọn Rạp Phim</h1>
          
          {/* Search Bar */}
          <div className="cinema-selection-search">
            <input
              type="text"
              placeholder="Tìm kiếm rạp phim..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="cinema-selection-search-input"
            />
            <i className="fas fa-search cinema-selection-search-icon"></i>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="cinema-selection-loading">
              <p>{t('home.loading')}</p>
            </div>
          ) : (
            /* Cinemas List by City */
            <div className="cinema-selection-list">
              {Object.keys(filteredCinemasByCity).length === 0 ? (
                <div className="cinema-selection-empty">
                  <p>Không tìm thấy rạp phim nào.</p>
                </div>
              ) : (
                Object.keys(filteredCinemasByCity).map((city) => (
                  <div key={city} className="cinema-selection-city-group">
                    <h2 className="cinema-selection-city-title">{city}</h2>
                    <div className="cinema-selection-cinemas-grid">
                      {filteredCinemasByCity[city].map((cinema) => (
                        <div
                          key={cinema.id}
                          className="cinema-selection-card"
                          onClick={() => handleCinemaClick(cinema)}
                        >
                          <div className="cinema-selection-card-header">
                            <h3 className="cinema-selection-card-name">{cinema.name}</h3>
                          </div>
                          <div className="cinema-selection-card-body">
                            {cinema.address && (
                              <p className="cinema-selection-card-address">
                                <i className="fas fa-map-marker-alt"></i>
                                {cinema.address}
                              </p>
                            )}
                            {cinema.phone_number && (
                              <p className="cinema-selection-card-phone">
                                <i className="fas fa-phone"></i>
                                {cinema.phone_number}
                              </p>
                            )}
                          </div>
                          <div className="cinema-selection-card-footer">
                            <span className="cinema-selection-card-link">
                              Xem lịch chiếu <i className="fas fa-arrow-right"></i>
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default CinemaSelection;

