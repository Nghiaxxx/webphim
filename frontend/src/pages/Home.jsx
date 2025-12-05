import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BannerCarousel from '../components/BannerCarousel';
import QuickBooking from '../components/QuickBooking';
import MovieSlideshow from '../components/MovieSlideshow';
import PromoSlideshow from '../components/PromoSlideshow';
import MemberProgram from '../components/MemberProgram';
import ServicesSection from '../components/ServicesSection';
import ContactSection from '../components/ContactSection';
import { useMovies } from '../hooks/useMovies';
import { usePromotions } from '../hooks/usePromotions';
import { bannerSlides, services } from '../constants/data';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../utils/translations';

function Home() {
  const { nowShowingMovies, comingSoonMovies, loading } = useMovies();
  const { promotionsData } = usePromotions();
  const { language } = useLanguage();
  const t = (key) => getTranslation(key, language);

  return (
    <div className="app-root">
      <Header />

      <main className="home-main">
        {/* Banner Carousel */}
        <BannerCarousel slides={bannerSlides} />

        {/* Đặt vé nhanh */}
        <QuickBooking movies={nowShowingMovies} />

        {/* Phim đang chiếu */}
        <section className="section-block">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
              {t('home.loading')}
            </div>
          ) : nowShowingMovies.length > 0 ? (
            <MovieSlideshow movies={nowShowingMovies} title={t('home.nowShowing')} />
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
              {t('home.noMoviesNowShowing')}
            </div>
          )}
        </section>

        {/* Phim sắp chiếu */}
        <section className="section-block">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
              {t('home.loading')}
            </div>
          ) : comingSoonMovies.length > 0 ? (
            <MovieSlideshow movies={comingSoonMovies} title={t('home.comingSoon')} />
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
              {t('home.noMoviesComingSoon')}
            </div>
          )}
        </section>

        {/* Khuyến mãi */}
        <section className="section-block">
          <PromoSlideshow promotions={promotionsData} title={t('home.promotions')} />
        </section>

        {/* Chương trình thành viên */}
        <MemberProgram />

        {/* Dịch vụ giải trí khác */}
        <ServicesSection services={services} />

        {/* Liên hệ */}
        <ContactSection />
      </main>

      <Footer />
    </div>
  );
}

export default Home;
