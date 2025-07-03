import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const RegisterModal = ({ isOpen, onClose, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const { register, isLoading } = useAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Email không hợp lệ');
      return;
    }

    try {
      await register(formData.name, formData.email, formData.password);
      onClose();
      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-spotify-gray rounded-lg p-8 w-full max-w-md relative animate-scale-in max-h-[90vh] overflow-y-auto">
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
          <h2 className="text-2xl font-bold text-white mb-2">Đăng ký Spotify miễn phí</h2>
          <p className="text-spotify-text-secondary">Tạo tài khoản để bắt đầu nghe nhạc</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Tên hiển thị
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Nhập tên hiển thị"
              className="w-full px-4 py-3 bg-spotify-light-gray text-white rounded-lg border border-spotify-lighter-gray focus:border-spotify-green focus:outline-none transition-colors"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Nhập email của bạn"
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
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Tạo mật khẩu"
              className="w-full px-4 py-3 bg-spotify-light-gray text-white rounded-lg border border-spotify-lighter-gray focus:border-spotify-green focus:outline-none transition-colors"
              disabled={isLoading}
            />
            <p className="text-spotify-text-secondary text-xs mt-1">
              Mật khẩu phải có ít nhất 6 ký tự
            </p>
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Xác nhận mật khẩu
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Nhập lại mật khẩu"
              className="w-full px-4 py-3 bg-spotify-light-gray text-white rounded-lg border border-spotify-lighter-gray focus:border-spotify-green focus:outline-none transition-colors"
              disabled={isLoading}
            />
          </div>

          {/* Terms */}
          <div className="text-xs text-spotify-text-secondary">
            Bằng cách nhấp vào Đăng ký, bạn đồng ý với{' '}
            <button type="button" className="text-spotify-green hover:underline">
              Điều khoản và Điều kiện sử dụng
            </button>{' '}
            của Spotify.
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-spotify-green text-black font-bold py-3 rounded-full hover:bg-spotify-green-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                <span>Đang đăng ký...</span>
              </div>
            ) : (
              'Đăng ký'
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

        {/* Social Register Buttons */}
        <div className="space-y-3">
          <button className="w-full bg-blue-600 text-white font-semibold py-3 rounded-full hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
            <span>📘</span>
            <span>Đăng ký với Facebook</span>
          </button>
          <button className="w-full bg-white text-black font-semibold py-3 rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2">
            <span>🔍</span>
            <span>Đăng ký với Google</span>
          </button>
        </div>

        {/* Login Link */}
        <div className="text-center mt-8 pt-6 border-t border-spotify-lighter-gray">
          <p className="text-spotify-text-secondary">
            Đã có tài khoản?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-white hover:text-spotify-green hover:underline font-medium"
            >
              Đăng nhập tại đây
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal; 