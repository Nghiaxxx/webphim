// import React, { useState } from 'react';
// import MovieCard from './MovieCard';

// function MovieSlideshow({ movies, title }) {
//   const [currentPage, setCurrentPage] = useState(0);
//   const moviesPerPage = 4;
//   const totalPages = Math.ceil(movies.length / moviesPerPage);

// // 💥 VỊ TRÍ DÁN 1: THÊM STATE VÀ HÀM XỬ LÝ MODAL TẠI ĐÂY 💥

//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [currentTrailerId, setCurrentTrailerId] = useState(null);

//     // Hàm trích xuất YouTube ID
//     const extractYouTubeId = (url) => {
//         if (!url) return null;
//         // Regex để tìm ID 11 ký tự trong URL YouTube
//         const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
//         const match = url.match(regex);
//         return match && match[1].length === 11 ? match[1] : null;
//     };

//     // Hàm mở Modal và đặt ID video
//     const openTrailerModal = (trailerUrl) => {
//         const videoId = extractYouTubeId(trailerUrl); 
//         if (videoId) {
//             setCurrentTrailerId(videoId);
//             setIsModalOpen(true);
//         } else {
//             console.warn("Lỗi: Không tìm thấy ID video hợp lệ hoặc trailerUrl bị thiếu.");
//         }
//     };

//     // Hàm đóng Modal
//     const closeTrailerModal = () => {
//         setIsModalOpen(false);
//         setCurrentTrailerId(null);
//     };

//   const goToPage = (page) => {
//     if (page < 0 || page >= totalPages) return;
//     setCurrentPage(page);
//   };

//   const goToPrev = () => {
//     goToPage(currentPage - 1);
//   };

//   const goToNext = () => {
//     goToPage(currentPage + 1);
//   };


//   if (movies.length === 0) {
//     return null;
//   }

//   return (
//     <div className="movie-slideshow-container">
//       {title && (
//         <div className="section-header">
//           <h2>{title}</h2>
//         </div>
//       )}
      
//       <div className="movie-slideshow-wrapper">
//         <button
//           className={`movie-slideshow-btn movie-slideshow-btn-prev ${currentPage === 0 ? 'disabled' : ''}`}
//           onClick={goToPrev}
//           disabled={currentPage === 0}
//           aria-label="Previous movies"
//         >
//           ‹
//         </button>
        
//         <div className="movie-slideshow">
//           <div 
//             className="movie-slideshow-content"
//             style={{
//               transform: `translateX(-${currentPage * (280 * moviesPerPage + 24 * (moviesPerPage - 1))}px)`,
//               transition: 'transform 0.5s ease'
//             }}
//           >
//             {movies.map((movie) => (
//               <div key={movie.id} className="movie-slideshow-item">
//                 <MovieCard movie={movie} />
//                 <div className="movie-actions">
//                   <button 
//                         className="movie-btn-outline movie-trailer-btn"
//                         onClick={() => openTrailerModal(movie.trailer_url)}>
//                       <img src="https://cinestar.com.vn/assets/images/icon-play-vid.svg" alt="" />
//                       <span className="trailer-text">Xem trailer</span> 
//                       </button>
//                   {movie.status === 'coming_soon' ? (
//                     <button className="movie-btn">
//                       Tìm hiểu thêm
//                     </button>
//                   ) : (
//                     <>
                      
//                       <button className="movie-btn">Đặt vé</button>
//                     </>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
        
//         <button
//           className={`movie-slideshow-btn movie-slideshow-btn-next ${currentPage >= totalPages - 1 ? 'disabled' : ''}`}
//           onClick={goToNext}
//           disabled={currentPage >= totalPages - 1}
//           aria-label="Next movies"
//         >
//           ›
//         </button>
//       </div>

//       {/* Pagination dots */}
//       {totalPages > 1 && (
//         <div className="movie-slideshow-pagination">
//           {Array.from({ length: totalPages }).map((_, index) => (
//             <button
//               key={index}
//               className={`movie-slideshow-dot ${index === currentPage ? 'active' : ''}`}
//               onClick={() => goToPage(index)}
//               aria-label={`Go to page ${index + 1}`}
//             />
//           ))}
//         </div>
//       )}

//       {/* XEM THÊM button */}
//       {movies.length > moviesPerPage && (
//         <div className="movie-slideshow-more">
//           <button className="movie-slideshow-more-btn">XEM THÊM</button>
//         </div>
        
//       )}
      
//     </div>
//   );
// }

// export default MovieSlideshow;

import React, { useState } from 'react';
import MovieCard from './MovieCard';

function MovieSlideshow({ movies, title }) {
    const [currentPage, setCurrentPage] = useState(0);
    const moviesPerPage = 4;
    const totalPages = Math.ceil(movies.length / moviesPerPage);

    // =======================================================
    // 💥 VỊ TRÍ 1: STATE VÀ HÀM XỬ LÝ MODAL (Đã sửa lỗi dán) 💥
    // =======================================================
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentTrailerId, setCurrentTrailerId] = useState(null);

    // Hàm trích xuất YouTube ID
    const extractYouTubeId = (url) => {
        if (!url) return null;
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
    // ------------------------------------------------------------------

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
                                    
                                    {/* NÚT XEM TRAILER (Áp dụng hàm mở Modal) */}
                                    <button 
                                        className="movie-btn-outline movie-trailer-btn"
                                        onClick={() => openTrailerModal(movie.trailer_url)}>
                                        <img src="https://cinestar.com.vn/assets/images/icon-play-vid.svg" alt="" />
                                        <span className="trailer-text">Xem trailer</span> 
                                    </button>
                                    
                                    {/* NÚT HÀNH ĐỘNG CHÍNH */}
                                    {movie.status === 'coming_soon' ? (
                                        /* PHIM SẮP CHIẾU: Style màu vàng (movie-btn) */
                                        <button className="movie-btn">
                                            Tìm hiểu thêm
                                        </button>
                                    ) : (
                                        /* PHIM ĐANG CHIẾU: Style màu vàng */
                                        <button className="movie-btn">Đặt vé</button>
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
            
            {/* ================================================= */}
            {/* 💥 VỊ TRÍ 2: JSX MODAL ĐƯỢC ĐẶT Ở ĐÂY (CUỐI CÙNG) 💥 */}
            {/* ================================================= */}
            {isModalOpen && currentTrailerId && (
                <div className="trailer-modal-overlay" onClick={closeTrailerModal}>
                    {/* Ngăn chặn việc click vào video làm đóng modal */}
                    <div className="trailer-modal-content" onClick={(e) => e.stopPropagation()}>
                        
                        {/* Tiêu đề modal */}
                        <div className="trailer-modal-header">
                            {/* Cần kiểm tra nếu movie.trailer_url tồn tại trước khi dùng find */}
                            
                            <button className="close-modal-btn" onClick={closeTrailerModal}>×</button>
                        </div>

                        {/* Iframe nhúng YouTube */}
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

