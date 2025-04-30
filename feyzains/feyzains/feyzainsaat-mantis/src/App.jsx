import React from 'react';
import { useContext } from 'react';
import { AuthContext } from 'contexts/auth/AuthContext';
import { ToastContainer } from 'react-toastify';

// project import
import ScrollTop from 'components/ScrollTop';

import RouterConfig from 'routes/RouterConfig';

import 'react-toastify/dist/ReactToastify.css';
import ThemeCustomization from 'themes';
// ==============================|| APP - THEME, ROUTER, LOCAL ||============================== //

export default function App() {
  const authContext = useContext(AuthContext);
  console.log('authContext', authContext);
  return (
    <ThemeCustomization>
      <ScrollTop>
        <div>
          {/* <RouterProvider router={router} /> */}
          <RouterConfig />
          <ToastContainer stacked />
        </div>
      </ScrollTop>
    </ThemeCustomization>
  );
}
