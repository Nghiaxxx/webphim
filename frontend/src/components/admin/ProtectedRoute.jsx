import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Loading from '../common/Loading';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <Loading message="Đang kiểm tra quyền truy cập..." />;
  }

  if (!isAuthenticated) {
    // Chưa đăng nhập, chuyển đến trang đăng nhập admin
    return <Navigate to="/admin/login" replace />;
  }

  if (requireAdmin && user?.role !== 'admin') {
    // Đã đăng nhập nhưng không phải admin, chuyển về trang chủ
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;

