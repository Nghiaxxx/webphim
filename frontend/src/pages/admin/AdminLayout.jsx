import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import '../../styles/admin/AdminLayout.css';

const AdminLayout = () => {
  useEffect(() => {
    // Thêm class vào body để ẩn background của client
    document.body.classList.add('admin-page-active');
    
    // Cleanup khi unmount
    return () => {
      document.body.classList.remove('admin-page-active');
    };
  }, []);

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        <AdminHeader />
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

