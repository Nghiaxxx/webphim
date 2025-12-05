import { useState, useEffect } from 'react';
import DataTable from '../../components/admin/DataTable';
import Loading from '../../components/common/Loading';
import Error from '../../components/common/Error';
import { adminAPI } from '../../services/api';
import { formatDateForDisplay, formatCurrency } from '../../utils/helpers';
import '../../styles/admin/AdminPage.css';

// Helper function to transform user data for display
const transformUserForDisplay = (user) => ({
  id: user.id,
  email: user.email || 'Chưa có',
  fullName: user.full_name || 'Chưa có',
  phone: user.phone || 'Chưa có',
  role: user.role || 'user',
  status: user.status || 'active',
  loyaltyPoints: user.loyalty_points || 0,
  createdAt: user.created_at ? formatDateForDisplay(user.created_at) : 'Chưa có',
  lastLogin: user.last_login ? formatDateForDisplay(user.last_login) : 'Chưa đăng nhập'
});

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    role: 'user',
    status: 'active',
    loyalty_points: 0
  });

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminAPI.users.getAll();
      const transformed = data.map(transformUserForDisplay);
      setUsers(transformed);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const getRoleLabel = (role) => {
    const roleMap = {
      'admin': 'Quản trị viên',
      'user': 'Người dùng',
      'staff': 'Nhân viên'
    };
    return roleMap[role] || role;
  };

  const columns = [
    { key: 'id', label: 'ID', width: '60px' },
    { 
      key: 'email', 
      label: 'Email',
      render: (value) => <strong>{value}</strong>
    },
    { key: 'fullName', label: 'Họ tên', width: '150px' },
    { key: 'phone', label: 'Số điện thoại', width: '120px' },
    { 
      key: 'role', 
      label: 'Vai trò',
      width: '120px',
      render: (value) => (
        <span className={`role-badge role-${value}`}>
          {getRoleLabel(value)}
        </span>
      )
    },
    { 
      key: 'status', 
      label: 'Trạng thái',
      width: '120px',
      render: (value) => (
        <span className={`status-badge status-${value}`}>
          {value === 'active' ? 'Hoạt động' : 'Đã khóa'}
        </span>
      )
    },
    { 
      key: 'loyaltyPoints', 
      label: 'Điểm tích lũy',
      width: '120px',
      render: (value) => <strong>{value.toLocaleString('vi-VN')}</strong>
    },
    { key: 'createdAt', label: 'Ngày tạo', width: '120px' },
    { key: 'lastLogin', label: 'Đăng nhập lần cuối', width: '150px' },
  ];

  const handleEdit = async (user) => {
    try {
      setError(null);
      const userData = await adminAPI.users.getById(user.id);
      setFormData({
        full_name: userData.full_name || '',
        phone: userData.phone || '',
        role: userData.role || 'user',
        status: userData.status || 'active',
        loyalty_points: userData.loyalty_points || 0
      });
      setEditingUser(user);
      setShowFormModal(true);
    } catch (err) {
      console.error('Error fetching user:', err);
      setError(err.message || 'Không thể tải thông tin người dùng');
    }
  };

  const handleDelete = async (user) => {
    if (window.confirm(`Bạn có chắc muốn xóa người dùng "${user.email}"?`)) {
      try {
        setError(null);
        await adminAPI.users.delete(user.id);
        setUsers(users.filter(u => u.id !== user.id));
      } catch (err) {
        console.error('Error deleting user:', err);
        setError(err.message || 'Không thể xóa người dùng. Vui lòng thử lại.');
      }
    }
  };

  const handleView = async (user) => {
    try {
      setLoadingDetails(true);
      setError(null);
      const userData = await adminAPI.users.getById(user.id);
      setViewingUser(userData);
      setShowViewModal(true);
    } catch (err) {
      console.error('Error fetching user details:', err);
      setError(err.message || 'Không thể tải thông tin chi tiết người dùng');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      const dataToSave = {
        full_name: formData.full_name.trim() || null,
        phone: formData.phone.trim() || null,
        role: formData.role,
        status: formData.status,
        loyalty_points: parseInt(formData.loyalty_points) || 0
      };

      await adminAPI.users.update(editingUser.id, dataToSave);
      
      setShowFormModal(false);
      await fetchUsers(); // Reload users
    } catch (err) {
      console.error('Error saving user:', err);
      setError(err.message || 'Có lỗi xảy ra khi lưu thông tin người dùng');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="page-content">
          <Loading message="Đang tải danh sách người dùng..." />
        </div>
      </div>
    );
  }

  if (error && users.length === 0) {
    return (
      <div className="admin-page">
        <div className="page-content">
          <Error message={error} onRetry={fetchUsers} />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>Quản lý người dùng</h1>
          <p className="page-subtitle">Quản lý tất cả người dùng trong hệ thống</p>
        </div>
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
          title="Danh sách người dùng"
          columns={columns}
          data={users}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          searchable={true}
        />
      </div>

      {/* User Edit Form Modal */}
      {showFormModal && editingUser && (
        <div className="modal-overlay" onClick={() => !saving && setShowFormModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>Sửa thông tin người dùng</h2>
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
                <label>Email</label>
                <input
                  type="email"
                  value={editingUser.email}
                  className="form-input"
                  disabled
                  style={{ background: '#f5f5f5' }}
                />
                <small style={{ color: '#666', fontSize: '12px' }}>Email không thể thay đổi</small>
              </div>
              <div className="form-group">
                <label>Họ tên</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  className="form-input"
                  placeholder="VD: Nguyễn Văn A"
                  disabled={saving}
                />
              </div>
              <div className="form-group">
                <label>Số điện thoại</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="form-input"
                  placeholder="VD: 0901234567"
                  disabled={saving}
                />
              </div>
              <div className="form-group">
                <label>Vai trò</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="form-input"
                  disabled={saving}
                >
                  <option value="user">Người dùng</option>
                  <option value="staff">Nhân viên</option>
                  <option value="admin">Quản trị viên</option>
                </select>
              </div>
              <div className="form-group">
                <label>Trạng thái</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="form-input"
                  disabled={saving}
                >
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Đã khóa</option>
                </select>
              </div>
              <div className="form-group">
                <label>Điểm tích lũy</label>
                <input
                  type="number"
                  value={formData.loyalty_points}
                  onChange={(e) => setFormData({...formData, loyalty_points: e.target.value})}
                  className="form-input"
                  min="0"
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
                {saving ? 'Đang lưu...' : 'Cập nhật'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User View Details Modal */}
      {showViewModal && viewingUser && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px', maxHeight: '85vh', overflow: 'auto' }}>
            <div className="modal-header">
              <h2>Chi tiết người dùng</h2>
              <button className="modal-close" onClick={() => setShowViewModal(false)}>
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              {loadingDetails ? (
                <Loading message="Đang tải thông tin..." />
              ) : (
                <div>
                  <div style={{ marginBottom: '24px', padding: '16px', background: '#f9f9f9', borderRadius: '8px' }}>
                    <h3 style={{ marginBottom: '12px', fontSize: '18px' }}>Thông tin cơ bản</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <strong>Email:</strong> {viewingUser.email || 'Chưa có'}
                      </div>
                      <div>
                        <strong>Họ tên:</strong> {viewingUser.full_name || 'Chưa có'}
                      </div>
                      <div>
                        <strong>Số điện thoại:</strong> {viewingUser.phone || 'Chưa có'}
                      </div>
                      <div>
                        <strong>Vai trò:</strong> {getRoleLabel(viewingUser.role)}
                      </div>
                      <div>
                        <strong>Trạng thái:</strong> 
                        <span className={`status-badge status-${viewingUser.status}`} style={{ marginLeft: '8px' }}>
                          {viewingUser.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                        </span>
                      </div>
                      <div>
                        <strong>Điểm tích lũy:</strong> {viewingUser.loyalty_points?.toLocaleString('vi-VN') || 0}
                      </div>
                      <div>
                        <strong>Ngày tạo:</strong> {viewingUser.created_at ? formatDateForDisplay(viewingUser.created_at) : 'Chưa có'}
                      </div>
                      <div>
                        <strong>Đăng nhập lần cuối:</strong> {viewingUser.last_login ? formatDateForDisplay(viewingUser.last_login) : 'Chưa đăng nhập'}
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

export default AdminUsers;

