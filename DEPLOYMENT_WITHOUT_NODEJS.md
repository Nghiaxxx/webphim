# Hướng Dẫn Deploy Khi cPanel Không Hỗ Trợ Node.js

## Giải Pháp: Deploy Backend Riêng + Frontend lên cPanel

Khi cPanel không hỗ trợ Node.js, bạn có thể:
- **Frontend**: Deploy lên cPanel (nghiaht.io.vn)
- **Backend**: Deploy lên dịch vụ miễn phí hỗ trợ Node.js

## Các Dịch Vụ Miễn Phí Để Deploy Backend

### 1. Railway (Khuyến nghị - Dễ nhất)
- **URL**: https://railway.app
- **Miễn phí**: $5 credit/tháng (đủ cho backend nhỏ)
- **Ưu điểm**: Dễ deploy, tự động detect Node.js

### 2. Render
- **URL**: https://render.com
- **Miễn phí**: Có free tier (có thể sleep sau 15 phút không dùng)
- **Ưu điểm**: Free tier tốt, dễ sử dụng

### 3. Fly.io
- **URL**: https://fly.io
- **Miễn phí**: Có free tier
- **Ưu điểm**: Performance tốt

### 4. Vercel / Netlify Functions
- Chỉ phù hợp nếu chuyển sang serverless functions

---

## Hướng Dẫn Chi Tiết: Railway (Khuyến nghị)

### Bước 1: Chuẩn Bị Backend

#### 1.1. Tạo file `railway.json` (tùy chọn)
Tạo file `railway.json` trong thư mục `backend`:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node src/index.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

#### 1.2. Tạo file `Procfile` (nếu Railway không tự detect)
Tạo file `Procfile` trong thư mục `backend`:

```
web: node src/index.js
```

#### 1.3. Cập nhật `package.json` để có script start
Đảm bảo `backend/package.json` có:
```json
{
  "scripts": {
    "start": "node src/index.js"
  }
}
```

### Bước 2: Deploy Backend lên Railway

#### 2.1. Đăng ký Railway
1. Vào https://railway.app
2. Đăng nhập bằng GitHub (khuyến nghị) hoặc email
3. Chọn "New Project"

#### 2.2. Deploy từ GitHub (Khuyến nghị)
1. **Push code lên GitHub** (nếu chưa có):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/webphim.git
   git push -u origin main
   ```

2. Trong Railway:
   - Chọn "Deploy from GitHub repo"
   - Chọn repository của bạn
   - Railway sẽ tự động detect Node.js

3. **Cấu hình Root Directory**:
   - Vào Settings → Source
   - Set "Root Directory" = `backend`

#### 2.3. Cấu hình Environment Variables
1. Vào tab "Variables" trong Railway
2. Thêm các biến môi trường:
   ```
   DB_HOST=your_database_host
   DB_USER=your_database_user
   DB_PASSWORD=your_database_password
   DB_NAME=your_database_name
   PORT=4000
   NODE_ENV=production
   JWT_SECRET=your_super_secret_jwt_key
   ```

   **Lưu ý**: Railway sẽ tự động cung cấp PORT, bạn không cần set PORT=4000

#### 2.4. Lấy URL Backend
1. Sau khi deploy xong, Railway sẽ cung cấp URL
2. URL sẽ có dạng: `https://your-app-name.up.railway.app`
3. Copy URL này để dùng cho frontend

### Bước 3: Cấu Hình Database

#### 3.1. Sử dụng Database từ cPanel
- Railway có thể kết nối đến MySQL database từ cPanel
- Cần đảm bảo:
  - Database cho phép remote connection (nếu cần)
  - Hoặc sử dụng MySQL từ Railway (khuyến nghị hơn)

#### 3.2. Sử dụng MySQL từ Railway (Khuyến nghị)
1. Trong Railway project, click "New" → "Database" → "Add MySQL"
2. Railway sẽ tạo MySQL database tự động
3. Lấy connection string từ tab "Variables"
4. Import `schema.sql` vào database này:
   - Vào tab "Connect" → "MySQL"
   - Copy connection command và chạy để import schema

### Bước 4: Deploy Frontend lên cPanel

#### 4.1. Cấu hình API URL cho Production
Tạo file `.env.production` trong thư mục `frontend`:

```env
VITE_API_URL=https://your-app-name.up.railway.app/api
```

Thay `your-app-name.up.railway.app` bằng URL backend từ Railway.

#### 4.2. Build Frontend
```bash
cd frontend
npm install --save-dev terser  # Nếu chưa cài
npm run build
```

#### 4.3. Upload lên cPanel
1. Vào **File Manager** trong cPanel
2. Vào thư mục `public_html` (hoặc thư mục domain nghiaht.io.vn)
3. Upload **TẤT CẢ** files từ `frontend/dist` lên `public_html`
4. Upload file `.htaccess` vào `public_html`

### Bước 5: Cấu Hình CORS trong Backend

Đảm bảo backend cho phép requests từ domain frontend.

Trong `backend/src/index.js`, cập nhật CORS:

```javascript
const cors = require('cors');

app.use(cors({
  origin: ['https://nghiaht.io.vn', 'http://localhost:5173'],
  credentials: true
}));
```

Sau đó commit và push lại lên Railway.

### Bước 6: Kiểm Tra

1. **Kiểm tra Backend**:
   - Truy cập: `https://your-app-name.up.railway.app/api`
   - Nên thấy: `{"message":"WebPhim API running"}`

2. **Kiểm tra Frontend**:
   - Truy cập: `https://nghiaht.io.vn`
   - Mở Developer Tools (F12) → Console
   - Kiểm tra không có lỗi CORS
   - Test đăng nhập/đăng ký

---

## Hướng Dẫn Chi Tiết: Render (Thay Thế)

### Bước 1: Đăng ký Render
1. Vào https://render.com
2. Đăng nhập bằng GitHub

### Bước 2: Tạo Web Service
1. Chọn "New" → "Web Service"
2. Connect GitHub repository
3. Cấu hình:
   - **Name**: webphim-backend
   - **Root Directory**: `backend`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node src/index.js`

### Bước 3: Cấu hình Environment Variables
Thêm các biến môi trường giống như Railway.

### Bước 4: Lấy URL
Render sẽ cung cấp URL dạng: `https://webphim-backend.onrender.com`

**Lưu ý**: Free tier có thể sleep sau 15 phút không dùng, request đầu tiên sẽ chậm.

---

## Cấu Hình Domain Tùy Chỉnh (Tùy chọn)

### Railway
1. Vào Settings → Domains
2. Add custom domain: `api.nghiaht.io.vn`
3. Cấu hình DNS trong cPanel:
   - Thêm CNAME record: `api` → `your-app-name.up.railway.app`

### Render
1. Vào Settings → Custom Domains
2. Add domain: `api.nghiaht.io.vn`
3. Cấu hình DNS tương tự

Sau đó cập nhật `VITE_API_URL` trong frontend thành `https://api.nghiaht.io.vn/api`

---

## Troubleshooting

### Backend không kết nối được Database
- Kiểm tra database host (có thể không phải `localhost`)
- Kiểm tra firewall/security settings
- Nếu dùng database từ cPanel, có thể cần whitelist IP của Railway

### CORS Errors
- Đảm bảo đã cấu hình CORS trong backend
- Kiểm tra URL trong `VITE_API_URL` có đúng không
- Kiểm tra protocol (http vs https)

### Frontend không load được
- Kiểm tra file `.htaccess` đã được upload chưa
- Kiểm tra SSL certificate đã được cài chưa
- Kiểm tra Console (F12) để xem lỗi cụ thể

---

## So Sánh Các Dịch Vụ

| Dịch vụ | Free Tier | Ưu điểm | Nhược điểm |
|---------|-----------|---------|------------|
| **Railway** | $5 credit/tháng | Dễ dùng, không sleep | Có giới hạn credit |
| **Render** | Free | Free tier tốt | Có thể sleep |
| **Fly.io** | Free | Performance tốt | Cấu hình phức tạp hơn |

**Khuyến nghị**: Bắt đầu với Railway vì dễ sử dụng nhất.

---

## Checklist Nhanh

- [ ] Đăng ký Railway/Render
- [ ] Push code lên GitHub
- [ ] Deploy backend lên Railway/Render
- [ ] Cấu hình environment variables
- [ ] Setup database (Railway MySQL hoặc cPanel)
- [ ] Import schema.sql
- [ ] Lấy URL backend
- [ ] Tạo `.env.production` trong frontend với URL backend
- [ ] Build frontend: `npm run build`
- [ ] Upload frontend/dist lên cPanel
- [ ] Upload .htaccess lên cPanel
- [ ] Cấu hình CORS trong backend
- [ ] Test website

