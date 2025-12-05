import { useState, useEffect } from 'react';
import DataTable from '../../components/admin/DataTable';
import Loading from '../../components/common/Loading';
import Error from '../../components/common/Error';
import { adminAPI } from '../../services/api';
import { formatDateForDisplay, formatDateForInput } from '../../utils/helpers';
import '../../styles/admin/AdminPage.css';

// Helper function to transform promotion data for display
const transformPromotionForDisplay = (promotion) => ({
  id: promotion.id,
  title: promotion.title || 'Chưa có',
  description: promotion.description ? (promotion.description.length > 50 ? promotion.description.substring(0, 50) + '...' : promotion.description) : 'Chưa có mô tả',
  imageUrl: promotion.image_url || '',
  slug: promotion.slug || `promo-${promotion.id}`,
  startDate: promotion.start_date ? formatDateForDisplay(promotion.start_date) : 'Chưa có',
  endDate: promotion.end_date ? formatDateForDisplay(promotion.end_date) : 'Chưa có',
  isActive: promotion.is_active !== undefined ? promotion.is_active : true,
  conditions: promotion.conditions || null
});

const AdminPromotions = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    image_url: '',
    start_date: '',
    end_date: '',
    is_active: true,
    conditions: ''
  });

  // Fetch promotions from API
  const fetchPromotions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminAPI.promotions.getAll();
      const transformed = data.map(transformPromotionForDisplay);
      setPromotions(transformed);
    } catch (err) {
      console.error('Error fetching promotions:', err);
      setError(err.message || 'Không thể tải danh sách khuyến mãi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const columns = [
    { key: 'id', label: 'ID', width: '60px' },
    { 
      key: 'title', 
      label: 'Tiêu đề',
      render: (value, row) => (
        <div className="promotion-cell">
          {row.imageUrl && (
            <img src={row.imageUrl} alt={value} className="promotion-thumb" />
          )}
          <strong>{value}</strong>
        </div>
      )
    },
    { 
      key: 'description', 
      label: 'Mô tả',
      render: (value) => <span title={value}>{value}</span>
    },
    { key: 'startDate', label: 'Ngày bắt đầu', width: '120px' },
    { key: 'endDate', label: 'Ngày kết thúc', width: '120px' },
    { 
      key: 'isActive', 
      label: 'Trạng thái',
      width: '120px',
      render: (value) => (
        <span className={`status-badge ${value ? 'status-active' : 'status-inactive'}`}>
          {value ? 'Đang hoạt động' : 'Đã tắt'}
        </span>
      )
    },
  ];

  const handleEdit = async (promotion) => {
    try {
      setError(null);
      // Get full promotion data by slug or id
      const promotionData = await adminAPI.promotions.getBySlug(promotion.slug);
      setFormData({
        title: promotionData.title || '',
        slug: promotionData.slug || '',
        description: promotionData.description || '',
        image_url: promotionData.image_url || '',
        start_date: promotionData.start_date ? formatDateForInput(promotionData.start_date) : '',
        end_date: promotionData.end_date ? formatDateForInput(promotionData.end_date) : '',
        is_active: promotionData.is_active !== undefined ? promotionData.is_active : true,
        conditions: promotionData.conditions ? JSON.stringify(promotionData.conditions, null, 2) : ''
      });
      setEditingPromotion(promotion);
      setShowFormModal(true);
    } catch (err) {
      console.error('Error fetching promotion:', err);
      setError(err.message || 'Không thể tải thông tin khuyến mãi');
    }
  };

  const handleDelete = async (promotion) => {
    if (window.confirm(`Bạn có chắc muốn xóa khuyến mãi "${promotion.title}"?`)) {
      try {
        setError(null);
        await adminAPI.promotions.delete(promotion.id);
        setPromotions(promotions.filter(p => p.id !== promotion.id));
      } catch (err) {
        console.error('Error deleting promotion:', err);
        setError(err.message || 'Không thể xóa khuyến mãi. Vui lòng thử lại.');
      }
    }
  };

  const handleView = (promotion) => {
    console.log('View promotion:', promotion);
    // TODO: Implement view logic
  };

  const handleAdd = () => {
    setFormData({
      title: '',
      slug: '',
      description: '',
      image_url: '',
      start_date: '',
      end_date: '',
      is_active: true,
      conditions: ''
    });
    setEditingPromotion(null);
    setShowFormModal(true);
  };

  const handleSave = async () => {
    // Validation
    if (!formData.title || !formData.start_date || !formData.end_date) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc (tiêu đề, ngày bắt đầu, ngày kết thúc)');
      return;
    }

    // Validate dates
    const startDate = new Date(formData.start_date);
    const endDate = new Date(formData.end_date);
    if (endDate < startDate) {
      setError('Ngày kết thúc phải sau ngày bắt đầu');
      return;
    }

    // Parse conditions if provided
    let conditionsJson = null;
    if (formData.conditions.trim()) {
      try {
        conditionsJson = JSON.parse(formData.conditions);
      } catch (err) {
        setError('Conditions không hợp lệ. Vui lòng kiểm tra định dạng JSON');
        return;
      }
    }

    try {
      setSaving(true);
      setError(null);
      
      const dataToSave = {
        title: formData.title.trim(),
        slug: formData.slug.trim() || null, // Auto-generate if empty
        description: formData.description.trim() || null,
        image_url: formData.image_url.trim() || null,
        start_date: formData.start_date,
        end_date: formData.end_date,
        is_active: formData.is_active,
        conditions: conditionsJson
      };

      if (editingPromotion) {
        await adminAPI.promotions.update(editingPromotion.id, dataToSave);
      } else {
        await adminAPI.promotions.create(dataToSave);
      }
      
      setShowFormModal(false);
      await fetchPromotions(); // Reload promotions
    } catch (err) {
      console.error('Error saving promotion:', err);
      setError(err.message || 'Có lỗi xảy ra khi lưu khuyến mãi');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="page-content">
          <Loading message="Đang tải danh sách khuyến mãi..." />
        </div>
      </div>
    );
  }

  if (error && promotions.length === 0) {
    return (
      <div className="admin-page">
        <div className="page-content">
          <Error message={error} onRetry={fetchPromotions} />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>Quản lý khuyến mãi</h1>
          <p className="page-subtitle">Quản lý các chương trình khuyến mãi trong hệ thống</p>
        </div>
        <button className="primary-btn" onClick={handleAdd}>
          <i className="fa-solid fa-plus"></i> Thêm khuyến mãi mới
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
          title="Danh sách khuyến mãi"
          columns={columns}
          data={promotions}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          searchable={true}
        />
      </div>

      {/* Promotion Form Modal */}
      {showFormModal && (
        <div className="modal-overlay" onClick={() => !saving && setShowFormModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px', maxHeight: '90vh', overflow: 'auto' }}>
            <div className="modal-header">
              <h2>{editingPromotion ? 'Sửa khuyến mãi' : 'Thêm khuyến mãi mới'}</h2>
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
                <label>Tiêu đề *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="form-input"
                  placeholder="VD: Khuyến mãi mùa hè 2024"
                  required
                  disabled={saving}
                />
              </div>
              <div className="form-group">
                <label>Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({...formData, slug: e.target.value})}
                  className="form-input"
                  placeholder="Tự động tạo từ tiêu đề nếu để trống"
                  disabled={saving}
                />
                <small style={{ color: '#666', fontSize: '12px' }}>URL-friendly identifier (tự động tạo nếu để trống)</small>
              </div>
              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="form-textarea"
                  rows="4"
                  placeholder="Mô tả chi tiết về chương trình khuyến mãi"
                  disabled={saving}
                />
              </div>
              <div className="form-group">
                <label>URL hình ảnh</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                  className="form-input"
                  placeholder="https://example.com/promotion.jpg"
                  disabled={saving}
                />
                {formData.image_url && (
                  <div style={{ marginTop: '8px' }}>
                    <img 
                      src={formData.image_url} 
                      alt="Preview" 
                      style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover', borderRadius: '4px' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                )}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Ngày bắt đầu *</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    className="form-input"
                    required
                    disabled={saving}
                  />
                </div>
                <div className="form-group">
                  <label>Ngày kết thúc *</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                    className="form-input"
                    required
                    disabled={saving}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Điều kiện (JSON - tùy chọn)</label>
                <textarea
                  value={formData.conditions}
                  onChange={(e) => setFormData({...formData, conditions: e.target.value})}
                  className="form-textarea"
                  rows="5"
                  style={{ fontFamily: 'monospace', fontSize: '12px' }}
                  placeholder='{"min_amount": 100000, "max_uses": 100}'
                  disabled={saving}
                />
                <small style={{ color: '#666', fontSize: '12px' }}>JSON object chứa các điều kiện khuyến mãi (tùy chọn)</small>
              </div>
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    disabled={saving}
                  />
                  <span>Đang hoạt động</span>
                </label>
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
                {saving ? 'Đang lưu...' : editingPromotion ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPromotions;

