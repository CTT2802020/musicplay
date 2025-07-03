import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = ({ currentView, setCurrentView, likedSongs, onSongSelect, onOpenLogin }) => {
  const { user, isAuthenticated } = useAuth();

  const menuItems = [
    {
      id: 'home',
      label: 'Trang chủ',
      icon: '🏠',
      active: currentView === 'home'
    },
    {
      id: 'search',
      label: 'Tìm kiếm',
      icon: '🔍',
      active: currentView === 'search'
    },
    {
      id: 'library',
      label: 'Thư viện',
      icon: '📚',
      active: currentView === 'library'
    },
    {
      id: 'my-music',
      label: 'Nhạc của tôi',
      icon: '🎵',
      active: currentView === 'my-music'
    }
  ];

  const quickAccessPlaylists = [
    { name: 'Đã chơi gần đây', icon: '🕒', action: 'recently-played' },
    { name: 'Made For You', icon: '✨', action: null },
    { name: 'Discover Weekly', icon: '🎵', action: null },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 bg-spotify-black h-full flex-col border-r border-spotify-gray">
        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Logo Section */}
          <div className="p-6 border-b border-spotify-gray">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-spotify-green rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-sm">S</span>
              </div>
              <h1 className="font-display text-xl font-bold text-white">
                Spotify
              </h1>
            </div>
          </div>

          {/* Main Navigation */}
          <nav className="px-4 py-4 space-y-1">
            {[...menuItems, {
              id: 'upload',
              label: 'Upload nhạc',
              icon: '⬆️',
              active: currentView === 'upload'
            }].map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`
                  w-full flex items-center space-x-4 px-4 py-3 rounded-lg
                  transition-all duration-200 ease-spotify group
                  ${item.active 
                    ? 'bg-spotify-gray text-white shadow-md' 
                    : 'text-spotify-text-secondary hover:text-white hover:bg-spotify-gray/50'
                  }
                `}
              >
                <span className="text-lg transition-transform duration-200 group-hover:scale-110">
                  {item.icon}
                </span>
                <span className="font-medium text-sm tracking-wide sidebar-text">
                  {item.label}
                </span>
              </button>
            ))}
          </nav>

          {/* Divider */}
          <div className="mx-4 h-px bg-spotify-gray my-4"></div>

          {/* Quick Access Section */}
          <div className="px-4 flex-1">
            <h3 className="text-spotify-text-secondary text-xs font-semibold uppercase tracking-wider mb-2 px-4">
              Truy cập nhanh
            </h3>
            <div className="space-y-1">
              {/* Liked Songs Section */}
              <div
                onClick={() => setCurrentView('liked-songs')}
                className="flex items-center space-x-3 px-4 py-2 rounded-lg text-spotify-text-secondary hover:text-white hover:bg-spotify-gray/30 cursor-pointer transition-all duration-200 ease-spotify group"
              >
                <span className={`text-sm transition-transform duration-200 group-hover:scale-110 ${likedSongs?.length > 0 ? 'text-spotify-green' : ''}`}>
                  💚
                </span>
                <span className="text-sm font-medium line-clamp-1 sidebar-text">
                  Bài hát yêu thích
                </span>
              </div>

              {/* Other Quick Access Playlists */}
              {quickAccessPlaylists.map((playlist, index) => (
                <div
                  key={index}
                  onClick={() => playlist.action && setCurrentView(playlist.action)}
                  className={`flex items-center space-x-3 px-4 py-2 rounded-lg text-spotify-text-secondary hover:text-white hover:bg-spotify-gray/30 transition-all duration-200 ease-spotify group ${playlist.action ? 'cursor-pointer' : 'cursor-default opacity-60'}`}
                >
                  <span className="text-sm transition-transform duration-200 group-hover:scale-110">{playlist.icon}</span>
                  <span className="text-sm font-medium line-clamp-1 sidebar-text">{playlist.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fixed Bottom User Profile Section */}
        <div className="p-4 border-t-2 border-white flex-shrink-0">
          {isAuthenticated ? (
            <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-spotify-gray/30 transition-colors duration-200 cursor-pointer group">
              <div className="w-8 h-8 bg-gradient-to-br from-spotify-green to-spotify-green-dark rounded-full flex items-center justify-center overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-black text-xs font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 sidebar-text">
                <p className="text-white text-sm font-medium truncate">{user.name}</p>
                <p className="text-spotify-text-secondary text-xs">Phần thưởng</p>
              </div>
              <div className="w-2 h-2 bg-spotify-green rounded-full animate-pulse"></div>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={onOpenLogin}
                className="w-full bg-spotify-green text-black font-bold py-2.5 rounded-full hover:bg-spotify-green-hover transition-colors"
              >
                Đăng nhập
              </button>
              <p className="text-spotify-text-secondary text-xs text-center">
                Đăng nhập để lưu nhạc yêu thích
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-spotify-black/90 backdrop-blur-md border-t border-spotify-gray z-50">
        <nav className="flex justify-around items-center py-3">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`
                flex flex-col items-center justify-center p-2 rounded-lg min-w-0 flex-1
                transition-all duration-200
                ${item.active 
                  ? 'text-spotify-green' 
                  : 'text-spotify-text-secondary hover:text-white'
                }
              `}
            >
              <span className="text-xl mb-1">
                {item.icon}
              </span>
              <span className="text-xs font-medium truncate max-w-full">
                {item.label}
              </span>
            </button>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar; 