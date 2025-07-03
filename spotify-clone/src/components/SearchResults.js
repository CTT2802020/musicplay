import React, { useState, useEffect, useRef } from 'react';

const SearchResults = ({ results, onSongSelect, currentSong }) => {
  const [visibleResults, setVisibleResults] = useState(20);
  const loadMoreRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleResults(prev => prev + 20);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setVisibleResults(20);
  }, [results]);

  const { songs = [], artists = [], playlists = [] } = results || {};

  if (!songs.length && !artists.length && !playlists.length) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center">
        <div className="w-32 h-32 bg-spotify-light-gray rounded-full flex items-center justify-center mb-6">
          <span className="text-5xl">🔍</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Không tìm thấy kết quả</h2>
        <p className="text-spotify-text-secondary">Hãy thử tìm kiếm với từ khóa khác</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Songs Section */}
      {songs.length > 0 && (
        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Bài Hát</h2>
          <div className="grid gap-1 sm:gap-2">
            {songs.slice(0, visibleResults).map((song, index) => (
              <div
                key={song.id || index}
                className={`group flex items-center p-3 sm:p-4 rounded-lg hover:bg-spotify-light-gray transition-colors cursor-pointer ${
                  currentSong?.id === song.id ? 'bg-spotify-light-gray' : 'bg-spotify-gray'
                }`}
                onClick={() => onSongSelect(song)}
              >
                <div className="w-12 h-12 relative mr-3 sm:mr-4">
                  <img
                    src={song.cover || `https://picsum.photos/100/100?random=${index}`}
                    alt={song.title}
                    className="w-full h-full object-cover rounded-md shadow-spotify-sm"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
                    <span className="text-white text-lg sm:text-2xl">▶</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0 mr-2 sm:mr-4">
                  <h3 className="text-white font-medium truncate text-base leading-normal">{song.title}</h3>
                  <p className="text-spotify-text-secondary text-sm truncate leading-normal">{song.artist}</p>
                </div>
                <div className="text-spotify-text-secondary text-xs sm:text-sm hidden sm:block">{song.duration}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Artists Section */}
      {artists.length > 0 && (
        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Nghệ Sĩ</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {artists.slice(0, visibleResults).map((artist, index) => (
              <div
                key={artist.id || index}
                className="bg-spotify-light-gray rounded-lg p-4 hover:bg-spotify-light-gray/80 transition-all cursor-pointer group hover:scale-105"
              >
                <div className="relative mb-3">
                  <img
                    src={artist.avatar || `https://picsum.photos/300/300?random=${index + 100}`}
                    alt={artist.name}
                    className="w-full aspect-square object-cover rounded-full shadow-spotify-md"
                  />
                  <button className="absolute bottom-2 right-2 w-10 h-10 bg-spotify-green rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all shadow-spotify-md">
                    <span className="text-black text-xl">▶</span>
                  </button>
                </div>
                <h3 className="text-white font-semibold text-center truncate text-base leading-normal mb-1">{artist.name}</h3>
                <p className="text-spotify-text-secondary text-sm text-center">Nghệ sĩ</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Playlists Section */}
      {playlists.length > 0 && (
        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Playlist</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {playlists.slice(0, visibleResults).map((playlist, index) => (
              <div
                key={playlist.id || index}
                className="bg-spotify-light-gray rounded-lg p-4 hover:bg-spotify-light-gray/80 transition-all cursor-pointer group hover:scale-105"
              >
                <div className="relative mb-3">
                  <img
                    src={playlist.cover || `https://picsum.photos/400/400?random=${index + 200}`}
                    alt={playlist.name}
                    className="w-full aspect-square object-cover rounded-md shadow-spotify-md"
                  />
                  <button className="absolute bottom-2 right-2 w-10 h-10 bg-spotify-green rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all shadow-spotify-md">
                    <span className="text-black text-xl">▶</span>
                  </button>
                </div>
                <h3 className="text-white font-semibold mb-1 truncate text-base leading-normal">{playlist.name}</h3>
                <p className="text-spotify-text-secondary text-sm truncate leading-normal">
                  {playlist.songs} bài hát • {playlist.creator}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Load More Trigger */}
      <div ref={loadMoreRef} className="h-10" />
    </div>
  );
};

export default SearchResults; 