// project import
import Dashboard from 'layout/Dashboard';
import LoginCheck from 'LoginCheck';

import PanelPage from 'pages/admin-pages/feyzains/Panel/PanelPage';
import CreateSnippetPage from 'pages/admin-pages/Snippet/CreateSnippetPage';
import PaymentEntryPage from 'pages/admin-pages/feyzains/paymentEntry/PaymentEntryPage';

import PanelProvider from 'contexts/admin/PanelContext';
import PaymentEntryProvider from 'contexts/admin/feyzains/PaymentEntryContext';
import SnippetProvider from 'contexts/admin/SnippetContext';

const AdminRoutes = {
  path: '/',
  element: (
    <LoginCheck>
      <PanelProvider>
        <SnippetProvider>
          <PaymentEntryProvider>
            <Dashboard />
          </PaymentEntryProvider>
        </SnippetProvider>
      </PanelProvider>
    </LoginCheck>
  ),
  children: [
    {
      path: '/',
      element: <PanelPage />
    },
    {
      path: 'panel',
      element: <PanelPage />
    },
    {
      path: 'snippet',
      element: <CreateSnippetPage />
    },
    {
      path: 'payment_entry',
      element: <PaymentEntryPage />
    }
  ]
};

export default AdminRoutes;
