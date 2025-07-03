import React, { useState, useEffect } from 'react';
import AudioPlayer from './AudioPlayer';

// Demo songs with corrected file names
const DEMO_SONGS = [
  {
    id: 1,
    title: 'Hôm Nay Em Cưới Rồi',
    artist: 'Khải Đăng & Thanh Hưng',
    album: 'Single',
    coverImage: 'https://i.ytimg.com/vi/ATPz9B9Vx9Y/maxresdefault.jpg',
    url: '/mp3/y2mate.com - Hôm Nay Em Cưới Rồi  Khải Đăng  Thanh Hưng  Live Version.mp3'
  },
  {
    id: 2,
    title: 'Waiting For You',
    artist: 'MONO',
    album: '22',
    coverImage: 'https://avatar-ex-swe.nixcdn.com/song/share/2022/08/17/e/a/1/b/1660733423986.jpg',
    url: '/mp3/y2mate.com - MONO  Waiting For You Album 22  Track No10.mp3'
  },
  {
    id: 3,
    title: 'Mưa Rơi Lặng Thầm',
    artist: 'M4U Band',
    album: 'Single',
    coverImage: 'https://i.ytimg.com/vi/XA6aNmjXdJA/maxresdefault.jpg',
    url: '/mp3/y2mate.com - Mưa Rơi Lặng Thầm  M4U Band  Official MV.mp3'
  },
  {
    id: 4,
    title: 'Thu Cuối',
    artist: 'Mr.T ft. Yanbi & Hằng BingBoong',
    album: 'Single',
    coverImage: 'https://i.ytimg.com/vi/CN4BFID7-SA/maxresdefault.jpg',
    url: '/mp3/y2mate.com - MrT  Thu Cuối ft  Yanbi  Hằng BingBoong Official MV.mp3'
  },
  {
    id: 5,
    title: 'Người Yêu Cũ',
    artist: 'Phan Mạnh Quỳnh',
    album: 'Single',
    coverImage: 'https://i.ytimg.com/vi/8LK_xD0WdOQ/maxresdefault.jpg',
    url: '/mp3/y2mate.com - Người Yêu Cũ  Phan Mạnh Quỳnh  Official Music Video  Mây Saigon.mp3'
  },
  {
    id: 6,
    title: 'Haru Haru',
    artist: 'BIGBANG',
    album: 'Remember',
    coverImage: 'https://i.ytimg.com/vi/MzCbEdtNbJ0/maxresdefault.jpg',
    url: '/mp3/y2mate.com - BIGBANG  HARU HARU하루하루 MV.mp3'
  },
  {
    id: 7,
    title: 'Ôm Em Được Không',
    artist: 'Sơn Tùng M-TP',
    album: 'Single',
    coverImage: 'https://i.ytimg.com/vi/D-A_x2_rR-g/maxresdefault.jpg',
    url: '/mp3/om-em-duoc-khong.mp3'
  },
  {
    id: 8,
    title: 'Phía Sau Một Cô Gái',
    artist: 'Soobin Hoàng Sơn',
    album: 'Single',
    coverImage: 'https://i.ytimg.com/vi/XM-p0c3Dygc/maxresdefault.jpg',
    url: '/mp3/phia-sau-mot-co-gai.mp3'
  },
  {
    id: 9,
    title: 'Thiên Mệnh Quan',
    artist: 'Various Artists',
    album: 'Single',
    coverImage: 'https://i.ytimg.com/vi/kFw8yPJ7jkE/maxresdefault.jpg',
    url: '/mp3/thien-menh-quan.mp3'
  },
  {
    id: 10,
    title: 'Mất Kết Nối',
    artist: 'Dương Domic',
    album: 'EP Dữ Liệu Quý',
    coverImage: 'https://i.ytimg.com/vi/YOrmCOqk8VY/maxresdefault.jpg',
    url: '/mp3/y2mate.com - Dương Domic  Mất Kết Nối  EP Dữ Liệu Quý.mp3'
  }
];

const MusicPlayerContainer = () => {
  const [songs] = useState(DEMO_SONGS);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [currentSong, setCurrentSong] = useState(songs[0]);

  // Set current song when index changes
  useEffect(() => {
    if (songs[currentSongIndex]) {
      setCurrentSong(songs[currentSongIndex]);
      console.log('Changed to song:', songs[currentSongIndex]);
    }
  }, [currentSongIndex, songs]);

  // Handle next song
  const handleNextSong = (shuffle = false) => {
    if (shuffle) {
      // Get random song excluding current one
      const availableIndices = Array.from({ length: songs.length }, (_, i) => i)
        .filter(i => i !== currentSongIndex);
      
      if (availableIndices.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableIndices.length);
        setCurrentSongIndex(availableIndices[randomIndex]);
      }
    } else {
      // Go to next song or loop back to first
      setCurrentSongIndex((prevIndex) => (prevIndex + 1) % songs.length);
    }
  };

  // Handle previous song
  const handlePrevSong = () => {
    // Go to previous song or loop back to last
    setCurrentSongIndex((prevIndex) => 
      prevIndex === 0 ? songs.length - 1 : prevIndex - 1
    );
  };

  return (
    <div className="music-player-container min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto p-4 pb-32">
        <h1 className="text-3xl font-bold mb-6">Your Music Player</h1>
        
        {/* Current Song Display */}
        <div className="current-song-display bg-gray-800 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Now Playing</h2>
          {currentSong && (
            <div className="flex items-center">
              <img 
                src={currentSong.coverImage} 
                alt={currentSong.title}
                className="w-16 h-16 object-cover rounded mr-4"
              />
              <div>
                <h3 className="text-lg font-semibold">{currentSong.title}</h3>
                <p className="text-gray-400">{currentSong.artist}</p>
                <p className="text-sm text-gray-500">{currentSong.album}</p>
                <p className="text-xs text-green-400 mt-1">File: {currentSong.url}</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Playlist */}
        <div className="playlist">
          <h2 className="text-xl font-semibold mb-4">Playlist ({songs.length} songs)</h2>
          <div className="space-y-2">
            {songs.map((song, index) => (
              <div 
                key={song.id}
                className={`song-item p-3 rounded-lg flex items-center cursor-pointer transition-all duration-200 ${
                  currentSongIndex === index 
                    ? 'bg-green-900 border border-green-500' 
                    : 'bg-gray-800 hover:bg-gray-700'
                }`}
                onClick={() => setCurrentSongIndex(index)}
              >
                <div className="song-number text-gray-400 w-8 text-center">
                  {currentSongIndex === index ? '♪' : index + 1}
                </div>
                <img 
                  src={song.coverImage} 
                  alt={song.title}
                  className="w-12 h-12 object-cover rounded mr-3"
                />
                <div className="song-details flex-1">
                  <h3 className="font-medium text-white">{song.title}</h3>
                  <p className="text-sm text-gray-400">{song.artist}</p>
                </div>
                <div className="song-album text-sm text-gray-500">
                  {song.album}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Audio Player */}
      <div className="audio-player-wrapper fixed bottom-0 left-0 right-0 z-50">
        <AudioPlayer 
          currentSong={currentSong}
          playlist={songs}
          onNextSong={handleNextSong}
          onPrevSong={handlePrevSong}
          autoplay={false}
        />
      </div>
    </div>
  );
};

export default MusicPlayerContainer; 