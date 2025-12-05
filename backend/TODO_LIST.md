# TODO List - Backend Implementation

## 📋 Tổng quan
Todo list này liệt kê tất cả các task cần làm để hoàn thiện backend. Các task được sắp xếp theo thứ tự ưu tiên và nhóm tính năng.

---

## 🗄️ PHẦN 1: Database Schema (Ưu tiên cao - Cần làm trước)

### 1.1. Tạo bảng `rooms`
- [ ] Tạo bảng rooms trong schema.sql với các cột:
  - `id` INT AUTO_INCREMENT PRIMARY KEY
  - `cinema_id` INT NOT NULL (FOREIGN KEY)
  - `name` VARCHAR(255) NOT NULL
  - `screen_type` VARCHAR(50) (2D, 3D, IMAX, etc.)
  - `layout_config` JSON
  - `created_at`, `updated_at` TIMESTAMP

### 1.2. Tạo bảng `products`
- [ ] Tạo bảng products trong schema.sql với các cột:
  - `id` INT AUTO_INCREMENT PRIMARY KEY
  - `name` VARCHAR(255) NOT NULL
  - `description` TEXT
  - `details` TEXT
  - `price` DECIMAL(10,2) NOT NULL
  - `image_url` VARCHAR(500)
  - `type` ENUM('popcorn', 'drink', 'combo', 'other')
  - `is_featured` BOOLEAN DEFAULT FALSE
  - `is_active` BOOLEAN DEFAULT TRUE
  - `created_at`, `updated_at` TIMESTAMP

### 1.3. Cập nhật bảng `showtimes`
- [ ] Thêm cột `room_id` INT (FOREIGN KEY đến rooms)
- [ ] Thêm cột `end_time` DATETIME
- [ ] Thêm cột `status` ENUM('active', 'inactive', 'cancelled') DEFAULT 'active'
- [ ] Xóa hoặc migrate cột `room` VARCHAR(50) cũ
- [ ] Thêm FOREIGN KEY constraint cho `room_id`

### 1.4. Cập nhật bảng `cinemas`
- [ ] Thêm cột `city` VARCHAR(100)
- [ ] Thêm cột `created_at` TIMESTAMP
- [ ] Thêm cột `updated_at` TIMESTAMP

---

## 🔐 PHẦN 2: Middleware (Ưu tiên cao)

### 2.1. isAdmin Middleware
- [ ] Thêm function `isAdmin` vào `backend/src/middleware/auth.js`
- [ ] Check `req.user.role === 'admin'`
- [ ] Return 403 nếu không phải admin

---

## 👤 PHẦN 3: User Bookings History (Ưu tiên cao)

### 3.1. Booking Model
- [ ] Thêm method `findAllByUserId(userId)` vào `Booking.js`
- [ ] Join với showtimes, movies, cinemas để lấy đầy đủ thông tin

### 3.2. Booking Service
- [ ] Thêm method `getUserBookings(userId)` vào `BookingService.js`
- [ ] Format data để frontend dễ sử dụng

### 3.3. Booking Controller
- [ ] Thêm method `getUserBookings` vào `BookingController.js`
- [ ] Lấy userId từ `req.user.userId`

### 3.4. User Routes
- [ ] Thêm route `GET /api/users/bookings` vào `userRoutes.js`
- [ ] Thêm middleware `authenticate`

---

## 🎬 PHẦN 4: Admin - Rooms CRUD (Ưu tiên trung bình)

### 4.1. Room Model
- [ ] Thêm method `create(roomData)` vào `Room.js`
- [ ] Thêm method `update(id, updateData)` vào `Room.js`
- [ ] Thêm method `delete(id)` vào `Room.js`

### 4.2. Room Service
- [ ] Thêm method `createRoom(roomData)` vào `RoomService.js`
- [ ] Thêm method `updateRoom(id, updateData)` vào `RoomService.js`
- [ ] Thêm method `deleteRoom(id)` vào `RoomService.js`
- [ ] Validate data (cinema_id tồn tại, layout_config hợp lệ)

### 4.3. Room Controller
- [ ] Thêm method `createRoom` vào `RoomController.js`
- [ ] Thêm method `updateRoom` vào `RoomController.js`
- [ ] Thêm method `deleteRoom` vào `RoomController.js`

### 4.4. Room Routes
- [ ] Thêm route `POST /api/rooms` vào `roomRoutes.js` (authenticate + isAdmin)
- [ ] Thêm route `PUT /api/rooms/:id` vào `roomRoutes.js` (authenticate + isAdmin)
- [ ] Thêm route `DELETE /api/rooms/:id` vào `roomRoutes.js` (authenticate + isAdmin)

---

## 🏢 PHẦN 5: Admin - Cinemas CRUD (Ưu tiên trung bình)

### 5.1. Cinema Model
- [ ] Thêm method `create(cinemaData)` vào `Cinema.js`
- [ ] Thêm method `update(id, updateData)` vào `Cinema.js`
- [ ] Thêm method `delete(id)` vào `Cinema.js`

### 5.2. Cinema Service
- [ ] Thêm method `createCinema(cinemaData)` vào `CinemaService.js`
- [ ] Thêm method `updateCinema(id, updateData)` vào `CinemaService.js`
- [ ] Thêm method `deleteCinema(id)` vào `CinemaService.js`
- [ ] Validate data (name không trùng, city hợp lệ)

### 5.3. Cinema Controller
- [ ] Thêm method `createCinema` vào `CinemaController.js`
- [ ] Thêm method `updateCinema` vào `CinemaController.js`
- [ ] Thêm method `deleteCinema` vào `CinemaController.js`

### 5.4. Cinema Routes
- [ ] Thêm route `POST /api/cinemas` vào `cinemaRoutes.js` (authenticate + isAdmin)
- [ ] Thêm route `PUT /api/cinemas/:id` vào `cinemaRoutes.js` (authenticate + isAdmin)
- [ ] Thêm route `DELETE /api/cinemas/:id` vào `cinemaRoutes.js` (authenticate + isAdmin)

---

## 🍿 PHẦN 6: Admin - Products CRUD (Ưu tiên trung bình)

### 6.1. Product Model
- [ ] Thêm method `create(productData)` vào `Product.js`
- [ ] Thêm method `update(id, updateData)` vào `Product.js`
- [ ] Thêm method `delete(id)` vào `Product.js` (soft delete: set is_active = FALSE)

### 6.2. Product Service
- [ ] Thêm method `createProduct(productData)` vào `ProductService.js`
- [ ] Thêm method `updateProduct(id, updateData)` vào `ProductService.js`
- [ ] Thêm method `deleteProduct(id)` vào `ProductService.js`
- [ ] Validate data (price > 0, type hợp lệ)

### 6.3. Product Controller
- [ ] Thêm method `createProduct` vào `ProductController.js`
- [ ] Thêm method `updateProduct` vào `ProductController.js`
- [ ] Thêm method `deleteProduct` vào `ProductController.js`

### 6.4. Product Routes
- [ ] Thêm route `POST /api/products` vào `productRoutes.js` (authenticate + isAdmin)
- [ ] Thêm route `PUT /api/products/:id` vào `productRoutes.js` (authenticate + isAdmin)
- [ ] Thêm route `DELETE /api/products/:id` vào `productRoutes.js` (authenticate + isAdmin)

---

## 🎫 PHẦN 7: Admin - Bookings Management (Ưu tiên trung bình)

### 7.1. Booking Model
- [ ] Thêm method `findAll(filters)` vào `Booking.js` (có thể filter theo status, date, cinema)
- [ ] Thêm method `findById(id)` vào `Booking.js` (join với showtimes, movies, users)
- [ ] Thêm method `update(id, updateData)` vào `Booking.js`
- [ ] Thêm method `delete(id)` vào `Booking.js`

### 7.2. Booking Service
- [ ] Thêm method `getAllBookings(filters)` vào `BookingService.js`
- [ ] Thêm method `getBookingById(id)` vào `BookingService.js`
- [ ] Thêm method `updateBooking(id, updateData)` vào `BookingService.js`
- [ ] Thêm method `deleteBooking(id)` vào `BookingService.js`

### 7.3. Booking Controller
- [ ] Thêm method `getAllBookings` vào `BookingController.js`
- [ ] Thêm method `getBookingById` vào `BookingController.js`
- [ ] Thêm method `updateBooking` vào `BookingController.js`
- [ ] Thêm method `deleteBooking` vào `BookingController.js`

### 7.4. Booking Routes
- [ ] Thêm route `GET /api/bookings` vào `bookingRoutes.js` (authenticate + isAdmin)
- [ ] Thêm route `GET /api/bookings/:id` vào `bookingRoutes.js` (authenticate + isAdmin)
- [ ] Thêm route `PUT /api/bookings/:id` vào `bookingRoutes.js` (authenticate + isAdmin)
- [ ] Thêm route `DELETE /api/bookings/:id` vào `bookingRoutes.js` (authenticate + isAdmin)

---

## 👥 PHẦN 8: Admin - Users Management (Ưu tiên trung bình)

### 8.1. User Model
- [ ] Thêm method `findAll(filters)` vào `User.js` (không trả về password_hash)
- [ ] Thêm method `findById(id)` vào `User.js` (không trả về password_hash)
- [ ] Thêm method `update(id, updateData)` vào `User.js`
- [ ] Thêm method `delete(id)` vào `User.js` (soft delete: set status = 'inactive')

### 8.2. User Service
- [ ] Thêm method `getAllUsers(filters)` vào `UserService.js`
- [ ] Thêm method `getUserById(id)` vào `UserService.js`
- [ ] Thêm method `updateUser(id, updateData)` vào `UserService.js`
- [ ] Thêm method `deleteUser(id)` vào `UserService.js`
- [ ] Validate: không cho phép xóa chính mình, không cho phép xóa admin khác

### 8.3. User Controller
- [ ] Thêm method `getAllUsers` vào `UserController.js`
- [ ] Thêm method `getUserById` vào `UserController.js`
- [ ] Thêm method `updateUser` vào `UserController.js`
- [ ] Thêm method `deleteUser` vào `UserController.js`

### 8.4. User Routes
- [ ] Thêm route `GET /api/users` vào `userRoutes.js` (authenticate + isAdmin)
- [ ] Thêm route `GET /api/users/:id` vào `userRoutes.js` (authenticate + isAdmin)
- [ ] Thêm route `PUT /api/users/:id` vào `userRoutes.js` (authenticate + isAdmin)
- [ ] Thêm route `DELETE /api/users/:id` vào `userRoutes.js` (authenticate + isAdmin)

---

## 🎟️ PHẦN 9: Vouchers System (Ưu tiên thấp - Tính năng bonus)

### 9.1. Voucher Model
- [ ] Tạo file `backend/src/models/Voucher.js`
- [ ] Thêm methods: `findAll()`, `findById(id)`, `findByCode(code)`
- [ ] Thêm methods: `create(voucherData)`, `update(id, updateData)`, `delete(id)`
- [ ] Validate: code unique, dates hợp lệ, discount values hợp lệ

### 9.2. User Voucher Model
- [ ] Tạo file `backend/src/models/UserVoucher.js`
- [ ] Thêm methods: `findByUserId(userId)`, `findByVoucherId(voucherId)`
- [ ] Thêm methods: `create(userVoucherData)`, `update(id, updateData)`
- [ ] Check expired vouchers

### 9.3. Voucher Service
- [ ] Tạo file `backend/src/services/VoucherService.js`
- [ ] Thêm method `getAllVouchers()` - Lấy tất cả vouchers active
- [ ] Thêm method `getVoucherByCode(code)` - Lấy voucher theo code
- [ ] Thêm method `getUserVouchers(userId)` - Lấy vouchers của user
- [ ] Thêm method `createVoucher(voucherData)` - Tạo voucher mới (admin)
- [ ] Thêm method `updateVoucher(id, updateData)` - Cập nhật voucher (admin)
- [ ] Thêm method `deleteVoucher(id)` - Xóa voucher (admin)
- [ ] Thêm method `applyVoucher(code, bookingData)` - Áp dụng voucher vào booking
- [ ] Validate: voucher còn hạn, đủ điều kiện, chưa hết số lượng

### 9.4. Voucher Controller
- [ ] Tạo file `backend/src/controllers/VoucherController.js`
- [ ] Thêm các methods tương ứng với VoucherService

### 9.5. Voucher Routes
- [ ] Tạo file `backend/src/routes/voucherRoutes.js`
- [ ] Thêm route `GET /api/vouchers` - Danh sách vouchers (public hoặc admin)
- [ ] Thêm route `GET /api/vouchers/:code` - Chi tiết voucher theo code
- [ ] Thêm route `GET /api/users/vouchers` - Vouchers của user (authenticate)
- [ ] Thêm route `POST /api/vouchers/apply` - Áp dụng voucher (authenticate)
- [ ] Thêm route `POST /api/vouchers` - Tạo voucher (authenticate + isAdmin)
- [ ] Thêm route `PUT /api/vouchers/:id` - Cập nhật voucher (authenticate + isAdmin)
- [ ] Thêm route `DELETE /api/vouchers/:id` - Xóa voucher (authenticate + isAdmin)

### 9.6. Register Voucher Routes
- [ ] Đăng ký voucherRoutes vào `backend/src/index.js`
- [ ] Thêm: `app.use('/api/vouchers', voucherRoutes)`

---

## 📊 PHẦN 10: Revenue/Statistics (Ưu tiên thấp - Optional)

### 10.1. Revenue Endpoint
- [ ] Tạo route `GET /api/admin/revenue` trong `adminRoutes.js` hoặc file riêng
- [ ] Tính toán: total, monthly, weekly, daily revenue
- [ ] Tính toán: total bookings, average ticket price
- [ ] Filter theo date range (optional)

---

## ✅ Checklist tổng hợp

### Database
- [ ] Bảng rooms
- [ ] Bảng products
- [ ] Cập nhật showtimes
- [ ] Cập nhật cinemas

### Middleware
- [ ] isAdmin middleware

### User Features
- [ ] User bookings history

### Admin CRUD
- [ ] Rooms CRUD
- [ ] Cinemas CRUD
- [ ] Products CRUD
- [ ] Bookings Management
- [ ] Users Management

### Bonus Features
- [ ] Vouchers System
- [ ] Revenue Endpoint

---

## 📝 Ghi chú

1. **Thứ tự ưu tiên:**
   - Phần 1 (Database) → Phần 2 (Middleware) → Phần 3 (User Bookings) → Phần 4-8 (Admin CRUD) → Phần 9-10 (Bonus)

2. **Testing:**
   - Sau mỗi phần, test API với Postman hoặc frontend
   - Kiểm tra validation, error handling
   - Kiểm tra authentication/authorization

3. **Code Style:**
   - Follow existing code patterns
   - Sử dụng asyncHandler cho tất cả routes
   - Return consistent response format: `{ success: true, data: ... }` hoặc `{ error: ... }`

4. **Security:**
   - Tất cả admin routes cần `authenticate + isAdmin`
   - Validate input data
   - Không trả về sensitive data (password_hash)

