import { useState, useEffect } from 'react';
import DataTable from '../../components/admin/DataTable';
import Loading from '../../components/common/Loading';
import Error from '../../components/common/Error';
import { adminAPI } from '../../services/api';
import '../../styles/admin/AdminPage.css';

// Helper function to transform cinema data for display
const transformCinemaForDisplay = (cinema) => ({
  id: cinema.id,
  name: cinema.name || 'Chưa có',
  address: cinema.address || 'Chưa có',
  city: cinema.city || 'Chưa có',
  phoneNumber: cinema.phone_number || 'Chưa có'
});

const AdminCinemas = () => {
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCinema, setSelectedCinema] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingCinema, setEditingCinema] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    phone_number: ''
  });

  // Fetch cinemas from API
  const fetchCinemas = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminAPI.cinemas.getAll();
      const transformed = data.map(transformCinemaForDisplay);
      setCinemas(transformed);
    } catch (err) {
      console.error('Error fetching cinemas:', err);
      setError(err.message || 'Không thể tải danh sách rạp phim');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCinemas();
  }, []);

  const columns = [
    { key: 'id', label: 'ID', width: '60px' },
    { 
      key: 'name', 
      label: 'Tên rạp',
      render: (value) => <strong>{value}</strong>
    },
    { key: 'address', label: 'Địa chỉ' },
    { key: 'city', label: 'Thành phố', width: '150px' },
    { key: 'phoneNumber', label: 'Số điện thoại', width: '150px' },
  ];

  const handleEdit = async (cinema) => {
    try {
      setError(null);
      const cinemaData = await adminAPI.cinemas.getById(cinema.id);
      setFormData({
        name: cinemaData.name || '',
        address: cinemaData.address || '',
        city: cinemaData.city || '',
        phone_number: cinemaData.phone_number || ''
      });
      setEditingCinema(cinema);
      setShowFormModal(true);
    } catch (err) {
      console.error('Error fetching cinema:', err);
      setError(err.message || 'Không thể tải thông tin rạp phim');
    }
  };

  const handleDelete = async (cinema) => {
    if (window.confirm(`Bạn có chắc muốn xóa rạp phim "${cinema.name}"?`)) {
      try {
        setError(null);
        await adminAPI.cinemas.delete(cinema.id);
        setCinemas(cinemas.filter(c => c.id !== cinema.id));
      } catch (err) {
        console.error('Error deleting cinema:', err);
        setError(err.message || 'Không thể xóa rạp phim. Vui lòng thử lại.');
      }
    }
  };

  const handleView = async (cinema) => {
    try {
      setLoadingDetails(true);
      setError(null);
      const data = await adminAPI.cinemas.getWithDetails(cinema.id);
      setSelectedCinema(data);
      setShowDetailsModal(true);
    } catch (err) {
      console.error('Error fetching cinema details:', err);
      setError(err.message || 'Không thể tải thông tin chi tiết rạp phim');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleAdd = () => {
    setFormData({
      name: '',
      address: '',
      city: '',
      phone_number: ''
    });
    setEditingCinema(null);
    setShowFormModal(true);
  };

  const handleSave = async () => {
    // Validation
    if (!formData.name || !formData.address || !formData.city || !formData.phone_number) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      const dataToSave = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        phone_number: formData.phone_number.trim()
      };

      if (editingCinema) {
        await adminAPI.cinemas.update(editingCinema.id, dataToSave);
      } else {
        await adminAPI.cinemas.create(dataToSave);
      }
      
      setShowFormModal(false);
      await fetchCinemas(); // Reload cinemas
    } catch (err) {
      console.error('Error saving cinema:', err);
      setError(err.message || 'Có lỗi xảy ra khi lưu rạp phim');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="page-content">
          <Loading message="Đang tải danh sách rạp phim..." />
        </div>
      </div>
    );
  }

  if (error && cinemas.length === 0) {
    return (
      <div className="admin-page">
        <div className="page-content">
          <Error message={error} onRetry={fetchCinemas} />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>Quản lý rạp phim</h1>
          <p className="page-subtitle">Quản lý các rạp phim trong hệ thống</p>
        </div>
        <button className="primary-btn" onClick={handleAdd}>
          <i className="fa-solid fa-plus"></i> Thêm rạp phim mới
        </button>
      </div>

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
          title="Danh sách rạp phim"
          columns={columns}
          data={cinemas}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          searchable={true}
        />
      </div>

      {/* Cinema Form Modal */}
      {showFormModal && (
        <div className="modal-overlay" onClick={() => !saving && setShowFormModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>{editingCinema ? 'Sửa rạp phim' : 'Thêm rạp phim mới'}</h2>
              <button 
                className="modal-close" 
                onClick={() => !saving && setShowFormModal(false)}
                disabled={saving}
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Tên rạp *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="form-input"
                  placeholder="VD: CGV Vincom Center"
                  required
                  disabled={saving}
                />
              </div>
              <div className="form-group">
                <label>Địa chỉ *</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="form-input"
                  placeholder="VD: 72 Lê Thánh Tôn, Quận 1"
                  required
                  disabled={saving}
                />
              </div>
              <div className="form-group">
                <label>Thành phố *</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  className="form-input"
                  placeholder="VD: Hồ Chí Minh"
                  required
                  disabled={saving}
                />
              </div>
              <div className="form-group">
                <label>Số điện thoại *</label>
                <input
                  type="text"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                  className="form-input"
                  placeholder="VD: 028 3829 5454"
                  required
                  disabled={saving}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="secondary-btn" 
                onClick={() => setShowFormModal(false)}
                disabled={saving}
              >
                Hủy
              </button>
              <button 
                className="primary-btn" 
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Đang lưu...' : editingCinema ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cinema Details Modal */}
      {showDetailsModal && selectedCinema && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px', maxHeight: '85vh', overflow: 'auto' }}>
            <div className="modal-header">
              <h2>Chi tiết rạp - {selectedCinema.name}</h2>
              <button className="modal-close" onClick={() => setShowDetailsModal(false)}>
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              {loadingDetails ? (
                <Loading message="Đang tải thông tin..." />
              ) : (
                <div>
                  {/* Cinema Info */}
                  <div style={{ marginBottom: '24px', padding: '16px', background: '#f9f9f9', borderRadius: '8px' }}>
                    <h3 style={{ marginBottom: '12px', fontSize: '18px' }}>Thông tin rạp</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <strong>Địa chỉ:</strong> {selectedCinema.address || 'Chưa có'}
                      </div>
                      <div>
                        <strong>Thành phố:</strong> {selectedCinema.city || 'Chưa có'}
                      </div>
                      <div>
                        <strong>Số điện thoại:</strong> {selectedCinema.phone_number || 'Chưa có'}
                      </div>
                      <div>
                        <strong>Tổng số phòng:</strong> {selectedCinema.rooms?.length || 0}
                      </div>
                    </div>
                  </div>

                  {/* Rooms and Showtimes */}
                  {selectedCinema.rooms && selectedCinema.rooms.length > 0 ? (
                    <div>
                      <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>Phòng chiếu và suất chiếu</h3>
                      {selectedCinema.rooms.map((room) => (
                        <div key={room.id} style={{ marginBottom: '24px', padding: '16px', border: '1px solid #ddd', borderRadius: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
                              {room.name}
                              {room.screen_type && <span style={{ marginLeft: '8px', fontSize: '14px', color: '#666', fontWeight: 'normal' }}>({room.screen_type})</span>}
                            </h4>
                            <span style={{ fontSize: '14px', color: '#666' }}>
                              {room.showtimes?.length || 0} suất chiếu
                            </span>
                          </div>
                          
                          {room.showtimes && room.showtimes.length > 0 ? (
                            <div style={{ marginTop: '12px' }}>
                              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                <thead>
                                  <tr style={{ background: '#f5f5f5' }}>
                                    <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Phim</th>
                                    <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Bắt đầu</th>
                                    <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Kết thúc</th>
                                    <th style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Giá vé</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {room.showtimes.map((showtime) => (
                                    <tr key={showtime.id} style={{ borderBottom: '1px solid #eee' }}>
                                      <td style={{ padding: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                          {showtime.movie_poster && (
                                            <img 
                                              src={showtime.movie_poster} 
                                              alt={showtime.movie_title}
                                              style={{ width: '40px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                                            />
                                          )}
                                          <span>{showtime.movie_title}</span>
                                        </div>
                                      </td>
                                      <td style={{ padding: '8px' }}>
                                        {showtime.start_time ? new Date(showtime.start_time).toLocaleString('vi-VN') : 'Chưa có'}
                                      </td>
                                      <td style={{ padding: '8px' }}>
                                        {showtime.end_time ? new Date(showtime.end_time).toLocaleString('vi-VN') : 'Chưa có'}
                                      </td>
                                      <td style={{ padding: '8px', textAlign: 'right' }}>
                                        {showtime.price ? `${parseInt(showtime.price).toLocaleString('vi-VN')} ₫` : '0 ₫'}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div style={{ padding: '12px', textAlign: 'center', color: '#999', fontSize: '14px' }}>
                              Chưa có suất chiếu nào
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                      <i className="fa-solid fa-door-open" style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}></i>
                      <p>Rạp này chưa có phòng chiếu nào</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="secondary-btn" onClick={() => setShowDetailsModal(false)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCinemas;

