import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from 'contexts/auth/AuthContext';

// project import
import AdminRoutes from './AdminRoutes';
import LoginRoutes from './LoginRoutes';

import MinimalLayout from 'layout/MinimalLayout';
import LoginCheck from 'LoginCheck';
import Loader from 'components/Loader';

const RouterConfig = () => {
  const { fetchUser } = useContext(AuthContext);
  const [routes, setRoutes] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeUser = async () => {
      const user = await fetchUser();
      console.log('user', user);

      if (user) {
        setRoutes(AdminRoutes);
      } else {
        setRoutes(AdminRoutes);
      }
      setLoading(false);
    };

    initializeUser();
  }, []);

  if (!routes || loading) {
    return <Loader />;
  } else {
    const Wrapper = {
      path: '/',
      element: (
        <LoginCheck>
          <MinimalLayout />
        </LoginCheck>
      ),
      children: [routes]
    };

    const router = createBrowserRouter([Wrapper, LoginRoutes], { basename: import.meta.env.VITE_APP_BASE_NAME });
    return <RouterProvider router={router} />;
  }
};

export default RouterConfig;
