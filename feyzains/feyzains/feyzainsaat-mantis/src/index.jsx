import React from 'react';
import ReactDOM from 'react-dom/client';

// scroll bar
import 'simplebar-react/dist/simplebar.min.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// google-fonts
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/700.css';

import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';

import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';

import '@fontsource/public-sans/400.css';
import '@fontsource/public-sans/500.css';
import '@fontsource/public-sans/600.css';
import '@fontsource/public-sans/700.css';
import './index.css';

// project import
import App from './App';
import reportWebVitals from './reportWebVitals';

import AuthProvider from './contexts/auth/AuthContext.jsx';

import robotoBase64 from '../src/pages/admin-pages/feyzains/fonts/roboto-base64';

const base64Roboto = `
  @font-face {
    font-family: 'Roboto';
    src: url("data:font/ttf;base64,${robotoBase64}") format('truetype');
    font-weight: normal;
    font-style: normal;
  }
`;

const root = ReactDOM.createRoot(document.getElementById('root'));

// ==============================|| MAIN - REACT DOM RENDER ||============================== //

root.render(
  <AuthProvider>
    {/* <React.StrictMode> */}
    <style>{base64Roboto}</style>
    <App />
    {/* </React.StrictMode> */}
  </AuthProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
