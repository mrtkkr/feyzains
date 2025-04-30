import { sendApiRequest } from './network_service.js';
import { toast } from 'react-toastify';

export const login = async (email, password) => {
  const PUBLIC_URL = import.meta.env.VITE_PUBLIC_URL || 'http://127.0.0.1:8000/';
  const apiUrl = PUBLIC_URL + 'login/';

  console.log('apiUrl', apiUrl);

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    console.log('loginresponse', response);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error response data:', errorData);
      return { success: false, message: errorData.message || 'An error occurred' };
    } else if (response.status === 401) {
      return { success: false, message: 'Invalid email or password' };
    }

    const responseData = await response.json();
    console.log('userGroup', responseData.user);

    localStorage.setItem('accessToken', responseData.token.access);
    localStorage.setItem('refreshToken', responseData.token.refresh);

    return { success: true, data: responseData };
  } catch (error) {
    console.error('error', error);
    return { success: false, message: 'An error occurred, please try again later.' };
  }
};

export const logout = async () => {
  try {
    console.log('logout');

    const apiUrl = 'logout/';
    var refreshToken = localStorage.getItem('refreshToken');
    var data = { refresh: refreshToken };
    console.log('data', data);
    const res = await sendApiRequest({ url: apiUrl, method: 'POST', body: data });
    console.log('res', res);
    console.log('result', res.data);
    console.log('response', res.response);

    if (res.response.status === 200) {
      toast.success('Çıkış Yapıldı!');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      return { success: true };
    } else {
      toast.error('Logout failed');
      console.error('Logout failed');
      return { success: false };
    }
  } catch (error) {
    console.error('error', error);
    toast.error('Çıkış yapılamadı!');
    return { success: false };
  }
};

export const register = async ({ first_name, last_name, email, password, company }) => {
  const PUBLIC_URL = import.meta.env.VITE_PUBLIC_URL || 'http://127.0.0.1:8000/';
  const apiUrl = PUBLIC_URL + 'register/'; // API'nde bu endpoint varsa

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        first_name,
        last_name,
        email,
        password,
        company,
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Register error:', errorData);
      return { success: false, message: errorData.message || 'Kayıt başarısız.' };
    }

    const responseData = await response.json();
    toast.success('Kayıt başarılı! Giriş yapabilirsiniz.');
    return { success: true, data: responseData };
  } catch (error) {
    console.error('Register error:', error);
    toast.error('Bir hata oluştu, lütfen tekrar deneyin.');
    return { success: false, message: 'Bir hata oluştu.' };
  }
};
