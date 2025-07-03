import React, { useState } from 'react';
import axios from 'axios';

const UploadMusic = () => {
  const [audioFile, setAudioFile] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [metadata, setMetadata] = useState({
    title: '',
    artist: '',
    album: '',
    genre: '',
    year: ''
  });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [dragActive, setDragActive] = useState(false);

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
      if (file.type.startsWith('audio/')) {
        setAudioFile(file);
        if (!metadata.title) {
          setMetadata(prev => ({
            ...prev,
            title: file.name.replace(/\.[^/.]+$/, "")
          }));
        }
      } else if (file.type.startsWith('image/')) {
        setCoverImage(file);
      }
    }
  };

  const handleAudioChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAudioFile(file);
      if (!metadata.title) {
        setMetadata(prev => ({
          ...prev,
          title: file.name.replace(/\.[^/.]+$/, "")
        }));
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
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
      setMessage('Vui lòng chọn file nhạc để upload!');
      return;
    }

    if (!metadata.title || !metadata.artist) {
      setMessage('Vui lòng nhập tên bài hát và tên nghệ sĩ!');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setMessage('');

    const formData = new FormData();
    formData.append('audio', audioFile);
    if (coverImage) {
      formData.append('coverImage', coverImage);
    }
    formData.append('title', metadata.title);
    formData.append('artist', metadata.artist);
    formData.append('album', metadata.album);
    formData.append('genre', metadata.genre);
    formData.append('year', metadata.year);

    try {
      const response = await axios.post(
        'http://localhost:3002/api/v1/upload/song',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': 'Bearer demo-token'
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(progress);
          }
        }
      );

      setMessage('Upload thành công! Bài hát đã được lưu.');
      
      // Reset form
      setAudioFile(null);
      setCoverImage(null);
      setMetadata({
        title: '',
        artist: '',
        album: '',
        genre: '',
        year: ''
      });
      
      // Reset file inputs
      document.getElementById('audioInput').value = '';
      document.getElementById('imageInput').value = '';
      
    } catch (error) {
      console.error('Upload error:', error);
      setMessage(
        error.response?.data?.message || 
        'Có lỗi xảy ra khi upload. Vui lòng thử lại!'
      );
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Upload Nhạc
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Drag and Drop Zone */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="space-y-4">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div>
              <p className="text-lg text-gray-600">
                Kéo và thả file nhạc hoặc ảnh bìa vào đây
              </p>
              <p className="text-sm text-gray-500">
                hoặc click để chọn file
              </p>
            </div>
          </div>
        </div>

        {/* File Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              File nhạc (MP3, WAV, M4A)
            </label>
            <input
              id="audioInput"
              type="file"
              accept="audio/*"
              onChange={handleAudioChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {audioFile && (
              <p className="mt-1 text-sm text-green-600">
                ✓ {audioFile.name}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ảnh bìa (JPG, PNG)
            </label>
            <input
              id="imageInput"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
            />
            {coverImage && (
              <div className="mt-2">
                <p className="text-sm text-green-600">✓ {coverImage.name}</p>
                <img
                  src={URL.createObjectURL(coverImage)}
                  alt="Preview"
                  className="mt-2 w-20 h-20 object-cover rounded-lg border"
                />
              </div>
            )}
          </div>
        </div>

        {/* Metadata Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên bài hát *
            </label>
            <input
              type="text"
              name="title"
              value={metadata.title}
              onChange={handleMetadataChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập tên bài hát"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nghệ sĩ *
            </label>
            <input
              type="text"
              name="artist"
              value={metadata.artist}
              onChange={handleMetadataChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập tên nghệ sĩ"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Album
            </label>
            <input
              type="text"
              name="album"
              value={metadata.album}
              onChange={handleMetadataChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập tên album"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thể loại
            </label>
            <select
              name="genre"
              value={metadata.genre}
              onChange={handleMetadataChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Chọn thể loại</option>
              <option value="Pop">Pop</option>
              <option value="Rock">Rock</option>
              <option value="Hip Hop">Hip Hop</option>
              <option value="R&B">R&B</option>
              <option value="Country">Country</option>
              <option value="Electronic">Electronic</option>
              <option value="Jazz">Jazz</option>
              <option value="Classical">Classical</option>
              <option value="Folk">Folk</option>
              <option value="Blues">Blues</option>
              <option value="Indie">Indie</option>
              <option value="Alternative">Alternative</option>
              <option value="V-Pop">V-Pop</option>
              <option value="Ballad">Ballad</option>
              <option value="Other">Khác</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Năm phát hành
            </label>
            <input
              type="number"
              name="year"
              value={metadata.year}
              onChange={handleMetadataChange}
              min="1900"
              max={new Date().getFullYear()}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập năm phát hành"
            />
          </div>
        </div>

        {/* Progress Bar */}
        {uploading && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
            <p className="text-center text-sm text-gray-600 mt-2">
              Đang upload... {uploadProgress}%
            </p>
          </div>
        )}

        {/* Message */}
        {message && (
          <div
            className={`p-4 rounded-md ${
              message.includes('thành công')
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {message}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={uploading || !audioFile}
          className={`w-full py-3 px-4 rounded-md font-semibold text-white transition-colors ${
            uploading || !audioFile
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {uploading ? 'Đang upload...' : 'Upload Nhạc'}
        </button>
      </form>
    </div>
  );
};

export default UploadMusic; 