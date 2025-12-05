# Các tính năng còn thiếu trong Backend

## 📋 Tổng quan
Tài liệu này liệt kê các tính năng, API endpoints và database tables còn thiếu trong backend so với yêu cầu của frontend.

---

## 🗄️ Database Tables còn thiếu

### 1. Bảng `rooms` (Phòng chiếu)
**Trạng thái:** Model và Service đã có, nhưng schema chưa có bảng

**Cần thêm vào schema.sql:**
```sql
CREATE TABLE IF NOT EXISTS rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cinema_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  screen_type VARCHAR(50) COMMENT '2D, 3D, IMAX, etc.',
  layout_config JSON COMMENT 'Cấu hình layout ghế (rowLetters, seatsPerRow, etc.)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (cinema_id) REFERENCES cinemas(id) ON DELETE CASCADE,
  INDEX idx_cinema_id (cinema_id)
);
```

**Cần cập nhật bảng `showtimes`:**
- Thêm cột `room_id` INT (thay cho `room` VARCHAR hiện tại)
- Thêm cột `end_time` DATETIME
- Thêm cột `status` ENUM('active', 'inactive', 'cancelled') DEFAULT 'active'
- Thêm FOREIGN KEY `room_id` REFERENCES `rooms(id)`
- **Lưu ý:** Model `Showtime.js` đã sử dụng `room_id`, `end_time`, `status` nhưng schema chưa có → Cần migration

### 2. Bảng `products` (Sản phẩm - Bắp/Nước)
**Trạng thái:** Model và Service đã có, nhưng schema chưa có bảng

**Cần thêm vào schema.sql:**
```sql
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
  INDEX idx_is_active (is_active)
);
```

### 3. Cập nhật bảng `cinemas`
**Cần thêm cột:**
- `city` VARCHAR(100) - Thành phố
- `created_at` TIMESTAMP
- `updated_at` TIMESTAMP

---

## 🔌 API Endpoints còn thiếu

### 1. User Bookings History
**Frontend cần:** `PurchaseHistory.jsx` cần lấy lịch sử đặt vé của user

**Thiếu:**
- `GET /api/users/bookings` - Lấy danh sách đặt vé của user hiện tại
- `GET /api/bookings/:id` - Chi tiết đặt vé (cho user xem vé của mình)

**Cần thêm vào:**
- `backend/src/routes/userRoutes.js` - Thêm route `GET /users/bookings`
- `backend/src/controllers/UserController.js` - Thêm method `getUserBookings`
- `backend/src/services/UserService.js` - Thêm logic lấy bookings

### 2. Admin - Rooms CRUD
**Frontend cần:** `AdminRooms.jsx` gọi create/update/delete nhưng routes chưa có

**Thiếu:**
- `POST /api/rooms` - Tạo phòng mới
- `PUT /api/rooms/:id` - Cập nhật phòng
- `DELETE /api/rooms/:id` - Xóa phòng

**Cần thêm vào:**
- `backend/src/routes/roomRoutes.js` - Thêm routes với `authenticate` middleware
- `backend/src/controllers/RoomController.js` - Thêm methods: `createRoom`, `updateRoom`, `deleteRoom`
- `backend/src/services/RoomService.js` - Thêm logic CRUD
- `backend/src/models/Room.js` - Thêm methods: `create`, `update`, `delete`

### 3. Admin - Cinemas CRUD
**Frontend cần:** `AdminCinemas.jsx` gọi create/update/delete nhưng routes chưa có

**Thiếu:**
- `POST /api/cinemas` - Tạo rạp mới
- `PUT /api/cinemas/:id` - Cập nhật rạp
- `DELETE /api/cinemas/:id` - Xóa rạp

**Cần thêm vào:**
- `backend/src/routes/cinemaRoutes.js` - Thêm routes với `authenticate` middleware
- `backend/src/controllers/CinemaController.js` - Thêm methods: `createCinema`, `updateCinema`, `deleteCinema`
- `backend/src/services/CinemaService.js` - Thêm logic CRUD
- `backend/src/models/Cinema.js` - Thêm methods: `create`, `update`, `delete`

### 4. Admin - Products CRUD
**Frontend cần:** `AdminProducts.jsx` gọi create/update/delete nhưng routes chưa có

**Thiếu:**
- `POST /api/products` - Tạo sản phẩm mới
- `PUT /api/products/:id` - Cập nhật sản phẩm
- `DELETE /api/products/:id` - Xóa sản phẩm

**Cần thêm vào:**
- `backend/src/routes/productRoutes.js` - Thêm routes với `authenticate` middleware
- `backend/src/controllers/ProductController.js` - Thêm methods: `createProduct`, `updateProduct`, `deleteProduct`
- `backend/src/services/ProductService.js` - Thêm logic CRUD
- `backend/src/models/Product.js` - Thêm methods: `create`, `update`, `delete`

### 5. Admin - Bookings Management
**Frontend cần:** `AdminBookings.jsx` gọi getAll/update/delete nhưng routes chưa có

**Thiếu:**
- `GET /api/bookings` - Lấy tất cả đặt vé (có filter, pagination)
- `GET /api/bookings/:id` - Chi tiết đặt vé
- `PUT /api/bookings/:id` - Cập nhật trạng thái đặt vé
- `DELETE /api/bookings/:id` - Xóa đặt vé

**Cần thêm vào:**
- `backend/src/routes/bookingRoutes.js` - Thêm routes với `authenticate` middleware
- `backend/src/controllers/BookingController.js` - Thêm methods: `getAllBookings`, `getBookingById`, `updateBooking`, `deleteBooking`
- `backend/src/services/BookingService.js` - Thêm logic CRUD
- `backend/src/models/Booking.js` - Thêm methods: `findAll`, `findById`, `update`, `delete`

### 6. Admin - Users Management
**Frontend cần:** `AdminUsers.jsx` gọi getAll/getById/update/delete nhưng routes chưa có

**Thiếu:**
- `GET /api/users` - Lấy tất cả users (admin only)
- `GET /api/users/:id` - Chi tiết user (admin only)
- `PUT /api/users/:id` - Cập nhật user (admin only)
- `DELETE /api/users/:id` - Xóa user (admin only)

**Cần thêm vào:**
- `backend/src/routes/userRoutes.js` - Thêm routes với `authenticate` và `isAdmin` middleware
- `backend/src/controllers/UserController.js` - Thêm methods: `getAllUsers`, `getUserById`, `updateUser`, `deleteUser`
- `backend/src/services/UserService.js` - Thêm logic CRUD
- `backend/src/models/User.js` - Thêm methods: `findAll`, `findById`, `update`, `delete`
- `backend/src/middleware/auth.js` - Thêm `isAdmin` middleware để check role

### 7. Vouchers System (Hoàn toàn chưa có)
**Trạng thái:** Schema đã có bảng `vouchers`, `user_vouchers`, `booking_vouchers` nhưng chưa có routes/controllers/services

**Thiếu toàn bộ:**
- Routes: `backend/src/routes/voucherRoutes.js`
- Controller: `backend/src/controllers/VoucherController.js`
- Service: `backend/src/services/VoucherService.js`
- Model: `backend/src/models/Voucher.js`

**Endpoints cần có:**
- `GET /api/vouchers` - Danh sách vouchers (public hoặc admin)
- `GET /api/vouchers/:code` - Chi tiết voucher theo code
- `GET /api/users/vouchers` - Vouchers của user hiện tại
- `POST /api/vouchers/apply` - Áp dụng voucher vào booking
- `POST /api/vouchers` - Tạo voucher mới (admin)
- `PUT /api/vouchers/:id` - Cập nhật voucher (admin)
- `DELETE /api/vouchers/:id` - Xóa voucher (admin)

### 8. Revenue/Statistics Endpoint (Optional)
**Frontend:** `AdminRevenue.jsx` đang tính toán từ bookings, có thể tối ưu bằng endpoint riêng

**Có thể thêm:**
- `GET /api/admin/revenue` - Thống kê doanh thu (theo ngày/tuần/tháng)
- `GET /api/admin/stats` - Thống kê tổng quan (bookings, users, movies, etc.)

---

## 🔐 Middleware còn thiếu

### 1. `isAdmin` Middleware
**Cần tạo:** `backend/src/middleware/auth.js` - Thêm function `isAdmin` để check role

```javascript
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Không có quyền truy cập' });
  }
  next();
};
```

---

## 📝 Ghi chú

1. **Showtimes table:** Cần cập nhật schema để thêm `room_id`, `end_time`, `status` thay vì chỉ có `room` (VARCHAR)

2. **Cinemas table:** Cần thêm cột `city` và timestamps

3. **Tất cả Admin endpoints:** Cần thêm `authenticate` và `isAdmin` middleware

4. **Vouchers:** Hệ thống hoàn chỉnh nhưng chưa được implement, cần tạo từ đầu

5. **User bookings:** Cần filter theo `user_id` và join với showtimes/movies để hiển thị đầy đủ thông tin

---

## ✅ Ưu tiên thực hiện

1. **Cao:** Database tables (rooms, products) - Cần có để app chạy được
2. **Cao:** User bookings history - Tính năng core cho user
3. **Trung bình:** Admin CRUD cho Rooms, Cinemas, Products - Cần cho admin quản lý
4. **Trung bình:** Admin Bookings & Users management - Cần cho admin
5. **Thấp:** Vouchers system - Tính năng bonus
6. **Thấp:** Revenue endpoint - Có thể tính từ bookings

