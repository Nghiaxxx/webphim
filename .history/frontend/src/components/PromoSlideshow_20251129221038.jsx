// Import hook chuyển hướng (nếu dùng React Router)
import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom'; // <--- Thêm nếu bạn dùng React Router

function PromoSlideshow({ promotions, title }) {
    // const navigate = useNavigate(); // <-- Kích hoạt nếu dùng React Router

    // ... (logic state và pagination giữ nguyên)

    // ... (trong phần render items)
    
    return (
        // ...
        <div 
            className="promo-slideshow-content"
            style={{
                // ... style cũ ...
            }}
        >
            {promotions.map((promo) => (
                // Thay div bằng thẻ a để xử lý link
                <a 
                    key={promo.id} 
                    href={promo.linkUrl || '#'} // <-- Dùng linkUrl từ dữ liệu
                    className="promo-slideshow-item"
                    // onClick={() => navigate(promo.linkUrl)} // <-- Dùng navigate nếu có
                >
                    <div className="promo-card">
                        <img src={promo.image} alt={promo.title || "Khuyến mãi"} />
                    </div>
                </a>
            ))}
        </div>
        // ...
    );
}

export default PromoSlideshow;