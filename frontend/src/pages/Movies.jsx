import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import QuickBooking from '../components/QuickBooking';
import MovieSlideshow from '../components/MovieSlideshow';
import { useMovies } from '../hooks/useMovies';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../utils/translations';

function Movies() {
  const { nowShowingMovies, comingSoonMovies, loading } = useMovies();
  const { language } = useLanguage();
  const t = (key) => getTranslation(key, language);

  return (
    <div className="app-root">
      <Header />

      <main className="movies-main">
        {/* Đặt vé nhanh - Section chính */}
        <section className="movies-quick-section">
          <QuickBooking movies={nowShowingMovies} />
        </section>

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
      </main>

      <Footer />
    </div>
  );
}

export default Movies;

