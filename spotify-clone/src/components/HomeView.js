import React, { useState, useEffect } from 'react';
import SearchService from '../services/searchService';

const HomeView = ({ playlist, onSongSelect, currentSong, likedSongs, onToggleLike, setCurrentView }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [artists, setArtists] = useState([]);

    useEffect(() => {
      const fetchArtists = async () => {
        try {
          const results = await SearchService.searchArtists('');
          setArtists(results);
        } catch (error) {
          console.error("Error fetching artists:", error);
          setArtists([]); // Set to empty array on error
        }
      };
      fetchArtists();
    }, []);

    const vietnameseGenres = ['V-Pop', 'Indie', 'Rock', 'Ballad', 'Rap'];
    const vietnameseArtists = artists.filter(a => vietnameseGenres.includes(a.genre));
    const internationalArtists = artists.filter(a => !vietnameseGenres.includes(a.genre));

    const heroSlides = [
        {
          image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop",
          gradient: "from-spotify-green to-spotify-dark-green",
          title: "Chào mừng bạn đến với Music",
          subtitle: "Khám phá hàng triệu bài hát và podcast"
        },
        {
          image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&auto=format&fit=crop",
          gradient: "from-purple-600 to-purple-800",
          title: "Âm nhạc không giới hạn",
          subtitle: "Thưởng thức âm nhạc chất lượng cao mọi lúc mọi nơi"
        },
        {
          image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&auto=format&fit=crop",
          gradient: "from-blue-600 to-blue-800",
          title: "Khám phá nghệ sĩ yêu thích",
          subtitle: "Kết nối với những nghệ sĩ và bài hát tuyệt vời"
        },
        {
          image: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&auto=format&fit=crop",
          gradient: "from-red-600 to-red-800",
          title: "Tạo playlist riêng",
          subtitle: "Sưu tập những bài hát yêu thích của bạn"
        }
      ];
    
      // Auto-slide effect
      useEffect(() => {
        const slideInterval = setInterval(() => {
          setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        }, 3000);
    
        return () => clearInterval(slideInterval);
      }, [heroSlides.length]);

    if (!playlist || playlist.length === 0) {
      return (
        <div className="flex items-center justify-center h-[50vh]">
          <div className="animate-spin w-12 h-12 border-4 border-spotify-green border-t-transparent rounded-full"></div>
        </div>
      );
    }

    return (
        <div className="space-y-6 sm:space-y-8 animate-fade-in">
        {/* Hero Section with Slideshow */}
        <div className="relative h-[220px] sm:h-[250px] md:h-[300px] rounded-lg sm:rounded-xl overflow-hidden shadow-spotify-lg mb-6 sm:mb-8 group">
          {/* Background Images */}
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} opacity-90`}></div>
              <img 
                src={slide.image}
                alt={`Music Hero ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
          
          {/* Content Overlay */}
          <div className="absolute inset-0 flex flex-col justify-center px-5 sm:px-6 md:px-8 z-10">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 animate-fade-in">
              {heroSlides[currentSlide].title}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white/90 animate-fade-in">
              {heroSlides[currentSlide].subtitle}
            </p>
          </div>
  
          {/* Navigation Arrows */}
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center text-white transition-all duration-200 opacity-0 hover:opacity-100 group-hover:opacity-100"
          >
            &#8249;
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center text-white transition-all duration-200 opacity-0 hover:opacity-100 group-hover:opacity-100"
          >
            &#8250;
          </button>
        </div>

        {/* Featured Playlists */}
        <section className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-5">Playlist Nổi Bật</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-spotify-light-gray rounded-lg p-4 hover:bg-spotify-light-gray/80 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-lg hover:shadow-spotify-green/20 cursor-pointer group">
                <div className="relative mb-3 sm:mb-4">
                  <img 
                    src={`https://picsum.photos/400/400?random=${i}`}
                    alt="Playlist Cover"
                    className="w-full aspect-square object-cover rounded-md shadow-spotify-md group-hover:shadow-spotify-lg transition-shadow"
                  />
                  <button className="absolute bottom-2 right-2 w-10 h-10 bg-spotify-green rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all shadow-spotify-md">
                    <span className="text-black text-xl">▶</span>
                  </button>
                </div>
                <h3 className="text-white font-semibold mb-1 text-base truncate">Playlist Hay Nhất {i}</h3>
                <p className="text-sm text-gray-400 truncate">Tuyển tập những bài hát hay nhất</p>
              </div>
            ))}
          </div>
        </section>

        {/* Artists Sections */}
        {artists.length > 0 && (
          <>
            {/* Nghệ sĩ Việt Nam */}
            <section className="mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-5">Nghệ sĩ Việt Nam</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {vietnameseArtists.map((artist) => (
                  <div key={artist.id} className="bg-spotify-light-gray rounded-lg p-4 hover:bg-spotify-light-gray/80 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-lg hover:shadow-spotify-green/20 cursor-pointer group text-center">
                    <div className="relative mb-3 sm:mb-4">
                      <img 
                        src={artist.avatar}
                        alt={artist.name}
                        className="w-full aspect-square object-cover rounded-full shadow-spotify-md group-hover:shadow-spotify-lg transition-shadow"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(artist.name)}&size=300&background=1ed760&color=000000&bold=true&rounded=true`;
                        }}
                      />
                      <button className="absolute bottom-2 right-2 w-8 h-8 bg-spotify-green rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all shadow-spotify-md">
                        <span className="text-black text-sm">▶</span>
                      </button>
                    </div>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <h3 className="text-white font-semibold text-base truncate">{artist.name}</h3>
                      {artist.verified && (
                        <span className="text-blue-400 text-xs">✓</span>
                      )}
                    </div>
                    <p className="text-spotify-text-secondary text-xs">{artist.followers} người theo dõi</p>
                  </div>
                ))}
              </div>
            </section>
            
            {/* Nghệ sĩ Quốc tế */}
            <section className="mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-5">Nghệ sĩ Quốc tế</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {internationalArtists.map((artist) => (
                  <div key={artist.id} className="bg-spotify-light-gray rounded-lg p-4 hover:bg-spotify-light-gray/80 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-lg hover:shadow-spotify-green/20 cursor-pointer group text-center">
                    <div className="relative mb-3 sm:mb-4">
                      <img 
                        src={artist.avatar}
                        alt={artist.name}
                        className="w-full aspect-square object-cover rounded-full shadow-spotify-md group-hover:shadow-spotify-lg transition-shadow"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(artist.name)}&size=300&background=1ed760&color=000000&bold=true&rounded=true`;
                        }}
                      />
                      <button className="absolute bottom-2 right-2 w-8 h-8 bg-spotify-green rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all shadow-spotify-md">
                        <span className="text-black text-sm">▶</span>
                      </button>
                    </div>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <h3 className="text-white font-semibold text-base truncate">{artist.name}</h3>
                      {artist.verified && (
                        <span className="text-blue-400 text-xs">✓</span>
                      )}
                    </div>
                    <p className="text-spotify-text-secondary text-xs">{artist.followers} người theo dõi</p>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* Mới phát hành */}
        <section className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-5">Mới phát hành</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {[7, 8, 9, 10, 11, 12].map((i) => (
              <div key={i} className="bg-spotify-light-gray rounded-lg p-4 hover:bg-spotify-light-gray/80 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-lg hover:shadow-spotify-green/20 cursor-pointer group">
                <div className="relative mb-3 sm:mb-4">
                  <img 
                    src={`https://picsum.photos/400/400?random=${i}`}
                    alt="Album Cover"
                    className="w-full aspect-square object-cover rounded-md shadow-spotify-md group-hover:shadow-spotify-lg transition-shadow"
                  />
                </div>
                <h3 className="text-white font-semibold mb-1 text-base truncate">Album Mới {i - 6}</h3>
                <p className="text-sm text-gray-400 truncate">Nghệ sĩ {i - 6}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Podcast */}
        <section className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-5">Podcast Thịnh Hành</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {[13, 14, 15, 16, 17, 18].map((i) => (
              <div key={i} className="bg-spotify-light-gray rounded-lg p-4 hover:bg-spotify-light-gray/80 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-lg hover:shadow-spotify-green/20 cursor-pointer group">
                <div className="relative mb-3 sm:mb-4">
                  <img 
                    src={`https://picsum.photos/400/400?random=${i}`}
                    alt="Podcast Cover"
                    className="w-full aspect-square object-cover rounded-md shadow-spotify-md group-hover:shadow-spotify-lg transition-shadow"
                  />
                </div>
                <h3 className="text-white font-semibold mb-1 text-base truncate">Podcast {i - 12}</h3>
                <p className="text-sm text-gray-400 truncate">Tác giả {i - 12}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Dành cho bạn */}
        <section className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-5">Dành cho bạn</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {[19, 20, 21, 22, 23, 24].map((i) => (
              <div key={i} className="bg-spotify-light-gray rounded-lg p-4 hover:bg-spotify-light-gray/80 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-lg hover:shadow-spotify-green/20 cursor-pointer group">
                <div className="relative mb-3 sm:mb-4">
                  <img 
                    src={`https://picsum.photos/400/400?random=${i}`}
                    alt="Playlist Cover"
                    className="w-full aspect-square object-cover rounded-md shadow-spotify-md group-hover:shadow-spotify-lg transition-shadow"
                  />
                </div>
                <h3 className="text-white font-semibold mb-1 text-base truncate">Mix của bạn {i - 18}</h3>
                <p className="text-sm text-gray-400 truncate">Tuyển tập cá nhân</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
};

export default HomeView; 