# Hướng Dẫn Deploy Backend Node.js lên Render

## Tổng Quan
Render là một dịch vụ cloud miễn phí hỗ trợ Node.js, rất phù hợp để deploy backend API.

**Ưu điểm:**
- ✅ Free tier tốt
- ✅ Tự động deploy từ GitHub
- ✅ Hỗ trợ MySQL database
- ✅ SSL tự động
- ✅ Dễ sử dụng

**Lưu ý:**
- Free tier có thể "sleep" sau 15 phút không có request
- Request đầu tiên sau khi sleep sẽ mất ~30 giây để wake up

---

## Bước 1: Chuẩn Bị Code

### 1.1. Đảm Bảo Code Sẵn Sàng

Kiểm tra các file sau trong thư mục `backend`:

- ✅ `package.json` có script `start`
- ✅ `src/index.js` là entry point
- ✅ File `.env` hoặc có thể cấu hình qua environment variables

### 1.2. Kiểm Tra package.json

Đảm bảo `backend/package.json` có:

```json
{
  "scripts": {
    "start": "node src/index.js"
  }
}
```

Nếu chưa có, tôi sẽ cập nhật cho bạn.

### 1.3. Tạo file render.yaml (Tùy chọn - Khuyến nghị)

Tạo file `render.yaml` ở root của project (cùng cấp với thư mục backend):

```yaml
services:
  - type: web
    name: webphim-backend
    env: node
    plan: free
    buildCommand: cd backend && npm install
    startCommand: cd backend && node src/index.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
```

**Lưu ý**: Render tự động set PORT, nhưng có thể set PORT=10000 để chắc chắn.

---

## Bước 2: Push Code lên GitHub

### 2.1. Khởi Tạo Git (Nếu Chưa Có)

```bash
# Từ thư mục root của project (D:\WebPhim)
git init
git add .
git commit -m "Initial commit - Ready for Render deployment"
```

### 2.2. Tạo Repository trên GitHub

1. Vào https://github.com
2. Click "New repository"
3. Đặt tên: `webphim` (hoặc tên khác)
4. **KHÔNG** check "Initialize with README"
5. Click "Create repository"

### 2.3. Push Code lên GitHub

```bash
# Thay yourusername và webphim bằng thông tin của bạn
git remote add origin https://github.com/yourusername/webphim.git
git branch -M main
git push -u origin main
```

**Lưu ý**: Nếu chưa có Git credentials, GitHub sẽ hướng dẫn bạn setup.

---

## Bước 3: Đăng Ký và Tạo Service trên Render

### 3.1. Đăng Ký Render

1. Vào https://render.com
2. Click "Get Started for Free"
3. Chọn "Sign up with GitHub" (khuyến nghị)
4. Authorize Render để truy cập GitHub repositories

### 3.2. Tạo Web Service

1. Trong Dashboard, click **"New +"** → **"Web Service"**
2. Chọn repository `webphim` của bạn
3. Click **"Connect"**

### 3.3. Cấu Hình Service

Điền thông tin:

**Basic Settings:**
- **Name**: `webphim-backend` (hoặc tên bạn muốn)
- **Region**: Chọn gần nhất (Singapore hoặc US)
- **Branch**: `main` (hoặc branch bạn muốn deploy)
- **Root Directory**: `backend` ⚠️ **QUAN TRỌNG**
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `node src/index.js`

**Advanced Settings (Click "Advanced"):**
- **Auto-Deploy**: `Yes` (tự động deploy khi push code mới)
- **Plan**: `Free` (hoặc chọn plan khác nếu có)

### 3.4. Cấu Hình Environment Variables

Scroll xuống phần **"Environment Variables"**, click **"Add Environment Variable"** và thêm:

```
NODE_ENV = production
PORT = 10000
```

**Lưu ý**: Chúng ta sẽ thêm database variables sau khi tạo database.

### 3.5. Deploy

1. Click **"Create Web Service"**
2. Render sẽ bắt đầu build và deploy
3. Quá trình này mất khoảng 2-5 phút
4. Bạn sẽ thấy logs trong quá trình build

---

## Bước 4: Tạo MySQL Database trên Render

### 4.1. Tạo Database

1. Trong Dashboard, click **"New +"** → **"PostgreSQL"** hoặc **"MySQL"**
2. **Lưu ý**: Render free tier chỉ có PostgreSQL, không có MySQL free
3. **Giải pháp**: 
   - Option 1: Dùng PostgreSQL (cần thay đổi code)
   - Option 2: Dùng MySQL từ cPanel (xem bước 4.2)
   - Option 3: Dùng dịch vụ MySQL miễn phí khác (PlanetScale, Aiven)

### 4.2. Sử Dụng MySQL từ cPanel (Khuyến nghị)

Nếu bạn đã có MySQL trên cPanel:

1. Trong cPanel, vào **MySQL Databases**
2. Ghi lại thông tin:
   - Database Host: `localhost` (hoặc IP server)
   - Database Name: `nghiaht_webphim` (ví dụ)
   - Database User: `nghiaht_dbuser` (ví dụ)
   - Database Password: (password bạn đã set)

3. **Quan trọng**: Để Render kết nối được, bạn cần:
   - Cho phép remote connections từ IP của Render
   - Hoặc sử dụng SSH tunnel (phức tạp hơn)

### 4.3. Sử Dụng PlanetScale (MySQL Miễn Phí - Khuyến nghị)

PlanetScale cung cấp MySQL miễn phí và dễ kết nối từ Render:

1. Đăng ký tại https://planetscale.com
2. Tạo database mới
3. Lấy connection string
4. Cập nhật environment variables trong Render

---

## Bước 5: Cấu Hình Environment Variables

### 5.1. Thêm Database Variables

Vào Web Service → **"Environment"** tab → Thêm các biến:

```
DB_HOST = your_database_host
DB_USER = your_database_user
DB_PASSWORD = your_database_password
DB_NAME = your_database_name
```

### 5.2. Thêm JWT Secret

```
JWT_SECRET = your_super_secret_jwt_key_here
```

**Tạo JWT Secret mạnh:**
- Có thể dùng: https://randomkeygen.com
- Hoặc tạo random string dài ít nhất 32 ký tự

### 5.3. Tất Cả Environment Variables Cần Có

```
NODE_ENV = production
PORT = 10000
DB_HOST = your_database_host
DB_USER = your_database_user
DB_PASSWORD = your_database_password
DB_NAME = your_database_name
JWT_SECRET = your_jwt_secret_key
```

### 5.4. Save và Redeploy

Sau khi thêm environment variables:
1. Click **"Save Changes"**
2. Render sẽ tự động redeploy
3. Hoặc vào **"Manual Deploy"** → **"Deploy latest commit"**

---

## Bước 6: Import Database Schema

### 6.1. Kết Nối Database

Nếu dùng MySQL từ cPanel:
- Vào phpMyAdmin trong cPanel
- Import file `backend/schema.sql`

Nếu dùng PlanetScale:
- Vào PlanetScale dashboard
- Vào tab "Console"
- Copy nội dung `backend/schema.sql` và chạy

Nếu dùng PostgreSQL (Render free):
- Cần convert schema từ MySQL sang PostgreSQL
- Hoặc dùng migration tool

### 6.2. Verify Database

Kiểm tra database đã có các bảng:
- users
- movies
- cinemas
- rooms
- showtimes
- bookings
- etc.

---

## Bước 7: Lấy URL Backend

### 7.1. Lấy URL

Sau khi deploy thành công:
1. Vào Web Service dashboard
2. URL sẽ hiển thị ở trên cùng, dạng:
   ```
   https://webphim-backend.onrender.com
   ```

### 7.2. Test Backend

1. Truy cập: `https://webphim-backend.onrender.com/api`
2. Nên thấy: `{"message":"WebPhim API running"}`
3. Nếu thấy lỗi, kiểm tra logs trong Render dashboard

---

## Bước 8: Cấu Hình Custom Domain (Tùy chọn)

### 8.1. Thêm Custom Domain

1. Vào Web Service → **"Settings"** → **"Custom Domains"**
2. Click **"Add Custom Domain"**
3. Nhập: `api.nghiaht.io.vn`
4. Render sẽ cung cấp DNS records cần thêm

### 8.2. Cấu Hình DNS

Trong cPanel:
1. Vào **"Zone Editor"** hoặc **"DNS Zone"**
2. Thêm CNAME record:
   - **Name**: `api`
   - **CNAME**: `webphim-backend.onrender.com`
3. Chờ DNS propagate (5-30 phút)

### 8.3. SSL Tự Động

Render tự động cài SSL certificate cho custom domain.

---

## Bước 9: Cấu Hình Frontend

### 9.1. Cập Nhật API URL

Tạo file `frontend/.env.production`:

```env
VITE_API_URL=https://webphim-backend.onrender.com/api
```

Hoặc nếu dùng custom domain:

```env
VITE_API_URL=https://api.nghiaht.io.vn/api
```

### 9.2. Build và Deploy Frontend

```bash
cd frontend
npm run build
```

Sau đó upload lên cPanel như đã hướng dẫn.

---

## Troubleshooting

### Backend Không Chạy

**Kiểm tra Logs:**
1. Vào Web Service → **"Logs"** tab
2. Xem lỗi cụ thể

**Lỗi thường gặp:**
- ❌ `Cannot find module`: Thiếu dependencies → Kiểm tra `package.json`
- ❌ `Port already in use`: PORT conflict → Set PORT=10000
- ❌ `Database connection failed`: Kiểm tra DB credentials

### Database Connection Error

**Kiểm tra:**
1. Environment variables đã đúng chưa
2. Database host có cho phép remote connection không
3. Firewall có block không
4. Database user có đủ quyền không

**Giải pháp:**
- Dùng PlanetScale (dễ nhất)
- Hoặc whitelist IP của Render trong cPanel

### CORS Errors

**Kiểm tra:**
1. Đã cấu hình CORS trong `backend/src/index.js` chưa
2. Frontend URL đã được thêm vào allowed origins chưa

**Cập nhật CORS:**
Trong `backend/src/index.js`, đảm bảo có:
```javascript
app.use(cors({
  origin: ['https://nghiaht.io.vn', 'http://localhost:5173'],
  credentials: true
}));
```

### Service Sleep (Free Tier)

**Vấn đề:**
- Free tier sleep sau 15 phút không có request
- Request đầu tiên sau khi sleep mất ~30 giây

**Giải pháp:**
- Upgrade lên paid plan ($7/tháng)
- Hoặc dùng uptime monitor (UptimeRobot) để ping mỗi 10 phút
- Hoặc chấp nhận delay lần đầu

---

## Checklist

- [ ] Code đã được push lên GitHub
- [ ] Đã tạo Web Service trên Render
- [ ] Đã set Root Directory = `backend`
- [ ] Đã cấu hình Build Command và Start Command
- [ ] Đã thêm tất cả environment variables
- [ ] Đã tạo và import database
- [ ] Backend đã deploy thành công
- [ ] Test API endpoint thành công
- [ ] Đã cập nhật frontend với URL backend mới
- [ ] Test toàn bộ website hoạt động

---

## Tổng Kết

Sau khi hoàn thành:
- ✅ Backend chạy trên: `https://webphim-backend.onrender.com`
- ✅ Frontend chạy trên: `https://nghiaht.io.vn`
- ✅ Database đã được setup và import schema
- ✅ Website hoạt động đầy đủ

**Thời gian ước tính**: 20-30 phút

---

## Hỗ Trợ Thêm

Nếu gặp vấn đề:
1. Kiểm tra logs trong Render dashboard
2. Kiểm tra environment variables
3. Test database connection
4. Kiểm tra CORS configuration

