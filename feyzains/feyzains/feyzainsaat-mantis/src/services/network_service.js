import { jwtDecode } from 'jwt-decode';

const PUBLIC_URL = import.meta.env.VITE_PUBLIC_URL || 'http://127.0.0.1:8000/';

const isTokenExpired = (token) => {
  if (!token) return true;

  const decodedToken = jwtDecode(token);
  console.log('decodedToken', decodedToken);

  const currentDate = new Date();

  // JWT exp is in seconds
  return decodedToken.exp * 1000 < currentDate.getTime();
};

const refreshToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (isTokenExpired(refreshToken)) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    throw new Error('Refresh token is expired or not available');
  }

  const response = await fetch(`${PUBLIC_URL}api/token/refresh/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ refresh: refreshToken })
  });

  if (!response.ok) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    throw new Error('Failed to refresh token');
  }

  const data = await response.json();
  localStorage.setItem('accessToken', data.access);
  localStorage.setItem('refreshToken', data.refresh);

  return data.access;
};

const sendApiRequest = async ({ url, method, body = null, headers = {}, languageCode = 'en', queryParams = {} }) => {
  console.log('url', url);
  console.log('method', method);
  console.log('body', body);
  console.log('headers', headers);
  console.log('languageCode', languageCode);

  let accessToken = localStorage.getItem('accessToken');

  if (isTokenExpired(accessToken)) {
    try {
      accessToken = await refreshToken();
    } catch (error) {
      throw new Error('User is not authenticated');
    }
  }

  const defaultHeaders = {
    Authorization: `Bearer ${accessToken}`,
    'Accept-Language': languageCode
  };

  if (!(body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  const queryString = new URLSearchParams(queryParams).toString();
  const fullUrl = `${PUBLIC_URL}${url}${queryString ? `?${queryString}` : ''}`;

  try {
    console.log('fullUrl:', fullUrl);

    const fetchOptions = {
      method: method,
      headers: { ...defaultHeaders, ...headers }
    };

    if (method !== 'GET' && method !== 'HEAD') {
      console.log('body:', body);
      fetchOptions.body = body instanceof FormData ? body : JSON.stringify(body);
    }

    let response = await fetch(fullUrl, fetchOptions);

    if (response.status === 401) {
      accessToken = await refreshToken();
      defaultHeaders.Authorization = `Bearer ${accessToken}`;
      response = await fetch(fullUrl, {
        ...fetchOptions,
        headers: { ...defaultHeaders, ...headers }
      });
    }

    const data = await response.json();
    return { data: data, response: response };
  } catch (error) {
    console.log('error', error);

    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || 'An error occurred');
    } else {
      throw new Error('An error occurred');
    }
  }
};

const openFile = async (fileUrl) => {
  return window.open(PUBLIC_URL + fileUrl, '_blank');
};

export { sendApiRequest, openFile };
