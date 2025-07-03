import React, { useState, useRef, useEffect, useCallback } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import MusicPlayer from './components/MusicPlayer';
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function App() {
  const auth = useAuth();
  const [playlist, setPlaylist] = useState(() => {
    // Load initial playlist from demo data and localStorage
    const defaultPlaylist = [
      {
        title: 'Ôm Em Được Không',
        artist: 'Sơn Tùng M-TP',
        src: 'http://localhost:3002/mp3/om-em-duoc-khong.mp3',
        cover: 'https://i.ytimg.com/vi/D-A_x2_rR-g/maxresdefault.jpg'
      },
      {
        title: 'Phía Sau Một Cô Gái',
        artist: 'Soobin Hoàng Sơn',
        src: 'http://localhost:3002/mp3/phia-sau-mot-co-gai.mp3',
        cover: 'https://i.ytimg.com/vi/XM-p0c3Dygc/maxresdefault.jpg'
      },
      {
        title: 'Thiên Mệnh Quan',
        artist: 'Various Artists',
        src: 'http://localhost:3002/mp3/thien-menh-quan.mp3',
        cover: 'https://i.ytimg.com/vi/kFw8yPJ7jkE/maxresdefault.jpg'
      },
      {
        title: 'HARU HARU',
        artist: 'BIGBANG',
        src: 'http://localhost:3002/mp3/' + encodeURIComponent('y2mate.com - BIGBANG  HARU HARU하루하루 MV.mp3'),
        cover: 'https://i.ytimg.com/vi/MzCbEdtNbJ0/maxresdefault.jpg'
      },
      {
        title: 'Mất Kết Nối',
        artist: 'Dương Domic',
        src: 'http://localhost:3002/mp3/' + encodeURIComponent('y2mate.com - Dương Domic  Mất Kết Nối  EP Dữ Liệu Quý.mp3'),
        cover: 'https://i.ytimg.com/vi/YOrmCOqk8VY/maxresdefault.jpg'
      },
      {
        title: 'Hôm Nay Em Cưới Rồi',
        artist: 'Khải Đăng, Thanh Hưng',
        src: 'http://localhost:3002/mp3/' + encodeURIComponent('y2mate.com - Hôm Nay Em Cưới Rồi  Khải Đăng  Thanh Hưng  Live Version.mp3'),
        cover: 'https://i.ytimg.com/vi/x8LyWn_7yuc/maxresdefault.jpg'
      },
      {
        title: 'Waiting For You',
        artist: 'MONO',
        src: 'http://localhost:3002/mp3/' + encodeURIComponent('y2mate.com - MONO  Waiting For You Album 22  Track No10.mp3'),
        cover: 'https://i.ytimg.com/vi/0DaJKVMQWjE/maxresdefault.jpg'
      },
      {
        title: 'Thu Cuối',
        artist: 'MrT ft. Yanbi, Hằng BingBoong',
        src: 'http://localhost:3002/mp3/' + encodeURIComponent('y2mate.com - MrT  Thu Cuối ft  Yanbi  Hằng BingBoong Official MV.mp3'),
        cover: 'https://i.ytimg.com/vi/KzlQWAfloRs/maxresdefault.jpg'
      },
      {
        title: 'Mưa Rơi Lặng Thầm',
        artist: 'M4U Band',
        src: 'http://localhost:3002/mp3/' + encodeURIComponent('y2mate.com - Mưa Rơi Lặng Thầm  M4U Band  Official MV.mp3'),
        cover: 'https://i.ytimg.com/vi/uOBNwSdGC38/maxresdefault.jpg'
      },
      {
        title: 'Người Yêu Cũ',
        artist: 'Phan Mạnh Quỳnh',
        src: 'http://localhost:3002/mp3/' + encodeURIComponent('y2mate.com - Người Yêu Cũ  Phan Mạnh Quỳnh  Official Music Video  Mây Saigon.mp3'),
        cover: 'https://i.ytimg.com/vi/yVWn66BbOX8/maxresdefault.jpg'
      }
    ];

    try {
      // Load uploaded songs from localStorage
      const uploadedSongs = JSON.parse(localStorage.getItem('uploadedSongs') || '[]');
      
      // Filter out songs with invalid URLs (blob URLs after reload, null, undefined, empty)
      const validSongs = uploadedSongs.filter(song => {
        if (!song.src || song.src === 'null' || song.src === 'undefined') {
          console.warn('🚨 Found song with invalid src:', { title: song.title, src: song.src });
          return false;
        }
        if (song.isLocal && song.src && song.src.startsWith('blob:')) {
          // Blob URLs become invalid after page reload
          console.warn('🚨 Found invalid blob URL after reload:', song.title);
          return false;
        }
        if (song.src.includes('null') || song.src.includes('undefined')) {
          console.warn('🚨 Found song with null/undefined in URL:', { title: song.title, src: song.src });
          return false;
        }
        return true;
      });
      
      console.log('🎵 Loaded', validSongs.length, 'valid uploaded songs from localStorage');
      return [...defaultPlaylist, ...validSongs];
    } catch (error) {
      console.error('❌ Error loading uploaded songs:', error);
      return defaultPlaylist;
    }
  });

  // Save playlist to localStorage whenever it changes
  useEffect(() => {
    try {
      // Only save uploaded songs to localStorage
      const uploadedSongs = playlist.filter(song => song.isLocal);
      
      // Remove duplicates before saving
      const uniqueUploadedSongs = uploadedSongs.filter((song, index, self) => 
        index === self.findIndex(s => 
          s.fileName === song.fileName && 
          s.title.toLowerCase().trim() === song.title.toLowerCase().trim()
        )
      );
      
      localStorage.setItem('uploadedSongs', JSON.stringify(uniqueUploadedSongs));
      console.log('💾 Saved', uniqueUploadedSongs.length, 'unique uploaded songs to localStorage');
    } catch (error) {
      console.error('Error saving uploaded songs:', error);
    }
  }, [playlist]);

  // Cleanup duplicates function
  const cleanupDuplicates = () => {
    setPlaylist(prev => {
      const defaultSongs = prev.filter(song => !song.isLocal);
      const uploadedSongs = prev.filter(song => song.isLocal);
      
      // Remove duplicates from uploaded songs
      const uniqueUploadedSongs = uploadedSongs.filter((song, index, self) => 
        index === self.findIndex(s => 
          s.fileName === song.fileName && 
          s.title.toLowerCase().trim() === song.title.toLowerCase().trim()
        )
      );
      
      const removedCount = uploadedSongs.length - uniqueUploadedSongs.length;
      if (removedCount > 0) {
        console.log('🧹 Cleaned up', removedCount, 'duplicate songs');
      } else {
        console.log('✅ No duplicates found');
      }
      
      return [...defaultSongs, ...uniqueUploadedSongs];
    });
  };

  const [currentSong, setCurrentSong] = useState(() => {
    const defaultSong = {
      title: 'Ôm Em Được Không',
      artist: 'Sơn Tùng M-TP',
      src: '/mp3/om-em-duoc-khong.mp3',
      cover: 'https://i.ytimg.com/vi/D-A_x2_rR-g/maxresdefault.jpg'
    };
    return defaultSong;
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [currentView, setCurrentView] = useState('');
  const [repeatMode, setRepeatMode] = useState('off');
  const [likedSongs, setLikedSongs] = useState(() => {
    try {
      const savedLikedSongs = localStorage.getItem('likedSongs');
      return savedLikedSongs ? JSON.parse(savedLikedSongs) : [];
    } catch (error) {
      console.error("Could not parse liked songs from localStorage", error);
      return [];
    }
  });
  const [recentlyPlayed, setRecentlyPlayed] = useState(() => {
    try {
      const savedRecentlyPlayed = localStorage.getItem('recentlyPlayed');
      return savedRecentlyPlayed ? JSON.parse(savedRecentlyPlayed) : [];
    } catch (error) {
      console.error("Could not parse recently played from localStorage", error);
      return [];
    }
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [userPlaylists, setUserPlaylists] = useState(() => {
    try {
      const savedPlaylists = localStorage.getItem('userPlaylists');
      return savedPlaylists ? JSON.parse(savedPlaylists) : [];
    } catch (error) {
      console.error("Could not parse user playlists from localStorage", error);
      return [];
    }
  });

  const audioRef = useRef(null);
  const currentSongTrackedRef = useRef(null); // Track if current song has been added to recently played

  // Load uploaded songs from database on app start
  useEffect(() => {
    const loadUploadedSongs = async () => {
      try {
        const token = auth.token || localStorage.getItem('token');
        if (!token) {
          console.log('🔑 No token found, skipping uploaded songs fetch');
          return;
        }

        console.log('🎵 Loading uploaded songs from database...');
        const response = await fetch('http://localhost:3002/api/v1/upload/my-songs', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        if (result.success && result.data?.songs) {
          const uploadedSongs = result.data.songs
            .filter(song => song.audioUrl) // Only require audioUrl, not completed status
            .map(song => ({
              id: song._id,
              title: song.title,
              artist: song.artist,
              album: song.album || 'Single',
              src: song.audioUrl, // Use the processed audioUrl from database
              cover: song.coverImageUrl || 'https://via.placeholder.com/300x300/1DB954/ffffff?text=♪',
              isLocal: true,
              fileName: song.originalName,
              fileSize: song.fileSize,
              duration: song.duration ? `${Math.floor(song.duration / 60)}:${String(Math.floor(song.duration % 60)).padStart(2, '0')}` : '0:00',
              uploadedAt: song.createdAt,
              processingStatus: song.processingStatus,
              songId: song._id
            }));

          console.log('✅ Loaded', uploadedSongs.length, 'uploaded songs from database');
          
          // Add uploaded songs to playlist, avoiding duplicates
          setPlaylist(prev => {
            const defaultSongs = prev.filter(song => !song.isLocal);
            const existingSongIds = new Set(prev.filter(s => s.isLocal).map(s => s.songId || s.id));
            
            // Only add songs that don't already exist
            const newSongs = uploadedSongs.filter(song => !existingSongIds.has(song.id));
            
            if (newSongs.length > 0) {
              console.log('🎉 Added', newSongs.length, 'new songs from database');
            }
            
            return [...defaultSongs, ...newSongs];
          });
        }
      } catch (error) {
        console.error('❌ Error loading uploaded songs from database:', error);
      }
    };

    // Load uploaded songs after component mounts or when auth token changes
    loadUploadedSongs();
  }, [auth.token]); // Run when auth token changes

  // Save playlists to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('userPlaylists', JSON.stringify(userPlaylists));
    } catch (error) {
      console.error("Could not save user playlists to localStorage", error);
    }
  }, [userPlaylists]);

  // Save recently played to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('recentlyPlayed', JSON.stringify(recentlyPlayed));
    } catch (error) {
      console.error("Could not save recently played to localStorage", error);
    }
  }, [recentlyPlayed]);

  // Save liked songs to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('likedSongs', JSON.stringify(likedSongs));
      console.log('💾 Saved', likedSongs.length, 'liked songs to localStorage');
    } catch (error) {
      console.error("Could not save liked songs to localStorage", error);
    }
  }, [likedSongs]);

  // Add song to recently played
  const addToRecentlyPlayed = useCallback((song) => {
    if (!song || !song.src) return;
    
    setRecentlyPlayed(prev => {
      // Remove song if it already exists to avoid duplicates
      const filtered = prev.filter(s => s.src !== song.src);
      // Add song to the beginning with timestamp
      const songWithTimestamp = {
        ...song,
        playedAt: new Date().toISOString()
      };
      // Keep only last 50 songs
      return [songWithTimestamp, ...filtered].slice(0, 50);
    });
  }, []);

  const handleNext = useCallback((skipCount = 0) => {
    // Prevent infinite loop if all songs fail
    if (skipCount >= playlist.length) {
      console.error('All songs in playlist failed to play');
      setIsPlaying(false);
      return;
    }

    const currentIndex = playlist.findIndex(s => s.src === currentSong.src);
    if (currentIndex === -1) return;

    let nextIndex;
    if (isShuffled) {
      do {
        nextIndex = Math.floor(Math.random() * playlist.length);
      } while (nextIndex === currentIndex && playlist.length > 1);
    } else {
      nextIndex = (currentIndex + 1) % playlist.length;
    }

    const nextSong = playlist[nextIndex];
    console.log(`🎵 Switching to next song: ${nextSong?.title} (attempt ${skipCount + 1})`);
    
    setCurrentSong(nextSong);
    setIsPlaying(true);
  }, [playlist, currentSong?.src, isShuffled]);

  // Audio management
  useEffect(() => {
    if (!currentSong || !audioRef.current) return;

    const audio = audioRef.current;
    
    console.log('🎵 Setting up audio for song:', {
      title: currentSong.title,
      isLocal: currentSong.isLocal,
      src: currentSong.src?.substring(0, 50) + '...',
      srcType: currentSong.src?.startsWith('blob:') ? 'blob' : 'url'
    });
    
    // Cleanup previous src if exists
    if (audio.src && audio.src !== currentSong.src) {
      audio.pause();
      audio.currentTime = 0;
    }
    
    audio.src = currentSong.src;
    console.log('🎵 Audio src set successfully');
    
    // Reset tracking for new song
    currentSongTrackedRef.current = null;
    
    const handleLoadedMetadata = () => {
      console.log('🎵 Audio metadata loaded, duration:', audio.duration);
      setDuration(audio.duration || 0);
    };

    const handleTimeUpdate = () => {
      console.log('⏰ Time update:', audio.currentTime, '/', audio.duration);
      setCurrentTime(audio.currentTime || 0);
      
      // Check if song has played 1/3 and hasn't been tracked yet
      if (audio.duration > 0 && 
          audio.currentTime >= audio.duration / 3 && 
          currentSongTrackedRef.current !== currentSong.src) {
        addToRecentlyPlayed(currentSong);
        currentSongTrackedRef.current = currentSong.src;
      }
    };

    const handleEnded = () => {
      if (audio.src === currentSong.src) { // Only handle if current song is still active
        if (repeatMode === 'one') {
          audio.currentTime = 0;
          audio.play().catch(() => {});
        } else if (repeatMode === 'all' || playlist.length > 1) {
          handleNext();
        } else {
          setIsPlaying(false);
        }
      }
    };

    const handleError = (e) => {
      console.error('Audio error for song:', currentSong.title);
      console.error('Error details:', e);
      console.error('Failed audio src:', audioRef.current?.src);
      
      if (currentSong?.isLocal && currentSong?.src?.startsWith('blob:')) {
        console.warn('🚨 Blob URL playback failed - file may need to be re-uploaded');
      }
      
      setIsPlaying(false);

      // Skip to next song after a delay
      console.log('Skipping to next song due to error...');
      setTimeout(() => {
        handleNext();
      }, 1000);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [currentSong, repeatMode, handleNext, playlist.length, addToRecentlyPlayed]);

  // Play/Pause control
  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    console.log('🎮 Play/Pause effect triggered:', { 
      isPlaying, 
      currentSong: currentSong?.title, 
      audioSrc: audio.src?.substring(0, 50) + '...',
      isLocal: currentSong?.isLocal,
      readyState: audio.readyState
    });

    if (isPlaying) {
      console.log('▶️ Attempting to play audio...');
      console.log('🔍 Audio element state:', {
        src: audio.src?.substring(0, 50) + '...',
        readyState: audio.readyState,
        networkState: audio.networkState,
        error: audio.error
      });
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('✅ Audio play started successfully');
          })
          .catch(err => {
            console.error('❌ Error playing audio:', err);
            console.error('🔍 Detailed error info:', {
              message: err.message,
              name: err.name,
              code: err.code
            });
            setIsPlaying(false);

            // Skip to next song after a delay when play fails
            console.log('Play failed, skipping to next song...');
            setTimeout(() => {
              handleNext();
            }, 1000);
          });
      }
    } else {
      console.log('⏸️ Pausing audio...');
      audio.pause();
    }
  }, [isPlaying, currentSong]);

  // Volume control
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const handleSongSelect = (song) => {
    console.log('Selecting song:', song);
    setCurrentSong(song);
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handlePrevious = () => {
    const currentIndex = playlist.findIndex(s => s.src === currentSong.src);
    if (currentIndex === -1) return;

    // If more than 3 seconds have passed, restart current song
    if (currentTime > 3) {
      handleSeek(0);
      return;
    }

    let prevIndex;
    if (isShuffled) {
      do {
        prevIndex = Math.floor(Math.random() * playlist.length);
      } while (prevIndex === currentIndex && playlist.length > 1);
    } else {
      prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
    }

    setCurrentSong(playlist[prevIndex]);
    setIsPlaying(true);
  };

  const handleSeek = (time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleToggleLike = (songToToggle) => {
    if (!songToToggle || !songToToggle.src) {
      console.error("Attempted to like an invalid song:", songToToggle);
      return;
    }
    console.log(`🎯 Toggling like for: ${songToToggle.title}`);
    setLikedSongs((prev) => {
      const isLiked = prev.some(s => s.src === songToToggle.src);
      console.log(`📊 Current liked songs: ${prev.length}, isLiked: ${isLiked}`);
      
      let newLikedSongs;
      if (isLiked) {
        newLikedSongs = prev.filter(s => s.src !== songToToggle.src);
        console.log(`💔 Removed from liked: ${songToToggle.title}, new count: ${newLikedSongs.length}`);
      } else {
        newLikedSongs = [...prev, songToToggle];
        console.log(`❤️ Added to liked: ${songToToggle.title}, new count: ${newLikedSongs.length}`);
      }
      
      return newLikedSongs;
    });
  };

  const handleCreatePlaylist = (playlistName) => {
    const newPlaylist = {
      id: `playlist-${Date.now()}`,
      name: playlistName,
      type: 'Playlist',
      owner: 'Bạn', // Or a dynamic user name
      image: 'https://community.spotify.com/t5/image/serverpage/image-id/25294i283622A73424276A/image-size/large?v=v2&px=999', // A default image
    };
    setUserPlaylists(prev => [...prev, newPlaylist]);
  };

  const handleDeletePlaylist = (playlistId) => {
    const updatedPlaylists = userPlaylists.filter(playlist => playlist.id !== playlistId);
    setUserPlaylists(updatedPlaylists);
  };

  // Auth modal handlers
  const handleOpenLogin = () => {
    setIsLoginModalOpen(true);
    setIsRegisterModalOpen(false);
  };

  const handleOpenRegister = () => {
    setIsRegisterModalOpen(true);
    setIsLoginModalOpen(false);
  };

  const handleCloseModals = () => {
    setIsLoginModalOpen(false);
    setIsRegisterModalOpen(false);
  };

  // Handle adding new song from upload
  const handleAddSong = (newSong) => {
    console.log('🎵 handleAddSong called with:', newSong);
    
    if (!newSong || !newSong.src) {
      console.error('❌ Invalid song data:', newSong);
      return;
    }

    setPlaylist(prev => {
      // Check for duplicates based on title and fileName for uploaded songs
      const isDuplicate = prev.some(song => {
        if (newSong.isLocal && song.isLocal) {
          // For uploaded songs, check by filename and title
          return song.fileName === newSong.fileName && 
                 song.title.toLowerCase().trim() === newSong.title.toLowerCase().trim();
        }
        // For regular songs, check by src
        return song.src === newSong.src;
      });

      if (isDuplicate) {
        console.log('⚠️ Duplicate song detected, skipping:', newSong.title);
        return prev; // Don't add duplicate
      }

      const updated = [...prev, newSong];
      console.log('✅ Updated playlist from', prev.length, 'to', updated.length, 'songs');
      console.log('📝 New song added:', newSong.title, 'by', newSong.artist);
      return updated;
    });
    
    // Optional: Auto play the new song
    setCurrentSong(newSong);
    setIsPlaying(false); // Don't auto-play
    
    console.log('🎉 Song successfully added to playlist!');
  };

  return (
    <ErrorBoundary>
      <div className="relative h-screen bg-black text-white flex flex-col overflow-hidden">
        {/* Hidden Audio Element */}
        <audio ref={audioRef} />

        {/* Main Content Area */}
        <div className="flex flex-1 h-screen-minus-player">
          {/* Sidebar */}
          <ErrorBoundary>
            <Sidebar 
              currentView={currentView} 
              setCurrentView={setCurrentView} 
              likedSongs={likedSongs}
              onSongSelect={handleSongSelect}
              onOpenLogin={handleOpenLogin}
            />
          </ErrorBoundary>
          
          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
            <ErrorBoundary>
              <MainContent
                  currentView={currentView}
                  setCurrentView={setCurrentView}
                  playlist={playlist}
                  onSongSelect={handleSongSelect}
                  currentSong={currentSong}
                  likedSongs={likedSongs}
                  onToggleLike={handleToggleLike}
                  userPlaylists={userPlaylists}
                  handleCreatePlaylist={handleCreatePlaylist}
                  handleDeletePlaylist={handleDeletePlaylist}
                  recentlyPlayed={recentlyPlayed}
                  onOpenLogin={handleOpenLogin}
                  onAddSong={handleAddSong}
              />
            </ErrorBoundary>
          </div>
        </div>

        {/* Music Player */}
        <div className="flex-shrink-0">
          <MusicPlayer 
            currentSong={currentSong} 
            isPlaying={isPlaying} 
            onPlay={() => setIsPlaying(true)}
            onPause={handlePause}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onSeek={handleSeek}
            currentTime={currentTime}
            duration={duration}
            volume={volume}
            onVolumeChange={setVolume}
            isMuted={isMuted}
            onToggleMute={() => setIsMuted(!isMuted)}
            isShuffled={isShuffled}
            onToggleShuffle={() => setIsShuffled(!isShuffled)}
            repeatMode={repeatMode}
            onToggleRepeat={() => setRepeatMode(m => (m === 'off' ? 'all' : m === 'all' ? 'one' : 'off'))}
            likedSongs={likedSongs}
            onToggleLike={handleToggleLike}
          />
        </div>

        {/* Auth Modals */}
        <ErrorBoundary>
          <LoginModal
            isOpen={isLoginModalOpen}
            onClose={handleCloseModals}
            onSwitchToRegister={handleOpenRegister}
          />
          <RegisterModal
            isOpen={isRegisterModalOpen}
            onClose={handleCloseModals}
            onSwitchToLogin={handleOpenLogin}
          />
        </ErrorBoundary>
      </div>
    </ErrorBoundary>
  );
}

const AppWrapper = () => (
  <AuthProvider>
    <App />
  </AuthProvider>
);

export default AppWrapper;
