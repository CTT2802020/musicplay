import React, { useState } from "react";
import { useAuth } from '../contexts/AuthContext';

const UploadMusic = ({ onAddSong }) => {
  const { user, isAuthenticated } = useAuth();
  const [audioFile, setAudioFile] = useState(null);
  const [metadata, setMetadata] = useState({
    title: ''
  });
  const [dragActive, setDragActive] = useState(false);
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.type.startsWith('audio/') || file.name.endsWith('.mp3')) {
        handleFileSelect(file);
      } else {
        setMessage('Vui lòng chọn file nhạc MP3!');
      }
    }
  };

  const handleFileSelect = (file) => {
    setAudioFile(file);
    // Auto fill title from filename
    const fileName = file.name.replace(/\.[^/.]+$/, "");
    setMetadata(prev => ({
      ...prev,
      title: fileName
    }));
    setMessage('');
  };

  const handleAudioChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleMetadataChange = (e) => {
    const { name, value } = e.target;
    setMetadata(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!audioFile) {
      setMessage('Vui lòng chọn file nhạc!');
      return;
    }

    if (!metadata.title.trim()) {
      setMessage('Vui lòng nhập tên bài hát!');
      return;
    }

    if (!isAuthenticated) {
      setMessage('Vui lòng đăng nhập để tải nhạc lên!');
      return;
    }

    setIsProcessing(true);
    setMessage('Đang upload file lên server...');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Không tìm thấy token. Vui lòng đăng nhập lại.');
      }
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('audioFile', audioFile); // Changed from 'audio' to 'audioFile' to match backend
      formData.append('title', metadata.title.trim());
      formData.append('artist', 'Uploaded Song'); // Default artist
      
      console.log('🚀 Uploading file to server:', audioFile.name, Math.round(audioFile.size / 1024), 'KB');
      
      // Upload file to server with authentication
      const response = await fetch('http://localhost:3002/api/v1/upload/song', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Upload failed');
      }

      const uploadResult = await response.json();
      console.log('✅ Upload successful:', uploadResult);
      
      // Check if upload was successful
      if (!uploadResult.success) {
        throw new Error(uploadResult.message || 'Upload was not successful');
      }
      
      // Create new song object with temporary local URL until processing completes
      const newSong = {
        id: uploadResult.data.songId || `uploaded_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: uploadResult.data.title || metadata.title.trim(),
        artist: uploadResult.data.artist || 'Uploaded Song',
        src: URL.createObjectURL(audioFile), // Use blob URL temporarily until processing completes
        cover: 'https://via.placeholder.com/300x300/1DB954/ffffff?text=Uploading',
        isLocal: true,
        fileName: audioFile.name,
        fileSize: audioFile.size,
        uploadedAt: new Date().toISOString(),
        processingStatus: 'processing', // Track processing status
        songId: uploadResult.data.songId
      };
      
      // Final validation before adding to playlist
      if (!newSong.src || newSong.src.includes('null') || newSong.src.includes('undefined')) {
        throw new Error('Generated invalid song URL: ' + newSong.src);
      }

      console.log('🎵 Created song object:', newSong);

      // Add to playlist if callback provided
      if (onAddSong) {
        console.log('✅ Calling onAddSong with:', { 
          title: newSong.title, 
          artist: newSong.artist,
          id: newSong.id 
        });
        onAddSong(newSong);
      } else {
        console.error('❌ onAddSong callback not provided!');
      }

      setMessage('✅ Upload thành công! Bài hát đã được thêm vào thư viện và có thể phát ngay.');
      
      // Reset form after 2 seconds
      setTimeout(() => {
        setAudioFile(null);
        setMetadata({
          title: ''
        });
        
        // Reset file input
        const fileInput = document.getElementById('audioInput');
        if (fileInput) {
          fileInput.value = '';
        }
        
        setMessage('');
      }, 2000);
      
    } catch (error) {
      console.error('❌ Upload error:', error);
      setMessage(`❌ Upload thất bại: ${error.message}. Vui lòng đảm bảo upload server đang chạy!`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-spotify-dark-gray to-spotify-black text-white p-4 sm:p-8 overflow-auto">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-spotify-green rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">⬆️</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-2">
            Tải nhạc lên
          </h2>
          <p className="text-spotify-text-secondary">
            Chỉ cần chọn file MP3 và thêm thông tin cơ bản
          </p>
          <p className="text-green-400 text-sm mt-2">
            ✅ Files sẽ được lưu lâu dài và có thể phát bất kỳ lúc nào
          </p>
          {!isAuthenticated && (
            <p className="text-yellow-400 text-sm mt-2 bg-yellow-900/20 p-2 rounded">
              ⚠️ Bạn cần đăng nhập để sử dụng tính năng upload nhạc
            </p>
          )}
          {isAuthenticated && user && (
            <p className="text-green-400 text-sm mt-2">
              👋 Xin chào, {user.name}! Bạn có thể upload nhạc ngay.
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Show login message if not authenticated */}
          {!isAuthenticated && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 text-center">
              <p className="text-red-400 mb-3">
                🔒 Bạn cần đăng nhập để tải nhạc lên
              </p>
              <p className="text-sm text-gray-400">
                Nhấn vào nút "Đăng nhập" ở góc trên bên phải để tiếp tục
              </p>
            </div>
          )}
          {/* Drag and Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${ 
              !isAuthenticated
                ? 'border-gray-600 bg-gray-800/50 cursor-not-allowed opacity-50'
                : dragActive
                ? 'border-spotify-green bg-spotify-green/10 scale-105 cursor-pointer'
                : audioFile
                ? 'border-spotify-green bg-spotify-green/5 cursor-pointer'
                : 'border-spotify-lighter-gray hover:border-spotify-green/50 hover:bg-spotify-light-gray/20 cursor-pointer'
            }`}
            onDragEnter={isAuthenticated ? handleDrag : undefined}
            onDragLeave={isAuthenticated ? handleDrag : undefined}
            onDragOver={isAuthenticated ? handleDrag : undefined}
            onDrop={isAuthenticated ? handleDrop : undefined}
            onClick={isAuthenticated ? () => document.getElementById('audioInput').click() : undefined}
          >
            <div className="space-y-4">
              <div className="text-6xl">
                {audioFile ? '🎵' : '📁'}
              </div>
              <div>
                {audioFile ? (
                  <div>
                    <p className="text-lg text-spotify-green font-semibold">
                      ✅ {audioFile.name}
                    </p>
                    <p className="text-sm text-spotify-text-secondary">
                      {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-lg text-white">
                      Kéo thả file MP3 vào đây
                    </p>
                    <p className="text-sm text-spotify-text-secondary">
                      hoặc click để chọn file
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Hidden File Input */}
          <input
            id="audioInput"
            type="file"
            accept="audio/mp3,audio/mpeg,.mp3"
            onChange={handleAudioChange}
            className="hidden"
            disabled={!isAuthenticated}
          />

          {/* Song Metadata */}
          <div className="space-y-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Tên bài hát *
              </label>
              <input
                type="text"
                name="title"
                value={metadata.title}
                onChange={handleMetadataChange}
                placeholder={isAuthenticated ? "Nhập tên bài hát..." : "Vui lòng đăng nhập trước"}
                className="w-full px-4 py-3 bg-spotify-light-gray text-white rounded-lg border border-spotify-lighter-gray focus:border-spotify-green focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                required
                autoFocus={isAuthenticated}
                disabled={!isAuthenticated}
              />
            </div>
          </div>

          {/* Message */}
          {message && (
            <div className={`p-4 rounded-lg text-sm ${
              message.includes('✅') 
                ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
                : 'bg-red-500/20 text-red-400 border border-red-500/50'
            }`}>
              {message}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!audioFile || isProcessing || !isAuthenticated}
            className="w-full bg-spotify-green text-black font-bold py-3 rounded-full hover:bg-spotify-green-hover transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-spotify-green"
          >
            {isProcessing ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                <span>Đang xử lý...</span>
              </div>
            ) : (
              '🎵 Thêm vào thư viện'
            )}
          </button>
        </form>

        {/* Instructions */}
        <div className="mt-8 p-4 bg-spotify-light-gray/30 rounded-lg">
          <h3 className="text-sm font-semibold text-white mb-2">📋 Hướng dẫn:</h3>
          <ul className="text-xs text-spotify-text-secondary space-y-1">
            <li>• Chỉ hỗ trợ file MP3</li>
            <li>• Kích thước tối đa: 50MB</li>
            <li>• Bài hát sẽ được lưu trong thư viện cá nhân</li>
            <li>• Có thể phát ngay sau khi upload</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UploadMusic;
