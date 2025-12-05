import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { authAPI } from '../services/api';
import { getToken, setToken as setTokenStorage, removeToken } from '../utils/token';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getToken());
  const [loading, setLoading] = useState(true);

  // Kiểm tra token khi component mount
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = getToken();
      if (savedToken) {
        try {
          const userData = await authAPI.getProfile();
          setUser(userData);
          setToken(savedToken);
        } catch (error) {
          // Token không hợp lệ, xóa đi
          removeToken();
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Đăng ký
  const register = useCallback(async (userData) => {
    try {
      const response = await authAPI.register(userData);
      setTokenStorage(response.token);
      setToken(response.token);
      // Lấy đầy đủ thông tin user bao gồm role
      const userDataFull = await authAPI.getProfile();
      setUser(userDataFull);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  // Đăng nhập
  const login = useCallback(async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      setTokenStorage(response.token);
      setToken(response.token);
      // Lấy đầy đủ thông tin user bao gồm role
      const userData = await authAPI.getProfile();
      setUser(userData);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  // Đăng xuất
  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      removeToken();
      setToken(null);
      setUser(null);
    }
  }, []);

  // Cập nhật profile
  const updateProfile = useCallback(async (userData) => {
    try {
      const updatedUser = await authAPI.updateProfile(userData);
      setUser(updatedUser);
      return { success: true, data: updatedUser };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  // Đổi mật khẩu
  const changePassword = useCallback(async (oldPassword, newPassword) => {
    try {
      await authAPI.changePassword(oldPassword, newPassword);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    user,
    token,
    loading,
    isAuthenticated: !!token,
    register,
    login,
    logout,
    updateProfile,
    changePassword,
  }), [user, token, loading, register, login, logout, updateProfile, changePassword]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

