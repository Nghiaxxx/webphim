import React, { useState } from 'react';

function PromoSlideshow({ promotions, title }) {
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 3; 
    const totalPages = Math.ceil(promotions.length / itemsPerPage);
    const itemWidth = 260; 
    const itemGap = 20;

    const goToPage = (page) => {
        if (page >= 0 && page < totalPages) {
            setCurrentPage(page);
        }
    };
    const goToPrev = () => goToPage(currentPage - 1);
    const goToNext = () => goToPage(currentPage + 1);

    if (promotions.length === 0) {
        return null; 
    }

    return (
        <div className="promo-slideshow-container">
            {title && (
                <div className="section-header">
                    <h2 className="promo-title">{title}</h2>
                </div>
            )}
            
            <div className="promo-slideshow-wrapper">
                <button
                    className={`promo-slideshow-btn promo-slideshow-btn-prev ${currentPage === 0 ? 'disabled' : ''}`}
                    onClick={goToPrev}
                    disabled={currentPage === 0}
                > ‹ </button>
                
                <div className="promo-slideshow">
                    <div 
                        className="promo-slideshow-content"
                        style={{
                            transform: `translateX(-${offset}px)`,
                             transition: 'transform 0.5s ease'
                        }}
                    >
                        {promotions.map((promo) => (
                            <a 
                                key={promo.id} 
                                href={`/khuyen-mai/${promo.slug}`} 
                                className="promo-slideshow-item"
                            >
                                <div className="promo-card">
                                    <img src={promo.image_url} alt={promo.title || "Khuyến mãi"} /> 
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
                
                {/* Nút Next */}
                <button
                    className={`promo-slideshow-btn promo-slideshow-btn-next ${currentPage >= totalPages - 1 ? 'disabled' : ''}`}
                    onClick={goToNext}
                    disabled={currentPage >= totalPages - 1}
                > › </button>
            </div>
            {totalPages > 1 && (
                <div className="movie-slideshow-pagination">
                    {/* ... (logic dots nếu cần) */}
                </div>
            )}
        </div>
    );
}

export default PromoSlideshow;