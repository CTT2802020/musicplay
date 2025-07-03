# Spotify Clone - Web Music Interface

🎵 Một giao diện web nghe nhạc được thiết kế giống Spotify, sử dụng React và Tailwind CSS.

## ✨ Tính năng

- **Thanh điều hướng bên trái** với các mục: Home, Search, Your Library
- **Màn hình chính** hiển thị:
  - Lời chào theo thời gian (Good morning/afternoon/evening)
  - Danh sách recently played với hiệu ứng hover
  - Featured playlists với layout grid responsive
  - Made for You section
- **Bottom music player** với đầy đủ controls:
  - Play/Pause, Previous/Next, Shuffle, Repeat
  - Seek bar với khả năng điều chỉnh
  - Volume control với mute
  - Hiển thị thông tin track hiện tại
- **Responsive design** hoạt động tốt trên cả desktop và mobile
- **Dark theme** với màu sắc Spotify authentic
- **Smooth animations** và hover effects

## 🎨 Thiết kế

- **Background**: Dark theme (#121212, #282828)
- **Accent Color**: Spotify Green (#1ed760)
- **Typography**: Modern sans-serif fonts
- **Border Radius**: Rounded corners cho modern look
- **Responsive**: Mobile-first approach

## 🚀 Cài đặt và chạy

### Prerequisites
- Node.js (>= 14.x)
- npm hoặc yarn

### Cài đặt
```bash
# Clone repository
git clone <repository-url>

# Vào thư mục project
cd spotify-clone

# Cài đặt dependencies
npm install

# Chạy development server
npm start
```

Ứng dụng sẽ chạy tại `http://localhost:3000`

## 📱 Mobile Support

Giao diện được thiết kế responsive với:
- **Mobile menu**: Hamburger menu cho navigation
- **Touch-friendly controls**: Buttons và sliders được tối ưu cho touch
- **Responsive grid**: Layout tự động điều chỉnh theo screen size
- **Mobile player**: Player controls được tối ưu cho mobile

## 🛠️ Công nghệ sử dụng

- **React** - UI framework
- **Tailwind CSS** - Utility-first CSS framework
- **SVG Icons** - Vector icons cho UI elements
- **CSS Gradients** - Modern gradients cho backgrounds

## 📦 Cấu trúc project

```
src/
├── components/
│   ├── Sidebar.js          # Left navigation sidebar
│   ├── MainContent.js      # Main content area
│   └── MusicPlayer.js      # Bottom music player
├── App.js                  # Main App component
├── App.css                 # Additional styles
└── index.css              # Tailwind CSS imports
```

## 🎯 Features chi tiết

### Sidebar
- Logo Spotify
- Navigation menu (Home, Search, Library)
- Create Playlist button
- Playlists list với scroll
- Install App button
- Mobile overlay support

### Main Content
- Dynamic greeting
- Recently played grid
- Featured playlists carousel
- Made for You section
- Sticky header với navigation controls
- User profile button

### Music Player
- Current track info với album art
- Play/Pause với visual feedback
- Previous/Next track controls
- Shuffle và Repeat modes
- Progress bar với time display
- Volume control với mute
- Additional controls (Queue, Devices, etc.)

## 🔧 Customization

Bạn có thể customize:
- **Colors**: Update `tailwind.config.js` để thay đổi color scheme
- **Layout**: Modify component layouts trong các file component
- **Data**: Update playlists và tracks data trong components
- **Icons**: Thay thế SVG icons với icon library khác

## 📄 License

MIT License - Xem file LICENSE để biết thêm chi tiết.
