import { useState, useEffect } from 'react';
import Loading from '../../components/common/Loading';
import Error from '../../components/common/Error';
import { adminAPI } from '../../services/api';
import { formatCurrencyVND } from '../../utils/helpers';
import '../../styles/admin/AdminPage.css';
import '../../styles/admin/CinemaDashboard.css';

const AdminRevenue = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    weeklyRevenue: 0,
    dailyRevenue: 0,
    totalBookings: 0,
    totalTickets: 0,
    averageTicketPrice: 0
  });

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch bookings to calculate revenue
        const bookings = await adminAPI.bookings.getAll();

        // Calculate revenue statistics
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);

        const totalRevenue = bookings.reduce((sum, booking) => sum + (parseFloat(booking.total_price) || 0), 0);
        const monthlyRevenue = bookings
          .filter(b => new Date(b.created_at) >= monthAgo)
          .reduce((sum, booking) => sum + (parseFloat(booking.total_price) || 0), 0);
        const weeklyRevenue = bookings
          .filter(b => new Date(b.created_at) >= weekAgo)
          .reduce((sum, booking) => sum + (parseFloat(booking.total_price) || 0), 0);
        const dailyRevenue = bookings
          .filter(b => new Date(b.created_at) >= today)
          .reduce((sum, booking) => sum + (parseFloat(booking.total_price) || 0), 0);

        const totalTickets = bookings.reduce((sum, booking) => sum + (parseInt(booking.seat_count) || 0), 0);
        const averageTicketPrice = totalTickets > 0 ? totalRevenue / totalTickets : 0;

        setStats({
          totalRevenue,
          monthlyRevenue,
          weeklyRevenue,
          dailyRevenue,
          totalBookings: bookings.length,
          totalTickets,
          averageTicketPrice
        });
      } catch (err) {
        console.error('Error fetching revenue data:', err);
        setError(err.message || 'Không thể tải dữ liệu doanh thu');
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, []);

  // Chart data for monthly revenue
  const monthlyChartData = [
    { month: 'T1', value: 35000000 },
    { month: 'T2', value: 28000000 },
    { month: 'T3', value: 45000000 },
    { month: 'T4', value: 52000000 },
    { month: 'T5', value: 38000000 },
    { month: 'T6', value: 65000000 },
    { month: 'T7', value: 48000000 },
    { month: 'T8', value: 72000000 },
  ];

  if (loading) {
    return (
      <div className="admin-page">
        <div className="page-content">
          <Loading message="Đang tải dữ liệu doanh thu..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <div className="page-content">
          <Error message={error} onRetry={() => window.location.reload()} />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>Báo cáo doanh thu</h1>
          <p className="page-subtitle">Thống kê và phân tích doanh thu hệ thống</p>
        </div>
        <div className="header-actions">
          <button className="secondary-btn">
            <i className="fa-solid fa-file-export"></i> Xuất báo cáo
          </button>
          <select className="time-select">
            <option>Tháng này</option>
            <option>Tháng trước</option>
            <option>3 tháng gần nhất</option>
            <option>Năm này</option>
          </select>
        </div>
      </div>

      <div className="page-content">
        {/* Revenue Statistics Cards */}
        <div className="stats-dashboard-grid">
          <div className="dash-card performance-card">
            <div className="card-header-row">
              <h3><i className="fa-solid fa-chart-line"></i> Tổng doanh thu</h3>
            </div>
            <div className="performance-stats">
              <div className="perf-stat">
                <span className="perf-label"><span className="dot green"></span> Tổng doanh thu</span>
                <span className="perf-value">{formatCurrencyVND(stats.totalRevenue)}</span>
              </div>
              <div className="perf-stat">
                <span className="perf-label"><span className="dot blue"></span> Doanh thu tháng</span>
                <span className="perf-value">{formatCurrencyVND(stats.monthlyRevenue)}</span>
              </div>
            </div>
          </div>

          <div className="dash-card breakdown-card">
            <div className="breakdown-item">
              <span className="breakdown-label"><i className="fa-solid fa-calendar-week"></i> Doanh thu tuần</span>
              <span className="breakdown-value">{formatCurrencyVND(stats.weeklyRevenue)}</span>
            </div>
            <div className="breakdown-item">
              <span className="breakdown-label"><i className="fa-solid fa-calendar-day"></i> Doanh thu ngày</span>
              <span className="breakdown-value">{formatCurrencyVND(stats.dailyRevenue)}</span>
            </div>
          </div>
        </div>

        {/* Booking Statistics */}
        <div className="stats-dashboard-grid second-row">
          <div className="dash-card security-card">
            <div className="card-header-row">
              <h3><i className="fa-solid fa-ticket"></i> Thống kê đặt vé</h3>
            </div>
            <div className="security-content">
              <div className="security-info">
                <div className="stat-item">
                  <span className="stat-label">Tổng số đơn đặt vé</span>
                  <span className="stat-value">{stats.totalBookings.toLocaleString('vi-VN')}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Tổng số vé đã bán</span>
                  <span className="stat-value">{stats.totalTickets.toLocaleString('vi-VN')}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Giá vé trung bình</span>
                  <span className="stat-value">{formatCurrencyVND(stats.averageTicketPrice)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="dash-card investor-card">
            <div className="card-header-row">
              <h3><i className="fa-solid fa-chart-bar"></i> Doanh thu theo tháng</h3>
            </div>
            <div className="investor-content">
              <div className="line-chart-container">
                <div className="chart-area">
                  <svg viewBox="0 0 400 150" className="perf-chart-svg" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
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
                      fill="url(#revenueGradient)"
                    />
                  </svg>
                  <div className="chart-x-axis">
                    {monthlyChartData.map((d, i) => (
                      <span key={i}>{d.month}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRevenue;

