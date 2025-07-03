# 🎵 Advanced Spotify Clone API

Backend API Node.js hoàn chỉnh với Express và tích hợp các tính năng nâng cao cho việc upload, phân tích và streaming nhạc.

## ✨ Tính Năng Nâng Cao

### 🎵 Audio Processing
- **Metadata Extraction**: Trích xuất đầy đủ metadata từ file audio (duration, bitrate, format, embedded tags)
- **Waveform Generation**: Tạo waveform data với 1000 điểm dữ liệu cho visualization
- **Cover Art Extraction**: Tự động trích xuất ảnh bìa embedded trong file audio
- **Audio Features Analysis**: Phân tích tempo, key, loudness, energy, valence và các đặc trưng khác

### 🎯 Genre Detection
- **Auto Genre Detection**: Tự động nhận diện thể loại dựa trên:
  - Embedded metadata trong file
  - Audio characteristics (tempo, energy, acousticness)
  - Rule-based classification
- **Confidence Scoring**: Đánh giá độ tin cậy của genre detection
- **Alternative Suggestions**: Gợi ý các thể loại thay thế với confidence score

### ⚡ Background Processing
- **Async Upload**: Upload file ngay lập tức, xử lý background
- **Real-time Status**: Theo dõi trạng thái xử lý real-time
- **Error Handling**: Xử lý lỗi comprehensive với recovery

### 💾 Storage Support
- **In-Memory Storage**: Demo mode với lưu trữ tạm thời
- **MongoDB Ready**: Sẵn sàng tích hợp với MongoDB
- **Cloudinary Integration**: Hỗ trợ cloud storage (có thể enable)

## 🚀 Cài Đặt

### Prerequisites
- Node.js >= 16.0.0
- FFmpeg (cho audio processing)

### Setup
```bash
cd spotify-api
npm install
mkdir -p uploads/songs uploads/images temp
```

### Chạy Server
```bash
# Development mode
npm run dev

# Production mode
npm start

# Advanced server (recommended)
node src/server-advanced.js
```

Server sẽ chạy tại: `http://localhost:3002`

## 📚 API Documentation

### Base URL
```
http://localhost:3002/api/v1
```

### Endpoints

#### 🎵 Upload & Music Management

**POST /upload/song**
Upload file nhạc với xử lý nâng cao

```bash
curl -X POST http://localhost:3002/api/v1/upload/song \
  -F "audio=@song.mp3" \
  -F "coverImage=@cover.jpg" \
  -F "title=Tên Bài Hát" \
  -F "artist=Tên Nghệ Sĩ" \
  -F "album=Tên Album" \
  -F "genre=Pop" \
  -F "year=2024"
```

Response:
```json
{
  "success": true,
  "message": "Upload thành công! Đang xử lý file...",
  "data": {
    "songId": 1,
    "status": "processing",
    "title": "Tên Bài Hát",
    "artist": "Tên Nghệ Sĩ"
  }
}
```

**GET /upload/song/:id/status**
Kiểm tra trạng thái xử lý

```bash
curl http://localhost:3002/api/v1/upload/song/1/status
```

Response:
```json
{
  "success": true,
  "data": {
    "songId": 1,
    "title": "Tên Bài Hát",
    "artist": "Tên Nghệ Sĩ",
    "processingStatus": "completed",
    "isCompleted": true,
    "hasWaveform": true,
    "detectedGenre": "V-Pop",
    "duration": 245.67
  }
}
```

**GET /upload/song/:id/waveform**
Lấy dữ liệu waveform

```bash
curl http://localhost:3002/api/v1/upload/song/1/waveform
```

Response:
```json
{
  "success": true,
  "data": {
    "songId": 1,
    "title": "Tên Bài Hát",
    "artist": "Tên Nghệ Sĩ",
    "waveform": {
      "peaks": [0.1, 0.3, 0.5, ...],
      "length": 1000,
      "sampleRate": 22050
    }
  }
}
```

**GET /upload/my-songs**
Lấy danh sách bài hát đã upload

```bash
curl "http://localhost:3002/api/v1/upload/my-songs?page=1&limit=10"
```

**DELETE /upload/song/:id**
Xóa bài hát

```bash
curl -X DELETE http://localhost:3002/api/v1/upload/song/1
```

#### 🎼 Songs API

**GET /songs**
Lấy tất cả bài hát

```bash
curl http://localhost:3002/api/v1/songs
```

**GET /songs/:id**
Lấy thông tin chi tiết bài hát

```bash
curl http://localhost:3002/api/v1/songs/1
```

#### 📖 System Info

**GET /health**
Health check

```bash
curl http://localhost:3002/health
```

**GET /api/v1/docs**
API documentation

```bash
curl http://localhost:3002/api/v1/docs
```

## 🎯 Audio Processing Details

### Metadata Extraction
API tự động trích xuất:
- **Basic Info**: Duration, file size, format, bitrate, sample rate, channels
- **Embedded Tags**: Title, artist, album, genre, year, track number, composer
- **Cover Art**: Embedded album artwork

### Waveform Generation
- Chuyển đổi audio thành WAV format
- Tạo 1000 data points cho visualization
- Normalized amplitude values (0-1)
- Compatible với audio visualization libraries

### Genre Detection
- **Embedded Priority**: Ưu tiên genre từ metadata file
- **Audio Analysis**: Phân tích tempo, energy, acousticness
- **Rule-based Classification**:
  - Electronic: tempo > 120, energy > 0.7
  - Ballad: tempo < 80, acousticness > 0.6
  - Pop: tempo > 100, danceability > 0.6

### Audio Features
- **Tempo**: BPM detection
- **Key**: Musical key detection
- **Loudness**: dB measurement
- **Energy**: 0-1 scale
- **Valence**: Mood/emotion 0-1
- **Acousticness**: Acoustic vs electronic 0-1
- **Danceability**: 0-1 scale

## 🔧 Configuration

### Environment Variables
```bash
NODE_ENV=development
PORT=3002
FRONTEND_URL=http://localhost:3000

# MongoDB (optional)
MONGODB_URI=mongodb://localhost:27017/spotify-clone

# Cloudinary (optional)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### File Limits
- **Audio Files**: 50MB maximum
- **Image Files**: 10MB maximum
- **Supported Audio Formats**: MP3, WAV, M4A, FLAC
- **Supported Image Formats**: JPG, PNG, GIF

## 🏗️ Architecture

### Processing Flow
1. **Upload**: File được upload và lưu tạm thời
2. **Initial Response**: Trả về ngay lập tức với status "processing"
3. **Background Processing**:
   - Metadata extraction
   - Cover art extraction
   - Waveform generation
   - Audio features analysis
   - Genre detection
4. **Update Status**: Cập nhật status thành "completed" hoặc "failed"
5. **Cleanup**: Xóa temporary files

### Error Handling
- **Upload Errors**: Validation, file size, format
- **Processing Errors**: FFmpeg, metadata extraction, waveform generation
- **Storage Errors**: File system, cloud storage
- **Recovery**: Automatic retry, fallback mechanisms

## 🎛️ Advanced Features

### Real-time Updates
- WebSocket support (có thể thêm)
- Server-sent events cho status updates
- Progress tracking cho long-running operations

### Batch Processing
- Multiple file upload
- Bulk operations
- Queue management

### Analytics
- Upload statistics
- Processing performance metrics
- User behavior tracking

## 🧪 Testing

### Health Check
```bash
curl http://localhost:3002/health
```

### Upload Test
```bash
# Test với file MP3
curl -X POST http://localhost:3002/api/v1/upload/song \
  -F "audio=@test.mp3" \
  -F "title=Test Song" \
  -F "artist=Test Artist"

# Kiểm tra status
curl http://localhost:3002/api/v1/upload/song/1/status

# Lấy waveform
curl http://localhost:3002/api/v1/upload/song/1/waveform
```

## 🚀 Production Deployment

### Optimizations
- **Clustering**: Multi-process support
- **Caching**: Redis integration
- **CDN**: Static file delivery
- **Load Balancing**: Multiple server instances

### Security
- **Authentication**: JWT tokens
- **Authorization**: Role-based access
- **Rate Limiting**: API request limits
- **File Validation**: Security scanning

### Monitoring
- **Logging**: Structured logging với Winston
- **Metrics**: Prometheus integration
- **Alerts**: Error tracking với Sentry
- **Performance**: APM tools

## 🔗 Integration

### Frontend Integration
API được thiết kế để tích hợp với React frontend:
- **CORS enabled** cho localhost:3000
- **JSON responses** consistent format
- **Error handling** user-friendly messages
- **File serving** static assets

### Database Integration
- **MongoDB**: Production database
- **In-memory**: Development/demo mode
- **Migration ready**: Easy switch between modes

### Cloud Storage
- **Cloudinary**: Image và audio processing
- **AWS S3**: Alternative storage
- **Local filesystem**: Development mode

## 📝 License

MIT License - có thể sử dụng tự do cho dự án cá nhân và commercial.

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📞 Support

- **GitHub Issues**: Bug reports và feature requests
- **Documentation**: API docs tại `/api/v1/docs`
- **Examples**: Sample code trong repository 