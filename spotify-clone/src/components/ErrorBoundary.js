import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Cập nhật state để hiển thị fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log lỗi để debug
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Lưu thông tin lỗi vào state
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Có thể gửi lỗi lên service tracking như Sentry
    // logErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI khi có lỗi
      return (
        <div className="min-h-screen bg-spotify-black flex items-center justify-center">
          <div className="text-center p-8 max-w-md mx-auto">
            <div className="w-24 h-24 bg-spotify-light-gray rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">⚠️</span>
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-4">
              Oops! Có lỗi xảy ra
            </h1>
            
            <p className="text-spotify-text-secondary mb-6">
              Ứng dụng gặp lỗi không mong muốn. Đừng lo, bạn có thể thử lại.
            </p>

            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full bg-spotify-green text-black font-bold py-3 px-6 rounded-full hover:bg-spotify-green-hover transition-colors"
              >
                Thử lại
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-transparent border border-spotify-light text-white font-bold py-3 px-6 rounded-full hover:border-white transition-colors"
              >
                Tải lại trang
              </button>
            </div>

            {/* Development mode: Hiển thị chi tiết lỗi */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-spotify-text-secondary hover:text-white transition-colors">
                  Chi tiết lỗi (Development)
                </summary>
                <div className="mt-3 p-4 bg-spotify-light-gray rounded-lg text-sm font-mono">
                  <h4 className="text-red-400 font-bold mb-2">Error:</h4>
                  <p className="text-red-300 mb-4">{this.state.error.toString()}</p>
                  
                  {this.state.errorInfo.componentStack && (
                    <>
                      <h4 className="text-yellow-400 font-bold mb-2">Component Stack:</h4>
                      <pre className="text-yellow-300 whitespace-pre-wrap text-xs overflow-auto max-h-32">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 