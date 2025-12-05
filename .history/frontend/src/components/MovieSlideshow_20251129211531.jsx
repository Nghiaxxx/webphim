import React, { useState } from 'react';
import MovieCard from './MovieCard';

function MovieSlideshow({ movies, title }) {
    const [currentPage, setCurrentPage] = useState(0);
    const moviesPerPage = 4;
    const totalPages = Math.ceil(movies.length / moviesPerPage);

    // 💥 VỊ TRÍ 1: THÊM STATE VÀ HÀM XỬ LÝ MODAL 💥
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentTrailerId, setCurrentTrailerId] = useState(null);

    const extractYouTubeId = (url) => {
        if (!url) return null;
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
        const match = url.match(regex);
        return match && match[1].length === 11 ? match[1] : null;
    };

    const openTrailerModal = (trailerUrl) => {
        const videoId = extractYouTubeId(trailerUrl); 
        if (videoId) {
            setCurrentTrailerId(videoId);
            setIsModalOpen(true);
        } else {
            console.warn("Lỗi: Không tìm thấy ID video hợp lệ.");
        }
    };

    const closeTrailerModal = () => {
        setIsModalOpen(false);
        setCurrentTrailerId(null);
    };
    // ----------------------------------------------------

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
            {/* ... (Phần tiêu đề và nút điều hướng PREV giữ nguyên) ... */}
            
            <div className="movie-slideshow-wrapper">
                {/* ... (Nút PREV) ... */}
                
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
                                    {/* 💥 ÁP DỤNG HÀM openTrailerModal Ở ĐÂY */}
                                    <button 
                                        className="movie-btn-outline movie-trailer-btn"
                                        onClick={() => openTrailerModal(movie.trailer_url)}
                                    >
                                        <img src="https://cinestar.com.vn/assets/images/icon-play-vid.svg" alt="" />
                                        <span className="trailer-text">Xem trailer</span> 
                                    </button>
                                    {/* ... (Logic nút Đặt vé / Tìm hiểu thêm giữ nguyên) ... */}
                                    {movie.status === 'coming_soon' ? (
                                        <button className="movie-btn">Tìm hiểu thêm</button>
                                    ) : (
                                        <button className="movie-btn">Đặt vé</button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* ... (Nút NEXT) ... */}
            </div>

            {/* Pagination dots */}
            {totalPages > 1 && (
                <div className="movie-slideshow-pagination">
                    {/* ... (Code Pagination giữ nguyên) ... */}
                </div>
            )}

            {/* XEM THÊM button */}
            {movies.length > moviesPerPage && (
                <div className="movie-slideshow-more">
                    <button className="movie-slideshow-more-btn">XEM THÊM</button>
                </div>
            )}
            
            {/* ================================================= */}
            {/* 💥 VỊ TRÍ 2: JSX MODAL ĐƯỢC ĐẶT Ở ĐÂY (CUỐI CÙNG) 💥 */}
            {/* ================================================= */}
            {isModalOpen && currentTrailerId && (
                <div className="trailer-modal-overlay" onClick={closeTrailerModal}>
                    <div className="trailer-modal-content" onClick={(e) => e.stopPropagation()}>
                        
                        <div className="trailer-modal-header">
                            {/* Cần kiểm tra nếu movie.trailer_url tồn tại trước khi dùng find */}
                            <h3>{movies.find(m => m.trailer_url && extractYouTubeId(m.trailer_url) === currentTrailerId)?.title || "Trailer Phim"}</h3>
                            <button className="close-modal-btn" onClick={closeTrailerModal}>×</button>
                        </div>

                        <div className="trailer-video-wrapper">
                            <iframe
                                title="Movie Trailer"
                                src={`https://www.youtube.com/embed/${currentTrailerId}?autoplay=1&rel=0`} 
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                            ></iframe>
                        </div>
                    </div>
                </div>
            )}
            
        </div>
    );
}

export default MovieSlideshow;