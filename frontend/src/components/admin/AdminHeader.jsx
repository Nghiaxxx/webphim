import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../styles/admin/AdminHeader.css';

const AdminHeader = () => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const userName = 'Jennie';

  const notifications = [
    { id: 1, message: 'New booking confirmed', time: '5 min ago', unread: true },
    { id: 2, message: 'Movie "Alita" is trending', time: '1 hour ago', unread: true },
    { id: 3, message: 'System update completed', time: '2 hours ago', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to appropriate admin page with search query
      const currentPath = location.pathname;
      if (currentPath.includes('/admin')) {
        // If already on an admin page, add search query to URL
        const searchParams = new URLSearchParams(location.search);
        searchParams.set('search', searchQuery.trim());
        navigate(`${currentPath}?${searchParams.toString()}`);
      } else {
        // Default to movies page
        navigate(`/admin/movies?search=${encodeURIComponent(searchQuery.trim())}`);
      }
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <header className="cinema-header">
      {/* Left - Greeting */}
      <div className="header-greeting">
        <h1>Hello {userName}! <span className="emoji"><i className="fa-regular fa-face-smile"></i></span></h1>
      </div>

      {/* Center - Search */}
      <div className="header-search" ref={searchRef}>
        <form onSubmit={handleSearch} style={{ width: '100%' }}>
          <div className="search-wrapper">
            <button type="submit" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <span className="search-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </span>
            </button>
            <input
              type="text"
              placeholder="Type to search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              className="search-input"
            />
          </div>
        </form>
      </div>

      {/* Right - Actions & Profile */}
      <div className="header-actions">
        {/* Notification Button */}
        <div className="action-item" ref={notifRef}>
          <button 
            className="action-btn"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
          </button>

          {showNotifications && (
            <div className="dropdown-menu notification-menu">
              <div className="dropdown-header">
                <h4>Notifications</h4>
                <button className="mark-read-btn">Mark all read</button>
              </div>
              <div className="notification-list">
                {notifications.map(notif => (
                  <div key={notif.id} className={`notification-item ${notif.unread ? 'unread' : ''}`}>
                    <div className="notif-dot"></div>
                    <div className="notif-content">
                      <p>{notif.message}</p>
                      <span className="notif-time">{notif.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="dropdown-footer">
                <button className="view-all-btn">View all notifications</button>
              </div>
            </div>
          )}
        </div>

        {/* Message Button */}
        <button className="action-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <span className="badge">3</span>
        </button>

        {/* Profile */}
        <div className="header-profile" ref={profileRef}>
          <button 
            className="profile-btn"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <img 
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80" 
              alt="Profile" 
              className="profile-avatar"
            />
            <div className="profile-info">
              <span className="profile-name">Abe Rigal</span>
              <span className="profile-role">Watcher</span>
            </div>
          </button>

          {showProfileMenu && (
            <div className="dropdown-menu profile-menu">
              <div className="menu-item" onClick={() => navigate('/admin/profile')}>
                <span className="item-icon"><i className="fa-solid fa-user"></i></span>
                <span>Profile</span>
              </div>
              <div className="menu-item" onClick={() => navigate('/admin/settings')}>
                <span className="item-icon"><i className="fa-solid fa-gear"></i></span>
                <span>Settings</span>
              </div>
              <div className="menu-divider"></div>
              <div className="menu-item" onClick={() => navigate('/')}>
                <span className="item-icon"><i className="fa-solid fa-house"></i></span>
                <span>Home</span>
              </div>
              <div className="menu-item logout" onClick={handleLogout}>
                <span className="item-icon"><i className="fa-solid fa-right-from-bracket"></i></span>
                <span>Logout</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
