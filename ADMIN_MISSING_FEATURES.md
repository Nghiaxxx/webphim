# Danh sách tính năng Admin còn thiếu

## 📋 Tổng quan

Tài liệu này liệt kê các tính năng admin còn thiếu trong frontend và backend. Backend đã có đầy đủ API endpoints, nhưng frontend chưa implement các form để tạo/sửa dữ liệu.

---

## ✅ Backend đã có đầy đủ

### Routes & Controllers đã có:
- ✅ **Rooms CRUD**: POST, PUT, DELETE `/api/rooms`
- ✅ **Cinemas CRUD**: POST, PUT, DELETE `/api/cinemas`
- ✅ **Products CRUD**: POST, PUT, DELETE `/api/products`
- ✅ **Bookings Management**: GET all, GET by id, PUT, DELETE `/api/bookings`
- ✅ **Users Management**: GET all, GET by id, PUT, DELETE `/api/users`
- ✅ **isAdmin Middleware**: Đã có trong `backend/src/middleware/auth.js`

---

## ❌ Frontend còn thiếu

### 1. AdminCinemas - Quản lý rạp phim
**Trạng thái:** Chỉ có xem danh sách và xóa, thiếu form thêm/sửa

**Cần implement:**
- [ ] Form modal thêm rạp mới với các trường:
  - `name` (bắt buộc)
  - `address` (bắt buộc)
  - `city` (bắt buộc)
  - `phone_number` (bắt buộc)
- [ ] Form modal sửa rạp (tương tự form thêm)
- [ ] Kết nối với API: `adminAPI.cinemas.create()` và `adminAPI.cinemas.update()`

**File cần sửa:** `frontend/src/pages/admin/AdminCinemas.jsx`
- Dòng 57-61: `handleEdit` - hiện chỉ có TODO
- Dòng 91-95: `handleAdd` - hiện chỉ có alert

---

### 2. AdminProducts - Quản lý sản phẩm
**Trạng thái:** Chỉ có xem danh sách và xóa, thiếu form thêm/sửa

**Cần implement:**
- [ ] Form modal thêm sản phẩm mới với các trường:
  - `name` (bắt buộc)
  - `description` (tùy chọn)
  - `details` (tùy chọn)
  - `price` (bắt buộc, số)
  - `type` (bắt buộc, dropdown: popcorn, drink, combo, other)
  - `image_url` (tùy chọn)
  - `is_featured` (checkbox)
- [ ] Form modal sửa sản phẩm (tương tự form thêm)
- [ ] Kết nối với API: `adminAPI.products.create()` và `adminAPI.products.update()`

**File cần sửa:** `frontend/src/pages/admin/AdminProducts.jsx`
- Dòng 97-101: `handleEdit` - hiện chỉ có TODO
- Dòng 121-125: `handleAdd` - hiện chỉ có alert

---

### 3. AdminUsers - Quản lý người dùng
**Trạng thái:** Chỉ có xem danh sách và xóa, thiếu form sửa và xem chi tiết

**Cần implement:**
- [ ] Form modal sửa user với các trường:
  - `full_name` (tùy chọn)
  - `phone` (tùy chọn)
  - `role` (dropdown: user, admin, staff)
  - `status` (dropdown: active, inactive)
  - `loyalty_points` (số)
- [ ] Modal xem chi tiết user (thông tin đầy đủ, lịch sử đặt vé)
- [ ] Kết nối với API: `adminAPI.users.update()` và `adminAPI.users.getById()`

**File cần sửa:** `frontend/src/pages/admin/AdminUsers.jsx`
- Dòng 95-99: `handleEdit` - hiện chỉ có TODO
- Dòng 114-117: `handleView` - hiện chỉ có TODO

---

### 4. AdminRooms - Quản lý phòng chiếu
**Trạng thái:** Chỉ có xem layout và danh sách, thiếu hoàn toàn chức năng thêm/sửa

**Cần implement:**
- [ ] Nút "Thêm phòng mới" trong page header
- [ ] Form modal thêm phòng mới với các trường:
  - `name` (bắt buộc)
  - `cinema_id` (bắt buộc, dropdown chọn rạp)
  - `screen_type` (tùy chọn: 2D, 3D, IMAX, etc.)
  - `layout_config` (JSON editor hoặc form builder cho layout ghế)
- [ ] Form modal sửa phòng (tương tự form thêm)
- [ ] Nút Edit trong mỗi room card
- [ ] Kết nối với API: `adminAPI.rooms.create()` và `adminAPI.rooms.update()`

**File cần sửa:** `frontend/src/pages/admin/AdminRooms.jsx`
- Thêm state cho modal và form
- Thêm handlers cho create/update
- Thêm UI cho form modal

---

### 5. AdminPromotions - Quản lý khuyến mãi
**Trạng thái:** Chỉ có xem danh sách và xóa, thiếu form thêm/sửa

**Cần implement:**
- [ ] Form modal thêm khuyến mãi mới với các trường:
  - `title` (bắt buộc)
  - `slug` (tự động từ title hoặc nhập tay)
  - `description` (tùy chọn)
  - `discount_percent` hoặc `discount_amount` (bắt buộc)
  - `start_date` (bắt buộc)
  - `end_date` (bắt buộc)
  - `image_url` (tùy chọn)
  - `is_active` (checkbox)
- [ ] Form modal sửa khuyến mãi (tương tự form thêm)
- [ ] Kết nối với API: `adminAPI.promotions.create()` và `adminAPI.promotions.update()`

**File cần sửa:** `frontend/src/pages/admin/AdminPromotions.jsx`
- Dòng 80-84: `handleEdit` - hiện chỉ có TODO
- Dòng 104-108: `handleAdd` - hiện chỉ có alert

---

### 6. AdminSettings - Cài đặt hệ thống
**Trạng thái:** Frontend có form nhưng backend chưa có API

**Cần implement Backend:**
- [ ] Tạo bảng `settings` trong database (hoặc dùng JSON file/config)
- [ ] Tạo route `GET /api/admin/settings` - Lấy cài đặt
- [ ] Tạo route `PUT /api/admin/settings` - Lưu cài đặt
- [ ] Tạo controller `SettingsController.js`
- [ ] Tạo service `SettingsService.js` (nếu cần)

**Cần implement Frontend:**
- [ ] Kết nối form với API để load cài đặt khi vào trang
- [ ] Kết nối nút "Lưu cài đặt" với API để lưu
- [ ] Hiển thị loading và success/error messages

**Files cần tạo/sửa:**
- Backend: `backend/src/routes/settingsRoutes.js` (mới)
- Backend: `backend/src/controllers/SettingsController.js` (mới)
- Backend: `backend/src/services/SettingsService.js` (mới, nếu cần)
- Frontend: `frontend/src/pages/admin/AdminSettings.jsx` - Dòng 31: TODO implement API call

---

### 7. AdminBookings - Quản lý đặt vé
**Trạng thái:** Có xem danh sách và xóa, thiếu modal xem chi tiết

**Cần implement:**
- [ ] Modal xem chi tiết đặt vé với thông tin:
  - Thông tin khách hàng (tên, email, phone)
  - Thông tin phim và suất chiếu
  - Danh sách ghế đã đặt
  - Sản phẩm đã mua (nếu có)
  - Tổng tiền và trạng thái
  - Thời gian tạo đơn
- [ ] Kết nối với API: `adminAPI.bookings.getById()`

**File cần sửa:** `frontend/src/pages/admin/AdminBookings.jsx`
- Dòng 99-102: `handleView` - hiện chỉ có console.log

---

## 📝 Ghi chú

1. **Backend đã sẵn sàng:** Tất cả API endpoints đã có trong backend, chỉ cần frontend implement form và kết nối.

2. **Pattern tham khảo:** Có thể tham khảo `AdminMovies.jsx` và `AdminShowtimes.jsx` để xem cách implement form modal (đã có đầy đủ).

3. **Thứ tự ưu tiên:**
   - **Cao:** AdminCinemas, AdminProducts, AdminRooms (quan trọng cho quản lý)
   - **Trung bình:** AdminUsers, AdminPromotions
   - **Thấp:** AdminSettings, AdminBookings view (tính năng bổ sung)

4. **Validation:** Nhớ thêm validation cho các form (required fields, format, etc.)

5. **Error handling:** Đảm bảo có error handling và user feedback khi API call thất bại

---

## ✅ Checklist tổng hợp

### Frontend Forms
- [ ] AdminCinemas - Form thêm/sửa
- [ ] AdminProducts - Form thêm/sửa
- [ ] AdminUsers - Form sửa và view
- [ ] AdminRooms - Form thêm/sửa
- [ ] AdminPromotions - Form thêm/sửa
- [ ] AdminBookings - Modal view chi tiết

### Backend API
- [ ] AdminSettings - GET/PUT endpoints

### Frontend API Integration
- [ ] AdminSettings - Kết nối với backend API

---

## 🎯 Kết luận

**Backend:** ✅ Đã có đầy đủ API endpoints
**Frontend:** ❌ Cần implement 7 form/modal còn thiếu

Tổng cộng cần implement: **7 tính năng** (6 frontend forms + 1 backend API cho Settings)

