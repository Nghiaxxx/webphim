import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Loading from '../../components/common/Loading';
import Error from '../../components/common/Error';
import { adminAPI } from '../../services/api';
import RoomLayoutEditor from '../../components/admin/RoomLayoutEditor';
import '../../styles/admin/AdminPage.css';

const AdminRoomForm = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // id sẽ là 'new' hoặc số ID phòng
  const [searchParams] = useSearchParams();
  const isEditing = id && id !== 'new';

  const [loading, setLoading] = useState(isEditing);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [cinemas, setCinemas] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    cinema_id: '',
    screen_type: '',
    layout_config: {
      rowLetters: [],
      seatsPerRow: {},
      middleSeats: {},
      rowsWithMiddleSeats: [],
      rowOffsets: {}
    }
  });
  const [useVisualEditor, setUseVisualEditor] = useState(true);

  useEffect(() => {
    fetchCinemas();
    if (isEditing) {
      fetchRoom();
    } else {
      // Nếu là tạo mới, kiểm tra query parameter cinema_id
      const cinemaId = searchParams.get('cinema_id');
      if (cinemaId) {
        setFormData(prev => ({
          ...prev,
          cinema_id: cinemaId
        }));
      }
    }
  }, [id, searchParams]);

  const fetchCinemas = async () => {
    try {
      const data = await adminAPI.cinemas.getAll();
      setCinemas(data);
    } catch (err) {
      console.error('Error fetching cinemas:', err);
    }
  };

  const fetchRoom = async () => {
    try {
      setLoading(true);
      setError(null);
      const roomData = await adminAPI.rooms.getById(id);
      let layoutConfig = roomData.layout_config;
      
      // Nếu layout_config là string, parse nó
      if (typeof layoutConfig === 'string') {
        try {
          layoutConfig = JSON.parse(layoutConfig);
        } catch (e) {
          console.error('Error parsing layout_config:', e);
          layoutConfig = {
            rowLetters: [],
            seatsPerRow: {},
            middleSeats: {},
            rowsWithMiddleSeats: [],
            rowOffsets: {}
          };
        }
      }
      
      // Đảm bảo có đầy đủ các field
      if (!layoutConfig || !layoutConfig.rowLetters || !layoutConfig.seatsPerRow) {
        layoutConfig = {
          rowLetters: [],
          seatsPerRow: {},
          middleSeats: layoutConfig?.middleSeats || {},
          rowsWithMiddleSeats: layoutConfig?.rowsWithMiddleSeats || [],
          rowOffsets: layoutConfig?.rowOffsets || {}
        };
      }
      
      // Debug log
      console.log('[AdminRoomForm] Loaded layout_config:', layoutConfig);
      console.log('[AdminRoomForm] rowOffsets:', layoutConfig.rowOffsets);
      
      setFormData({
        name: roomData.name || '',
        cinema_id: roomData.cinema_id || '',
        screen_type: roomData.screen_type || '',
        layout_config: layoutConfig
      });
      setUseVisualEditor(true);
    } catch (err) {
      console.error('Error fetching room:', err);
      setError(err.message || 'Không thể tải thông tin phòng');
    } finally {
      setLoading(false);
    }
  };

  // Handle layout change from visual editor
  const handleLayoutChange = useCallback((newLayout) => {
    setFormData(prev => ({
      ...prev,
      layout_config: newLayout
    }));
  }, []);

  const handleSave = async () => {
    // Validation
    if (!formData.name || !formData.cinema_id) {
      setError('Vui lòng điền tên phòng và chọn rạp');
      return;
    }

    // Validate layout_config
    let layoutConfig = formData.layout_config;
    
    // Nếu là string, parse nó
    if (typeof layoutConfig === 'string') {
      try {
        layoutConfig = JSON.parse(layoutConfig);
      } catch (err) {
        setError('Layout config không hợp lệ. Vui lòng kiểm tra định dạng JSON');
        return;
      }
    }
    
    // Validate structure
    if (!layoutConfig || !layoutConfig.rowLetters || !layoutConfig.seatsPerRow) {
      setError('Layout config phải có rowLetters và seatsPerRow');
      return;
    }

    // Validate rowLetters và seatsPerRow match
    const rowLetters = layoutConfig.rowLetters || [];
    const seatsPerRow = layoutConfig.seatsPerRow || {};
    for (const row of rowLetters) {
      if (!seatsPerRow[row] || seatsPerRow[row] < 1) {
        setError(`Hàng ${row} phải có ít nhất 1 ghế`);
        return;
      }
    }

    try {
      setSaving(true);
      setError(null);
      
      // Debug log
      console.log('[AdminRoomForm] Saving layout_config:', layoutConfig);
      console.log('[AdminRoomForm] rowOffsets:', layoutConfig.rowOffsets);
      
      const dataToSave = {
        name: formData.name.trim(),
        cinema_id: parseInt(formData.cinema_id),
        screen_type: formData.screen_type.trim() || null,
        layout_config: layoutConfig
      };

      if (isEditing) {
        await adminAPI.rooms.update(id, dataToSave);
      } else {
        await adminAPI.rooms.create(dataToSave);
      }
      
      // Navigate back to rooms list
      navigate('/admin/rooms');
    } catch (err) {
      console.error('Error saving room:', err);
      setError(err.message || 'Có lỗi xảy ra khi lưu phòng');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="page-content">
          <Loading message="Đang tải thông tin phòng..." />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>{isEditing ? 'Sửa phòng chiếu' : 'Thêm phòng chiếu mới'}</h1>
          <p className="page-subtitle">
            {isEditing ? 'Chỉnh sửa thông tin và layout phòng chiếu' : 'Tạo phòng chiếu mới với layout tùy chỉnh'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button 
            className="secondary-btn"
            onClick={() => navigate('/admin/rooms')}
            disabled={saving}
          >
            <i className="fa-solid fa-arrow-left"></i> Quay lại
          </button>
          <button 
            className="primary-btn"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Đang lưu...' : isEditing ? 'Cập nhật' : 'Thêm mới'}
          </button>
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

        <div className="form-container">
          <div className="form-group">
            <label>Tên phòng *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="form-input"
              placeholder="VD: Phòng 1, Phòng VIP"
              required
              disabled={saving}
            />
          </div>
          <div className="form-group">
            <label>Rạp phim *</label>
            <select
              value={formData.cinema_id}
              onChange={(e) => setFormData({...formData, cinema_id: e.target.value})}
              className="form-input"
              required
              disabled={saving}
            >
              <option value="">-- Chọn rạp --</option>
              {cinemas.map(cinema => (
                <option key={cinema.id} value={cinema.id}>
                  {cinema.name} - {cinema.city}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Loại màn hình</label>
            <select
              value={formData.screen_type}
              onChange={(e) => setFormData({...formData, screen_type: e.target.value})}
              className="form-input"
              disabled={saving}
            >
              <option value="">-- Chọn loại --</option>
              <option value="2D">2D</option>
              <option value="3D">3D</option>
              <option value="IMAX">IMAX</option>
              <option value="4DX">4DX</option>
              <option value="ScreenX">ScreenX</option>
            </select>
          </div>
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label>Layout Phòng Chiếu *</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className={useVisualEditor ? 'primary-btn' : 'secondary-btn'}
                  onClick={() => setUseVisualEditor(true)}
                  disabled={saving}
                >
                  <i className="fa-solid fa-palette"></i> Visual Editor
                </button>
                <button
                  type="button"
                  className={!useVisualEditor ? 'primary-btn' : 'secondary-btn'}
                  onClick={() => setUseVisualEditor(false)}
                  disabled={saving}
                >
                  <i className="fa-solid fa-code"></i> JSON Editor
                </button>
              </div>
            </div>
            
            {useVisualEditor ? (
              <div>
                <RoomLayoutEditor
                  initialLayout={formData.layout_config}
                  onLayoutChange={handleLayoutChange}
                />
                <div style={{ marginTop: '12px', padding: '12px', background: '#f0f9ff', borderRadius: '6px', fontSize: '12px', color: '#0369a1' }}>
                  <strong>💡 Hướng dẫn:</strong>
                  <ul style={{ margin: '8px 0 0 20px', padding: 0 }}>
                    <li><strong>Thêm:</strong> Click vào ô trống để thêm ghế</li>
                    <li><strong>Xóa:</strong> Click vào ghế để xóa</li>
                    <li><strong>Di chuyển:</strong> Kéo thả ghế để di chuyển vị trí</li>
                    <li><strong>VIP:</strong> Click vào ghế để đánh dấu/bỏ đánh dấu VIP</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div>
                <textarea
                  value={typeof formData.layout_config === 'string' 
                    ? formData.layout_config 
                    : JSON.stringify(formData.layout_config, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      setFormData({...formData, layout_config: parsed});
                    } catch {
                      // Nếu không parse được, lưu dạng string tạm thời
                      setFormData({...formData, layout_config: e.target.value});
                    }
                  }}
                  className="form-textarea"
                  rows="15"
                  style={{ fontFamily: 'monospace', fontSize: '12px' }}
                  placeholder='{"rowLetters": ["A", "B", "C"], "seatsPerRow": {"A": 12, "B": 12, "C": 12}}'
                  required
                  disabled={saving}
                />
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                  <strong>Format:</strong> JSON object với <code>rowLetters</code> (array) và <code>seatsPerRow</code> (object).
                  <br />
                  <strong>Ví dụ:</strong> {`{"rowLetters": ["A", "B", "C"], "seatsPerRow": {"A": 12, "B": 12, "C": 15}}`}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRoomForm;

