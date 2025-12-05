// Import hook chuyển hướng (nếu dùng React Router)
import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom'; // <--- Thêm nếu bạn dùng React Router

function PromoSlideshow({ promotions, title }) {
    // const navigate = useNavigate(); // <-- Kích hoạt nếu dùng React Router

    // ... (logic state và pagination giữ nguyên)

    // ... (trong phần render items)
    
    return (
        // ...
        <div className="promo-slideshow-content" style={{/* ... */}}>
            {promotions.map((promo) => (
                <a 
                    key={promo.id} 
                    
                    {/* 💡 SỬA ĐẦU TIÊN: Dùng promo.slug để tạo URL */}
                    href={`/khuyen-mai/${promo.slug}`} 
                    className="promo-slideshow-item"
                >
                    <div className="promo-card">
                        {/* 💡 SỬA THỨ HAI: Dùng promo.image_url */}
                        <img src={promo.image_url} alt={promo.title || "Khuyến mãi"} /> 
                    </div>
                </a>
            ))}
 </div>
        // ...
    );
}

export default PromoSlideshow;