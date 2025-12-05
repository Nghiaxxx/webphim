# Hướng Dẫn Nhanh - Deploy Không Cần Node.js trên cPanel

## Tóm Tắt
- **Frontend**: Deploy lên cPanel (nghiaht.io.vn) ✅
- **Backend**: Deploy lên Railway (miễn phí) ✅

---

## Bước 1: Deploy Backend lên Railway (5 phút)

### 1.1. Đăng ký Railway
1. Vào https://railway.app
2. Đăng nhập bằng GitHub

### 1.2. Push code lên GitHub (nếu chưa có)
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/webphim.git
git push -u origin main
```

### 1.3. Deploy trên Railway
1. Click "New Project" → "Deploy from GitHub repo"
2. Chọn repository của bạn
3. Railway sẽ tự động detect Node.js
4. Vào **Settings** → **Source** → Set **Root Directory** = `backend`

### 1.4. Cấu hình Environment Variables
Vào tab **Variables**, thêm:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=webphim
NODE_ENV=production
JWT_SECRET=your_random_secret_key_here
```

**Lưu ý**: Railway tự động set PORT, không cần set PORT=4000

### 1.5. Setup Database trên Railway
1. Trong project, click **New** → **Database** → **Add MySQL**
2. Railway sẽ tạo MySQL tự động
3. Vào tab **Variables** của MySQL service
4. Copy các giá trị: `MYSQLHOST`, `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQLDATABASE`
5. Cập nhật lại environment variables của backend service với các giá trị này

### 1.6. Import Database Schema
1. Vào tab **Connect** của MySQL service
2. Copy connection command
3. Chạy command để kết nối MySQL
4. Import file `backend/schema.sql`

### 1.7. Lấy URL Backend
Sau khi deploy xong, Railway cung cấp URL dạng:
`https://your-app-name.up.railway.app`

Copy URL này!

---

## Bước 2: Cấu Hình Frontend (2 phút)

### 2.1. Tạo file `.env.production`
Tạo file `frontend/.env.production`:

```env
VITE_API_URL=https://your-app-name.up.railway.app/api
```

Thay `your-app-name.up.railway.app` bằng URL backend từ Railway.

### 2.2. Build Frontend
```bash
cd frontend
npm install --save-dev terser
npm run build
```

---

## Bước 3: Upload Frontend lên cPanel (5 phút)

### 3.1. Upload Files
1. Vào **File Manager** trong cPanel
2. Vào `public_html` (hoặc thư mục domain nghiaht.io.vn)
3. Upload **TẤT CẢ** files từ `frontend/dist` lên `public_html`
4. Upload file `.htaccess` vào `public_html`

### 3.2. Cài SSL
1. Vào **SSL/TLS Status** trong cPanel
2. Cài đặt SSL certificate (Let's Encrypt) cho nghiaht.io.vn

---

## Bước 4: Kiểm Tra (2 phút)

1. **Backend**: Truy cập `https://your-app-name.up.railway.app/api`
   - Nên thấy: `{"message":"WebPhim API running"}`

2. **Frontend**: Truy cập `https://nghiaht.io.vn`
   - Website hiển thị đúng
   - Mở F12 → Console, không có lỗi
   - Test đăng nhập/đăng ký

---

## Tổng Thời Gian: ~15 phút

## Lưu Ý Quan Trọng

✅ **Railway Free Tier**: $5 credit/tháng (đủ cho backend nhỏ)  
✅ **Database**: Dùng MySQL từ Railway (dễ hơn)  
✅ **CORS**: Đã được cấu hình tự động trong code  
✅ **SSL**: Cài đặt trên cả Railway và cPanel  

## Nếu Gặp Lỗi

### Backend không chạy
- Kiểm tra environment variables
- Kiểm tra logs trong Railway dashboard

### CORS Error
- Đảm bảo URL trong `.env.production` đúng
- Kiểm tra CORS config trong `backend/src/index.js`

### Database connection error
- Kiểm tra thông tin database trong environment variables
- Đảm bảo đã import schema.sql

---

## Xem Hướng Dẫn Chi Tiết
Xem file `DEPLOYMENT_WITHOUT_NODEJS.md` để biết thêm chi tiết và các dịch vụ thay thế.

