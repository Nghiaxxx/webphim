import { useState, useEffect, useRef } from 'react';
import '../../styles/admin/CinemaDashboard.css';

const AdminDashboard = () => {
  const [activeMovieIndex, setActiveMovieIndex] = useState(0);
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMovies: 0,
    nowShowing: 0,
    comingSoon: 0,
    totalBookings: 0,
    totalRevenue: 48907231,
    monthlyRevenue: 5213000
  });

  // Refs for scroll animations
  const statsRef = useRef(null);
  const chartsRef = useRef(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const [chartsVisible, setChartsVisible] = useState(false);

  // Animated counter values
  const [animatedStats, setAnimatedStats] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    securityScore: 0,
    totalYield1: 0,
    totalYield2: 0
  });

  // Fetch movies and stats from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        const allMoviesRes = await fetch('/api/movies');
        const allMovies = await allMoviesRes.json();
        
        const nowShowingRes = await fetch('/api/movies?status=now_showing');
        const nowShowingMovies = nowShowingRes.ok ? await nowShowingRes.json() : [];
        
        const comingSoonRes = await fetch('/api/movies?status=coming_soon');
        const comingSoonMovies = comingSoonRes.ok ? await comingSoonRes.json() : [];
        
        let totalBookings = 0;
        try {
          const bookingsRes = await fetch('/api/bookings');
          if (bookingsRes.ok) {
            const bookings = await bookingsRes.json();
            totalBookings = Array.isArray(bookings) ? bookings.length : 0;
          }
        } catch (e) {
          console.log('Bookings API not available');
        }
        
        setStats(prev => ({
          ...prev,
          totalMovies: allMovies.length,
          nowShowing: nowShowingMovies.length || Math.ceil(allMovies.length * 0.6),
          comingSoon: comingSoonMovies.length || Math.floor(allMovies.length * 0.4),
          totalBookings: totalBookings
        }));
        
        const featured = nowShowingMovies.length > 0 ? nowShowingMovies : allMovies;
        setFeaturedMovies(featured.slice(0, 5));
        
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setStatsVisible(true);
        }
      });
    }, observerOptions);

    const chartsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setChartsVisible(true);
        }
      });
    }, observerOptions);

    // Check if element is already visible on mount
    const checkInitialVisibility = () => {
      if (statsRef.current) {
        const rect = statsRef.current.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        if (isVisible) {
          setStatsVisible(true);
        } else {
          statsObserver.observe(statsRef.current);
        }
      }
      
      if (chartsRef.current) {
        const rect = chartsRef.current.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        if (isVisible) {
          setChartsVisible(true);
        } else {
          chartsObserver.observe(chartsRef.current);
        }
      }
    };

    // Delay to ensure DOM is ready
    setTimeout(checkInitialVisibility, 100);

    return () => {
      statsObserver.disconnect();
      chartsObserver.disconnect();
    };
  }, []);

  // Animate numbers when visible
  useEffect(() => {
    if (statsVisible) {
      animateValue('totalRevenue', 0, stats.totalRevenue, 2000);
      animateValue('monthlyRevenue', 0, stats.monthlyRevenue, 2000);
      animateValue('securityScore', 0, 96, 1500);
      animateValue('totalYield1', 0, 25, 1500);
      animateValue('totalYield2', 0, 25, 1500);
    }
  }, [statsVisible, stats.totalRevenue, stats.monthlyRevenue]);

  const animateValue = (key, start, end, duration) => {
    const startTime = performance.now();
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(start + (end - start) * easeOutQuart);
      
      setAnimatedStats(prev => ({ ...prev, [key]: current }));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  };

  // Helper functions
  const formatDuration = (minutes) => {
    if (!minutes) return '';
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs}hr ${mins}m` : `${mins}m`;
  };

  const getGenreTags = (genre) => {
    if (!genre) return [];
    return genre.split(',').map(g => g.trim()).slice(0, 3);
  };

  const getCardPosition = (index) => {
    const diff = index - activeMovieIndex;
    if (diff === 0) return 'center';
    if (diff === -1 || (activeMovieIndex === 0 && index === featuredMovies.length - 1)) return 'left';
    if (diff === 1 || (activeMovieIndex === featuredMovies.length - 1 && index === 0)) return 'right';
    return 'hidden';
  };

  const formatNumber = (num) => {
    return num.toLocaleString('vi-VN');
  };

  // Chart data
  const chartData = [
    { month: 'T1', value: 35 },
    { month: 'T2', value: 28 },
    { month: 'T3', value: 45 },
    { month: 'T4', value: 52 },
    { month: 'T5', value: 38 },
    { month: 'T6', value: 65 },
    { month: 'T7', value: 48 },
    { month: 'T8', value: 72 },
  ];

  // Transaction history data
  const transactions = [
    { pair: 'Avengers/VIP', price: '1.02', change24h: '+0.33%', change7d: '+1.22%', change30d: '+6.8%', positive: true },
    { pair: 'Spider/Normal', price: '0.9987', change24h: '-0.02%', change7d: '+0.01%', change30d: '+0.12%', positive: false },
    { pair: 'Batman/VIP', price: '1.001', change24h: '+0.05%', change7d: '+0.04%', change30d: '+0.21%', positive: true },
  ];

  // Investor composition data
  const investorData = [
    { label: 'Thành viên VIP', percent: 65, color: '#a855f7' },
    { label: 'Thành viên Gold', percent: 21, color: '#8b5cf6' },
    { label: 'Thành viên Bạc', percent: 14, color: '#7c3aed' },
  ];

  if (loading) {
    return (
      <div className="cinema-dashboard">
        <div className="loading-state" style={{ textAlign: 'center', padding: '100px 0', color: '#fff' }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', marginBottom: '16px' }}></i>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (featuredMovies.length === 0) {
    return (
      <div className="cinema-dashboard">
        <div className="empty-state" style={{ textAlign: 'center', padding: '100px 0', color: '#fff' }}>
          <p>Không có phim nào trong hệ thống</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cinema-dashboard">
      {/* Featured Movies Section */}
      <section className="featured-section">
        <div className="featured-cards">
          {featuredMovies.map((movie, index) => {
            const position = getCardPosition(index);
            if (position === 'hidden') return null;
            
            return (
              <div
                key={movie.id}
                className={`featured-card ${position} ${index === activeMovieIndex ? 'active' : ''}`}
                onClick={() => setActiveMovieIndex(index)}
                style={{
                  backgroundImage: `url(${movie.poster_url || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400'})`,
                }}
              >
                {index === activeMovieIndex && (
                  <div className="card-content">
                    <div className="movie-title-section">
                      <h2 className="movie-main-title">{movie.title}</h2>
                      {movie.subtitle && (
                        <span className="movie-subtitle">{movie.subtitle}</span>
                      )}
                    </div>
                    <div className="movie-tags">
                      {getGenreTags(movie.genre).map((tag, idx) => (
                        <span key={idx} className="tag">{tag}</span>
                      ))}
                    </div>
                    <p className="movie-description">{movie.description || 'Không có mô tả'}</p>
                    <div className="movie-footer">
                      <div className="movie-rating">
                        {movie.rating && (
                          <span className="rating-badge"><i className="fa-solid fa-star"></i> {movie.rating}</span>
                        )}
                      </div>
                      <button className="watch-btn">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                        {formatDuration(movie.duration)}
                      </button>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: '35%' }}></div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="featured-dots">
          {featuredMovies.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === activeMovieIndex ? 'active' : ''}`}
              onClick={() => setActiveMovieIndex(index)}
            />
          ))}
        </div>
      </section>

      {/* Statistics Dashboard Section */}
      <section className={`stats-dashboard ${statsVisible ? 'visible' : ''}`} ref={statsRef}>
        <div className="stats-dashboard-grid">
          {/* Performance Card */}
          <div className="dash-card performance-card">
            <div className="card-header-row">
              <h3><i className="fa-solid fa-chart-line"></i> Hiệu suất</h3>
              <div className="card-actions">
                <button className="export-btn">
                  <i className="fa-solid fa-file-export"></i> Xuất CSV
                </button>
                <select className="time-select">
                  <option>Tất cả</option>
                  <option>7 ngày</option>
                  <option>30 ngày</option>
                </select>
              </div>
            </div>
            <div className="performance-stats">
              <div className="perf-stat">
                <span className="perf-label"><span className="dot green"></span> Tổng doanh thu</span>
                <span className="perf-value">{formatNumber(animatedStats.totalRevenue)} <small>VNĐ</small></span>
              </div>
              <div className="perf-stat">
                <span className="perf-label"><span className="dot blue"></span> Doanh thu tháng</span>
                <span className="perf-value">{formatNumber(animatedStats.monthlyRevenue)} <small>VNĐ</small></span>
              </div>
            </div>
            {/* Animated Line Chart */}
            <div className="line-chart-container" ref={chartsRef}>
              <div className="chart-y-axis">
                <span>₫70M</span>
                <span>₫60M</span>
                <span>₫50M</span>
                <span>₫12M</span>
                <span>₫1M</span>
              </div>
              <div className="chart-area">
                <svg viewBox="0 0 400 150" className="perf-chart-svg" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="perfGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="rgba(168, 85, 247, 0.4)" />
                      <stop offset="100%" stopColor="rgba(168, 85, 247, 0)" />
                    </linearGradient>
                  </defs>
                  <path 
                    className="chart-line"
                    d="M0,120 C20,110 40,100 60,95 C80,90 100,85 120,75 C140,65 160,70 180,60 C200,50 220,55 240,45 C260,35 280,40 300,30 C320,25 340,35 360,25 C380,20 400,15 400,10" 
                    fill="none" 
                    stroke="#a855f7" 
                    strokeWidth="3"
                  />
                  <path 
                    className="chart-fill"
                    d="M0,120 C20,110 40,100 60,95 C80,90 100,85 120,75 C140,65 160,70 180,60 C200,50 220,55 240,45 C260,35 280,40 300,30 C320,25 340,35 360,25 C380,20 400,15 400,10 L400,150 L0,150 Z" 
                    fill="url(#perfGradient)"
                  />
                  {/* Animated dots */}
                  <circle className="chart-dot" cx="60" cy="95" r="4" fill="#a855f7" />
                  <circle className="chart-dot" cx="120" cy="75" r="4" fill="#a855f7" />
                  <circle className="chart-dot" cx="180" cy="60" r="4" fill="#a855f7" />
                  <circle className="chart-dot" cx="240" cy="45" r="4" fill="#a855f7" />
                  <circle className="chart-dot" cx="300" cy="30" r="4" fill="#a855f7" />
                  <circle className="chart-dot" cx="360" cy="25" r="4" fill="#a855f7" />
                </svg>
                <div className="chart-x-axis">
                  {chartData.map((d, i) => (
                    <span key={i}>{d.month}</span>
                  ))}
                </div>
              </div>
              <div className="chart-side-values">
                <span>₫800k</span>
                <span>₫700k</span>
                <span>₫500k</span>
                <span>₫200k</span>
                <span>₫50k</span>
                <span>₫10k</span>
              </div>
            </div>
          </div>

          {/* Breakdown Card */}
          <div className="dash-card breakdown-card">
            <div className="breakdown-item">
              <span className="breakdown-label"><i className="fa-solid fa-ticket"></i> Vé đã bán</span>
              <span className="breakdown-value">4,210,000 <small>VNĐ</small></span>
              <div className="circular-gauge">
                <svg viewBox="0 0 100 100">
                  <circle className="gauge-bg" cx="50" cy="50" r="40" />
                  <circle 
                    className="gauge-progress"
                    cx="50" cy="50" r="40" 
                    style={{ '--progress': 25 }}
                  />
                </svg>
                <div className="gauge-content">
                  <span className="gauge-percent">{animatedStats.totalYield1}%</span>
                  <span className="gauge-label">Tổng lợi nhuận</span>
                </div>
              </div>
            </div>
            <div className="breakdown-item">
              <span className="breakdown-label"><i className="fa-solid fa-popcorn"></i> Combo bán ra</span>
              <span className="breakdown-value">2,003,000 <small>VNĐ</small></span>
              <div className="circular-gauge">
                <svg viewBox="0 0 100 100">
                  <circle className="gauge-bg" cx="50" cy="50" r="40" />
                  <circle 
                    className="gauge-progress blue"
                    cx="50" cy="50" r="40" 
                    style={{ '--progress': 25 }}
                  />
                </svg>
                <div className="gauge-content">
                  <span className="gauge-percent">{animatedStats.totalYield2}%</span>
                  <span className="gauge-label">Tổng lợi nhuận</span>
                </div>
              </div>
            </div>
            <div className="ai-button">
              <i className="fa-solid fa-robot"></i>
              <span>Hỏi AI về chiến lược kinh doanh</span>
            </div>
          </div>
        </div>

        {/* Second Row */}
        <div className="stats-dashboard-grid second-row">
          {/* Security Status Card */}
          <div className="dash-card security-card">
            <div className="card-header-row">
              <h3><i className="fa-solid fa-shield-halved"></i> Trạng thái Bảo mật</h3>
              <button className="expand-btn"><i className="fa-solid fa-arrow-up-right-from-square"></i></button>
            </div>
            <div className="security-content">
              <div className="security-info">
                <span className="audit-label">Kiểm tra gần nhất</span>
                <span className="audit-name">Quantstamp - May 2025</span>
                <div className="verified-badge">
                  <i className="fa-solid fa-circle-check"></i>
                  <span>Hệ thống đã xác minh</span>
                </div>
              </div>
              <div className="security-radar">
                <div className="radar-circle">
                  <div className="radar-shield">
                    <i className="fa-solid fa-shield-halved"></i>
                  </div>
                  <div className="radar-labels">
                    <span className="label-top">Hợp đồng</span>
                    <span className="label-right">Bảo mật</span>
                    <span className="label-bottom">Phát hiện</span>
                    <span className="label-left">Giao thức</span>
                  </div>
                </div>
              </div>
              <div className="pen-test">
                <span className="pen-label">Điểm kiểm tra</span>
                <div className="pen-score">
                  <span className="score-value">{animatedStats.securityScore}</span>
                  <span className="score-total">/100</span>
                </div>
                <button className="download-btn">
                  <i className="fa-solid fa-download"></i> Tải báo cáo
                </button>
              </div>
            </div>
          </div>

          {/* Investor Composition Card */}
          <div className="dash-card investor-card">
            <div className="card-header-row">
              <h3><i className="fa-solid fa-users"></i> Thành phần khách hàng</h3>
            </div>
            <div className="investor-content">
              <div className="investor-list">
                {investorData.map((item, i) => (
                  <div key={i} className="investor-item">
                    <span className="investor-dot" style={{ background: item.color }}></span>
                    <span className="investor-label">{item.label}</span>
                    <span className="investor-percent">{item.percent}%</span>
                  </div>
                ))}
              </div>
              <div className="pie-chart">
                <svg viewBox="0 0 100 100">
                  <circle className="pie-segment seg-1" cx="50" cy="50" r="40" 
                    style={{ strokeDasharray: '163.36 251.2', strokeDashoffset: '0' }} />
                  <circle className="pie-segment seg-2" cx="50" cy="50" r="40" 
                    style={{ strokeDasharray: '52.75 251.2', strokeDashoffset: '-163.36' }} />
                  <circle className="pie-segment seg-3" cx="50" cy="50" r="40" 
                    style={{ strokeDasharray: '35.17 251.2', strokeDashoffset: '-216.11' }} />
                </svg>
              </div>
            </div>
          </div>

          {/* Invite Card */}
          <div className="dash-card invite-card">
            <div className="invite-avatars">
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60" alt="User" />
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60" alt="User" />
              <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60" alt="User" />
            </div>
            <p className="invite-text">Mời bạn bè và nhận</p>
            <span className="invite-reward">₫1.000.000</span>
          </div>
        </div>

        {/* Transaction History */}
        <div className="dash-card transaction-card">
          <div className="card-header-row">
            <h3><i className="fa-solid fa-clock-rotate-left"></i> Lịch sử giao dịch</h3>
            <select className="time-select">
              <option>Tất cả</option>
            </select>
          </div>
          <div className="transaction-table">
            <div className="table-header">
              <span>Loại vé</span>
              <span>Giá</span>
              <span>24h</span>
              <span>7 ngày</span>
              <span>30 ngày</span>
            </div>
            {transactions.map((tx, i) => (
              <div key={i} className="table-row">
                <span className="pair-name">{tx.pair}</span>
                <span className="price">{tx.price}</span>
                <span className={tx.change24h.startsWith('+') ? 'positive' : 'negative'}>{tx.change24h}</span>
                <span className={tx.change7d.startsWith('+') ? 'positive' : 'negative'}>{tx.change7d}</span>
                <span className={tx.change30d.startsWith('+') ? 'positive' : 'negative'}>{tx.change30d}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
