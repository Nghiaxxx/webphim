import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Dữ liệu giả định (Mock Data) để hiển thị giao diện
const MOCK_PROMOTIONS = [
    { id: 1, title: 'Happy Birthday', slug: 'happy-birthday', image_url: 'https://placehold.co/300x400/522583/ffffff?text=Ưu+Đãi+1' },
    { id: 2, title: 'Happy Hour', slug: 'happy-hour', image_url: 'https://placehold.co/300x400/9839b2/ffffff?text=Ưu+Đãi+2' },
    { id: 3, title: 'G-School', slug: 'g-school', image_url: 'https://placehold.co/300x400/590059/ffffff?text=Ưu+Đãi+3' },
    { id: 4, title: 'Happy Day', slug: 'happy-day', image_url: 'https://placehold.co/300x400/7c4dff/ffffff?text=Ưu+Đãi+4' },
    { id: 5, title: 'Flash Sale', slug: 'flash-sale', image_url: 'https://placehold.co/300x400/3c003c/ffffff?text=Ưu+Đãi+5' },
    { id: 6, title: 'Weekend Promo', slug: 'weekend-promo', image_url: 'https://placehold.co/300x400/a35fbc/ffffff?text=Ưu+Đãi+6' },
    { id: 7, title: 'New User Gift', slug: 'new-user', image_url: 'https://placehold.co/300x400/522583/ffffff?text=Ưu+Đãi+7' },
    { id: 8, title: 'Summer Deal', slug: 'summer-deal', image_url: 'https://placehold.co/300x400/9839b2/ffffff?text=Ưu+Đãi+8' },
];

// Component PromoSlideshow
function PromoSlideshow({ promotions, title }) {
    // Kích thước cố định của mỗi item và khoảng cách
    const itemWidth = 300; // Chiều rộng mỗi thẻ khuyến mãi (px)
    const itemGap = 24; // Khoảng cách giữa các thẻ (px)
    const itemsPerPage = 3; // Số lượng khuyến mãi hiển thị cùng lúc (Điều chỉnh để khớp ảnh mẫu)

    // 1. LOGIC SLIDESHOW
    const [currentPage, setCurrentPage] = useState(0);
    const totalPages = Math.ceil(promotions.length / itemsPerPage);

    const goToPage = (page) => {
        if (page >= 0 && page < totalPages) {
            setCurrentPage(page);
        }
    };
    const goToPrev = () => goToPage(currentPage - 1);
    const goToNext = () => goToPage(currentPage + 1);
    
    // Tính toán khoảng cách trượt (tổng chiều rộng của 3 item + 2 khoảng cách)
    const slideDistance = itemWidth * itemsPerPage + itemGap * (itemsPerPage - 1);

    if (promotions.length === 0) {
        return null;
    }

    return (
        <div className="promo-slideshow-container">
            {/* Header section (Không có trong ảnh mẫu, nhưng giữ lại theo code bạn gửi) */}
            {title && (
                <div className="section-header text-center mb-8">
                    <h2 className="promo-title text-3xl font-bold text-white">{title}</h2>
                </div>
            )}
            
            <div className="promo-slideshow-wrapper">
                {/* Nút Previous */}
                <button
                    className={`promo-slideshow-btn promo-slideshow-btn-prev ${currentPage === 0 ? 'disabled' : ''}`}
                    onClick={goToPrev}
                    disabled={currentPage === 0}
                    aria-label="Previous Slide"
                >
                    <ChevronLeft size={24} />
                </button>
                
                {/* Khung nhìn Slideshow */}
                <div className="promo-slideshow">
                    <div 
                        className="promo-slideshow-content"
                        style={{
                            // 2. LOGIC TRƯỢT: Sử dụng giá trị tính toán
                            transform: `translateX(-${currentPage * slideDistance}px)`,
                            transition: 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)' // Easing đẹp hơn
                        }}
                    >
                        {promotions.map((promo) => (
                            <a 
                                key={promo.id} 
                                href={`/khuyen-mai/${promo.slug}`} 
                                className="promo-slideshow-item"
                                style={{
                                    // Set chiều rộng item cố định
                                    minWidth: `${itemWidth}px`,
                                    marginRight: `${itemGap}px`
                                }}
                            >
                                <div className="promo-card">
                                    {/* Sử dụng placeholder image */}
                                    <img 
                                        src={promo.image_url} 
                                        alt={promo.title || "Khuyến mãi"} 
                                        className="w-full h-full object-cover rounded-xl"
                                        onError={(e) => {
                                            e.target.onerror = null; 
                                            e.target.src="https://placehold.co/300x400/3e0b4a/ffffff?text=Ảnh+Lỗi"
                                        }}
                                    /> 
                                </div>
                            </a>
                        ))}
                        {/* Thêm một item rỗng để đảm bảo marginRight cuối cùng không bị ẩn bởi overflow */}
                        <div style={{ minWidth: 0, marginRight: 0 }}></div>
                    </div>
                </div>
                
                {/* Nút Next */}
                <button
                    className={`promo-slideshow-btn promo-slideshow-btn-next ${currentPage >= totalPages - 1 ? 'disabled' : ''}`}
                    onClick={goToNext}
                    disabled={currentPage >= totalPages - 1}
                    aria-label="Next Slide"
                >
                    <ChevronRight size={24} />
                </button>
            </div>

            {/* Pagination dots (Chấm phân trang) */}
            {totalPages > 1 && (
                <div className="movie-slideshow-pagination flex justify-center mt-6">
                    {[...Array(totalPages)].map((_, index) => (
                        <button
                            key={index}
                            className={`h-2 w-2 rounded-full mx-1 transition-colors ${
                                index === currentPage ? 'bg-white scale-125' : 'bg-gray-600'
                            }`}
                            onClick={() => goToPage(index)}
                            aria-label={`Go to page ${index + 1}`}
                        />
                    ))}
                </div>
            )}

            {/* Nút CTA (Tất cả ưu đãi) */}
            <div className="flex justify-center mt-8">
                <a 
                    href="/tat-ca-khuyen-mai" 
                    className="cta-button bg-yellow-400 text-purple-900 font-extrabold py-3 px-10 rounded-full shadow-lg hover:bg-yellow-300 transition-all uppercase text-sm tracking-wider"
                >
                    TẤT CẢ ƯU ĐÃI
                </a>
            </div>
        </div>
    );
}

// Component chính
export default function App() {
    return (
        // Khung nền tổng thể
        <div className="min-h-screen p-8 flex items-start justify-center bg-[#1c2135] font-sans">
            <style jsx="true">{`
                /* 1. CONTAINER CHUNG */
                .promo-slideshow-container {
                    max-width: 1024px; /* Giới hạn chiều rộng cho desktop */
                    width: 100%;
                    padding: 0 16px; /* Padding ngang cho mobile */
                }

                /* 2. WRAPPER (Để neo nút Prev/Next) */
                .promo-slideshow-wrapper {
                    position: relative;
                    margin: 0 -24px; /* Lấy lại 24px bị mất do padding của container và để nút lấn ra ngoài */
                }

                /* 3. KHUNG VIEWPORT (Chỉ cho phép 3 item hiển thị) */
                .promo-slideshow {
                    /* Chiều rộng tính toán: 3 * 300px (width) + 2 * 24px (gap) */
                    width: 948px; 
                    margin: 0 auto; /* Căn giữa slideshow */
                    overflow: hidden; /* Cắt phần ngoài */
                    border-radius: 12px;
                }
                
                /* Tối ưu cho màn hình nhỏ hơn 1024px (Mobile/Tablet) */
                @media (max-width: 1023px) {
                    .promo-slideshow-container {
                        max-width: 100%;
                        padding: 0 8px;
                    }
                    .promo-slideshow {
                        width: 100%; /* Chiếm toàn bộ chiều rộng có thể */
                        overflow-x: scroll; /* Kéo ngang nếu không muốn dùng nút, nhưng đây là slider nên dùng nút */
                        scroll-behavior: smooth;
                        margin: 0;
                    }
                    /* Điều chỉnh kích thước item cho mobile, chỉ show 1.2 item để báo hiệu còn trượt được */
                    .promo-slideshow-item {
                        min-width: 80vw !important; /* Rộng 80% viewport */
                    }
                    .promo-slideshow-content {
                        gap: 16px; /* Giảm gap cho mobile */
                    }
                    /* Ẩn nút mũi tên trên mobile vì thường dùng thao tác vuốt */
                    .promo-slideshow-btn {
                        display: none; 
                    }
                }
                
                /* 4. CONTENT (Dải trượt) */
                .promo-slideshow-content {
                    display: flex;
                    flex-wrap: nowrap;
                    padding-bottom: 24px; /* Để giữ lại bóng đổ nếu có */
                }

                /* 5. ITEM CARD */
                .promo-slideshow-item {
                    display: block;
                    text-decoration: none;
                    flex-shrink: 0;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 10px 20px rgba(0,0,0,0.3);
                    transform: scale(1);
                    transition: transform 0.3s ease;
                }
                .promo-slideshow-item:hover {
                    transform: scale(1.02);
                }

                /* 6. NÚT ĐIỀU HƯỚNG */
                .promo-slideshow-btn {
                    position: absolute;
                    top: 50%; /* Đặt nút ở giữa dọc */
                    transform: translateY(-50%);
                    z-index: 10;
                    background: rgba(0, 0, 0, 0.7);
                    color: white;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 50%;
                    width: 48px;
                    height: 48px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
                }
                .promo-slideshow-btn:hover:not(:disabled) {
                    background: rgba(0, 0, 0, 0.9);
                    transform: translateY(-50%) scale(1.1);
                }
                .promo-slideshow-btn.disabled {
                    opacity: 0.3;
                    cursor: not-allowed;
                }

                .promo-slideshow-btn-prev {
                    left: 0; /* Đặt ở rìa trái của wrapper */
                }
                .promo-slideshow-btn-next {
                    right: 0; /* Đặt ở rìa phải của wrapper */
                }

                /* Tùy chỉnh cho mobile */
                @media (min-width: 1024px) {
                    .promo-slideshow-btn-prev {
                         left: -48px; /* Đẩy ra ngoài khung slide */
                    }
                    .promo-slideshow-btn-next {
                        right: -48px; /* Đẩy ra ngoài khung slide */
                    }
                }
            `}</style>

            <PromoSlideshow 
                promotions={MOCK_PROMOTIONS} 
                title="Khuyến Mãi Nổi Bật" 
            />
        </div>
    );
}