# 🎵 Spotify Clone - Music Player Application

Một ứng dụng nghe nhạc hiện đại được xây dựng với React và Node.js, mô phỏng các tính năng chính của Spotify.

![Music Player](https://img.shields.io/badge/Music-Player-green)
![React](https://img.shields.io/badge/React-19.1.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-brightgreen)

## 🌟 Tính năng chính

### 🎧 Phát nhạc
- **Audio Player**: Phát nhạc với giao diện đẹp mắt
- **Playlist Management**: Tạo và quản lý danh sách phát
- **Shuffle & Repeat**: Phát ngẫu nhiên và lặp lại
- **Volume Control**: Điều chỉnh âm lượng
- **Progress Bar**: Thanh tiến trình với khả năng tua

### 👤 Quản lý người dùng
- **Authentication**: Đăng nhập/Đăng ký an toàn
- **User Profiles**: Hồ sơ người dùng cá nhân
- **History Tracking**: Lịch sử nghe nhạc
- **Favorites**: Lưu bài hát yêu thích

### 📁 Quản lý file nhạc
- **Upload Music**: Upload file MP3/Audio
- **Metadata Extraction**: Trích xuất thông tin bài hát tự động
- **Cloudinary Integration**: Lưu trữ file trên cloud
- **Audio Processing**: Xử lý audio với FFmpeg

### 🔍 Tìm kiếm & Khám phá
- **Search Function**: Tìm kiếm bài hát, nghệ sĩ
- **Music Library**: Thư viện nhạc cá nhân
- **Recommendations**: Gợi ý nhạc (đang phát triển)

## 🛠️ Công nghệ sử dụng

### Frontend
- **React 19.1.0** - UI Framework
- **Tailwind CSS** - Styling
- **React Icons** - Icon library
- **Axios** - HTTP client
- **Context API** - State management

### Backend
- **Node.js + Express** - Server framework
- **MongoDB + Mongoose** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Multer** - File upload
- **Cloudinary** - Cloud storage
- **music-metadata** - Metadata extraction
- **fluent-ffmpeg** - Audio processing

## 📦 Cài đặt và chạy

### Yêu cầu hệ thống
- Node.js >= 16.0.0
- MongoDB
- FFmpeg (cho audio processing)
- npm hoặc yarn

### 1. Clone repository
```bash
git clone https://github.com/CTT2802020/musicplay.git
cd musicplay
```

### 2. Cài đặt Backend
```bash
cd spotify-api
npm install

# Tạo file .env
cp .env.example .env
# Cấu hình các biến môi trường trong .env
```

### 3. Cài đặt Frontend
```bash
cd ../spotify-clone
npm install
```

### 4. Cấu hình môi trường

Tạo file `.env` trong thư mục `spotify-api`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/musicapp
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 5. Khởi chạy MongoDB
```bash
# macOS với Homebrew
brew services start mongodb/brew/mongodb-community

# hoặc
mongod --config /usr/local/etc/mongod.conf
```

### 6. Chạy ứng dụng

**Backend** (Terminal 1):
```bash
cd spotify-api
npm run dev
# Server chạy tại http://localhost:5000
```

**Frontend** (Terminal 2):
```bash
cd spotify-clone
npm start
# Client chạy tại http://localhost:3000
```

## 📁 Cấu trúc dự án

```
musicplay/
├── spotify-api/                 # Backend API
│   ├── src/
│   │   ├── controllers/         # Controllers
│   │   ├── models/             # MongoDB Models
│   │   ├── routes/             # API Routes
│   │   ├── middleware/         # Middlewares
│   │   ├── config/             # Cấu hình
│   │   └── utils/              # Utilities
│   ├── uploads/                # File uploads
│   └── package.json
├── spotify-clone/              # Frontend React App
│   ├── src/
│   │   ├── components/         # React Components
│   │   ├── contexts/           # Context providers
│   │   ├── hooks/              # Custom hooks
│   │   ├── services/           # API services
│   │   └── utils/              # Utilities
│   ├── public/
│   └── package.json
└── README.md
```

## 🎯 Cách sử dụng

### 1. Đăng ký tài khoản
- Mở ứng dụng tại `http://localhost:3000`
- Click "Register" để tạo tài khoản mới
- Hoặc "Login" nếu đã có tài khoản

### 2. Upload nhạc
- Vào trang "My Music"
- Click "Upload Music" 
- Chọn file MP3 và upload
- Hệ thống sẽ tự động trích xuất metadata

### 3. Phát nhạc
- Chọn bài hát từ library
- Sử dụng controls để play/pause, next/previous
- Tạo playlist và thêm bài hát yêu thích

### 4. Quản lý playlist
- Tạo playlist mới
- Thêm/xóa bài hát khỏi playlist
- Chia sẻ playlist (tính năng sẽ có)

## 🔧 Scripts hữu ích

```bash
# Chạy backend development mode
cd spotify-api && npm run dev

# Chạy frontend development mode  
cd spotify-clone && npm start

# Build frontend cho production
cd spotify-clone && npm run build

# Setup backend (tạo thư mục cần thiết)
cd spotify-api && npm run setup

# Khởi động MongoDB
npm run mongo
```

## 🤝 Đóng góp

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📝 Todo List

- [ ] Implement real-time lyrics
- [ ] Add social features (follow users)
- [ ] Music recommendations algorithm
- [ ] Mobile responsive design
- [ ] Offline mode
- [ ] Music visualizer
- [ ] Podcast support

## ⚠️ Lưu ý

- Đảm bảo MongoDB đang chạy trước khi khởi động backend
- Cần cấu hình Cloudinary để upload file hoạt động
- FFmpeg cần được cài đặt cho audio processing
- File nhạc demo có sẵn trong thư mục `public/mp3`

## 📄 License

Dự án này sử dụng [MIT License](LICENSE)

## 👨‍💻 Tác giả

**Cao Tiến** - [GitHub](https://github.com/CTT2802020)

---

⭐ Nếu project hữu ích, hãy cho một star nhé! 