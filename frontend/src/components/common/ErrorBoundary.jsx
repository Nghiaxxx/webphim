import React from 'react';

/**
 * ErrorBoundary component to catch React errors and display fallback UI
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console or error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
          padding: '40px',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '600px',
            background: '#1f2937',
            borderRadius: '12px',
            padding: '32px',
            border: '1px solid #374151'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <h2 style={{ 
              color: '#ef4444', 
              marginBottom: '16px',
              fontSize: '24px',
              fontWeight: '600'
            }}>
              Đã xảy ra lỗi
            </h2>
            <p style={{ 
              color: '#9ca3af', 
              marginBottom: '24px',
              lineHeight: '1.6'
            }}>
              Rất tiếc, đã xảy ra lỗi không mong muốn. Vui lòng thử lại hoặc liên hệ với bộ phận hỗ trợ nếu vấn đề vẫn tiếp tục.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{
                marginTop: '20px',
                padding: '16px',
                background: '#111827',
                borderRadius: '8px',
                textAlign: 'left',
                maxHeight: '300px',
                overflow: 'auto'
              }}>
                <summary style={{ 
                  color: '#9ca3af', 
                  cursor: 'pointer',
                  marginBottom: '12px'
                }}>
                  Chi tiết lỗi (chỉ hiển thị trong development)
                </summary>
                <pre style={{
                  color: '#ef4444',
                  fontSize: '12px',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo && (
                    <>
                      {'\n\n'}
                      {this.state.errorInfo.componentStack}
                    </>
                  )}
                </pre>
              </details>
            )}

            <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={this.handleReset}
                style={{
                  padding: '12px 24px',
                  background: '#3b82f6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Thử lại
              </button>
              <button
                onClick={() => window.location.href = '/'}
                style={{
                  padding: '12px 24px',
                  background: '#374151',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Về trang chủ
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

