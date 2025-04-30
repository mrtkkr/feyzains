import React, { createContext, useState, useEffect } from 'react';
import { sendApiRequest } from '../../services/network_service.js';
import PropTypes from 'prop-types';

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchUser = async () => {
    const apiUrl = 'user/';
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      try {
        const res = await sendApiRequest({ url: apiUrl, method: 'GET' });
        console.log('fetchUserresss', res);
        if (res.response.status === 200) {
          setUser(res.data);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
        return res.data;
      } catch (error) {
        console.error('Failed to fetch user:', error);
        setIsAuthenticated(false);
        return false;
      }
    } else {
      setIsAuthenticated(false);
      return false;
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);
  const clearUser = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  return <AuthContext.Provider value={{ user, isAuthenticated, fetchUser, clearUser }}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = { children: PropTypes.node };

export default AuthProvider;
