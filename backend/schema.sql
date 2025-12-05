-- Tạo database
CREATE DATABASE IF NOT EXISTS webphim CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE webphim;

-- Bảng phim
CREATE TABLE IF NOT EXISTS movies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  poster_url VARCHAR(500),
  duration INT,
  rating VARCHAR(50),
  genre VARCHAR(255),
  description TEXT,
  status VARCHAR(20) DEFAULT 'now_showing' COMMENT 'now_showing = đang chiếu, coming_soon = sắp chiếu',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng suất chiếu
CREATE TABLE IF NOT EXISTS showtimes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  movie_id INT NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME,
  room_id INT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  status ENUM('active', 'inactive', 'cancelled') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL,
  INDEX idx_movie_id (movie_id),
  INDEX idx_room_id (room_id),
  INDEX idx_status (status),
  INDEX idx_start_time (start_time)
);

-- Bảng đặt vé
CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  showtime_id INT NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  seat_row INT NOT NULL,
  seat_col INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_seat (showtime_id, seat_row, seat_col),
  FOREIGN KEY (showtime_id) REFERENCES showtimes(id) ON DELETE CASCADE
);

-- Bảng rạp phim
CREATE TABLE IF NOT EXISTS cinemas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  phone_number VARCHAR(20),
  city VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bảng phòng chiếu
CREATE TABLE IF NOT EXISTS rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cinema_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  screen_type VARCHAR(50) COMMENT '2D, 3D, IMAX, etc.',
  layout_config JSON COMMENT 'Cấu hình layout ghế (rowLetters, seatsPerRow, middleSeats, etc.)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (cinema_id) REFERENCES cinemas(id) ON DELETE CASCADE,
  INDEX idx_cinema_id (cinema_id)
);

-- Bảng sản phẩm (Bắp/Nước/Combo)
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  details TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url VARCHAR(500),
  type ENUM('popcorn', 'drink', 'combo', 'other') NOT NULL,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_type (type),
  INDEX idx_is_active (is_active),
  INDEX idx_is_featured (is_featured)
);

-- ============================================
-- PHẦN USER VÀ AUTHENTICATION
-- ============================================

-- Bảng users
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  date_of_birth DATE,
  gender ENUM('male', 'female', 'other') DEFAULT NULL,
  avatar_url VARCHAR(500),
  address TEXT,
  loyalty_points INT DEFAULT 0 COMMENT 'Điểm tích lũy',
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  status ENUM('active', 'inactive', 'banned') DEFAULT 'active',
  role ENUM('customer', 'admin', 'staff') DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL,
  INDEX idx_email (email),
  INDEX idx_phone (phone)
);

-- Bảng user_sessions (JWT tokens)
CREATE TABLE IF NOT EXISTS user_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(500) NOT NULL,
  refresh_token VARCHAR(500),
  device_info VARCHAR(255),
  ip_address VARCHAR(45),
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_token (token(255))
);

-- ============================================
-- CẬP NHẬT BẢNG BOOKINGS - Thêm user và payment
-- ============================================

-- Tắt foreign key checks tạm thời để có thể xóa và tạo lại bảng
SET FOREIGN_KEY_CHECKS = 0;

-- Xóa các bảng có foreign key đến bookings trước (nếu có)
-- Lưu ý: Các bảng này sẽ được tạo lại tự động với CREATE TABLE IF NOT EXISTS ở dưới
DROP TABLE IF EXISTS booking_vouchers;
DROP TABLE IF EXISTS loyalty_transactions;
DROP TABLE IF EXISTS user_vouchers;

-- Xóa bảng bookings cũ và tạo lại với đầy đủ cột
DROP TABLE IF EXISTS bookings;

CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL COMMENT 'User đặt vé (NULL nếu đặt không đăng nhập)',
  showtime_id INT NOT NULL,
  booking_code VARCHAR(50) UNIQUE COMMENT 'Mã đặt vé (VD: BK20250101001)',
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  seat_row INT NOT NULL,
  seat_col INT NOT NULL,
  original_price DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT 'Tổng tiền gốc',
  discount_amount DECIMAL(10,2) DEFAULT 0 COMMENT 'Số tiền được giảm',
  total_price DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT 'Tổng tiền sau giảm giá',
  payment_method ENUM('cash', 'card', 'momo', 'zalopay', 'bank_transfer') DEFAULT 'cash',
  payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
  status ENUM('confirmed', 'cancelled', 'completed', 'expired') DEFAULT 'confirmed',
  cancelled_at TIMESTAMP NULL,
  qr_code VARCHAR(500) COMMENT 'QR code để check-in',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_seat (showtime_id, seat_row, seat_col),
  FOREIGN KEY (showtime_id) REFERENCES showtimes(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_booking_code (booking_code)
);

-- ============================================
-- PHẦN KHUYẾN MÃI VÀ VOUCHER
-- ============================================

-- Bảng vouchers (Mã giảm giá)
CREATE TABLE IF NOT EXISTS vouchers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE COMMENT 'Mã voucher (VD: SUMMER2025)',
  name VARCHAR(255) NOT NULL COMMENT 'Tên voucher',
  description TEXT,
  discount_type ENUM('fixed', 'percentage') NOT NULL COMMENT 'fixed = giảm cố định, percentage = giảm %',
  discount_value DECIMAL(10,2) NOT NULL COMMENT 'Giá trị giảm (số tiền hoặc %)',
  max_discount DECIMAL(10,2) NULL COMMENT 'Giảm tối đa (nếu là %)',
  min_order_amount DECIMAL(10,2) DEFAULT 0 COMMENT 'Đơn tối thiểu để áp dụng',
  max_usage_per_user INT DEFAULT 1 COMMENT 'Số lần mỗi user được dùng',
  total_quantity INT NULL COMMENT 'Tổng số voucher (NULL = không giới hạn)',
  used_count INT DEFAULT 0 COMMENT 'Số lần đã dùng',
  movie_ids TEXT NULL COMMENT 'Danh sách ID phim (JSON array, NULL = tất cả)',
  cinema_ids TEXT NULL COMMENT 'Danh sách ID rạp (JSON array, NULL = tất cả)',
  start_date DATETIME NOT NULL COMMENT 'Ngày bắt đầu',
  end_date DATETIME NOT NULL COMMENT 'Ngày kết thúc',
  status ENUM('active', 'inactive', 'expired') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_code (code),
  INDEX idx_status (status),
  INDEX idx_dates (start_date, end_date)
);

-- Bảng promotions (Khuyến mãi tự động)
CREATE TABLE IF NOT EXISTS promotions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  promotion_type ENUM('discount_percentage', 'discount_fixed', 'buy_x_get_y', 'combo') NOT NULL,
  discount_value DECIMAL(10,2) NULL COMMENT 'Giá trị giảm (nếu có)',
  max_discount DECIMAL(10,2) NULL,
  min_order_amount DECIMAL(10,2) DEFAULT 0,
  conditions JSON COMMENT 'Điều kiện: {min_tickets: 2, time_range: "before_18:00", day_of_week: [2,3]}',
  movie_ids TEXT NULL,
  cinema_ids TEXT NULL,
  start_date DATETIME NOT NULL,
  end_date DATETIME NOT NULL,
  status ENUM('active', 'inactive', 'expired') DEFAULT 'active',
  auto_apply BOOLEAN DEFAULT TRUE COMMENT 'Tự động áp dụng nếu đủ điều kiện',
  priority INT DEFAULT 0 COMMENT 'Độ ưu tiên (số càng cao càng ưu tiên)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_dates (start_date, end_date),
  INDEX idx_auto_apply (auto_apply)
);

-- Bảng booking_vouchers (Voucher đã dùng trong đơn)
CREATE TABLE IF NOT EXISTS booking_vouchers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  voucher_id INT NULL COMMENT 'Nếu dùng voucher',
  promotion_id INT NULL COMMENT 'Nếu dùng promotion tự động',
  user_voucher_id INT NULL COMMENT 'Link đến user_vouchers nếu dùng voucher',
  discount_amount DECIMAL(10,2) NOT NULL COMMENT 'Số tiền được giảm',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (voucher_id) REFERENCES vouchers(id) ON DELETE SET NULL,
  FOREIGN KEY (promotion_id) REFERENCES promotions(id) ON DELETE SET NULL,
  FOREIGN KEY (user_voucher_id) REFERENCES user_vouchers(id) ON DELETE SET NULL,
  INDEX idx_booking_id (booking_id)
);

-- Tạo lại các bảng đã xóa (nếu đã bị xóa ở trên)
-- Các bảng này đã có CREATE TABLE IF NOT EXISTS ở trên, nhưng cần tạo lại sau khi bookings được tạo
CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  booking_id INT NULL COMMENT 'Nếu tích điểm từ đặt vé',
  points INT NOT NULL COMMENT 'Số điểm (âm nếu đã dùng)',
  type ENUM('earned', 'used', 'expired', 'admin_adjust') DEFAULT 'earned',
  description VARCHAR(255),
  expires_at TIMESTAMP NULL COMMENT 'Điểm hết hạn sau bao lâu',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id)
);

CREATE TABLE IF NOT EXISTS user_vouchers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  voucher_id INT NOT NULL,
  status ENUM('available', 'used', 'expired') DEFAULT 'available',
  used_at TIMESTAMP NULL COMMENT 'Thời điểm sử dụng',
  booking_id INT NULL COMMENT 'Đơn hàng đã dùng voucher này',
  expires_at TIMESTAMP NULL COMMENT 'Hết hạn (có thể khác với voucher.end_date)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (voucher_id) REFERENCES vouchers(id) ON DELETE CASCADE,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_voucher_id (voucher_id),
  INDEX idx_status (status)
);

-- Bật lại foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

