import React, { useState, useMemo } from 'react';

// FIX: Gán giá trị mặc định là mảng rỗng cho promotions để tránh lỗi 'Cannot read properties of undefined (reading length)'
function PromoSlideshow({ promotions = [], title }) {
    const [currentPage, setCurrentPage] = useState(0);
    
    // Cố định số lượng items hiển thị trên mỗi trang (giống như moviesPerPage)
    const itemsPerPage = 3; 
    
    // Kích thước items được định nghĩa cục bộ trong promo component
    const itemWidth = 260; // Chiều rộng của mỗi promo card
    const itemGap = 20; // Khoảng cách giữa các promo card

    // promotions.length giờ đây được đảm bảo là số hợp lệ
    const totalPages = Math.ceil(promotions.length / itemsPerPage);

    // Tính toán độ dịch chuyển (offset) cho slide, tương tự như logic trong MovieSlideshow
    const slideOffset = useMemo(() => {
        // Tổng chiều rộng của itemsPerPage cards + (itemsPerPage - 1) gaps
        if (itemsPerPage === 0) return 0;
        return itemsPerPage * itemWidth + (itemsPerPage - 1) * itemGap;
    }, [itemWidth, itemGap, itemsPerPage]);


    const goToPage = (page) => {
        // Đảm bảo không vượt quá giới hạn trang
        if (page < 0 || page >= totalPages) return;
        setCurrentPage(page);
    };

    const goToPrev = () => {
        goToPage(currentPage - 1);
    };

    const goToNext = () => {
        goToPage(currentPage + 1);
    };

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
                {/* Nút Prev */}
                <button
                    className={`promo-slideshow-btn promo-slideshow-btn-prev ${currentPage === 0 ? 'disabled' : ''}`}
                    onClick={goToPrev}
                    disabled={currentPage === 0}
                    aria-label="Khuyến mãi trước"
                > ‹ </button>
                
                <div className="promo-slideshow">
                    <div 
                        className="promo-slideshow-content"
                        style={{
                            // Dùng slideOffset đã tính toán chính xác
                            transform: `translateX(-${currentPage * slideOffset}px)`,
                            transition: 'transform 0.5s ease',
                            // Thiết lập chiều rộng cho mỗi item để đảm bảo layout đúng
                            '--item-width': `${itemWidth}px`,
                            '--item-gap': `${itemGap}px`,
                        }}
                    >
                        {promotions.map((promo) => (
                            <a 
                                key={promo.id} 
                                href={`/khuyen-mai/${promo.slug}`} 
                                className="promo-slideshow-item"
                                style={{ width: `${itemWidth}px`, marginRight: `${itemGap}px` }}
                            >
                                <div className="promo-card">
                                    <img src={promo.image_url} alt={promo.title || "Khuyến mãi"} /> 
                                    {/* Thêm tiêu đề khuyến mãi nếu cần, tương tự như MovieCard */}
                                    <div className="promo-card-details">
                                        <h3>{promo.title}</h3>
                                        <p>{promo.description}</p>
                                    </div>
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
                    aria-label="Khuyến mãi tiếp theo"
                > › </button>
            </div>

            {/* Pagination dots (Đã thêm logic từ MovieSlideshow) */}
            {totalPages > 1 && (
                <div className="promo-slideshow-pagination">
                    {Array.from({ length: totalPages }).map((_, index) => (
                        <button
                            key={index}
                            className={`promo-slideshow-dot ${index === currentPage ? 'active' : ''}`}
                            onClick={() => goToPage(index)}
                            aria-label={`Đi đến trang ${index + 1}`}
                        />
                    ))}
                </div>
            )}
            
            {/* XEM THÊM button (Đã thêm logic từ MovieSlideshow) */}
            {promotions.length > itemsPerPage && (
                <div className="promo-slideshow-more">
                    <button className="promo-slideshow-more-btn">XEM THÊM</button>
                </div>
            )}
        </div>
    );
}

// Lưu ý: MovieCard không được dùng ở đây, nên tôi đã thêm chi tiết promo cơ bản 
// và tôi giả định rằng CSS classes `promo-slideshow-container`, `promo-slideshow-wrapper`, 
// `promo-slideshow-btn`, `promo-slideshow-pagination`, `promo-slideshow-dot`, v.v...
// đã được định nghĩa trong file CSS/styling chung của bạn.

export default PromoSlideshow;