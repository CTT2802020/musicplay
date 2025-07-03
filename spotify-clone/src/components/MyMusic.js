import React, { useState, useEffect, useRef } from 'react';

const MyMusic = ({ onSongSelect, currentSong, likedSongs, onToggleLike, songsToShow, searchTerm = '', isLikedSongsView = false }) => {
  const [visibleSongs, setVisibleSongs] = useState(20);
  const loadMoreRef = useRef(null);
  const [imageErrors, setImageErrors] = useState(new Set());

  // Fallback for songsToShow if it's undefined
  const displaySongs = songsToShow && songsToShow.length > 0 ? songsToShow : (likedSongs || []);

  // Debug logging
  console.log('🎵 MyMusic Debug:', {
    songsToShow: songsToShow?.length || 0,
    likedSongs: likedSongs?.length || 0, 
    displaySongs: displaySongs.length,
    isLikedSongsView,
    samples: displaySongs.slice(0, 2).map(s => ({ title: s.title, isLocal: s.isLocal }))
  });

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const currentRef = loadMoreRef.current; // Copy ref to local variable
    if (!currentRef || displaySongs.length <= visibleSongs) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleSongs(prev => Math.min(prev + 20, displaySongs.length));
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(currentRef);

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [displaySongs.length, visibleSongs]);

  // Cleanup function để tránh memory leaks
  useEffect(() => {
    return () => {
      setImageErrors(new Set());
    };
  }, []);

  // Handler cho lỗi hình ảnh
  const handleImageError = (songSrc, e) => {
    if (e?.target) {
      setImageErrors(prev => new Set([...prev, songSrc]));
      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjNDA0MDQwIi8+Cjx0ZXh0IHg9IjIwIiB5PSIyNSIgZm9udC1mYW1pbHk9InN5c3RlbS11aSIgZm9udC1zaXplPSIyMCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+8J+OtTwvdGV4dD4KPHN2Zz4=';
    }
  };



  if (!displaySongs.length) {
    // This specific message is for the "Liked Songs" page
    if (likedSongs !== undefined && songsToShow === likedSongs) {
      return (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center">
          <div className="w-32 h-32 bg-spotify-light-gray rounded-full flex items-center justify-center mb-6">
            <span className="text-5xl">🎵</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Bài hát bạn thích sẽ xuất hiện ở đây</h2>
          <p className="text-spotify-text-secondary">Lưu bài hát bằng cách nhấp vào biểu tượng trái tim.</p>
        </div>
      );
    }
    
    // Generic "empty" message for other uses
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center">
        <div className="w-32 h-32 bg-spotify-light-gray rounded-full flex items-center justify-center mb-6">
          <span className="text-5xl">🎵</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Không có bài hát nào</h2>
        <p className="text-spotify-text-secondary">Thư viện của bạn trống.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            {isLikedSongsView ? 'Bài hát đã thích' : 'Nhạc của tôi'}
          </h1>
          <p className="text-gray-400">
            {displaySongs.length} {isLikedSongsView ? 'bài hát đã thích' : 'bài hát đã tải lên'}
          </p>
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-4">
          
          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder={isLikedSongsView ? "Tìm trong bài hát đã thích..." : "Tìm trong Nhạc của tôi..."}
              value={searchTerm}
              onChange={(e) => {
                // Handle search term change
              }}
              className="pl-10 pr-4 py-2 w-80 bg-spotify-dark-gray text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      </div>

      {/* Song Grid */}
      <div className="grid gap-4">
        {displaySongs.slice(0, visibleSongs).map((song, index) => (
          <div
            key={song.id || index}
            className={`group flex items-center p-4 rounded-lg hover:bg-spotify-light-gray transition-all cursor-pointer ${
              currentSong?.id === song.id ? 'bg-spotify-light-gray' : 'bg-spotify-gray'
            }`}
            onClick={() => onSongSelect(song)}
          >
            {/* Song Number/Play Button */}
            <div className="w-8 flex items-center justify-center mr-4">
              <span className="text-spotify-text-secondary group-hover:hidden">
                {index + 1}
              </span>
              <span className="text-white hidden group-hover:block">▶</span>
            </div>

            {/* Song Cover */}
            <div className="w-12 h-12 bg-spotify-light-gray rounded-lg overflow-hidden mr-4 flex-shrink-0 flex items-center justify-center">
              {song.cover && !imageErrors.has(song.src) ? (
                <img
                  key={`mymusic-${song.src}`}
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
                <div className="flex items-center space-x-2">
                  <h3 className={`font-medium truncate ${currentSong?.id === song.id ? 'text-spotify-green' : 'text-white'}`}>
                    {song.title || 'Không có tên'}
                  </h3>
                  {song.isLocal && (
                    <span className="px-2 py-0.5 bg-spotify-green text-black text-xs font-bold rounded-full flex-shrink-0">
                      UPLOADED
                    </span>
                  )}
                </div>
                <p className="text-spotify-text-secondary text-sm truncate">
                  {song.artist || 'Không có nghệ sĩ'}
                  {song.isLocal && song.fileName && (
                    <span className="ml-2 text-xs opacity-70">
                      • {song.fileName}
                    </span>
                  )}
                </p>
              </div>

            {/* Album (hidden on mobile) */}
            <div className="hidden md:block flex-1 max-w-xs px-4">
              <p className="text-spotify-text-secondary text-sm truncate">{song.album}</p>
            </div>

            {/* Duration */}
            <div className="text-spotify-text-secondary text-sm">{song.duration}</div>

            {/* Actions */}
            <div className="ml-4 flex items-center space-x-4 opacity-0 group-hover:opacity-100 transition-opacity">
              {isLikedSongsView ? (
                // Show trash can on Liked Songs page
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleLike(song);
                  }}
                  className="text-spotify-text-secondary hover:text-red-400 transition-colors"
                  aria-label="Xóa khỏi danh sách yêu thích"
                  title="Xóa khỏi danh sách yêu thích"
                >
                  🗑️
                </button>
              ) : (
                // Show heart icon on other pages
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleLike(song);
                  }}
                  className={`transition-colors duration-200 ${
                    likedSongs?.some(liked => liked.src === song.src)
                      ? 'text-spotify-green'
                      : 'text-spotify-text-secondary hover:text-white'
                  }`}
                  aria-label={likedSongs?.some(liked => liked.src === song.src) ? "Bỏ thích" : "Thích bài hát"}
                  title={likedSongs?.some(liked => liked.src === song.src) ? "Bỏ thích" : "Thích bài hát"}
                >
                  ♥
                </button>
              )}
              <button className="text-spotify-text-secondary hover:text-white transition-colors">
                ⋯
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Load More Trigger */}
      {displaySongs.length > visibleSongs && (
        <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-spotify-green border-t-transparent rounded-full"></div>
        </div>
      )}
    </div>
  );
};

export default MyMusic; 