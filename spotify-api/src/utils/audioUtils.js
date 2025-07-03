const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const mm = require('music-metadata');
const ffmpeg = require('fluent-ffmpeg');

/**
 * Get audio duration in seconds using ffprobe
 * Note: Requires ffmpeg to be installed on the server
 * @param {string} filePath - Path to audio file
 * @returns {Promise<number>} - Duration in seconds
 */
exports.getAudioDurationInSeconds = (filePath) => {
  return new Promise((resolve, reject) => {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return reject(new Error(`File not found: ${filePath}`));
    }
    
    // Use ffprobe to get audio duration
    const command = `ffprobe -i "${filePath}" -show_entries format=duration -v quiet -of csv="p=0"`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        // If ffprobe fails, estimate from file size (rough estimation)
        try {
          const stats = fs.statSync(filePath);
          // Rough estimate: ~128kbps MP3 = ~16KB per second
          const durationEstimate = stats.size / 16000;
          return resolve(Math.round(durationEstimate));
        } catch (err) {
          return reject(error);
        }
      }
      
      const duration = parseFloat(stdout.trim());
      resolve(Math.round(duration)); // Round to nearest second
    });
  });
};

/**
 * Format seconds to mm:ss or hh:mm:ss format
 * @param {number} seconds - Duration in seconds
 * @returns {string} - Formatted time
 */
exports.formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Extract comprehensive metadata from audio file
 */
const extractAudioMetadata = async (filePath) => {
  try {
    const metadata = await mm.parseFile(filePath);
    const stats = fs.statSync(filePath);
    
    return {
      // Basic audio info
      duration: metadata.format.duration || 0,
      bitrate: metadata.format.bitrate || 0,
      sampleRate: metadata.format.sampleRate || 0,
      channels: metadata.format.numberOfChannels || 0,
      format: metadata.format.container || path.extname(filePath).slice(1),
      fileSize: stats.size,
      
      // Embedded metadata
      embeddedMetadata: {
        title: metadata.common.title || '',
        artist: metadata.common.artist || '',
        album: metadata.common.album || '',
        genre: metadata.common.genre ? metadata.common.genre[0] : '',
        year: metadata.common.year || null,
        track: {
          no: metadata.common.track?.no || null,
          of: metadata.common.track?.of || null
        },
        albumArtist: metadata.common.albumartist || '',
        composer: metadata.common.composer ? metadata.common.composer[0] : '',
        comment: metadata.common.comment ? metadata.common.comment[0] : ''
      },
      
      // Cover art
      coverArt: metadata.common.picture && metadata.common.picture.length > 0 
        ? metadata.common.picture[0] 
        : null
    };
  } catch (error) {
    console.error('Error extracting metadata:', error);
    throw new Error('Failed to extract audio metadata');
  }
};

/**
 * Generate waveform data from audio file
 */
const generateWaveform = async (inputPath, options = {}) => {
  const {
    samples = 1000
  } = options;

  return new Promise((resolve, reject) => {
    const tempWavPath = path.join(__dirname, '../../temp', `temp_${Date.now()}.wav`);
    
    // First convert to WAV for processing
    ffmpeg(inputPath)
      .audioCodec('pcm_s16le')
      .audioChannels(1)
      .audioFrequency(22050)
      .format('wav')
      .output(tempWavPath)
      .on('end', async () => {
        try {
          // Read WAV file and generate waveform data
          const waveformData = await generateWaveformFromWav(tempWavPath, samples);
          
          // Clean up temp file
          if (fs.existsSync(tempWavPath)) {
            fs.unlinkSync(tempWavPath);
          }
          
          resolve(waveformData);
        } catch (error) {
          reject(error);
        }
      })
      .on('error', (error) => {
        console.error('FFmpeg error:', error);
        reject(new Error('Failed to process audio for waveform'));
      })
      .run();
  });
};

/**
 * Generate waveform data from WAV file
 */
const generateWaveformFromWav = async (wavPath, samples = 1000) => {
  try {
    const buffer = fs.readFileSync(wavPath);
    
    // Skip WAV header (44 bytes) and read audio data
    const audioData = buffer.slice(44);
    const samplesCount = audioData.length / 2; // 16-bit samples
    
    const peaks = [];
    const chunkSize = Math.floor(samplesCount / samples);
    
    for (let i = 0; i < samples; i++) {
      let max = 0;
      const start = i * chunkSize * 2;
      const end = Math.min(start + chunkSize * 2, audioData.length);
      
      for (let j = start; j < end; j += 2) {
        const sample = audioData.readInt16LE(j);
        const normalized = Math.abs(sample) / 32768; // Normalize to 0-1
        max = Math.max(max, normalized);
      }
      
      peaks.push(max);
    }
    
    return {
      peaks,
      length: samples,
      sampleRate: 22050 // Matches our conversion
    };
  } catch (error) {
    console.error('Error generating waveform from WAV:', error);
    throw new Error('Failed to generate waveform data');
  }
};

/**
 * Analyze audio features (tempo, key, etc.)
 */
const analyzeAudioFeatures = async (filePath) => {
  try {
    // This is a simplified version - in production you'd use more sophisticated analysis
    const metadata = await mm.parseFile(filePath);
    
    // Basic analysis from metadata and file characteristics
    const features = {
      tempo: extractBPM(metadata) || estimateTempo(filePath),
      key: extractKey(metadata) || 'Unknown',
      loudness: calculateLoudness(metadata),
      energy: Math.random() * 0.3 + 0.4, // Placeholder - would use real analysis
      valence: Math.random() * 0.4 + 0.3, // Placeholder
      acousticness: Math.random() * 0.3 + 0.2, // Placeholder
      instrumentalness: Math.random() * 0.5, // Placeholder
      liveness: Math.random() * 0.3 + 0.1, // Placeholder
      speechiness: Math.random() * 0.2 + 0.05, // Placeholder
      danceability: Math.random() * 0.4 + 0.3 // Placeholder
    };
    
    return features;
  } catch (error) {
    console.error('Error analyzing audio features:', error);
    return {
      tempo: null,
      key: 'Unknown',
      loudness: null,
      energy: 0.5,
      valence: 0.5,
      acousticness: 0.5,
      instrumentalness: 0.5,
      liveness: 0.1,
      speechiness: 0.1,
      danceability: 0.5
    };
  }
};

/**
 * Simple genre detection based on audio characteristics
 */
const detectGenre = async (filePath, metadata) => {
  try {
    const audioFeatures = await analyzeAudioFeatures(filePath);
    const embeddedGenre = metadata.embeddedMetadata?.genre;
    
    // Simple rule-based genre detection
    const detectedGenres = [];
    
    // If we have embedded genre, use it with high confidence
    if (embeddedGenre && embeddedGenre.length > 0) {
      detectedGenres.push({
        genre: normalizeGenre(embeddedGenre),
        confidence: 0.9
      });
    }
    
    // Add some basic detection based on audio features
    if (audioFeatures.tempo) {
      if (audioFeatures.tempo > 120 && audioFeatures.energy > 0.7) {
        detectedGenres.push({ genre: 'Electronic', confidence: 0.6 });
      } else if (audioFeatures.tempo < 80 && audioFeatures.acousticness > 0.6) {
        detectedGenres.push({ genre: 'Ballad', confidence: 0.5 });
      } else if (audioFeatures.tempo > 100 && audioFeatures.danceability > 0.6) {
        detectedGenres.push({ genre: 'Pop', confidence: 0.5 });
      }
    }
    
    // Sort by confidence and remove duplicates
    const uniqueGenres = detectedGenres.filter((genre, index, self) =>
      index === self.findIndex(g => g.genre === genre.genre)
    ).sort((a, b) => b.confidence - a.confidence);
    
    if (uniqueGenres.length === 0) {
      return {
        detected: 'Unknown',
        confidence: 0,
        alternatives: []
      };
    }
    
    return {
      detected: uniqueGenres[0].genre,
      confidence: uniqueGenres[0].confidence,
      alternatives: uniqueGenres.slice(1, 4) // Top 3 alternatives
    };
  } catch (error) {
    console.error('Error detecting genre:', error);
    return {
      detected: 'Unknown',
      confidence: 0,
      alternatives: []
    };
  }
};

/**
 * Save embedded cover art to file
 */
const saveEmbeddedCoverArt = async (coverArt, outputPath) => {
  if (!coverArt || !coverArt.data) {
    return null;
  }
  
  try {
    const extension = coverArt.format === 'image/jpeg' ? '.jpg' : '.png';
    const filename = `cover_${Date.now()}${extension}`;
    const fullPath = path.join(outputPath, filename);
    
    // Ensure directory exists
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }
    
    fs.writeFileSync(fullPath, coverArt.data);
    return filename;
  } catch (error) {
    console.error('Error saving cover art:', error);
    return null;
  }
};

/**
 * Create waveform SVG string for visualization
 */
const createWaveformSVG = (waveformData, options = {}) => {
  const {
    width = 1000,
    height = 100,
    backgroundColor = '#000000',
    waveColor = '#1db954',
    strokeWidth = 1
  } = options;
  
  const { peaks } = waveformData;
  const stepX = width / peaks.length;
  const centerY = height / 2;
  
  let pathData = '';
  
  for (let i = 0; i < peaks.length; i++) {
    const x = i * stepX;
    const amplitude = peaks[i] * centerY;
    
    if (i === 0) {
      pathData += `M ${x} ${centerY - amplitude} L ${x} ${centerY + amplitude}`;
    } else {
      pathData += ` M ${x} ${centerY - amplitude} L ${x} ${centerY + amplitude}`;
    }
  }
  
  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${backgroundColor}"/>
      <path d="${pathData}" stroke="${waveColor}" stroke-width="${strokeWidth}" fill="none"/>
    </svg>
  `.trim();
};

// Helper functions
const extractBPM = (metadata) => {
  // Look for BPM in various metadata fields
  const bpm = metadata.common.bpm || 
               metadata.native?.ID3v24?.find(tag => tag.id === 'TBPM')?.value ||
               metadata.native?.ID3v23?.find(tag => tag.id === 'TBPM')?.value;
  return bpm ? parseInt(bpm) : null;
};

const extractKey = (metadata) => {
  // Look for key information in metadata
  const key = metadata.common.key ||
              metadata.native?.ID3v24?.find(tag => tag.id === 'TKEY')?.value ||
              metadata.native?.ID3v23?.find(tag => tag.id === 'TKEY')?.value;
  return key || 'Unknown';
};

const calculateLoudness = (metadata) => {
  // Calculate approximate loudness from available data
  const replayGain = metadata.common.replaygain_track_gain;
  if (replayGain) {
    return parseFloat(replayGain.replace(' dB', ''));
  }
  return null;
};

const estimateTempo = async (filePath) => {
  // Simplified tempo estimation - in production use beat detection algorithms
  return new Promise((resolve) => {
    // Placeholder - would implement actual tempo detection
    resolve(Math.floor(Math.random() * 60) + 80); // Random BPM between 80-140
  });
};

const normalizeGenre = (genre) => {
  // Normalize genre names to standard formats
  const genreMap = {
    'rock': 'Rock',
    'pop': 'Pop',
    'electronic': 'Electronic',
    'hip hop': 'Hip Hop',
    'hip-hop': 'Hip Hop',
    'rap': 'Hip Hop',
    'r&b': 'R&B',
    'rnb': 'R&B',
    'country': 'Country',
    'folk': 'Folk',
    'classical': 'Classical',
    'jazz': 'Jazz',
    'blues': 'Blues',
    'indie': 'Indie',
    'alternative': 'Alternative',
    'ballad': 'Ballad',
    'v-pop': 'V-Pop',
    'vpop': 'V-Pop'
  };
  
  const normalized = genreMap[genre.toLowerCase()] || genre;
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

// Ensure temp directory exists
const tempDir = path.join(__dirname, '../../temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

module.exports = {
  extractAudioMetadata,
  generateWaveform,
  analyzeAudioFeatures,
  detectGenre,
  saveEmbeddedCoverArt,
  createWaveformSVG
}; 