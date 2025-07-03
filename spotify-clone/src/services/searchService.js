// Mock database for search functionality
const mockDatabase = {
  songs: [
    {
      id: 1,
      title: 'Ôm Em Được Không',
      artist: 'Phương Ly',
      album: 'Single',
      src: '/mp3/om-em-duoc-khong.mp3',
      cover: 'https://i.ytimg.com/vi/KYNLeOzCrbQ/maxresdefault.jpg',
      duration: '3:45',
      genre: 'V-Pop'
    },
    {
      id: 2,
      title: 'Phía Sau Một Cô Gái',
      artist: 'Soobin Hoàng Sơn',
      album: 'Single',
      src: '/mp3/phia-sau-mot-co-gai.mp3',
      cover: 'https://i.ytimg.com/vi/XM-p0c3Dygc/maxresdefault.jpg',
      duration: '4:12',
      genre: 'V-Pop'
    },
    {
      id: 3,
      title: 'Thiên Mệnh Quan',
      artist: 'Various Artists',
      album: 'OST',
      src: '/mp3/thien-menh-quan.mp3',
      cover: 'https://i.ytimg.com/vi/kFw8yPJ7jkE/maxresdefault.jpg',
      duration: '5:30',
      genre: 'Traditional'
    },
    {
      id: 4,
      title: 'HARU HARU',
      artist: 'BIGBANG',
      album: 'Remember',
      src: '/mp3/y2mate.com - BIGBANG  HARU HARU하루하루 MV.mp3',
      cover: 'https://i.ytimg.com/vi/MzCbEdtNbJ0/maxresdefault.jpg',
      duration: '4:05',
      genre: 'K-Pop'
    },
    {
      id: 5,
      title: 'Mất Kết Nối',
      artist: 'Dương Domic',
      album: 'Dữ Liệu Quý',
      src: '/mp3/y2mate.com - Dương Domic  Mất Kết Nối  EP Dữ Liệu Quý.mp3',
      cover: 'https://i.ytimg.com/vi/YOrmCOqk8VY/maxresdefault.jpg',
      duration: '3:28',
      genre: 'Indie'
    },
    {
      id: 6,
      title: 'Hôm Nay Em Cưới Rồi',
      artist: 'Khải Đăng',
      album: 'Single',
      src: '/mp3/y2mate.com - Hôm Nay Em Cưới Rồi  Khải Đăng  Thanh Hưng  Live Version.mp3',
      cover: 'https://i.ytimg.com/vi/x8LyWn_7yuc/maxresdefault.jpg',
      duration: '4:15',
      genre: 'V-Pop'
    },
    {
      id: 7,
      title: 'Waiting For You',
      artist: 'MONO',
      album: '22',
      src: '/mp3/y2mate.com - MONO  Waiting For You Album 22  Track No10.mp3',
      cover: 'https://i.ytimg.com/vi/0DaJKVMQWjE/maxresdefault.jpg',
      duration: '3:52',
      genre: 'V-Pop'
    },
    {
      id: 8,
      title: 'Thu Cuối',
      artist: 'MrT ft. Yanbi, Hằng BingBoong',
      album: 'Single',
      src: '/mp3/y2mate.com - MrT  Thu Cuối ft  Yanbi  Hằng BingBoong Official MV.mp3',
      cover: 'https://i.ytimg.com/vi/KzlQWAfloRs/maxresdefault.jpg',
      duration: '4:20',
      genre: 'V-Pop'
    },
    {
      id: 9,
      title: 'Mưa Rơi Lặng Thầm',
      artist: 'M4U Band',
      album: 'Single',
      src: '/mp3/y2mate.com - Mưa Rơi Lặng Thầm  M4U Band  Official MV.mp3',
      cover: 'https://i.ytimg.com/vi/uOBNwSdGC38/maxresdefault.jpg',
      duration: '4:45',
      genre: 'Rock'
    },
    {
      id: 10,
      title: 'Người Yêu Cũ',
      artist: 'Phan Mạnh Quỳnh',
      album: 'Single',
      src: '/mp3/y2mate.com - Người Yêu Cũ  Phan Mạnh Quỳnh  Official Music Video  Mây Saigon.mp3',
      cover: 'https://i.ytimg.com/vi/yVWn66BbOX8/maxresdefault.jpg',
      duration: '4:30',
      genre: 'Ballad'
    }
  ],
  
  artists: [
    {
      id: 1,
      name: 'Phương Ly',
      avatar: 'https://via.placeholder.com/300/ff69b4/ffffff?text=PL',
      followers: '2.1M',
      verified: true,
      genre: 'V-Pop',
      description: 'Ca sĩ V-Pop nổi tiếng với nhiều hit'
    },
    {
      id: 2,
      name: 'Soobin Hoàng Sơn',
      avatar: 'https://via.placeholder.com/300/32cd32/ffffff?text=SHS',
      followers: '3.5M',
      verified: true,
      genre: 'V-Pop',
      description: 'Nghệ sĩ đa tài, ca sĩ, rapper'
    },
    {
      id: 3,
      name: 'BIGBANG',
      avatar: 'https://via.placeholder.com/300/ff6347/ffffff?text=BB',
      followers: '12.8M',
      verified: true,
      genre: 'K-Pop',
      description: 'Nhóm nhạc K-Pop huyền thoại'
    },
    {
      id: 4,
      name: 'Dương Domic',
      avatar: 'https://via.placeholder.com/300/90ee90/ffffff?text=DD',
      followers: '856K',
      verified: true,
      genre: 'Indie',
      description: 'Nghệ sĩ indie với phong cách độc đáo'
    },
    {
      id: 5,
      name: 'MONO',
      avatar: 'https://via.placeholder.com/300/ffd700/000000?text=MONO',
      followers: '1.2M',
      verified: true,
      genre: 'V-Pop',
      description: 'Ca sĩ trẻ tài năng'
    },
    {
      id: 6,
      name: 'Khải Đăng',
      avatar: 'https://via.placeholder.com/300/dda0dd/ffffff?text=KD',
      followers: '785K',
      verified: true,
      genre: 'V-Pop',
      description: 'Ca sĩ ballad nổi tiếng'
    },
    {
      id: 7,
      name: 'MrT',
      avatar: 'https://via.placeholder.com/300/4169e1/ffffff?text=MrT',
      followers: '920K',
      verified: true,
      genre: 'V-Pop',
      description: 'Rapper và ca sĩ tài năng'
    },
    {
      id: 8,
      name: 'M4U Band',
      avatar: 'https://via.placeholder.com/300/9370db/ffffff?text=M4U',
      followers: '456K',
      verified: true,
      genre: 'Rock',
      description: 'Ban nhạc rock Việt Nam'
    },
    {
      id: 9,
      name: 'Phan Mạnh Quỳnh',
      avatar: 'https://via.placeholder.com/300/00ced1/ffffff?text=PMQ',
      followers: '1.8M',
      verified: true,
      genre: 'Ballad',
      description: 'Nhạc sĩ và ca sĩ ballad tài năng'
    },
    {
      id: 10,
      name: 'Anh Tú',
      avatar: 'https://via.placeholder.com/300/dc143c/ffffff?text=AT',
      followers: '1.5M',
      verified: true,
      genre: 'V-Pop',
      description: 'Ca sĩ The Voice, nổi tiếng với các bản cover và hit ballad'
    },
    {
      id: 11,
      name: 'Sơn Tùng M-TP',
      avatar: 'https://via.placeholder.com/300/1ed760/000000?text=MTP',
      followers: '8.2M',
      verified: true,
      genre: 'V-Pop',
      description: 'Siêu sao V-Pop, rapper, producer'
    },
    {
      id: 12,
      name: 'Chi Pu',
      avatar: 'https://via.placeholder.com/300/ff1493/ffffff?text=CP',
      followers: '2.8M',
      verified: true,
      genre: 'V-Pop',
      description: 'Diễn viên kiêm ca sĩ'
    },
    {
      id: 13,
      name: 'Đen Vâu',
      avatar: 'https://via.placeholder.com/300/2f4f4f/ffffff?text=DV',
      followers: '3.1M',
      verified: true,
      genre: 'Rap',
      description: 'Rapper số 1 Việt Nam với nhiều hit triệu view'
    },
    {
      id: 14,
      name: 'Hòa Minzy',
      avatar: 'https://via.placeholder.com/300/ff4500/ffffff?text=HM',
      followers: '2.4M',
      verified: true,
      genre: 'V-Pop',
      description: 'Cựu thành viên Uni5, giọng ca khỏe khoắn'
    },
    {
      id: 15,
      name: 'Jack',
      avatar: 'https://via.placeholder.com/300/ba55d3/ffffff?text=JACK',
      followers: '4.2M',
      verified: true,
      genre: 'V-Pop',
      description: 'Ca sĩ Gen Z với nhiều hit viral'
    },
    {
      id: 16,
      name: 'Min',
      avatar: 'https://via.placeholder.com/300/0000ff/ffffff?text=MIN',
      followers: '1.9M',
      verified: true,
      genre: 'V-Pop',
      description: 'Nữ ca sĩ với giọng hát trong trẻo'
    },
    {
      id: 17,
      name: 'Erik',
      avatar: 'https://via.placeholder.com/300/3cb371/ffffff?text=ERIK',
      followers: '1.7M',
      verified: true,
      genre: 'V-Pop',
      description: 'Ca sĩ trẻ tài năng với nhiều ballad hay'
    },
    {
      id: 18,
      name: 'Amee',
      avatar: 'https://via.placeholder.com/300/87ceeb/ffffff?text=AMEE',
      followers: '1.3M',
      verified: true,
      genre: 'V-Pop',
      description: 'Giọng ca trẻ đầy triển vọng'
    },
    {
      id: 19,
      name: 'Hiếu Thứ Hai',
      avatar: 'https://via.placeholder.com/300/cd5c5c/ffffff?text=HTH',
      followers: '956K',
      verified: true,
      genre: 'Indie',
      description: 'Ca sĩ indie với phong cách độc đáo'
    },
    {
      id: 20,
      name: 'Orange',
      avatar: 'https://via.placeholder.com/300/ffa500/ffffff?text=OG',
      followers: '821K',
      verified: true,
      genre: 'R&B',
      description: 'Ca sĩ R&B tài năng'
    },
    {
      id: 21,
      name: 'Vũ Cát Tường',
      avatar: 'https://via.placeholder.com/300/708090/ffffff?text=VCT',
      followers: '1.6M',
      verified: true,
      genre: 'Indie',
      description: 'Nghệ sĩ indie đa tài, sáng tác'
    },
    {
      id: 22,
      name: 'Đức Phúc',
      avatar: 'https://via.placeholder.com/300/696969/ffffff?text=DP',
      followers: '1.1M',
      verified: true,
      genre: 'V-Pop',
      description: 'Quán quân The Voice với giọng hát ngọt ngào'
    },
    {
      id: 23,
      name: 'Bích Phương',
      avatar: 'https://via.placeholder.com/300/ff0000/ffffff?text=BP',
      followers: '2.2M',
      verified: true,
      genre: 'V-Pop',
      description: 'Nữ ca sĩ với nhiều hit đình đám'
    },
    {
      id: 24,
      name: 'Noo Phước Thịnh',
      avatar: 'https://via.placeholder.com/300/663399/ffffff?text=NPT',
      followers: '2.7M',
      verified: true,
      genre: 'V-Pop',
      description: 'Nam ca sĩ kỳ cựu với nhiều hit'
    },
    {
      id: 25,
      name: 'Taylor Swift',
      avatar: 'https://via.placeholder.com/300/9966cc/ffffff?text=TS',
      followers: '89.2M',
      verified: true,
      genre: 'Pop',
      description: 'Siêu sao nhạc pop thế giới'
    },
    {
      id: 26,
      name: 'Ed Sheeran',
      avatar: 'https://via.placeholder.com/300/ffb347/ffffff?text=ES',
      followers: '52.1M',
      verified: true,
      genre: 'Pop',
      description: 'Singer-songwriter nổi tiếng thế giới'
    },
    {
      id: 27,
      name: 'Billie Eilish',
      avatar: 'https://via.placeholder.com/300/20b2aa/ffffff?text=BE',
      followers: '61.3M',
      verified: true,
      genre: 'Alternative',
      description: 'Nghệ sĩ trẻ với phong cách độc đáo'
    },
    {
      id: 28,
      name: 'BTS',
      avatar: 'https://via.placeholder.com/300/6a5acd/ffffff?text=BTS',
      followers: '74.6M',
      verified: true,
      genre: 'K-Pop',
      description: 'Boyband K-Pop toàn cầu'
    },
    {
      id: 29,
      name: 'BLACKPINK',
      avatar: 'https://via.placeholder.com/300/ff1493/000000?text=BP',
      followers: '84.5M',
      verified: true,
      genre: 'K-Pop',
      description: 'Girlgroup K-Pop hàng đầu'
    },
    {
      id: 30,
      name: 'Ariana Grande',
      avatar: 'https://via.placeholder.com/300/dda0dd/000000?text=AG',
      followers: '52.0M',
      verified: true,
      genre: 'Pop',
      description: 'Nữ ca sĩ pop với giọng hát cao vút'
    },
    {
      id: 31,
      name: 'The Weeknd',
      avatar: 'https://via.placeholder.com/300/191970/ffffff?text=TW',
      followers: '31.8M',
      verified: true,
      genre: 'R&B',
      description: 'Ca sĩ R&B hàng đầu thế giới'
    },
    {
      id: 32,
      name: 'Dua Lipa',
      avatar: 'https://via.placeholder.com/300/da70d6/ffffff?text=DL',
      followers: '28.4M',
      verified: true,
      genre: 'Pop',
      description: 'Nữ ca sĩ pop Anh quốc'
    }
  ],
  
  playlists: [
    {
      id: 1,
      name: 'Top Hits Vietnam',
      description: 'Những bài hát hot nhất Việt Nam',
      cover: 'https://i.scdn.co/image/ab67706f00000002724554ed6bed6f051d9b0bfc',
      songs: 25,
      creator: 'Spotify',
      followers: '1.2M'
    },
    {
      id: 2,
      name: 'K-Pop Rising',
      description: 'Best K-Pop tracks of all time',
      cover: 'https://i.scdn.co/image/ab67706f000000028ed8405bfd6aa726b0c7b4b5',
      songs: 50,
      creator: 'Spotify',
      followers: '3.8M'
    },
    {
      id: 3,
      name: 'Indie Vietnam',
      description: 'Nhạc indie Việt chất lượng cao',
      cover: 'https://i.scdn.co/image/ab67706f00000002fe24dcd263c08c6406b83d8f',
      songs: 30,
      creator: 'Curated',
      followers: '450K'
    },
    {
      id: 4,
      name: 'Chill Vibes',
      description: 'Thư giãn với những giai điệu nhẹ nhàng',
      cover: 'https://i.scdn.co/image/ab67706f000000027ea4d505212b9de1f72c5112',
      songs: 40,
      creator: 'Spotify',
      followers: '2.1M'
    },
    {
      id: 5,
      name: 'Ballad Classics',
      description: 'Những ballad bất hủ mọi thời đại',
      cover: 'https://i.scdn.co/image/ab67706f00000002d073e656e546e43bc387ad79',
      songs: 35,
      creator: 'Music Lover',
      followers: '890K'
    }
  ]
};

/**
 * Search service to simulate API calls
 */
class SearchService {
  // Simulate API delay
  static delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Normalize text for search (remove accents, lowercase)
  static normalizeText(text) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '');
  }

  // Search songs
  static async searchSongs(query, limit = 10) {
    await this.delay(200); // Simulate API delay
    
    // Return all songs if query is empty or very short
    if (!query || query.length === 0) {
      return mockDatabase.songs.slice(0, limit);
    }
    
    if (query.length < 2) return [];
    
    const normalizedQuery = this.normalizeText(query);
    
    return mockDatabase.songs.filter(song => {
      const titleMatch = this.normalizeText(song.title).includes(normalizedQuery);
      const artistMatch = this.normalizeText(song.artist).includes(normalizedQuery);
      const albumMatch = this.normalizeText(song.album).includes(normalizedQuery);
      const genreMatch = this.normalizeText(song.genre).includes(normalizedQuery);
      
      return titleMatch || artistMatch || albumMatch || genreMatch;
    }).slice(0, limit);
  }

  // Search artists
  static async searchArtists(query, limit = 5) {
    await this.delay(200);
    
    if (!query || query.length < 2) return [];
    
    const normalizedQuery = this.normalizeText(query);
    
    return mockDatabase.artists.filter(artist => {
      const nameMatch = this.normalizeText(artist.name).includes(normalizedQuery);
      const genreMatch = this.normalizeText(artist.genre).includes(normalizedQuery);
      const descMatch = this.normalizeText(artist.description).includes(normalizedQuery);
      
      return nameMatch || genreMatch || descMatch;
    }).slice(0, limit);
  }

  // Search playlists
  static async searchPlaylists(query, limit = 5) {
    await this.delay(200);
    
    if (!query || query.length < 2) return [];
    
    const normalizedQuery = this.normalizeText(query);
    
    return mockDatabase.playlists.filter(playlist => {
      const nameMatch = this.normalizeText(playlist.name).includes(normalizedQuery);
      const descMatch = this.normalizeText(playlist.description).includes(normalizedQuery);
      const creatorMatch = this.normalizeText(playlist.creator).includes(normalizedQuery);
      
      return nameMatch || descMatch || creatorMatch;
    }).slice(0, limit);
  }

  // Search all categories
  static async searchAll(query) {
    // Return all data if query is empty
    if (!query || query.length === 0) {
      return {
        songs: mockDatabase.songs,
        artists: mockDatabase.artists,
        playlists: mockDatabase.playlists,
        total: mockDatabase.songs.length + mockDatabase.artists.length + mockDatabase.playlists.length
      };
    }
    
    if (query.length < 2) {
      return {
        songs: [],
        artists: [],
        playlists: [],
        total: 0
      };
    }

    const [songs, artists, playlists] = await Promise.all([
      this.searchSongs(query, 8),
      this.searchArtists(query, 5),
      this.searchPlaylists(query, 5)
    ]);

    return {
      songs,
      artists,
      playlists,
      total: songs.length + artists.length + playlists.length
    };
  }

  // Get search suggestions
  static async getSearchSuggestions(query) {
    await this.delay(100);
    
    if (!query || query.length < 1) return [];
    
    const normalizedQuery = this.normalizeText(query);
    const suggestions = new Set();
    
    // Add song titles
    mockDatabase.songs.forEach(song => {
      if (this.normalizeText(song.title).includes(normalizedQuery)) {
        suggestions.add(song.title);
      }
      if (this.normalizeText(song.artist).includes(normalizedQuery)) {
        suggestions.add(song.artist);
      }
    });
    
    // Add artist names
    mockDatabase.artists.forEach(artist => {
      if (this.normalizeText(artist.name).includes(normalizedQuery)) {
        suggestions.add(artist.name);
      }
    });
    
    // Add playlist names
    mockDatabase.playlists.forEach(playlist => {
      if (this.normalizeText(playlist.name).includes(normalizedQuery)) {
        suggestions.add(playlist.name);
      }
    });
    
    return Array.from(suggestions).slice(0, 6);
  }

  // Get trending searches
  static async getTrendingSearches() {
    await this.delay(100);
    
    return [
      'BIGBANG',
      'Phương Ly',
      'V-Pop hits',
      'K-Pop rising',
      'Indie Vietnam',
      'Ballad classics',
      'Chill vibes',
      'Top hits'
    ];
  }
}

export default SearchService; 