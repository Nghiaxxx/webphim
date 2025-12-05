import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { getTranslation } from '../utils/translations';
import Header from '../components/Header';
import Footer from '../components/Footer';

function Login() {
  const { language } = useLanguage();
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const t = (key) => getTranslation(key, language);
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberPassword, setRememberPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Login form state
  const [loginForm, setLoginForm] = useState({
    account: '',
    password: ''
  });

  // Register form state
  const [registerForm, setRegisterForm] = useState({
    fullName: '',
    dateOfBirth: '',
    phone: '',
    username: '',
    idCard: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleLoginChange = (e) => {
    setLoginForm({
      ...loginForm,
      [e.target.name]: e.target.value
    });
  };

  const handleRegisterChange = (e) => {
    setRegisterForm({
      ...registerForm,
      [e.target.name]: e.target.value
    });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // account có thể là email hoặc phone
      const email = loginForm.account;
      const result = await login(email, loginForm.password);

      if (result.success) {
        // Đăng nhập thành công, redirect về trang chủ
        setSuccess('Đăng nhập thành công!');
        setTimeout(() => {
          navigate('/');
        }, 500);
      } else {
        setError(result.error || 'Đăng nhập thất bại');
      }
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi đăng nhập');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (registerForm.password !== registerForm.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (registerForm.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (!agreeTerms) {
      setError('Vui lòng đồng ý với điều khoản');
      return;
    }

    setLoading(true);

    try {
      const userData = {
        email: registerForm.email,
        password: registerForm.password,
        full_name: registerForm.fullName,
        phone: registerForm.phone || null,
        date_of_birth: registerForm.dateOfBirth || null,
      };

      const result = await register(userData);

      if (result.success) {
        // Đăng ký thành công, hiển thị thông báo và chuyển sang tab đăng nhập
        setSuccess('Đăng ký thành công! Vui lòng đăng nhập.');
        // Reset form
        setRegisterForm({
          fullName: '',
          dateOfBirth: '',
          phone: '',
          username: '',
          idCard: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
        // Chuyển sang tab đăng nhập sau 1.5 giây
        setTimeout(() => {
          setActiveTab('login');
          setSuccess('');
          // Điền email vào form đăng nhập
          setLoginForm({
            account: userData.email,
            password: ''
          });
        }, 1500);
      } else {
        setError(result.error || 'Đăng ký thất bại');
      }
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi đăng ký');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    console.log(`Social login with ${provider}`);
    // TODO: Implement social login logic
  };

  return (
    <div className="app-root">
      <Header />
      <main className="login-main">
        <div className="login-container">
          <div className="login-form-wrapper">
            {/* Tabs */}
            <div className="login-tabs">
              <button
                className={`login-tab ${activeTab === 'login' ? 'active' : ''}`}
                onClick={() => setActiveTab('login')}
              >
                {t('login.tabLogin')}
              </button>
              <button
                className={`login-tab ${activeTab === 'register' ? 'active' : ''}`}
                onClick={() => setActiveTab('register')}
              >
                {t('login.tabRegister')}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="error-message" style={{
                padding: '10px',
                marginBottom: '15px',
                backgroundColor: '#fee',
                color: '#c33',
                borderRadius: '4px',
                textAlign: 'center'
              }}>
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="success-message" style={{
                padding: '10px',
                marginBottom: '15px',
                backgroundColor: '#dfd',
                color: '#3a3',
                borderRadius: '4px',
                textAlign: 'center'
              }}>
                {success}
              </div>
            )}

            {/* Login Form */}
            {activeTab === 'login' && (
              <form className="login-form" onSubmit={handleLoginSubmit}>
                <div className="form-group">
                  <label htmlFor="account">{t('login.accountLabel')}</label>
                  <input
                    type="text"
                    id="account"
                    name="account"
                    value={loginForm.account}
                    onChange={handleLoginChange}
                    placeholder={t('login.accountPlaceholder')}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">{t('login.passwordLabel')}</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={loginForm.password}
                      onChange={handleLoginChange}
                      placeholder={t('login.passwordPlaceholder')}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                </div>

                <div className="form-options">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={rememberPassword}
                      onChange={(e) => setRememberPassword(e.target.checked)}
                    />
                    <span>{t('login.rememberPassword')}</span>
                  </label>
                  <a href="#" className="forgot-password-link">
                    {t('login.forgotPassword')}
                  </a>
                </div>

                <button 
                  type="submit" 
                  className="login-submit-btn"
                  disabled={loading}
                >
                  {loading ? 'Đang xử lý...' : t('login.submitButton')}
                </button>

                {/* Social Login Options */}
                <div className="social-login-section">
                  <div className="social-login-divider">
                    <span className="divider-text">{t('login.or')}</span>
                  </div>
                  
                  <div className="social-login-grid">
                    <div className="social-login-column">
                      <button type="button" className="social-login-btn" onClick={() => handleSocialLogin('google')}>
                        <i className="fab fa-google"></i>
                        <span>{t('login.continueWith')} Google</span>
                      </button>
                      <button type="button" className="social-login-btn" onClick={() => handleSocialLogin('instagram')}>
                        <i className="fab fa-instagram"></i>
                        <span>{t('login.continueWith')} Instagram</span>
                      </button>
                      <button type="button" className="social-login-btn" onClick={() => handleSocialLogin('tiktok')}>
                        <i className="fab fa-tiktok"></i>
                        <span>{t('login.continueWith')} TikTok</span>
                      </button>
                      <button type="button" className="social-login-btn" onClick={() => handleSocialLogin('reddit')}>
                        <i className="fab fa-reddit"></i>
                        <span>{t('login.continueWith')} Reddit</span>
                      </button>
                      <button type="button" className="social-login-btn" onClick={() => handleSocialLogin('github')}>
                        <i className="fab fa-github"></i>
                        <span>{t('login.continueWith')} GitHub</span>
                      </button>
                      <button type="button" className="social-login-btn" onClick={() => handleSocialLogin('snapchat')}>
                        <i className="fab fa-snapchat"></i>
                        <span>{t('login.continueWith')} Snapchat</span>
                      </button>
                      <button type="button" className="social-login-btn" onClick={() => handleSocialLogin('spotify')}>
                        <i className="fab fa-spotify"></i>
                        <span>{t('login.continueWith')} Spotify</span>
                      </button>
                      <button type="button" className="social-login-btn" onClick={() => handleSocialLogin('telegram')}>
                        <i className="fab fa-telegram"></i>
                        <span>{t('login.continueWith')} Telegram</span>
                      </button>
                      <button type="button" className="social-login-btn" onClick={() => handleSocialLogin('apple')}>
                        <i className="fab fa-apple"></i>
                        <span>{t('login.continueWith')} Apple</span>
                      </button>
                      <button type="button" className="social-login-btn" onClick={() => handleSocialLogin('slack')}>
                        <i className="fab fa-slack"></i>
                        <span>{t('login.continueWith')} Slack</span>
                      </button>
                      <button type="button" className="social-login-btn" onClick={() => handleSocialLogin('steam')}>
                        <i className="fab fa-steam"></i>
                        <span>{t('login.continueWith')} Steam</span>
                      </button>
                      <button type="button" className="social-login-btn" onClick={() => handleSocialLogin('amazon')}>
                        <i className="fab fa-amazon"></i>
                        <span>{t('login.continueWith')} Amazon</span>
                      </button>
                      <button type="button" className="social-login-btn" onClick={() => handleSocialLogin('hbo')}>
                        <i className="fas fa-tv"></i>
                        <span>{t('login.continueWith')} HBO</span>
                      </button>
                      <button type="button" className="social-login-btn" onClick={() => handleSocialLogin('kickstarter')}>
                        <i className="fab fa-kickstarter"></i>
                        <span>{t('login.continueWith')} Kickstarter</span>
                      </button>
                      <button type="button" className="social-login-btn" onClick={() => handleSocialLogin('yandex')}>
                        <i className="fab fa-yandex"></i>
                        <span>{t('login.continueWith')} Yandex</span>
                      </button>
                      <button type="button" className="social-login-btn" onClick={() => handleSocialLogin('wechat')}>
                        <i className="fab fa-weixin"></i>
                        <span>{t('login.continueWith')} WeChat</span>
                      </button>
                      <button type="button" className="social-login-btn" onClick={() => handleSocialLogin('playstation')}>
                        <i className="fab fa-playstation"></i>
                        <span>{t('login.continueWith')} PlayStation</span>
                      </button>
                      <button type="button" className="social-login-btn" onClick={() => handleSocialLogin('blizzard')}>
                        <i className="fab fa-battle-net"></i>
                        <span>{t('login.continueWith')} Blizzard</span>
                      </button>
                      <button type="button" className="social-login-btn" onClick={() => handleSocialLogin('shopee')}>
                        <i className="fas fa-shopping-bag"></i>
                        <span>{t('login.continueWith')} Shopee</span>
                      </button>
                      <button type="button" className="social-login-btn" onClick={() => handleSocialLogin('deezer')}>
                        <i className="fab fa-deezer"></i>
                        <span>{t('login.continueWith')} Deezer</span>
                      </button>
                      <button type="button" className="social-login-btn" onClick={() => handleSocialLogin('medium')}>
                        <i className="fab fa-medium"></i>
                        <span>{t('login.continueWith')} Medium</span>
                      </button>
                      <button type="button" className="social-login-btn" onClick={() => handleSocialLogin('dribbble')}>
                        <i className="fab fa-dribbble"></i>
                        <span>{t('login.continueWith')} Dribbble</span>
                      </button>
                      <button type="button" className="social-login-btn" onClick={() => handleSocialLogin('notion')}>
                        <i className="fas fa-file-alt"></i>
                        <span>{t('login.continueWith')} Notion</span>
                      </button>
                      <button type="button" className="social-login-btn" onClick={() => handleSocialLogin('airbnb')}>
                        <i className="fab fa-airbnb"></i>
                        <span>{t('login.continueWith')} Airbnb</span>
                      </button>
                      <button type="button" className="social-login-btn" onClick={() => handleSocialLogin('okru')}>
                        <i className="fas fa-globe"></i>
                        <span>{t('login.continueWith')} OK.ru</span>
                      </button>
                      <button type="button" className="social-login-btn" onClick={() => handleSocialLogin('gojek')}>
                        <i className="fas fa-motorcycle"></i>
                        <span>{t('login.continueWith')} Gojek</span>
                      </button>
                      <button type="button" className="social-login-btn" onClick={() => handleSocialLogin('pornhub')}>
                        <i className="fas fa-video"></i>
                        <span>{t('login.continueWith')} Pornhub</span>
                      </button>

                    </div>
                    
                    <div className="social-login-column">
                      <button type="button" className="social-login-btn" onClick={() => handleSocialLogin('facebook')}>
                        <i className="fab fa-facebook-f"></i>
                        <span>{t('login.continueWith')} Facebook</span>
                      </button>
                      <button type="button" className="social-login-btn" onClick={() => handleSocialLogin('twitter')}>
                        <i className="fab fa-x-twitter"></i>
                        <span>{t('login.continueWith')} X</span>
                      </button>
                      <button type="button" className="social-login-btn" onClick={() => handleSocialLogin('youtube')}>
                        <i className="fab fa-youtube"></i>
                        <span>{t('login.continueWith')} YouTube</span>
                      </button>
                      <button type="button" className="social-login-btn" onClick={() => handleSocialLogin('discord')}>
                        <i className="fab fa-discord"></i>
                        <span>{t('login.continueWith')} Discord</span>
                      </button>
                      <button type="button" className="social-login-btn" onClick={() => handleSocialLogin('linkedin')}>
                        <i className="fab fa-linkedin-in"></i>
                        <span>{t('login.continueWith')} LinkedIn</span>
                      </button>
                      <button type="button" className="social-login-btn" onClick={() => handleSocialLogin('pinterest')}>
                        <i className="fab fa-pinterest"></i>
                        <span>{t('login.continueWith')} Pinterest</span>
                      </button>
                      <button type="button" className="social-login-btn" onClick={() => handleSocialLogin('twitch')}>
                        <i className="fab fa-twitch"></i>
                        <span>{t('login.continueWith')} Twitch</span>
                      </button>
                      <button type="button" className="social-login-btn" onClick={() => handleSocialLogin('whatsapp')}>
                        <i className="fab fa-whatsapp"></i>
                        <span>{t('login.continueWith')} WhatsApp</span>
                      </button>
                      <button type="button" className="social-login-btn" onClick={() => handleSocialLogin('microsoft')}>
                        <i className="fab fa-microsoft"></i>
                        <span>{t('login.continueWith')} Microsoft</span>
                      </button>
                      <button type="button" className="social-login-btn" onClick={() => handleSocialLogin('canva')}>
                        <i className="fas fa-palette"></i>
                        <span>{t('login.continueWith')} Canva</span>
                      </button>
                      <button type="button" className="social-login-btn" onClick={() => handleSocialLogin('paypal')}>
                        <i className="fab fa-paypal"></i>
                        <span>{t('login.continueWith')} PayPal</span>
                      </button>
                      <button type="button" className="social-login-btn" onClick={() => handleSocialLogin('netflix')}>
                        <i className="fas fa-play-circle"></i>
                        <span>{t('login.continueWith')} Netflix</span>
                      </button>
                      <button type="button" className="social-login-btn" onClick={() => handleSocialLogin('patreon')}>
                        <i className="fab fa-patreon"></i>
                        <span>{t('login.continueWith')} Patreon</span>
                      </button>
                      <button type="button" className="social-login-btn" onClick={() => handleSocialLogin('vk')}>
                        <i className="fab fa-vk"></i>
                        <span>{t('login.continueWith')} VK</span>
                      </button>
                      <button type="button" className="social-login-btn" onClick={() => handleSocialLogin('baidu')}>
                        <i className="fas fa-search"></i>
                        <span>{t('login.continueWith')} Baidu</span>
                      </button>
                      <button type="button" className="social-login-btn" onClick={() => handleSocialLogin('xbox')}>
                        <i className="fab fa-xbox"></i>
                        <span>{t('login.continueWith')} Xbox</span>
                      </button>
                      <button type="button" className="social-login-btn" onClick={() => handleSocialLogin('nintendo')}>
                        <i className="fas fa-gamepad"></i>
                        <span>{t('login.continueWith')} Nintendo</span>
                      </button>
                      <button type="button" className="social-login-btn" onClick={() => handleSocialLogin('riotgames')}>
                        <i className="fas fa-gamepad"></i>
                        <span>{t('login.continueWith')} Riot Games</span>
                      </button>
                      <button type="button" className="social-login-btn" onClick={() => handleSocialLogin('soundcloud')}>
                        <i className="fab fa-soundcloud"></i>
                        <span>{t('login.continueWith')} SoundCL</span>
                      </button>
                      <button type="button" className="social-login-btn" onClick={() => handleSocialLogin('wordpress')}>
                        <i className="fab fa-wordpress"></i>
                        <span>{t('login.continueWith')} WordPress</span>
                      </button>
                      <button type="button" className="social-login-btn" onClick={() => handleSocialLogin('behance')}>
                        <i className="fab fa-behance"></i>
                        <span>{t('login.continueWith')} Behance</span>
                      </button>
                      <button type="button" className="social-login-btn" onClick={() => handleSocialLogin('dropbox')}>
                        <i className="fab fa-dropbox"></i>
                        <span>{t('login.continueWith')} Dropbox</span>
                      </button>
                      <button type="button" className="social-login-btn" onClick={() => handleSocialLogin('grab')}>
                        <i className="fas fa-car"></i>
                        <span>{t('login.continueWith')} Grab</span>
                      </button>
                      <button type="button" className="social-login-btn" onClick={() => handleSocialLogin('calculator')}>
                        <i className="fas fa-calculator"></i>
                        <span>{t('login.continueWith')} Calculator</span>
                      </button>
                      <button type="button" className="social-login-btn" onClick={() => handleSocialLogin('paint')}>
                        <i className="fas fa-paint-brush"></i>
                        <span>{t('login.continueWith')} Paint</span>
                      </button>
                      <button type="button" className="social-login-btn" onClick={() => handleSocialLogin('basau')}>
                        <i className="fas fa-leaf"></i>
                        <span>{t('login.continueWith')} Ba Sáu</span>
                      </button>
                      <button type="button" className="social-login-btn" onClick={() => handleSocialLogin('zalo')}>
                        <i className="fas fa-comments"></i>
                        <span>{t('login.continueWith')} Zalo</span>
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            )}

            {/* Register Form */}
            {activeTab === 'register' && (
              <form className="register-form" onSubmit={handleRegisterSubmit}>
                <div className="form-group">
                  <label htmlFor="fullName">{t('register.fullNameLabel')}</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={registerForm.fullName}
                    onChange={handleRegisterChange}
                    placeholder={t('register.fullNamePlaceholder')}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="dateOfBirth">{t('register.dateOfBirthLabel')}</label>
                  <div className="date-input-wrapper">
                    <input
                      type="text"
                      id="dateOfBirth"
                      name="dateOfBirth"
                      value={registerForm.dateOfBirth}
                      onChange={handleRegisterChange}
                      placeholder={t('register.dateOfBirthPlaceholder')}
                      required
                    />
                    <i className="fas fa-calendar-alt date-icon"></i>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="phone">{t('register.phoneLabel')}</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={registerForm.phone}
                    onChange={handleRegisterChange}
                    placeholder={t('register.phonePlaceholder')}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="username">{t('register.usernameLabel')}</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={registerForm.username}
                    onChange={handleRegisterChange}
                    placeholder={t('register.usernamePlaceholder')}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="idCard">{t('register.idCardLabel')}</label>
                  <input
                    type="text"
                    id="idCard"
                    name="idCard"
                    value={registerForm.idCard}
                    onChange={handleRegisterChange}
                    placeholder={t('register.idCardPlaceholder')}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">{t('register.emailLabel')}</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={registerForm.email}
                    onChange={handleRegisterChange}
                    placeholder={t('register.emailPlaceholder')}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="registerPassword">{t('register.passwordLabel')}</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="registerPassword"
                      name="password"
                      value={registerForm.password}
                      onChange={handleRegisterChange}
                      placeholder={t('register.passwordPlaceholder')}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">{t('register.confirmPasswordLabel')}</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={registerForm.confirmPassword}
                      onChange={handleRegisterChange}
                      placeholder={t('register.confirmPasswordPlaceholder')}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                </div>

                <div className="form-options">
                  <a href="#" className="privacy-policy-link">
                    {t('register.privacyPolicy')}
                  </a>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      required
                    />
                    <span>{t('register.agreeTerms')}</span>
                  </label>
                </div>

                <button 
                  type="submit" 
                  className="register-submit-btn"
                  disabled={loading}
                >
                  {loading ? 'Đang xử lý...' : t('register.submitButton')}
                </button>

                <div className="register-footer">
                  <span>{t('register.haveAccount')} </span>
                  <button
                    type="button"
                    className="switch-to-login-link"
                    onClick={() => setActiveTab('login')}
                  >
                    {t('register.loginLink')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Login;

