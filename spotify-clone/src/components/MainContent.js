import React, { useState, useEffect } from 'react';
import SearchResults from './SearchResults';
import MyMusic from './MyMusic';
import UploadMusic from './UploadMusic';
import SearchService from '../services/searchService';
import useDebounce from '../hooks/useDebounce';
import CreatePlaylistModal from './CreatePlaylistModal';
import HomeView from './HomeView';
import { useAuth } from '../contexts/AuthContext';

const MainContent = ({ 
  currentView, 
  setCurrentView,
  playlist,
  onSongSelect, 
  currentSong,
  likedSongs, 
  onToggleLike,
  userPlaylists,
  handleCreatePlaylist,
  handleDeletePlaylist,
  recentlyPlayed,
  onOpenLogin,
  onAddSong
}) => {
  const [headerSearchValue, setHeaderSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState({ songs: [], artists: [], playlists: [], total: 0 });
  const [isSearching, setIsSearching] = useState(false);
  const [imageErrors, setImageErrors] = useState(new Set());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  
  const debouncedSearchQuery = useDebounce(headerSearchValue, 300);

  // Cleanup function để tránh memory leaks
  useEffect(() => {
    return () => {
      setHeaderSearchValue('');
      setSearchResults({ songs: [], artists: [], playlists: [], total: 0 });
      setIsSearching(false);
    };
  }, []);

  // Handler cho lỗi hình ảnh
  const handleImageError = (songSrc, e) => {
    if (e?.target) {
      setImageErrors(prev => new Set([...prev, songSrc]));
      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjNDA0MDQwIi8+Cjx0ZXh0IHg9IjIwIiB5PSIyNSIgZm9udC1mYW1pbHk9InN5c3RlbS11aSIgZm9udC1zaXplPSIyMCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+8J+OtTwvdGV4dD4KPHN2Zz4=';
    }
  };

  // Effect to perform search when debounced query changes
  useEffect(() => {
    if (currentView !== 'search') return;

    const performSearch = async () => {
      if (!debouncedSearchQuery) {
        setSearchResults({ songs: [], artists: [], playlists: [] });
        return;
      }
      
      setIsSearching(true);
      try {
        const results = await SearchService.searchAll(debouncedSearchQuery);
        setSearchResults(results);
      } catch (error) {
        console.error("Error performing search:", error);
        setSearchResults({ songs: [], artists: [], playlists: [], total: 0 });
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();
  }, [debouncedSearchQuery, currentView]);

  const handleHeaderSearch = (e) => {
    const value = e.target.value;
    setHeaderSearchValue(value);
    
    // If user types something, automatically switch to search view
    if (value.length > 0 && currentView !== 'search') {
      if (setCurrentView) {
        setCurrentView('search');
      }
    }
  };

  const handleHeaderSearchKeyPress = (e) => {
    if (e.key === 'Enter' && headerSearchValue.length > 0) {
      // Instantly trigger search on Enter, no need to wait for debounce
      const performSearch = async () => {
        setIsSearching(true);
        try {
          const results = await SearchService.searchAll(headerSearchValue);
          setSearchResults(results);
        } catch (error) {
          console.error("Error performing search:", error);
          setSearchResults({ songs: [], artists: [], playlists: [], total: 0 });
        } finally {
          setIsSearching(false);
        }
      };
      if (currentView !== 'search') {
        setCurrentView('search');
      }
      performSearch();
    }
  };

  const renderHomeView = () => (
    <HomeView
      playlist={playlist}
      onSongSelect={onSongSelect}
      currentSong={currentSong}
      likedSongs={likedSongs}
      onToggleLike={onToggleLike}
      setCurrentView={setCurrentView}
    />
  );

  const renderSearchView = () => (
    <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
      {isSearching ? (
        <div className="animate-spin w-12 h-12 border-4 border-spotify-green border-t-transparent rounded-full"></div>
      ) : searchResults && (searchResults.songs?.length > 0 || searchResults.artists?.length > 0 || searchResults.playlists?.length > 0) ? (
        <SearchResults 
          results={searchResults} 
          onSongSelect={onSongSelect} 
          currentSong={currentSong} 
          likedSongs={likedSongs}
          onToggleLike={onToggleLike}
        />
      ) : (
        <div className="text-center">
          <div className="w-32 h-32 bg-spotify-light-gray rounded-full flex items-center justify-center mb-6 mx-auto">
            <span className="text-5xl">🎵</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Tìm kiếm nhạc yêu thích</h2>
          <p className="text-spotify-text-secondary">Nhập tên bài hát, nghệ sĩ hoặc album để bắt đầu</p>
        </div>
      )}
    </div>
  );

  const renderLibraryView = () => (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Library Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Thư viện của bạn</h1>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-spotify-green text-black font-semibold rounded-full hover:bg-spotify-green/90 transition-colors"
        >
          Tạo mới
        </button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div 
          className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg p-4 cursor-pointer hover:scale-105 transition-transform"
          onClick={() => setCurrentView('liked-songs')}
        >
          <div className="text-2xl mb-2">❤️</div>
          <h3 className="text-white font-semibold">Bài hát đã thích</h3>
          <p className="text-white/80 text-sm">{likedSongs?.length || 0} bài hát</p>
        </div>
        <div 
          className="bg-gradient-to-br from-green-600 to-green-800 rounded-lg p-4 cursor-pointer hover:scale-105 transition-transform"
          onClick={() => setCurrentView('my-music')}
        >
          <div className="text-2xl mb-2">🎵</div>
          <h3 className="text-white font-semibold">Nhạc của tôi</h3>
          <p className="text-white/80 text-sm">{playlist?.length || 0} bài hát</p>
        </div>
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg p-4 cursor-pointer hover:scale-105 transition-transform">
          <div className="text-2xl mb-2">📻</div>
          <h3 className="text-white font-semibold">Podcast</h3>
          <p className="text-white/80 text-sm">5 episodes</p>
        </div>
        <div className="bg-gradient-to-br from-orange-600 to-orange-800 rounded-lg p-4 cursor-pointer hover:scale-105 transition-transform">
          <div className="text-2xl mb-2">📱</div>
          <h3 className="text-white font-semibold">Đã tải xuống</h3>
          <p className="text-white/80 text-sm">15 bài hát</p>
        </div>
      </div>

      {/* Recently Created */}
      <section>
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Tạo gần đây</h2>
        <div className="grid gap-3">
          {userPlaylists.length > 0 ? (
            userPlaylists.map((item) => (
              <div key={item.id} className="flex items-center p-3 pr-2 rounded-lg hover:bg-spotify-light-gray transition-colors cursor-pointer group">
                <img 
                  src={item.image}
                  alt={item.name}
                  className="w-12 h-12 rounded-md mr-4 object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium truncate">{item.name}</h3>
                  <p className="text-spotify-text-secondary text-sm truncate">{item.type} • {item.owner}</p>
                </div>
                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePlaylist(item.id);
                    }}
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/20"
                    aria-label="Xóa playlist"
                  >
                    <span role="img" aria-label="Xóa">🗑️</span>
                  </button>
                  <button className="w-8 h-8 bg-spotify-green rounded-full flex items-center justify-center ml-2">
                    <span className="text-black text-sm">▶</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-spotify-text-secondary px-3">Bạn chưa tạo playlist nào.</p>
          )}
        </div>
      </section>

      {/* Made by You */}
      <section>
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Do bạn tạo</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-spotify-light-gray rounded-lg p-4 hover:bg-spotify-light-gray/80 transition-colors cursor-pointer group">
              <div className="relative mb-3">
                <img 
                  src={`https://picsum.photos/200/200?random=${i + 10}`}
                  alt="Playlist"
                  className="w-full aspect-square object-cover rounded-md shadow-spotify-md"
                />
                <button className="absolute bottom-2 right-2 w-8 h-8 bg-spotify-green rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                  <span className="text-black text-sm">▶</span>
                </button>
              </div>
              <h3 className="text-white font-semibold mb-1 text-sm truncate">My Playlist #{i}</h3>
              <p className="text-spotify-text-secondary text-xs truncate">Bởi bạn • {Math.floor(Math.random() * 20) + 5} bài hát</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );

  const renderLikedSongsView = () => (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end space-y-4 sm:space-y-0 sm:space-x-6 p-4 sm:p-6 bg-gradient-to-b from-purple-600/20 to-transparent rounded-lg">
        <div className="w-48 h-48 sm:w-56 sm:h-56 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center shadow-2xl flex-shrink-0">
          <span className="text-6xl sm:text-8xl">💚</span>
        </div>
        <div className="min-w-0 flex-1 text-center sm:text-left">
          <p className="text-sm text-white/80 mb-2">PLAYLIST</p>
          <h1 className="text-4xl sm:text-6xl font-bold text-white">Bài hát đã thích</h1>
          <p className="text-white/80 mt-2">{likedSongs.length} bài hát</p>
        </div>
      </div>
      <MyMusic 
        onSongSelect={onSongSelect} 
        currentSong={currentSong} 
        likedSongs={likedSongs} 
        onToggleLike={onToggleLike} 
        songsToShow={likedSongs}
        isLikedSongsView={true}
      />
    </div>
  );

  const renderMyMusicView = () => {
    // Show ALL songs from playlist (both default and uploaded)
    const songsToDisplay = playlist || [];
    const uploadedSongs = playlist.filter(song => song.isLocal);
    
    // Debug logging
    console.log('🎵 MainContent renderMyMusicView Debug:', {
      totalPlaylist: playlist.length,
      uploadedSongs: uploadedSongs.length,
      songsToDisplay: songsToDisplay.length,
      playlistSamples: playlist.slice(0, 2).map(s => ({ title: s.title, isLocal: s.isLocal }))
    });
    
    return (
      <MyMusic 
        onSongSelect={onSongSelect} 
        currentSong={currentSong} 
        likedSongs={likedSongs} 
        onToggleLike={onToggleLike} 
        songsToShow={songsToDisplay}
        isLikedSongsView={false}
      />
    );
  };

  const renderRecentlyPlayedView = () => (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Recently Played Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Đã chơi gần đây</h1>
          <p className="text-spotify-text-secondary">
            {recentlyPlayed?.length || 0} bài hát đã phát
          </p>
        </div>
        <div className="text-4xl">🕒</div>
      </div>

      {/* Recently Played Songs */}
      {recentlyPlayed && recentlyPlayed.length > 0 ? (
        <div className="space-y-2">
          {recentlyPlayed.map((song, index) => {
            const isCurrentSong = currentSong && currentSong.src === song.src;
            const isLiked = likedSongs?.some(s => s.src === song.src);
            const playedDate = new Date(song.playedAt);
            const timeAgo = getTimeAgo(playedDate);

            return (
              <div
                key={`recently-${song.src || song.id || index}-${song.playedAt}`}
                className={`flex items-center p-4 hover:bg-spotify-light-gray rounded-lg transition-colors cursor-pointer ${
                  isCurrentSong ? 'bg-spotify-light-gray/30' : ''
                }`}
                onClick={() => onSongSelect(song)}
              >
                {/* Song Image */}
                <div className="w-12 h-12 bg-spotify-light-gray rounded-lg overflow-hidden mr-4 flex-shrink-0 flex items-center justify-center">
                  {song.cover && !imageErrors.has(song.src) ? (
                    <img
                      key={`recently-${song.src}`}
                      src={song.cover}
                      alt={song.title || 'Song cover'}
                      className="w-full h-full object-cover"
                      onError={(e) => handleImageError(song.src, e)}
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-spotify-text-secondary text-lg">🎵</span>
                  )}
                </div>

                {/* Song Info */}
                <div className="flex-1 min-w-0">
                  <h3 className={`font-medium truncate ${isCurrentSong ? 'text-spotify-green' : 'text-white'}`}>
                    {song.title || 'Không có tên'}
                  </h3>
                  <p className="text-spotify-text-secondary text-sm truncate">
                    {song.artist || 'Không có nghệ sĩ'}
                  </p>
                </div>

                {/* Time Ago */}
                <div className="text-spotify-text-secondary text-sm mr-4">
                  {timeAgo}
                </div>

                {/* Like Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleLike(song);
                  }}
                  className="w-8 h-8 flex items-center justify-center text-spotify-text-secondary hover:text-white transition-colors mr-2"
                >
                  <span className={`text-lg ${isLiked ? 'text-spotify-green' : ''}`}>💚</span>
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-32 h-32 bg-spotify-light-gray rounded-full flex items-center justify-center mb-6 mx-auto">
            <span className="text-5xl">🕒</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Chưa có bài hát nào</h2>
          <p className="text-spotify-text-secondary">
            Bắt đầu nghe nhạc để xem lịch sử phát của bạn ở đây
          </p>
        </div>
      )}
    </div>
  );

  // Helper function to calculate time ago
  const getTimeAgo = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Vừa xong';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  const renderUploadView = () => (
    <UploadMusic onAddSong={onAddSong} />
  );

  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return renderHomeView();
      case 'search':
        return renderSearchView();
      case 'library':
        return renderLibraryView();
      case 'my-music':
        return renderMyMusicView();
      case 'liked-songs':
        return renderLikedSongsView();
      case 'recently-played':
        return renderRecentlyPlayedView();
      case 'upload':
        return renderUploadView();
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 bg-gradient-to-b from-spotify-dark-gray to-spotify-black min-h-screen overflow-hidden">
      
      <CreatePlaylistModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={(playlistName) => {
          handleCreatePlaylist(playlistName);
          setIsCreateModalOpen(false);
        }}
      />
      
      {/* Header with gradient overlay - Hidden on upload page */}
      {currentView !== 'upload' && (
        <div className="sticky top-0 z-40 bg-gradient-to-b from-spotify-dark-gray/95 to-transparent backdrop-blur-sm">
        <div className="p-4 sm:p-6 pb-2">
          {/* Mobile Header Layout */}
          <div className="flex md:hidden items-center justify-between mb-4 mobile-header px-1">
            <div className="flex-1 max-w-[calc(100%-70px)] min-w-0 mr-3">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none search-icon">
                  <span className="text-gray-400 text-sm">🔍</span>
                </div>
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={headerSearchValue}
                  onChange={handleHeaderSearch}
                  onKeyPress={handleHeaderSearchKeyPress}
                  className="mobile-search-input w-full"
                />
              </div>
            </div>
            <div className="flex-shrink-0">
              {isAuthenticated ? (
                <div className="w-10 h-10 bg-spotify-green rounded-full flex items-center justify-center overflow-hidden">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-black font-bold text-base">
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              ) : (
                <button
                  onClick={onOpenLogin}
                  className="px-3 py-1.5 bg-spotify-green text-black font-semibold rounded-full text-sm hover:bg-spotify-green-hover transition-colors"
                >
                  Đăng nhập
                </button>
              )}
            </div>
          </div>

          {/* Desktop Header Layout */}
          <div className="hidden md:flex items-center justify-between">
            {/* Left side - Empty for spacing */}
            <div className="flex-1"></div>
            
            {/* Center - Search Input */}
            <div className="flex-1 max-w-lg mx-8">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400 text-sm">🔍</span>
                </div>
                <input
                  type="text"
                  placeholder="Tìm kiếm bài hát, nghệ sĩ, album..."
                  value={headerSearchValue}
                  onChange={handleHeaderSearch}
                  onKeyPress={handleHeaderSearchKeyPress}
                  className="
                    w-full bg-white/10 backdrop-blur-sm text-white placeholder-gray-400
                    pl-10 pr-4 py-2 rounded-full text-sm
                    border border-white/20 hover:border-white/40 focus:border-white/60
                    focus:outline-none focus:ring-2 focus:ring-spotify-green/50
                    transition-all duration-200
                  "
                />
              </div>
            </div>
            
            {/* Right side - User controls */}
            <div className="flex-1 flex items-center justify-end space-x-4">
              {isAuthenticated ? (
                <>
                  <button className="px-4 py-2 bg-transparent border border-spotify-light text-white font-semibold rounded-full transition-all duration-200 hover:border-white hover:scale-105">
                    Nâng cấp
                  </button>
                  <div className="relative group">
                    <div className="w-8 h-8 bg-spotify-green rounded-full flex items-center justify-center overflow-hidden cursor-pointer">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-black font-bold text-sm">
                          {user.name?.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    {/* Dropdown menu */}
                    <div className="absolute right-0 top-full mt-2 w-48 bg-spotify-gray rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="p-2">
                        <div className="px-3 py-2 text-white text-sm font-medium border-b border-spotify-lighter-gray">
                          {user.name}
                        </div>
                        <button 
                          onClick={logout}
                          className="w-full text-left px-3 py-2 text-spotify-text-secondary hover:text-white text-sm transition-colors rounded"
                        >
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <button 
                    onClick={onOpenLogin} 
                    className="px-4 py-2 bg-transparent border border-spotify-light text-white font-semibold rounded-full transition-all duration-200 hover:border-white hover:scale-105"
                  >
                    Đăng nhập
                  </button>
                  <button
                    onClick={onOpenLogin}
                    className="px-4 py-2 bg-spotify-green text-black font-semibold rounded-full transition-all duration-200 hover:bg-spotify-green-hover hover:scale-105"
                  >
                    Đăng ký
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        </div>
      )}
      
      {/* Main Content with Scrolling */}
      <div className={`px-4 sm:px-6 pb-32 md:pb-24 overflow-y-auto custom-scrollbar ${
        currentView === 'upload' 
          ? 'h-screen' 
          : 'h-[calc(100vh-80px)] sm:h-[calc(100vh-64px)]'
      }`}>
        {currentView === 'home' && renderHomeView()}
        {currentView === 'search' && renderSearchView()}
        {currentView === 'library' && renderLibraryView()}
        {currentView === 'my-music' && renderMyMusicView()}
        {currentView === 'liked-songs' && renderLikedSongsView()}
        {currentView === 'recently-played' && renderRecentlyPlayedView()}
        {currentView === 'upload' && renderUploadView()}
      </div>
    </div>
  );
};

export default MainContent; 