# Hệ thống Upload Bài Hát - Spotify Clone

## Tổng quan
Hệ thống cho phép người dùng upload bài hát với metadata và ảnh bìa lên cloud storage (Cloudinary) và lưu thông tin vào MongoDB.

## Tính năng chính

### 1. Upload Bài Hát
- **File audio**: Hỗ trợ MP3, WAV, M4A (tối đa 50MB)
- **Ảnh bìa**: Hỗ trợ JPG, PNG, GIF (tự động resize 500x500px)
- **Metadata**: Tên bài hát, nghệ sĩ, album, thể loại, lời bài hát

### 2. Quản lý Bài Hát
- Xem danh sách bài hát đã upload
- Chỉnh sửa metadata
- Xóa bài hát (cả file và database)
- Phân trang và tìm kiếm

### 3. Streaming & Phát nhạc
- Stream trực tiếp từ Cloudinary
- Đếm lượt phát
- Tích hợp với music player

## Cài đặt & Cấu hình

### 1. Dependencies
```bash
cd spotify-api
npm install cloudinary
```

### 2. Cấu hình Cloudinary
Tạo tài khoản tại [cloudinary.com](https://cloudinary.com) và cập nhật file `.env`:

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key  
CLOUDINARY_API_SECRET=your-api-secret
```

### 3. Database Models
Song model đã được cập nhật với các trường:
- `audioUrl`: URL file audio trên Cloudinary
- `audioPublicId`: Public ID để quản lý file
- `coverImageUrl`: URL ảnh bìa
- `coverImagePublicId`: Public ID của ảnh bìa
- `uploadedBy`: ID của user upload
- `fileSize`, `format`, `lyrics`: Metadata mở rộng

## API Endpoints

### Upload bài hát
```http
POST /api/v1/upload/song
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body:
- audioFile: File (required)
- coverImage: File (optional)
- title: String (required)
- artist: String (required)
- album: String (optional)
- genre: String (optional)
- lyrics: String (optional)
```

### Lấy bài hát của user
```http
GET /api/v1/upload/my-songs?page=1&limit=10
Authorization: Bearer <token>
```

### Cập nhật metadata
```http
PUT /api/v1/upload/song/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Tên mới",
  "artist": "Nghệ sĩ mới",
  "album": "Album mới",
  "genre": "Thể loại mới",
  "lyrics": "Lời bài hát mới"
}
```

### Xóa bài hát
```http
DELETE /api/v1/upload/song/:id
Authorization: Bearer <token>
```

### Lấy danh sách bài hát (public)
```http
GET /api/v1/songs?page=1&limit=20&genre=Pop&artist=Artist
```

### Phát bài hát
```http
POST /api/v1/songs/:id/play
```

## Frontend Components

### 1. UploadMusic Component
- Form upload với drag & drop
- Preview ảnh bìa
- Progress bar
- Validation form
- Error handling

### 2. MyMusic Component  
- Danh sách bài hát đã upload
- Table view với metadata
- Nút play/delete
- Pagination
- Integration với music player

### 3. Integration với App
- Navigation "Nhạc của tôi" trong Sidebar
- Routing đến MyMusic component
- Tích hợp với music player hiện tại

## Cấu trúc Files

### Backend (spotify-api/)
```
src/
├── config/
│   └── cloudinary.js          # Cấu hình Cloudinary
├── controllers/
│   ├── upload.controller.js   # Logic upload
│   └── song.controller.js     # CRUD songs (updated)
├── middleware/
│   └── uploadMusic.js         # Multer middleware
├── models/
│   └── Song.js               # Model updated với Cloudinary
├── routes/
│   ├── upload.routes.js      # Routes upload
│   └── song.routes.js        # Routes songs (updated)
└── utils/
    └── cloudinaryUpload.js   # Utils upload/delete files
```

### Frontend (src/)
```
components/
├── UploadMusic.js            # Component upload
├── MyMusic.js               # Quản lý bài hát
├── Sidebar.js               # Navigation (updated)
└── App.js                   # Main app (updated)
```

## Bảo mật & Best Practices

### 1. File Upload Security
- Validation file type và size
- Rename files với timestamp
- Error handling cho failed uploads
- Clean up temporary files

### 2. Authorization
- JWT authentication required
- Owner-only access cho CRUD operations
- Admin override permissions

### 3. Database Design
- Indexes cho performance
- Virtual fields cho computed values
- Backward compatibility với legacy fields
- Cascade delete cho related data

## Demo Data
Để test hệ thống, bạn có thể sử dụng các file MP3 mẫu trong thư mục `public/mp3/`.

## Troubleshooting

### Lỗi thường gặp:

1. **Cloudinary upload failed**
   - Kiểm tra credentials trong .env
   - Kiểm tra network connection
   - Verify file size limits

2. **File too large**
   - Tăng limit trong middleware (hiện tại 50MB)
   - Kiểm tra server upload limits

3. **Authentication errors**
   - Verify JWT token in localStorage
   - Check token expiration
   - Ensure user is logged in

4. **CORS issues**
   - Verify API server is running on port 5000
   - Check CORS configuration in server.js

## Phát triển thêm

### Tính năng có thể thêm:
- Batch upload multiple files
- Audio format conversion
- Automatic metadata extraction từ MP3 tags
- Playlist management integration
- Social features (share, like, comment)
- Audio waveform visualization
- Lyrics synchronization
- Download management

### Performance optimizations:
- CDN cho static assets
- Audio streaming optimization
- Lazy loading cho large lists
- Caching strategies
- Background processing cho uploads

## Liên hệ & Hỗ trợ
Nếu gặp vấn đề, vui lòng tạo issue hoặc liên hệ team phát triển. 