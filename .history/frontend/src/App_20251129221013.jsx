import React, { useState, useEffect } from 'react';
import MovieCard from './components/MovieCard';
import MovieSlideshow from './components/MovieSlideshow';
import PromoSlideshow from './components/PromoSlideshow';
import { promotions, services, bannerSlides } from './mockData';

function App() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [nowShowingMovies, setNowShowingMovies] = useState([]);
  const [comingSoonMovies, setComingSoonMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [promotionsData, setPromotionsData] = useState([]);

  // Fetch dữ liệu phim từ API
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        // Fetch phim đang chiếu
        const nowShowingResponse = await fetch('/api/movies?status=now_showing');
        // Fetch phim sắp chiếu
        const comingSoonResponse = await fetch('/api/movies?status=coming_soon');
        
        if (!nowShowingResponse.ok || !comingSoonResponse.ok) {
          throw new Error('Không thể tải dữ liệu phim');
        }
        
        const nowShowing = await nowShowingResponse.json();
        const comingSoon = await comingSoonResponse.json();
        
        // Nếu không có status, fallback về cách cũ (chia đôi)
        if (nowShowing.length === 0 && comingSoon.length === 0) {
          const allResponse = await fetch('/api/movies');
          const allMovies = await allResponse.json();
          setNowShowingMovies(allMovies.slice(0, 4));
          setComingSoonMovies(allMovies.slice(4));
        } else {
          setNowShowingMovies(nowShowing);
          setComingSoonMovies(comingSoon);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu phim:', error);
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 5000); // Chuyển slide mỗi 5 giây

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
        const fetchPromotions = async () => {
            try {
                // Giả định API endpoint cho khuyến mãi
                const response = await fetch('/api/promotions'); 
                if (!response.ok) {
                    throw new Error('Không thể tải dữ liệu khuyến mãi');
                }
                const data = await response.json();
                setPromotionsData(data);
            } catch (error) {
                console.error('Lỗi khi tải dữ liệu khuyến mãi:', error);
            }
        };

        fetchPromotions();
    }, []);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const goToPrev = () => {
    setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
  };

  return (
    <div className="app-root">
      <div className="header-wrapper">
    <header className="main-header">
        {/* Thêm container này để căn giữa và giới hạn chiều rộng (max-width) */}
        <div className="header-content-container"> 
            
            {/* LOGO MỚI: Sử dụng thẻ img */}
            <a href="/" className="main-logo-link">
                {/* ⚠️ Cập nhật đường dẫn hình ảnh của bạn tại đây */}
                <img 
                    src="https://cinestar.com.vn/_next/image/?url=%2Fassets%2Fimages%2Fheader-logo.png&w=1920&q=75" 
                    alt="CINESTAR Logo" 
                    className="main-logo-image" 
                />
            </a>

            {/* Các nút hành động */}
            <div className="header-actions">
                <button className="btn-ticket">
                  <img src="https://cinestar.com.vn/assets/images/ic-ticket.svg" alt="" />
                    ĐẶT VÉ NGAY
                </button>
                <button className="btn-popcorn">
                  <img src="https://cinestar.com.vn/assets/images/ic-cor.svg" alt="" />
                    ĐẶT BẮP NƯỚC
                </button>
            </div>
            
            {/* Thanh tìm kiếm */}
            <div className="header-search">
                <input type="text" placeholder="Tìm phim, rạp" className="search-input" />
                <i className="fas fa-search search-icon"></i>
            </div>
            
            {/* Đăng nhập và Ngôn ngữ */}
            <div className="header-user">
                <img src="https://cinestar.com.vn/assets/images/ic-header-auth.svg" alt="" />
                <span className="user-text">Đăng nhập</span>
                <div className="language-selector">
                    <img src="https://cinestar.com.vn/assets/images/footer-vietnam.svg" alt="" />
                    <span>VN</span>
                    <i className="fas fa-chevron-down chevron"></i>
                </div>
            </div>
        </div> {/* Đóng header-content-container */}
    </header>
</div>

      {/* Secondary Navigation */}
      <nav className="secondary-nav">
        <div className="secondary-nav-left">
          <button className="nav-link-with-icon">
            <i className="fas fa-map-marker-alt nav-icon"></i>
            Chọn rạp
          </button>
          <button className="nav-link-with-icon">
            <i className="fas fa-clock nav-icon"></i>
            Lịch chiếu
          </button>
        </div>
      </nav>

      <main className="home-main">
        {/* Banner Carousel */}
        <section className="hero-section">
          <div className="banner-carousel-wrapper">
            <button className="carousel-btn carousel-btn-prev" onClick={goToPrev}>
              ‹
            </button>
            <div className="banner-carousel">
              <div className="carousel-container">
                {bannerSlides.map((slide, index) => (
                  <div
                    key={slide.id}
                    className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
                    style={{ backgroundImage: `url(${slide.image})` }}
                  />
                ))}
              </div>
              <div className="carousel-dots">
                {bannerSlides.map((slide, index) => (
                  <button
                    key={slide.id}
                    className={`carousel-dot ${index === currentSlide ? 'active' : ''}`}
                    onClick={() => goToSlide(index)}
                    aria-label={`Slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
            <button className="carousel-btn carousel-btn-next" onClick={goToNext}>
              ›
            </button>
          </div>
        </section>

        {/* Đặt vé nhanh */}     
        <section className="quick-booking-container">
    <div className="quick-steps-wrapper">
        <h2 className="quick-booking-title">ĐẶT VÉ NHANH</h2>
        
        <div className="quick-select-group">
            {/* Bước 1: Chọn Rạp */}
            <div className="quick-step-select">
                <select defaultValue="Chọn rạp">
                    <option disabled>1. Chọn rạp</option>
                    <option>Chọn rạp</option>
                    <option>WebPhim Nguyễn Huệ</option>
                    <option>WebPhim Bình Thạnh</option>
                </select>
            </div>
            
            {/* Bước 2: Chọn Phim */}
            <div className="quick-step-select">
                <select defaultValue="Chọn phim">
                    <option disabled>2. Chọn Phim</option>
                    <option>Chọn Phim</option>
                    {/* Giả định: {nowShowingMovies.map...} */}
                </select>
            </div>
            
            {/* Bước 3: Chọn Ngày */}
            <div className="quick-step-select">
                {/* Dùng input type date để đơn giản, hoặc select cho danh sách ngày */}
                <select defaultValue="Chọn ngày">
                    <option disabled>3. Chọn Ngày</option>
                    <option>Chọn Ngày</option>
                    <option>29/11/2025</option>
                    <option>30/11/2025</option>
                </select>
            </div>
            
            {/* Bước 4: Chọn Suất */}
            <div className="quick-step-select">
                <select defaultValue="Chọn suất">
                    <option disabled>4. Chọn Suất</option>
                    <option>Chọn Suất</option>
                    <option>10:00</option>
                    <option>13:30</option>
                </select>
            </div>
            
            {/* Nút Đặt Ngay */}
            <button className="quick-submit-btn">ĐẶT NGAY</button>
        </div>
    </div>
</section>

        {/* Phim đang chiếu */}
        <section className="section-block">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
              Đang tải dữ liệu...
            </div>
          ) : nowShowingMovies.length > 0 ? (
            <MovieSlideshow movies={nowShowingMovies} title="Phim đang chiếu" />
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
              Chưa có phim đang chiếu
            </div>
          )}
        </section>

        {/* Phim sắp chiếu */}
        <section className="section-block">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
              Đang tải dữ liệu...
            </div>
          ) : comingSoonMovies.length > 0 ? (
            <MovieSlideshow movies={comingSoonMovies} title="Phim sắp chiếu" />
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
              Chưa có phim sắp chiếu
            </div>
          )}
        </section>


        

        {/* Khuyến mãi */}
        <section className="section-block">
                {promotionsData.length > 0 && (
                    <PromoSlideshow promotions={promotionsData} title="Khuyến mãi" />
                )}
            </section>

        {/* Dịch vụ giải trí khác */}
        <section className="section-block dark-block">
          <div className="section-header">
            <h2>Dịch vụ giải trí khác</h2>
          </div>
          <p className="section-intro">
            WebPhim không chỉ chiếu phim – chúng tôi còn mang đến nhiều mô hình
            giải trí đặc sắc khác, giúp bạn tận hưởng trọn vẹn từng khoảnh khắc.
          </p>
          <div className="services-grid">
            {services.map((s) => (
              <div key={s.id} className="service-card">
                <img src={s.image} alt={s.title} />
                <div className="service-title">{s.title}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Liên hệ */}
        <section className="section-block contact-block">
          <div className="contact-left">
            <h2>Liên hệ với chúng tôi</h2>
            <ul className="contact-info">
              <li>Email: support@webphim.vn</li>
              <li>Hotline: 1900 1234</li>
              <li>Địa chỉ: 123 Đường Điện Ảnh, Quận 1, TP.HCM</li>
            </ul>
            <div className="contact-buttons">
              <button className="social-btn facebook">Facebook</button>
              <button className="social-btn zalo">Zalo Chat</button>
            </div>
          </div>
          <div className="contact-right">
            <h3>Gửi thông tin liên hệ</h3>
            <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
              <input type="text" placeholder="Họ và tên" />
              <input type="email" placeholder="Email" />
              <input type="text" placeholder="Số điện thoại" />
              <textarea rows="4" placeholder="Nội dung"></textarea>
              <button className="btn-primary" type="submit">
                Gửi đi
              </button>
            </form>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-left">
            <div className="footer-logo">WebPhim</div>
            <p>© {new Date().getFullYear()} WebPhim. All rights reserved.</p>
          </div>
          <div className="footer-links">
            <a>Điều khoản sử dụng</a>
            <a>Chính sách bảo mật</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;


