import React, { useState, useRef, useEffect, useCallback } from 'react';

const MusicPlayer = ({ 
  currentSong, 
  isPlaying, 
  onPlay, 
  onPause, 
  onNext, 
  onPrevious,
  onSeek,
  currentTime,
  duration,
  volume,
  onVolumeChange,
  isMuted,
  onToggleMute,
  isShuffled,
  onToggleShuffle,
  repeatMode,
  onToggleRepeat,
  likedSongs,
  onToggleLike
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [imageErrors, setImageErrors] = useState(new Set());
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  
  const progressBarRef = useRef(null);

  // Check if currentSong is liked
  const isLiked = currentSong && likedSongs && likedSongs.some(s => s.src === currentSong.src);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT') return;
      
      switch (e.key) {
        case ' ':
          e.preventDefault();
          isPlaying ? onPause() : onPlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          onPrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          onNext();
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, onPlay, onPause, onPrevious, onNext]);

  // Cleanup function để tránh memory leaks
  useEffect(() => {
    return () => {
      setIsDragging(false);
    };
  }, []);

  // Handler cho lỗi hình ảnh
  const handleImageError = (songSrc, e) => {
    if (e?.target) {
      setImageErrors(prev => new Set([...prev, songSrc]));
      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjNDA0MDQwIi8+Cjx0ZXh0IHg9IjIwIiB5PSIyNSIgZm9udC1mYW1pbHk9InN5c3RlbS11aSIgZm9udC1zaXplPSIyMCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+8J+OtTwvdGV4dD4KPHN2Zz4=';
    }
  };

  // Reset image errors khi song thay đổi
  useEffect(() => {
    if (currentSong?.src) {
      setImageErrors(prev => {
        const newSet = new Set(prev);
        newSet.delete(currentSong.src);
        return newSet;
      });
    }
  }, [currentSong?.src]);

  const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = useCallback((e) => {
    if (!onSeek) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newTime = (clickX / width) * duration;
    onSeek(newTime);
  }, [duration, onSeek]);

  const handleProgressMouseDown = (e) => {
    setIsDragging(true);
    handleProgressClick(e);
  };

  // Removed unused functions to fix ESLint warnings
  // const handleProgressMouseMove and handleProgressMouseUp were not being used



  const getRepeatIcon = () => {
    switch (repeatMode) {
      case 'one': return '🔂';
      case 'all': return '🔁';
      default: return '🔁';
    }
  };

  // Mouse event handlers for progress
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging && duration) {
        const rect = e.target.closest('[data-progress-bar]')?.getBoundingClientRect();
        if (rect) {
          const clickX = e.clientX - rect.left;
          const width = rect.width;
          const newTime = (clickX / width) * duration;
          onSeek && onSeek(newTime);
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, duration, onSeek]);

  if (!currentSong) {
    return (
      <div className="fixed bottom-0 right-0 md:left-64 bg-spotify-gray border-t-2 border-white z-40 md:z-50 pb-16 md:pb-4">
        <div className="flex items-center justify-center text-spotify-text-secondary">
          <span className="text-sm">Chọn bài hát để bắt đầu phát nhạc</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 right-0 md:left-64 bg-spotify-gray border-t-2 border-white z-40 md:z-50 pb-16 md:pb-0">
      {/* Progress Bar */}
      <div className="w-full h-1 bg-spotify-light-gray relative group cursor-pointer" onClick={handleProgressClick}>
        <div 
          className="h-full bg-spotify-green transition-all duration-150 ease-out relative"
          style={{ 
            width: `${duration && duration > 0 ? (currentTime / duration) * 100 : 0}%`
          }}
        >
          <div 
            className="
              absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2
              w-3 h-3 bg-white rounded-full shadow-md
              opacity-0 group-hover:opacity-100 transition-opacity duration-200
            "
          ></div>
        </div>
        <div 
          ref={progressBarRef}
          className="absolute inset-0 cursor-pointer"
          onMouseDown={handleProgressMouseDown}
        ></div>
              </div>

      {/* Mobile Layout */}
      <div className="block sm:hidden pb-16">
        {/* Mobile Player - Compact Layout */}
        <div className="flex items-center justify-between p-3">
          {/* Song Info */}
          <div className="flex items-center space-x-3 flex-1 min-w-0 mr-3">
            <div className="w-12 h-12 bg-spotify-light-gray rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
              {currentSong?.cover && !imageErrors.has(currentSong.src) ? (
                <img
                  key={`mobile-${currentSong.src}`}
                  src={currentSong.cover}
                  alt={currentSong.title || 'Song cover'}
                  className="w-full h-full object-cover"
                  onError={(e) => handleImageError(currentSong.src, e)}
                  loading="lazy"
                />
              ) : (
                <span className="text-spotify-text-secondary text-lg">🎵</span>
              )}
            </div>
            
            <div className="min-w-0 flex-1">
              <h4 className="text-white font-medium text-sm truncate leading-normal">
                {currentSong?.title || 'Không có bài hát'}
              </h4>
              <p className="text-spotify-text-secondary text-xs truncate leading-normal">
                {currentSong?.artist || 'Không có nghệ sĩ'}
              </p>
            </div>
          </div>

          {/* Mobile Controls */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onPrevious}
              className="w-10 h-10 flex items-center justify-center text-spotify-text-secondary hover:text-white transition-colors duration-200"
            >
              <span className="text-lg">⏮</span>
            </button>

            <button
              onClick={isPlaying ? onPause : onPlay}
              className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform duration-200 shadow-md"
            >
              <span className="text-black text-xl ml-0.5">
                {isPlaying ? '⏸' : '▶'}
              </span>
            </button>

            <button
              onClick={onNext}
              className="w-10 h-10 flex items-center justify-center text-spotify-text-secondary hover:text-white transition-colors duration-200"
            >
              <span className="text-lg">⏭</span>
            </button>
          </div>
        </div>

        {/* Mobile Time Display */}
        <div className="px-3 pb-3">
          <div className="flex justify-between text-xs text-spotify-text-secondary">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden sm:block">
        {/* Main Player */}
        <div className="grid grid-cols-3 items-center p-4 h-[90px]">
          {/* Left: Song Info */}
          <div className="flex items-center space-x-4 min-w-0">
            {currentSong && (
              <>
                <div className="w-14 h-14 bg-spotify-light-gray rounded-lg overflow-hidden flex-shrink-0 group flex items-center justify-center">
                  {currentSong.cover && !imageErrors.has(currentSong.src) ? (
                    <img
                      key={`desktop-${currentSong.src}`}
                      src={currentSong.cover}
                      alt={currentSong.title || 'Song cover'}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      onError={(e) => handleImageError(currentSong.src, e)}
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-spotify-text-secondary text-lg">🎵</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-white font-medium text-sm line-clamp-1 hover:underline cursor-pointer">
                    {currentSong.title || 'Không có bài hát'}
                  </h4>
                  <p className="text-spotify-text-secondary text-xs line-clamp-1 hover:underline cursor-pointer hover:text-white transition-colors">
                    {currentSong.artist || 'Không có nghệ sĩ'}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Center: Playback Controls */}
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="flex items-center space-x-4">
              <button 
                onClick={onToggleShuffle}
                className={`w-8 h-8 flex items-center justify-center text-spotify-text-secondary hover:text-white transition-colors ${isShuffled ? 'text-spotify-green' : ''}`}
                aria-label="Shuffle"
              >
                <span className="text-lg">🔀</span>
              </button>

              <button 
                onClick={onPrevious} 
                className="w-10 h-10 flex items-center justify-center text-spotify-text-secondary hover:text-white transition-colors"
                aria-label="Previous"
              >
                <span className="text-xl">⏮</span>
              </button>

              <button 
                onClick={isPlaying ? onPause : onPlay}
                className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-md"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                <span className="text-black text-2xl ml-0.5">
                  {isPlaying ? '⏸' : '▶'}
                </span>
              </button>

              <button 
                onClick={onNext} 
                className="w-10 h-10 flex items-center justify-center text-spotify-text-secondary hover:text-white transition-colors"
                aria-label="Next"
              >
                <span className="text-xl">⏭</span>
              </button>

              <button 
                onClick={onToggleRepeat}
                className={`w-8 h-8 flex items-center justify-center text-spotify-text-secondary hover:text-white transition-colors ${repeatMode !== 'off' ? 'text-spotify-green' : ''}`}
                aria-label="Repeat"
              >
                <span className="text-lg">{getRepeatIcon()}</span>
              </button>
            </div>
            
            {/* Desktop Time Display */}
            <div className="flex items-center space-x-2 text-xs text-spotify-text-secondary w-full max-w-lg">
              <span>{formatTime(currentTime)}</span>
              <div 
                className="flex-1 h-1 bg-spotify-light-gray rounded-full cursor-pointer"
                onMouseDown={handleProgressMouseDown}
                data-progress-bar
              >
                <div 
                  className="h-full bg-white rounded-full transition-all duration-150 ease-out"
                  style={{ width: `${duration && duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                ></div>
              </div>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
          
          {/* Right: Volume & Other Controls */}
          <div className="flex items-center justify-end space-x-4">
            <button 
              onClick={() => onToggleLike(currentSong)}
              className="w-8 h-8 flex items-center justify-center text-spotify-text-secondary hover:text-white transition-colors"
              aria-label="Like"
            >
              <span className={`text-lg ${isLiked ? 'text-spotify-green' : ''}`}>💚</span>
            </button>
            
                        {/* Volume Control với hover popup */}
            <div 
              className="relative flex items-center"
              onMouseEnter={() => setShowVolumeSlider(true)}
              onMouseLeave={() => setShowVolumeSlider(false)}
            >
              <button 
                onClick={onToggleMute}
                className="w-8 h-8 flex items-center justify-center text-spotify-text-secondary hover:text-white transition-colors"
                aria-label="Mute"
              >
                <span className="text-lg">{isMuted || volume === 0 ? '🔇' : '🔊'}</span>
              </button>
              
              {/* Volume Slider Popup - chỉ hiện khi hover */}
              {showVolumeSlider && (
                <div 
                  className="absolute bottom-full right-0 mb-2 bg-spotify-gray rounded-lg p-3 shadow-xl z-30"
                  onMouseEnter={() => setShowVolumeSlider(true)}
                  onMouseLeave={() => setShowVolumeSlider(false)}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <div 
                      className="w-1 h-20 bg-spotify-light-gray rounded-full cursor-pointer relative"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const clickY = e.clientY - rect.top;
                        const height = rect.height;
                        const newVolume = Math.max(0, Math.min(1, 1 - (clickY / height))); // Đảo ngược: top = 100%, bottom = 0%
                        onVolumeChange(newVolume);
                        if (newVolume > 0 && isMuted) {
                          onToggleMute();
                        }
                      }}
                    >
                      {/* Volume track filled */}
                      <div 
                        className="absolute bottom-0 w-full bg-spotify-green rounded-full transition-all duration-150"
                        style={{ height: `${isMuted ? 0 : volume * 100}%` }}
                      ></div>
                      
                      {/* Volume knob */}
                      <div 
                        className="absolute w-3 h-3 bg-white rounded-full shadow-md transform -translate-x-1/2 left-1/2 transition-all duration-150 hover:scale-110 border border-spotify-green"
                        style={{ 
                          bottom: `${(isMuted ? 0 : volume * 100)}%`,
                          transform: 'translateX(-50%) translateY(50%)'
                        }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-400">{Math.round((isMuted ? 0 : volume) * 100)}%</span>
                  </div>
                  
                  {/* Mũi tên chỉ xuống */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                    <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-spotify-gray"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer; 