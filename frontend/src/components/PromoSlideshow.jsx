import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function PromoSlideshow({ promotions = [], title }) {
    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(0);
    const itemWidth = 380;
    const gap = 33;
    const itemsVisiblePerPage = 3; // Số ảnh hiển thị trên màn hình
    // Tính maxIndex: chỉ cho phép lướt đến khi còn đủ số ảnh hiển thị
    const maxIndex = Math.max(0, promotions.length - itemsVisiblePerPage);

    const goToIndex = (index) => {
        if (index < 0 || index > maxIndex) return;
        setCurrentIndex(index);
    };

    const goToPrev = () => {
        goToIndex(currentIndex - 1);
    };

    const goToNext = () => {
        goToIndex(currentIndex + 1);
    };

    // Always show the section, even if no promotions
    // This ensures the section header is visible

    return (
        <div className="promo-slideshow-container">
            {title && (
                <div className="section-header">
                    <h2>{title}</h2>
                </div>
            )}
            
            {promotions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                    Hiện chưa có chương trình khuyến mãi nào.
                </div>
            ) : (
                <>
                    <div className="promo-slideshow-wrapper">
                        <button
                            className={`promo-slideshow-btn promo-slideshow-btn-prev ${currentIndex === 0 ? 'disabled' : ''}`}
                            onClick={goToPrev}
                            disabled={currentIndex === 0}
                            aria-label="Khuyến mãi trước"
                        >
                            ‹
                        </button>
                        
                        <div className="promo-slideshow">
                            <div 
                                className="promo-slideshow-content"
                                style={{
                                    transform: `translateX(-${currentIndex * (itemWidth + gap)}px)`,
                                    transition: 'transform 0.5s ease'
                                }}
                            >
                                {promotions.map((promo) => (
                                    <div 
                                        key={promo.id} 
                                        className="promo-slideshow-item"
                                        onClick={() => navigate('/chuong-trinh-khuyen-mai')}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className="promo-card">
                                            <img src={promo.image_url} alt={promo.title || "Khuyến mãi"} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <button
                            className={`promo-slideshow-btn promo-slideshow-btn-next ${currentIndex >= maxIndex ? 'disabled' : ''}`}
                            onClick={goToNext}
                            disabled={currentIndex >= maxIndex}
                            aria-label="Khuyến mãi tiếp theo"
                        >
                            ›
                        </button>
                    </div>

                    {/* Pagination dots */}
                    {promotions.length > itemsVisiblePerPage && (
                        <div className="promo-slideshow-pagination">
                            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                                <button
                                    key={index}
                                    className={`promo-slideshow-dot ${index === currentIndex ? 'active' : ''}`}
                                    onClick={() => goToIndex(index)}
                                    aria-label={`Đi đến trang ${index + 1}`}
                                />
                            ))}
                        </div>
                    )}

                    {/* XEM THÊM button - Hiển thị khi có nhiều hơn số lượng hiển thị */}
                    {promotions.length > itemsVisiblePerPage && (
                        <div className="movie-slideshow-more">
                            <button 
                                className="movie-slideshow-more-btn"
                                onClick={() => navigate('/chuong-trinh-khuyen-mai')}
                            >
                                XEM THÊM
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}


export default PromoSlideshow;