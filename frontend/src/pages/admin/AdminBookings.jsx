import { useState, useEffect } from 'react';
import DataTable from '../../components/admin/DataTable';
import Loading from '../../components/common/Loading';
import Error from '../../components/common/Error';
import { adminAPI } from '../../services/api';
import { formatCurrency } from '../../utils/helpers';
import '../../styles/admin/AdminPage.css';

// Helper function to transform booking data for display
const transformBookingForDisplay = (booking) => ({
  id: booking.id || `BK${String(booking.id).padStart(3, '0')}`,
  customer: booking.customer_name || 'Chưa có',
  email: booking.customer_email || 'Chưa có',
  phone: booking.customer_phone || 'Chưa có',
  movie: booking.movie_title || 'Chưa có',
  cinema: booking.cinema_name || 'Chưa có',
  showtime: booking.showtime_start ? new Date(booking.showtime_start).toLocaleString('vi-VN') : 'Chưa có',
  seats: booking.seats || 'Chưa có',
  total: booking.total_price ? formatCurrency(parseFloat(booking.total_price)) : '0',
  status: booking.status || 'pending',
  createdAt: booking.created_at ? new Date(booking.created_at).toLocaleDateString('vi-VN') : 'Chưa có'
});

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    cinema: 'all',
    date: ''
  });
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingBooking, setViewingBooking] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Fetch bookings from API
  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminAPI.bookings.getAll();
      const transformedBookings = data.map(transformBookingForDisplay);
      setBookings(transformedBookings);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err.message || 'Không thể tải danh sách đặt vé');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Filter bookings
  const filteredBookings = bookings.filter(booking => {
    if (filters.status !== 'all' && booking.status !== filters.status) return false;
    if (filters.cinema !== 'all' && !booking.cinema.toLowerCase().includes(filters.cinema.toLowerCase())) return false;
    if (filters.date && !booking.showtime.includes(filters.date)) return false;
    return true;
  });

  const columns = [
    { key: 'id', label: 'Mã đặt', width: '100px' },
    { 
      key: 'customer', 
      label: 'Khách hàng',
      render: (value, row) => (
        <div className="customer-cell">
          <strong>{value}</strong>
          <span className="customer-email">{row.email}</span>
        </div>
      )
    },
    { key: 'movie', label: 'Phim' },
    { key: 'cinema', label: 'Rạp', width: '120px' },
    { key: 'showtime', label: 'Suất chiếu', width: '140px' },
    { key: 'seats', label: 'Ghế', width: '100px' },
    { 
      key: 'total', 
      label: 'Tổng tiền',
      width: '120px',
      render: (value) => <strong>{value} ₫</strong>
    },
    { 
      key: 'status', 
      label: 'Trạng thái',
      width: '120px',
      render: (value) => (
        <span className={`status-badge status-${value}`}>
          {value === 'completed' ? <><i className="fa-solid fa-check"></i> Hoàn thành</> : 
           value === 'pending' ? <><i className="fa-solid fa-clock"></i> Đang xử lý</> : 
           <><i className="fa-solid fa-xmark"></i> Đã hủy</>}
        </span>
      )
    },
  ];

  const handleView = async (booking) => {
    try {
      setLoadingDetails(true);
      setError(null);
      // Extract booking ID from display format (BK001) or use direct ID
      const bookingId = booking.id.toString().startsWith('BK') 
        ? booking.id.toString().replace('BK', '') 
        : booking.id;
      const bookingData = await adminAPI.bookings.getById(bookingId);
      setViewingBooking(bookingData);
      setShowViewModal(true);
    } catch (err) {
      console.error('Error fetching booking details:', err);
      setError(err.message || 'Không thể tải thông tin chi tiết đặt vé');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleDelete = async (booking) => {
    if (window.confirm(`Bạn có chắc muốn hủy đặt vé "${booking.id}"?`)) {
      try {
        setError(null);
        await adminAPI.bookings.delete(booking.id);
        setBookings(bookings.filter(b => b.id !== booking.id));
      } catch (err) {
        console.error('Error deleting booking:', err);
        setError(err.message || 'Không thể hủy đặt vé. Vui lòng thử lại.');
      }
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>Quản lý đặt vé</h1>
          <p className="page-subtitle">Xem và quản lý tất cả các đặt vé</p>
        </div>
        <div className="header-actions">
          <button className="secondary-btn">
            <i className="fa-solid fa-chart-column"></i> Xuất báo cáo
          </button>
          <button className="secondary-btn">
            <i className="fa-solid fa-magnifying-glass"></i> Tra cứu vé
          </button>
        </div>
      </div>

      <div className="filter-bar">
        <select 
          className="filter-select"
          value={filters.status}
          onChange={(e) => setFilters({...filters, status: e.target.value})}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="completed">Hoàn thành</option>
          <option value="confirmed">Đã xác nhận</option>
          <option value="pending">Đang xử lý</option>
          <option value="cancelled">Đã hủy</option>
        </select>
        <select 
          className="filter-select"
          value={filters.cinema}
          onChange={(e) => setFilters({...filters, cinema: e.target.value})}
        >
          <option value="all">Tất cả rạp</option>
          {[...new Set(bookings.map(b => b.cinema))].filter(c => c && c !== 'Chưa có').map(cinema => (
            <option key={cinema} value={cinema}>{cinema}</option>
          ))}
        </select>
        <input 
          type="date" 
          className="filter-date" 
          value={filters.date}
          onChange={(e) => setFilters({...filters, date: e.target.value})}
        />
      </div>

      {loading ? (
        <div className="page-content">
          <Loading message="Đang tải danh sách đặt vé..." />
        </div>
      ) : error && bookings.length === 0 ? (
        <div className="page-content">
          <Error message={error} onRetry={fetchBookings} />
        </div>
      ) : (
        <div className="page-content">
          {error && (
            <div style={{ 
              padding: '12px', 
              marginBottom: '20px', 
              background: '#fee2e2', 
              color: '#dc2626', 
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>{error}</span>
              <button 
                onClick={() => setError(null)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: '#dc2626', 
                  cursor: 'pointer',
                  fontSize: '18px'
                }}
              >
                ×
              </button>
            </div>
          )}
          <DataTable
            title="Danh sách đặt vé"
            columns={columns}
            data={filteredBookings}
            onView={handleView}
            onDelete={handleDelete}
            searchable={true}
          />
        </div>
      )}

      {/* Booking Details Modal */}
      {showViewModal && viewingBooking && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', maxHeight: '85vh', overflow: 'auto' }}>
            <div className="modal-header">
              <h2>Chi tiết đặt vé - {viewingBooking.id || 'N/A'}</h2>
              <button className="modal-close" onClick={() => setShowViewModal(false)}>
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              {loadingDetails ? (
                <Loading message="Đang tải thông tin..." />
              ) : (
                <div>
                  {/* Customer Info */}
                  <div style={{ marginBottom: '24px', padding: '16px', background: '#f9f9f9', borderRadius: '8px' }}>
                    <h3 style={{ marginBottom: '12px', fontSize: '18px' }}>Thông tin khách hàng</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <strong>Tên:</strong> {viewingBooking.customer_name || 'Chưa có'}
                      </div>
                      <div>
                        <strong>Email:</strong> {viewingBooking.customer_email || 'Chưa có'}
                      </div>
                      <div>
                        <strong>Số điện thoại:</strong> {viewingBooking.customer_phone || 'Chưa có'}
                      </div>
                      <div>
                        <strong>Trạng thái:</strong> 
                        <span className={`status-badge status-${viewingBooking.status || 'pending'}`} style={{ marginLeft: '8px' }}>
                          {viewingBooking.status === 'completed' ? 'Hoàn thành' : 
                           viewingBooking.status === 'confirmed' ? 'Đã xác nhận' : 
                           viewingBooking.status === 'cancelled' ? 'Đã hủy' : 'Đang xử lý'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Showtime Info */}
                  <div style={{ marginBottom: '24px', padding: '16px', background: '#f9f9f9', borderRadius: '8px' }}>
                    <h3 style={{ marginBottom: '12px', fontSize: '18px' }}>Thông tin suất chiếu</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <strong>Phim:</strong> {viewingBooking.movie_title || 'Chưa có'}
                      </div>
                      <div>
                        <strong>Rạp:</strong> {viewingBooking.cinema_name || 'Chưa có'}
                      </div>
                      <div>
                        <strong>Thời gian bắt đầu:</strong> {viewingBooking.showtime_start ? new Date(viewingBooking.showtime_start).toLocaleString('vi-VN') : 'Chưa có'}
                      </div>
                      <div>
                        <strong>Thời gian kết thúc:</strong> {viewingBooking.showtime_end ? new Date(viewingBooking.showtime_end).toLocaleString('vi-VN') : 'Chưa có'}
                      </div>
                    </div>
                  </div>

                  {/* Seats */}
                  {viewingBooking.seats && (
                    <div style={{ marginBottom: '24px', padding: '16px', background: '#f9f9f9', borderRadius: '8px' }}>
                      <h3 style={{ marginBottom: '12px', fontSize: '18px' }}>Ghế đã đặt</h3>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {Array.isArray(viewingBooking.seats) ? (
                          viewingBooking.seats.map((seat, idx) => (
                            <span 
                              key={idx}
                              style={{ 
                                padding: '6px 12px', 
                                background: '#e3f2fd', 
                                borderRadius: '4px',
                                fontSize: '14px',
                                fontWeight: '500'
                              }}
                            >
                              {seat.code || `${seat.row}${seat.col}`}
                            </span>
                          ))
                        ) : (
                          <span>{viewingBooking.seats}</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Products */}
                  {viewingBooking.products && viewingBooking.products.length > 0 && (
                    <div style={{ marginBottom: '24px', padding: '16px', background: '#f9f9f9', borderRadius: '8px' }}>
                      <h3 style={{ marginBottom: '12px', fontSize: '18px' }}>Sản phẩm đã mua</h3>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ background: '#f5f5f5' }}>
                            <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Tên</th>
                            <th style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Số lượng</th>
                            <th style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Giá</th>
                          </tr>
                        </thead>
                        <tbody>
                          {viewingBooking.products.map((product, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                              <td style={{ padding: '8px' }}>{product.name || 'N/A'}</td>
                              <td style={{ padding: '8px', textAlign: 'right' }}>{product.quantity || 1}</td>
                              <td style={{ padding: '8px', textAlign: 'right' }}>
                                {product.price ? `${parseInt(product.price).toLocaleString('vi-VN')} ₫` : '0 ₫'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Summary */}
                  <div style={{ marginBottom: '24px', padding: '16px', background: '#e8f5e9', borderRadius: '8px' }}>
                    <h3 style={{ marginBottom: '12px', fontSize: '18px' }}>Tổng kết</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <strong>Tổng tiền vé:</strong> {viewingBooking.ticket_price ? `${parseInt(viewingBooking.ticket_price).toLocaleString('vi-VN')} ₫` : '0 ₫'}
                      </div>
                      <div>
                        <strong>Tổng tiền sản phẩm:</strong> {viewingBooking.product_price ? `${parseInt(viewingBooking.product_price).toLocaleString('vi-VN')} ₫` : '0 ₫'}
                      </div>
                      {viewingBooking.discount_amount && (
                        <div>
                          <strong>Giảm giá:</strong> -{parseInt(viewingBooking.discount_amount).toLocaleString('vi-VN')} ₫
                        </div>
                      )}
                      <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2e7d32' }}>
                        <strong>Tổng cộng:</strong> {viewingBooking.total_price ? `${parseInt(viewingBooking.total_price).toLocaleString('vi-VN')} ₫` : '0 ₫'}
                      </div>
                    </div>
                  </div>

                  {/* Booking Info */}
                  <div style={{ padding: '16px', background: '#f9f9f9', borderRadius: '8px' }}>
                    <h3 style={{ marginBottom: '12px', fontSize: '18px' }}>Thông tin đơn hàng</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px' }}>
                      <div>
                        <strong>Mã đặt vé:</strong> {viewingBooking.id || 'N/A'}
                      </div>
                      <div>
                        <strong>Ngày tạo:</strong> {viewingBooking.created_at ? new Date(viewingBooking.created_at).toLocaleString('vi-VN') : 'Chưa có'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="secondary-btn" onClick={() => setShowViewModal(false)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;

