import { useState, useEffect } from 'react';
import DataTable from '../../components/admin/DataTable';
import Loading from '../../components/common/Loading';
import Error from '../../components/common/Error';
import { adminAPI } from '../../services/api';
import { formatCurrency } from '../../utils/helpers';
import '../../styles/admin/AdminPage.css';

// Helper function to transform product data for display
const transformProductForDisplay = (product) => ({
  id: product.id,
  name: product.name || 'Chưa có',
  description: product.description ? (product.description.length > 50 ? product.description.substring(0, 50) + '...' : product.description) : 'Chưa có mô tả',
  price: product.price ? `${formatCurrency(product.price)} ₫` : '0 ₫',
  type: product.type || 'other',
  imageUrl: product.image_url || '',
  isFeatured: product.is_featured || false
});

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    details: '',
    price: '',
    type: 'popcorn',
    image_url: '',
    is_featured: false
  });

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminAPI.products.getAll();
      const transformed = data.map(transformProductForDisplay);
      setProducts(transformed);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message || 'Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const getTypeLabel = (type) => {
    const typeMap = {
      'popcorn': 'Bắp rang',
      'drink': 'Nước uống',
      'combo': 'Combo',
      'other': 'Khác'
    };
    return typeMap[type] || type;
  };

  const columns = [
    { key: 'id', label: 'ID', width: '60px' },
    { 
      key: 'name', 
      label: 'Tên sản phẩm',
      render: (value, row) => (
        <div className="product-cell">
          {row.imageUrl && (
            <img src={row.imageUrl} alt={value} className="product-thumb" />
          )}
          <div>
            <strong>{value}</strong>
            {row.isFeatured && (
              <span className="featured-badge">
                <i className="fa-solid fa-star"></i> Nổi bật
              </span>
            )}
          </div>
        </div>
      )
    },
    { 
      key: 'description', 
      label: 'Mô tả',
      render: (value) => <span title={value}>{value}</span>
    },
    { 
      key: 'type', 
      label: 'Loại',
      width: '120px',
      render: (value) => (
        <span className="type-badge">{getTypeLabel(value)}</span>
      )
    },
    { 
      key: 'price', 
      label: 'Giá',
      width: '120px',
      render: (value) => <strong>{value}</strong>
    },
  ];

  const handleEdit = async (product) => {
    try {
      setError(null);
      const productData = await adminAPI.products.getById(product.id);
      setFormData({
        name: productData.name || '',
        description: productData.description || '',
        details: productData.details || '',
        price: productData.price || '',
        type: productData.type || 'popcorn',
        image_url: productData.image_url || '',
        is_featured: productData.is_featured || false
      });
      setEditingProduct(product);
      setShowFormModal(true);
    } catch (err) {
      console.error('Error fetching product:', err);
      setError(err.message || 'Không thể tải thông tin sản phẩm');
    }
  };

  const handleDelete = async (product) => {
    if (window.confirm(`Bạn có chắc muốn xóa sản phẩm "${product.name}"?`)) {
      try {
        setError(null);
        await adminAPI.products.delete(product.id);
        setProducts(products.filter(p => p.id !== product.id));
      } catch (err) {
        console.error('Error deleting product:', err);
        setError(err.message || 'Không thể xóa sản phẩm. Vui lòng thử lại.');
      }
    }
  };

  const handleView = (product) => {
    console.log('View product:', product);
    // TODO: Implement view logic
  };

  const handleAdd = () => {
    setFormData({
      name: '',
      description: '',
      details: '',
      price: '',
      type: 'popcorn',
      image_url: '',
      is_featured: false
    });
    setEditingProduct(null);
    setShowFormModal(true);
  };

  const handleSave = async () => {
    // Validation
    if (!formData.name || !formData.price) {
      setError('Vui lòng điền tên sản phẩm và giá');
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      setError('Giá sản phẩm phải là số dương');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      const dataToSave = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        details: formData.details.trim() || null,
        price: price,
        type: formData.type,
        image_url: formData.image_url.trim() || null,
        is_featured: formData.is_featured
      };

      if (editingProduct) {
        await adminAPI.products.update(editingProduct.id, dataToSave);
      } else {
        await adminAPI.products.create(dataToSave);
      }
      
      setShowFormModal(false);
      await fetchProducts(); // Reload products
    } catch (err) {
      console.error('Error saving product:', err);
      setError(err.message || 'Có lỗi xảy ra khi lưu sản phẩm');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="page-content">
          <Loading message="Đang tải danh sách sản phẩm..." />
        </div>
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <div className="admin-page">
        <div className="page-content">
          <Error message={error} onRetry={fetchProducts} />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>Quản lý sản phẩm</h1>
          <p className="page-subtitle">Quản lý các sản phẩm (bắp, nước, combo) trong hệ thống</p>
        </div>
        <button className="primary-btn" onClick={handleAdd}>
          <i className="fa-solid fa-plus"></i> Thêm sản phẩm mới
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
          title="Danh sách sản phẩm"
          columns={columns}
          data={products}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          searchable={true}
        />
      </div>

      {/* Product Form Modal */}
      {showFormModal && (
        <div className="modal-overlay" onClick={() => !saving && setShowFormModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', maxHeight: '90vh', overflow: 'auto' }}>
            <div className="modal-header">
              <h2>{editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
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
                <label>Tên sản phẩm *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="form-input"
                  placeholder="VD: Bắp rang bơ lớn"
                  required
                  disabled={saving}
                />
              </div>
              <div className="form-group">
                <label>Loại sản phẩm *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="form-input"
                  required
                  disabled={saving}
                >
                  <option value="popcorn">Bắp rang</option>
                  <option value="drink">Nước uống</option>
                  <option value="combo">Combo</option>
                  <option value="other">Khác</option>
                </select>
              </div>
              <div className="form-group">
                <label>Giá (₫) *</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="form-input"
                  placeholder="VD: 50000"
                  min="0"
                  step="1000"
                  required
                  disabled={saving}
                />
              </div>
              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="form-textarea"
                  rows="3"
                  placeholder="Mô tả ngắn về sản phẩm"
                  disabled={saving}
                />
              </div>
              <div className="form-group">
                <label>Chi tiết</label>
                <textarea
                  value={formData.details}
                  onChange={(e) => setFormData({...formData, details: e.target.value})}
                  className="form-textarea"
                  rows="3"
                  placeholder="Thông tin chi tiết về sản phẩm"
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
                  placeholder="https://example.com/image.jpg"
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
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
                    disabled={saving}
                  />
                  <span>Sản phẩm nổi bật</span>
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
                {saving ? 'Đang lưu...' : editingProduct ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;

