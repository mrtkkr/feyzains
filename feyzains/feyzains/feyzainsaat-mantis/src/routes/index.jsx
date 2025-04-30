import { createBrowserRouter } from 'react-router-dom';

// project import
import AdminRoutes from './AdminRoutes';
import LoginRoutes from './LoginRoutes';
import CompanyEmployeeRoutes from './CompanyEmployeeRoutes';

// ==============================|| ROUTING RENDER ||============================== //

const router = createBrowserRouter([AdminRoutes, LoginRoutes, CompanyEmployeeRoutes], { basename: import.meta.env.VITE_APP_BASE_NAME });

export default router;
