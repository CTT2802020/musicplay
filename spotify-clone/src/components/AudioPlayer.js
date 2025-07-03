import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

// Fallback icons if react-icons fails to load
const PlayIcon = () => <span>▶</span>;
const PauseIcon = () => <span>⏸</span>;
const NextIcon = () => <span>⏭</span>;
const PrevIcon = () => <span>⏮</span>;
const ShuffleIcon = () => <span>🔀</span>;
const RepeatIcon = () => <span>🔁</span>;
const RepeatOneIcon = () => <span>🔂</span>;
const VolumeIcon = () => <span>🔊</span>;
const MuteIcon = () => <span>🔇</span>;

// Try to import react-icons, use fallbacks if not available
let FaPlay, FaPause, FaStepForward, FaStepBackward, FaRandom, FaVolumeUp, FaVolumeMute, FaVolumeDown, TbRepeat, TbRepeatOnce;

try {
  const faIcons = require('react-icons/fa');
  const tbIcons = require('react-icons/tb');
  
  FaPlay = faIcons.FaPlay || PlayIcon;
  FaPause = faIcons.FaPause || PauseIcon;
  FaStepForward = faIcons.FaStepForward || NextIcon;
  FaStepBackward = faIcons.FaStepBackward || PrevIcon;
  FaRandom = faIcons.FaRandom || ShuffleIcon;
  FaVolumeUp = faIcons.FaVolumeUp || VolumeIcon;
  FaVolumeMute = faIcons.FaVolumeMute || MuteIcon;
  FaVolumeDown = faIcons.FaVolumeDown || VolumeIcon;
  TbRepeat = tbIcons.TbRepeat || RepeatIcon;
  TbRepeatOnce = tbIcons.TbRepeatOnce || RepeatOneIcon;
} catch (error) {
  console.warn('react-icons not available, using fallback icons');
  FaPlay = PlayIcon;
  FaPause = PauseIcon;
  FaStepForward = NextIcon;
  FaStepBackward = PrevIcon;
  FaRandom = ShuffleIcon;
  FaVolumeUp = VolumeIcon;
  FaVolumeMute = MuteIcon;
  FaVolumeDown = VolumeIcon;
  TbRepeat = RepeatIcon;
  TbRepeatOnce = RepeatOneIcon;
}

const AudioPlayer = ({ 
  currentSong, 
  playlist = [], 
  onNextSong, 
  onPrevSong,
  autoplay = false 
}) => {
  // States
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(0); // 0: no repeat, 1: repeat all, 2: repeat one
  const [audioError, setAudioError] = useState(null);

  // Refs
  const audioRef = useRef(null);
  const progressBarRef = useRef(null);
  const volumeBarRef = useRef(null);
  const animationRef = useRef(null);

  // Play/Pause functions
  const playAudio = useCallback(() => {
    if (!audioRef.current || !currentSong) return;
    
    const audio = audioRef.current;
    
    // Check if audio is ready to play
    if (audio.readyState < 2) {
      console.log('Audio not ready, waiting...');
      setAudioError('Audio is loading, please wait...');
      return;
    }
    
    console.log('Attempting to play audio...');
    audio.play().then(() => {
      console.log('Audio playing successfully');
      setIsPlaying(true);
      setAudioError(null);
      // Start animation loop
      const whilePlaying = () => {
        if (audioRef.current && audioRef.current.currentTime) {
          setCurrentTime(audioRef.current.currentTime);
          animationRef.current = requestAnimationFrame(whilePlaying);
        }
      };
      animationRef.current = requestAnimationFrame(whilePlaying);
    }).catch(err => {
      console.error('Error playing audio:', err);
      if (err.name === 'NotAllowedError') {
        setAudioError('Please click play button to start audio (browser autoplay policy)');
      } else if (err.name === 'NotSupportedError') {
        setAudioError('Audio format not supported by browser');
      } else {
        setAudioError(`Cannot play audio: ${err.message}`);
      }
      setIsPlaying(false);
    });
  }, [currentSong]);

  const pauseAudio = useCallback(() => {
    if (!audioRef.current) return;
    
    const audio = audioRef.current;
    audio.pause();
    setIsPlaying(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  }, []);

  const togglePlayPause = useCallback(() => {
    if (!currentSong) return;
    
    if (isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  }, [isPlaying, currentSong, playAudio, pauseAudio]);

  // Navigation functions
  const handleNext = useCallback(() => {
    pauseAudio();
    if (onNextSong) {
      onNextSong(shuffle);
    }
  }, [onNextSong, shuffle, pauseAudio]);

  const handlePrev = useCallback(() => {
    pauseAudio();
    if (onPrevSong) {
      onPrevSong();
    }
  }, [onPrevSong, pauseAudio]);

  // Effect for loading song
  useEffect(() => {
    if (!currentSong || !audioRef.current) return;
    
    const audio = audioRef.current;
    
    // Reset states
    setCurrentTime(0);
    setDuration(0);
    setAudioError(null);
    setIsPlaying(false);
    
    // Cancel any ongoing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    console.log('Loading song:', currentSong.title, 'URL:', currentSong.url);
    
    // Set up event listeners
    const setAudioData = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
        console.log('Audio loaded successfully, duration:', audio.duration);
        if (autoplay) {
          playAudio();
        }
      }
    };

    const handleError = (e) => {
      console.error('Audio error:', e);
      console.error('Audio error details:', {
        error: e.target?.error,
        networkState: e.target?.networkState,
        readyState: e.target?.readyState,
        src: e.target?.src
      });
      
      const errorMsg = e.target?.error?.message || 'Cannot load audio file';
      setAudioError(`Error loading audio: ${errorMsg}`);
      setIsPlaying(false);
    };

    const handleCanPlay = () => {
      console.log('Audio can play');
      setAudioError(null);
    };

    const handleLoadStart = () => {
      console.log('Audio load started');
    };

    const handleLoadedData = () => {
      console.log('Audio data loaded');
    };
    
    audio.addEventListener('loadedmetadata', setAudioData);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('loadeddata', handleLoadedData);
    
    // Clean up
    return () => {
      if (audio) {
        audio.removeEventListener('loadedmetadata', setAudioData);
        audio.removeEventListener('error', handleError);
        audio.removeEventListener('canplay', handleCanPlay);
        audio.removeEventListener('loadstart', handleLoadStart);
        audio.removeEventListener('loadeddata', handleLoadedData);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [currentSong, autoplay, playAudio]);

  // Effect for keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        togglePlayPause();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [togglePlayPause]);

  // Effect for auto-next when song ends
  useEffect(() => {
    if (!audioRef.current) return;
    
    const audio = audioRef.current;
    
    const handleEnded = () => {
      console.log('Song ended');
      if (repeat === 2) {
        // Repeat one song
        audio.currentTime = 0;
        playAudio();
      } else if (repeat === 1 || (playlist && playlist.length > 1)) {
        // Go to next song
        handleNext();
      } else {
        // Stop playing if no repeat and no more songs
        setIsPlaying(false);
      }
    };
    
    audio.addEventListener('ended', handleEnded);
    
    return () => {
      if (audio) {
        audio.removeEventListener('ended', handleEnded);
      }
    };
  }, [repeat, playlist, handleNext, playAudio]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Progress bar functions
  const calculateTime = (secs) => {
    if (isNaN(secs) || secs === 0) return '0:00';
    
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    const returnedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
    return `${minutes}:${returnedSeconds}`;
  };

  const handleProgressChange = (e) => {
    if (!audioRef.current || !duration) return;
    
    const audio = audioRef.current;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newTime = (clickX / width) * duration;
    
    setCurrentTime(newTime);
    audio.currentTime = newTime;
  };

  // Volume functions
  const handleVolumeChange = (e) => {
    if (!volumeBarRef.current || !audioRef.current) return;
    
    const rect = volumeBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newVolume = Math.max(0, Math.min(1, clickX / width));
    
    setVolume(newVolume);
    audioRef.current.volume = newVolume;
    
    if (newVolume === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    
    const audio = audioRef.current;
    
    if (isMuted) {
      audio.volume = volume;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  // Repeat mode toggle
  const toggleRepeat = () => {
    setRepeat((prevRepeat) => (prevRepeat + 1) % 3);
  };

  // Shuffle toggle
  const toggleShuffle = () => {
    setShuffle((prevShuffle) => !prevShuffle);
  };

  // Volume icon based on level
  const getVolumeIcon = () => {
    if (isMuted || volume === 0) {
      return <FaVolumeMute />;
    } else if (volume < 0.5) {
      return <FaVolumeDown />;
    } else {
      return <FaVolumeUp />;
    }
  };

  return (
    <div className="audio-player bg-gray-900 text-white p-4 border-t border-gray-700">
      {/* Audio element */}
      <audio 
        ref={audioRef} 
        src={currentSong?.url} 
        preload="metadata"
        crossOrigin="anonymous"
        controls={false}
      />
      
      {/* Error message */}
      {audioError && (
        <div className="error-message bg-red-800 text-white p-2 mb-3 rounded text-sm">
          ⚠️ {audioError}
        </div>
      )}
      
      {/* Debug info - only show when there's an error */}
      {(audioError || process.env.NODE_ENV === 'development') && (
        <div className="debug-info text-xs text-gray-400 mb-2 p-2 bg-gray-800 rounded">
          <p>Song: {currentSong?.title || 'None'}</p>
          <p>URL: {currentSong?.url || 'None'}</p>
          <p>Duration: {duration ? calculateTime(duration) : 'Not loaded'}</p>
          <p>Playing: {isPlaying ? 'Yes' : 'No'}</p>
          <p>Ready State: {audioRef.current?.readyState || 'N/A'}</p>
        </div>
      )}
      
      {/* Progress bar */}
      <div className="progress-container mb-3">
        <div 
          className="progress-bar h-2 bg-gray-600 rounded-full cursor-pointer relative"
          ref={progressBarRef}
          onClick={handleProgressChange}
        >
          <div 
            className="progress h-full bg-green-500 rounded-full"
            style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
          ></div>
        </div>
        <div className="time-container flex justify-between text-xs text-gray-400 mt-1">
          <span>{calculateTime(currentTime)}</span>
          <span>{calculateTime(duration)}</span>
        </div>
      </div>
      
      {/* Player controls */}
      <div className="controls-container flex items-center justify-between">
        <div className="song-info flex items-center flex-1 min-w-0">
          {currentSong?.coverImage && (
            <img 
              src={currentSong.coverImage} 
              alt={currentSong.title} 
              className="h-12 w-12 object-cover rounded mr-3"
            />
          )}
          <div className="song-details">
            <h3 className="text-sm font-semibold truncate">{currentSong?.title || 'No song selected'}</h3>
            <p className="text-xs text-gray-400 truncate">{currentSong?.artist || 'Unknown artist'}</p>
          </div>
        </div>
        
        <div className="player-controls flex items-center justify-center flex-1">
          <button 
            className={`mx-2 text-lg p-2 rounded ${shuffle ? 'text-green-500 bg-green-900' : 'text-gray-400 hover:text-white'}`}
            onClick={toggleShuffle}
            title="Shuffle"
          >
            <FaRandom />
          </button>
          <button 
            className="mx-2 text-xl text-gray-300 hover:text-white p-2 rounded"
            onClick={handlePrev}
            disabled={!currentSong}
            title="Previous"
          >
            <FaStepBackward />
          </button>
          <button 
            className="mx-3 p-3 bg-white rounded-full text-black text-xl flex items-center justify-center w-12 h-12 hover:scale-105 transition-transform"
            onClick={togglePlayPause}
            disabled={!currentSong}
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>
          <button 
            className="mx-2 text-xl text-gray-300 hover:text-white p-2 rounded"
            onClick={handleNext}
            disabled={!currentSong}
            title="Next"
          >
            <FaStepForward />
          </button>
          <button 
            className={`mx-2 text-lg p-2 rounded ${repeat > 0 ? 'text-green-500 bg-green-900' : 'text-gray-400 hover:text-white'}`}
            onClick={toggleRepeat}
            title={repeat === 0 ? "Enable repeat" : repeat === 1 ? "Enable repeat all" : "Enable repeat one"}
          >
            {repeat === 2 ? <TbRepeatOnce /> : <TbRepeat />}
          </button>
        </div>
        
        <div className="volume-controls flex items-center justify-end flex-1">
          <button 
            className="text-gray-400 hover:text-white mr-2 p-2 rounded"
            onClick={toggleMute}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {getVolumeIcon()}
          </button>
          <div 
            className="volume-bar w-24 h-2 bg-gray-600 rounded-full cursor-pointer"
            ref={volumeBarRef}
            onClick={handleVolumeChange}
          >
            <div 
              className="volume-level h-full bg-white rounded-full"
              style={{ width: `${isMuted ? 0 : volume * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer; 