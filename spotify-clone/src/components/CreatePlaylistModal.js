import React, { useState } from 'react';

const CreatePlaylistModal = ({ isOpen, onClose, onCreate }) => {
  const [playlistName, setPlaylistName] = useState('');

  if (!isOpen) {
    return null;
  }

  const handleCreate = () => {
    if (playlistName.trim()) {
      onCreate(playlistName.trim());
      setPlaylistName('');
      onClose();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleCreate();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-spotify-light-gray p-6 rounded-lg shadow-spotify-lg w-full max-w-sm"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <h2 className="text-white text-2xl font-bold mb-4">Tạo playlist mới</h2>
        <input
          type="text"
          value={playlistName}
          onChange={(e) => setPlaylistName(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Tên playlist của bạn"
          className="w-full bg-spotify-gray text-white placeholder-gray-400 p-3 rounded-md mb-6 focus:outline-none focus:ring-2 focus:ring-spotify-green"
          autoFocus
        />
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full text-white font-semibold hover:scale-105 transition-transform"
          >
            Hủy
          </button>
          <button
            onClick={handleCreate}
            className="px-6 py-2 bg-spotify-green text-black font-semibold rounded-full hover:bg-spotify-green/90 hover:scale-105 transition-transform"
          >
            Tạo
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePlaylistModal; 