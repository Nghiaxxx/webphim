import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Link } from 'react-router-dom';
import MovieCard from './components/MovieCard';
import MovieSlideshow from './components/MovieSlideshow';
import PromoSlideshow from './components/PromoSlideshow';
import Footer from './components/Footer';
import MovieDetail from './components/MovieDetail';
import Header from './components/Header';

function Home() {
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
      <Header />

     
     
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
                    <option>1. Chọn rạp</option>
                    <option>WebPhim Nguyễn Huệ</option>
                    <option>WebPhim Bình Thạnh</option>
                </select>
            </div>
            
            {/* Bước 2: Chọn Phim */}
            <div className="quick-step-select">
                <select defaultValue="Chọn phim">
                    <option disabled>2. Chọn Phim</option>
                    <option>2. Chọn Phim</option>
                    {/* Giả định: {nowShowingMovies.map...} */}
                </select>
            </div>
            
            {/* Bước 3: Chọn Ngày */}
            <div className="quick-step-select">
                {/* Dùng input type date để đơn giản, hoặc select cho danh sách ngày */}
                <select defaultValue="Chọn ngày">
                    <option disabled>3. Chọn Ngày</option>
                    <option>3. Chọn Ngày</option>
                    <option>29/11/2025</option>
                    <option>30/11/2025</option>
                </select>
            </div>
            
            {/* Bước 4: Chọn Suất */}
            <div className="quick-step-select">
                <select defaultValue="Chọn suất">
                    <option disabled>4. Chọn Suất</option>
                    <option>4. Chọn Suất</option>
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

        {/* Chương trình thành viên */}
        <section className="member-program-section">
            <div className="member-program-container">
                <div className="section-header">
                    <h2>CHƯƠNG TRÌNH THÀNH VIÊN</h2>
                </div>
                <div className="member-cards-wrapper">
                    <div className="member-card">
                        <div className="member-card-image">
                            <img src="https://api-website.cinestar.com.vn/media/wysiwyg/CMSPage/Member/Desktop519x282_CMember.webp" alt="C'FRIEND" />
                        </div>
                        <div className="member-card-content">
                            <h3>THÀNH VIÊN C'FRIEND</h3>
                            <p>The C'Friend mang đến nhiều ưu đãi cho thành viên mới</p>
                            <button className="member-card-btn">TÌM HIỂU NGAY</button>
                        </div>
                    </div>
                    <div className="member-card">
                        <div className="member-card-image">
                            <img src="https://api-website.cinestar.com.vn/media/wysiwyg/CMSPage/Member/c-vip.webp" alt="C'VIP" />
                        </div>
                        <div className="member-card-content">
                            <h3>THÀNH VIÊN C'VIP</h3>
                            <p>Thẻ VIP Cinestar dành riêng cho bạn những đặc quyền chất riêng.</p>
                            <button className="member-card-btn">TÌM HIỂU NGAY</button>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* Dịch vụ giải trí khác */}
        <section className="section-block dark-block">
          <div className="section-header">
            <h2>Dịch vụ giải trí khác</h2>
          </div>
          <p className="section-intro">
            WebPhim không chỉ chiếu phim – chúng tôi còn mang đến nhiều mô hình giải trí đặc sắc khác, giúp bạn tận hưởng từng giây phút bên ngoài màn ảnh rộng.
          </p>
          <div className="services-grid-container">
          <div className="services-grid">
            {services.map((s) => (
              <div key={s.id} className="service-card">
                <img src={s.image} alt={s.title} />
                <div className="service-title">{s.title}</div>
              </div>
            ))}
          </div>
          </div>
        </section>

   
        <section className="section-block contact-block">
    <div className="contact-left">
        <h2>LIÊN HỆ VỚI CHÚNG TÔI</h2>
        <div className="contact-buttons">
            {/* Thẻ <li> bị ẩn, nên tôi chỉ dùng nút */}
            <button className="social-btn facebook">FACEBOOK</button>
            <button className="social-btn zalo">ZALO CHAT</button>
        </div>
    </div>
    <div className="contact-right">
        {/* Khối Thông tin liên hệ, đặt ở đầu Form */}
        <h3>THÔNG TIN LIÊN HỆ</h3>
        <div className="contact-info-header">
             <p><img src="https://cinestar.com.vn/assets/images/ct-1.svg" alt="" /> cs@cinestar.com.vn</p>
             <p><img src="https://cinestar.com.vn/assets/images/ct-2.svg" alt="" /> 1900 0085</p>
             <p><img src="https://cinestar.com.vn/assets/images/ct-3.svg" alt="" /> 135 Hai Bà Trưng, phường Sài Gòn, TP.HCM</p>
        </div>
        
        {/* Form chính */}
        <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
            <input type="text" placeholder="Họ và tên" />
            <input type="email" placeholder="Điền email" />
            {/* Thay thế 'Số điện thoại' bằng 'Nội dung' như hình mẫu */}
            <textarea rows="4" placeholder="Thông tin liên hệ hoặc phản ánh"></textarea>
            
            <button className="btn-primary" type="submit">
                GỬI NGAY
            </button>
        </form>
    </div>
</section>
      </main>

      <Footer />
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/movie/:id" element={<MovieDetail />} />
    </Routes>
  );
}

export default App;


