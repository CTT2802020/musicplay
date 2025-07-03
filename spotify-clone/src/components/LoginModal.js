import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const LoginModal = ({ isOpen, onClose, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      await login(email, password);
      onClose();
      // Reset form
      setEmail('');
      setPassword('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleClose = () => {
    setEmail('');
    setPassword('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-spotify-gray rounded-lg p-8 w-full max-w-md relative animate-scale-in">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-spotify-text-secondary hover:text-white text-2xl"
        >
          ×
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-spotify-green rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-black font-bold text-2xl">S</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Đăng nhập vào Spotify</h2>
          <p className="text-spotify-text-secondary">Chào mừng bạn trở lại!</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Email hoặc tên người dùng
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email hoặc tên người dùng"
              className="w-full px-4 py-3 bg-spotify-light-gray text-white rounded-lg border border-spotify-lighter-gray focus:border-spotify-green focus:outline-none transition-colors"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Mật khẩu
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mật khẩu"
              className="w-full px-4 py-3 bg-spotify-light-gray text-white rounded-lg border border-spotify-lighter-gray focus:border-spotify-green focus:outline-none transition-colors"
              disabled={isLoading}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-spotify-green text-black font-bold py-3 rounded-full hover:bg-spotify-green-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                <span>Đang đăng nhập...</span>
              </div>
            ) : (
              'Đăng nhập'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-spotify-lighter-gray"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-spotify-gray text-spotify-text-secondary">hoặc</span>
          </div>
        </div>

        {/* Social Login Buttons */}
        <div className="space-y-3">
          <button className="w-full bg-blue-600 text-white font-semibold py-3 rounded-full hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
            <span>📘</span>
            <span>Tiếp tục với Facebook</span>
          </button>
          <button className="w-full bg-white text-black font-semibold py-3 rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2">
            <span>🔍</span>
            <span>Tiếp tục với Google</span>
          </button>
        </div>

        {/* Register Link */}
        <div className="text-center mt-8 pt-6 border-t border-spotify-lighter-gray">
          <p className="text-spotify-text-secondary">
            Chưa có tài khoản?{' '}
            <button
              onClick={onSwitchToRegister}
              className="text-white hover:text-spotify-green hover:underline font-medium"
            >
              Đăng ký Spotify
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal; 