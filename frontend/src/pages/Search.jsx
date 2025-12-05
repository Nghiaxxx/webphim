import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import TrailerModal from '../components/movie/TrailerModal';
import LazyImage from '../components/common/LazyImage';
import Loading from '../components/common/Loading';
import { publicAPI } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../utils/translations';

// Hàm trích xuất YouTube ID
const extractYouTubeId = (url) => {
  if (!url) return null;
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = url.match(regex);
  return match && match[1].length === 11 ? match[1] : null;
};

// Hàm format ngày
const formatReleaseDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  } catch (error) {
    return dateString;
  }
};

function Search() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = (key) => getTranslation(key, language);
  
  const keyword = searchParams.get('keyword') || '';
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTrailerId, setCurrentTrailerId] = useState(null);
  const [currentMovie, setCurrentMovie] = useState(null);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!keyword.trim()) {
        setMovies([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Only search for movies with the keyword
        const moviesData = await publicAPI.movies.getAll(null, null, keyword);
        
        // Filter to ensure we only show movies that match the search keyword
        const filteredMovies = Array.isArray(moviesData) 
          ? moviesData.filter(movie => {
              const searchTerm = keyword.toLowerCase().trim();
              const title = (movie.title || '').toLowerCase();
              const description = (movie.description || '').toLowerCase();
              const genre = (movie.genre || '').toLowerCase();
              const director = (movie.director || '').toLowerCase();
              
              return title.includes(searchTerm) || 
                     description.includes(searchTerm) || 
                     genre.includes(searchTerm) ||
                     director.includes(searchTerm);
            })
          : [];
        
        setMovies(filteredMovies);
        setCurrentIndex(0);
      } catch (error) {
        console.error('Error fetching search results:', error);
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [keyword]);

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % movies.length);
  };

  const openTrailerModal = (movie) => {
    if (movie.trailer_url) {
      const videoId = extractYouTubeId(movie.trailer_url);
      if (videoId) {
        setCurrentMovie(movie);
        setCurrentTrailerId(videoId);
        setIsModalOpen(true);
      }
    }
  };

  const closeTrailerModal = () => {
    setIsModalOpen(false);
    setCurrentTrailerId(null);
    setCurrentMovie(null);
  };

  const handleBookTicket = (movie) => {
    navigate(`/movie/${movie.id}`);
  };

  const displayedMovie = movies[currentIndex];

  return (
    <div className="app-root">
      <Header />

      <main className="search-main">
        <div className="search-container">
          <h1 className="search-title">KẾT QUẢ TÌM KIẾM PHIM</h1>

          {loading ? (
            <Loading />
          ) : movies.length === 0 ? (
            <div className="search-empty">
              <p>Không tìm thấy phim nào cho "{keyword}"</p>
            </div>
          ) : (
            <div className="search-results-wrapper">
              <button
                className="search-nav-btn search-nav-btn-prev"
                onClick={goToPrev}
                disabled={movies.length <= 1}
                aria-label="Previous"
              >
                ‹
              </button>

              <div className="search-result-item">
                {displayedMovie && (
                  <>
                    <div className="search-poster-container">
                      <div className="search-poster">
                        {displayedMovie.rating && (
                          <div className="movie-badges">
                            <span className="badge badge-format">
                              <span>2D</span>
                            </span>
                            <span className="badge badge-rating">
                              <span className="rating-number">{displayedMovie.rating}</span>
                              <span className="rating-text">
                                {displayedMovie.rating === 'P' ? 'KID' : 
                                 displayedMovie.rating === 'C' ? 'ALL' : 
                                 displayedMovie.rating.startsWith('T') ? 'TEEN' : 'ALL'}
                              </span>
                            </span>
                          </div>
                        )}
                        {displayedMovie.poster_url ? (
                          <LazyImage src={displayedMovie.poster_url} alt={displayedMovie.title} />
                        ) : (
                          <div className="poster-placeholder">{displayedMovie.title?.charAt(0)}</div>
                        )}
                      </div>
                      <h2 className="search-item-title">{displayedMovie.title} {displayedMovie.rating && `(${displayedMovie.rating})`}</h2>
                      <div className="search-item-actions">
                        {displayedMovie.trailer_url && (
                          <button
                            className="btn-watch-trailer"
                            onClick={() => openTrailerModal(displayedMovie)}
                          >
                            <i className="fas fa-play"></i>
                            Xem Trailer
                          </button>
                        )}
                        <button
                          className="btn-book-ticket-search"
                          onClick={() => handleBookTicket(displayedMovie)}
                        >
                          ĐẶT VÉ
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <button
                className="search-nav-btn search-nav-btn-next"
                onClick={goToNext}
                disabled={movies.length <= 1}
                aria-label="Next"
              >
                ›
              </button>
            </div>
          )}

          {/* Pagination dots */}
          {movies.length > 1 && (
            <div className="search-pagination">
              {movies.map((_, index) => (
                <button
                  key={index}
                  className={`search-dot ${index === currentIndex ? 'active' : ''}`}
                  onClick={() => setCurrentIndex(index)}
                  aria-label={`Go to result ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Trailer Modal */}
      {currentMovie && currentTrailerId && (
        <TrailerModal
          isOpen={isModalOpen}
          onClose={closeTrailerModal}
          movie={currentMovie}
          videoId={currentTrailerId}
        />
      )}
    </div>
  );
}

export default Search;

