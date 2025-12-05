import React, { useState } from 'react';
import MovieCard from './MovieCard';

function MovieSlideshow({ movies, title }) {
  const [currentPage, setCurrentPage] = useState(0);
  const moviesPerPage = 4;
  const totalPages = Math.ceil(movies.length / moviesPerPage);

// 💥 VỊ TRÍ DÁN 1: THÊM STATE VÀ HÀM XỬ LÝ MODAL TẠI ĐÂY 💥

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentTrailerId, setCurrentTrailerId] = useState(null);

    // Hàm trích xuất YouTube ID
    const extractYouTubeId = (url) => {
        if (!url) return null;
        // Regex để tìm ID 11 ký tự trong URL YouTube
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
        const match = url.match(regex);
        return match && match[1].length === 11 ? match[1] : null;
    };

    // Hàm mở Modal và đặt ID video
    const openTrailerModal = (trailerUrl) => {
        const videoId = extractYouTubeId(trailerUrl); 
        if (videoId) {
            setCurrentTrailerId(videoId);
            setIsModalOpen(true);
        } else {
            console.warn("Lỗi: Không tìm thấy ID video hợp lệ hoặc trailerUrl bị thiếu.");
        }
    };

    // Hàm đóng Modal
    const closeTrailerModal = () => {
        setIsModalOpen(false);
        setCurrentTrailerId(null);
    };

  const goToPage = (page) => {
    if (page < 0 || page >= totalPages) return;
    setCurrentPage(page);
  };

  const goToPrev = () => {
    goToPage(currentPage - 1);
  };

  const goToNext = () => {
    goToPage(currentPage + 1);
  };


  if (movies.length === 0) {
    return null;
  }

  return (
    <div className="movie-slideshow-container">
      {title && (
        <div className="section-header">
          <h2>{title}</h2>
        </div>
      )}
      
      <div className="movie-slideshow-wrapper">
        <button
          className={`movie-slideshow-btn movie-slideshow-btn-prev ${currentPage === 0 ? 'disabled' : ''}`}
          onClick={goToPrev}
          disabled={currentPage === 0}
          aria-label="Previous movies"
        >
          ‹
        </button>
        
        <div className="movie-slideshow">
          <div 
            className="movie-slideshow-content"
            style={{
              transform: `translateX(-${currentPage * (280 * moviesPerPage + 24 * (moviesPerPage - 1))}px)`,
              transition: 'transform 0.5s ease'
            }}
          >
            {movies.map((movie) => (
              <div key={movie.id} className="movie-slideshow-item">
                <MovieCard movie={movie} />
                <div className="movie-actions">
                  <button 
                        className="movie-btn-outline movie-trailer-btn"
                        // 💥 VỊ TRÍ DÁN 2: THAY THẾ onClick BẰNG HÀM MỚI 💥
                        // Truyền movie.trailer_url (giả sử trường này đã được thêm vào DB)
                        onClick={() => openTrailerModal(movie.trailer_url)}
                    >
                        <img src="https://cinestar.com.vn/assets/images/icon-play-vid.svg" alt="" />
                        <span className="trailer-text">Xem trailer</span> 
</button>
                  {movie.status === 'coming_soon' ? (
                    <button className="movie-btn">
                      Tìm hiểu thêm
                    </button>
                  ) : (
                    <>
                      
                      <button className="movie-btn">Đặt vé</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <button
          className={`movie-slideshow-btn movie-slideshow-btn-next ${currentPage >= totalPages - 1 ? 'disabled' : ''}`}
          onClick={goToNext}
          disabled={currentPage >= totalPages - 1}
          aria-label="Next movies"
        >
          ›
        </button>
      </div>

      {/* Pagination dots */}
      {totalPages > 1 && (
        <div className="movie-slideshow-pagination">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              className={`movie-slideshow-dot ${index === currentPage ? 'active' : ''}`}
              onClick={() => goToPage(index)}
              aria-label={`Go to page ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* XEM THÊM button */}
      {movies.length > moviesPerPage && (
        <div className="movie-slideshow-more">
          <button className="movie-slideshow-more-btn">XEM THÊM</button>
        </div>
      )}
    </div>
  );
}

export default MovieSlideshow;

