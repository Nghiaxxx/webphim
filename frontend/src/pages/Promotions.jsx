import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { usePromotions } from '../hooks/usePromotions';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../utils/translations';

function Promotions() {
  const { promotionsData, loading, error } = usePromotions();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const t = (key) => getTranslation(key, language);

  const handleBookTicket = () => {
    navigate('/movie');
  };
  const getLayoutDirection = (index) => {
    return index % 2 === 0 ? 'right-image' : 'left-image';
  };

  return (
    <div className="app-root">
      <Header />

      <main className="promotions-main">
        {/* Header Title */}
        {/* <div className="section-header">
          <h2>CHƯƠNG TRÌNH KHUYẾN MÃI</h2>
        </div> */}

        {/* Promotions List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
            Đang tải...
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#ef4444' }}>
            <p>Lỗi: {error}</p>
            <p style={{ fontSize: '14px', marginTop: '10px', color: '#9ca3af' }}>
              Vui lòng kiểm tra kết nối backend hoặc thử lại sau.
            </p>
          </div>
        ) : promotionsData.length > 0 ? (
          <div className="promotions-list">
            {promotionsData.map((promo, index) => {
              const layoutDirection = promo.layout || getLayoutDirection(index);
              
              return (
                <div key={promo.id} className={`promotion-item ${layoutDirection}`}>
                  {/* Promotional Banner/Image Section */}
                  <div className="promotion-banner-section">
                    <div className="promotion-banner-wrapper">
                      <img 
                        src={promo.image_url} 
                        alt={promo.title || "Khuyến mãi"} 
                        className="promotion-banner-image"
                        loading="lazy"
                      />
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="promotion-details-section">
                    <div className="promotion-details-content">
                      <h3 className="promotion-details-title">{promo.title}</h3>
                      {promo.subtitle && (
                        <p className="promotion-details-subtitle">{promo.subtitle}</p>
                      )}
                      {promo.description && (
                        <div className="promotion-details-description">
                          {promo.description}
                        </div>
                      )}
                      {promo.conditions && (
                        <div className="promotion-conditions">
                          <h4 className="promotion-conditions-title">Điều kiện</h4>
                          <ul className="promotion-conditions-list">
                            {Array.isArray(promo.conditions) ? (
                              promo.conditions.map((condition, idx) => (
                                <li key={idx}>{condition}</li>
                              ))
                            ) : (
                              <li>{promo.conditions}</li>
                            )}
                          </ul>
                        </div>
                      )}
                      {promo.notes && (
                        <div className="promotion-notes">
                          <h4 className="promotion-notes-title">Lưu ý</h4>
                          <ul className="promotion-notes-list">
                            {Array.isArray(promo.notes) ? (
                              promo.notes.map((note, idx) => (
                                <li key={idx}>{note}</li>
                              ))
                            ) : (
                              <li>{promo.notes}</li>
                            )}
                          </ul>
                        </div>
                      )}
                      <button
                        className="promotion-book-btn"
                        onClick={handleBookTicket}
                      >
                        <span>ĐẶT VÉ NGAY</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
            Hiện chưa có chương trình khuyến mãi nào.
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default Promotions;

