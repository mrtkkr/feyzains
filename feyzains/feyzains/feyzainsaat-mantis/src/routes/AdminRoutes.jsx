// project import
import Dashboard from 'layout/Dashboard';
import LoginCheck from 'LoginCheck';

import PanelPage from 'pages/admin-pages/feyzains/Panel/PanelPage';
import CreateSnippetPage from 'pages/admin-pages/Snippet/CreateSnippetPage';
import PaymentEntryPage from 'pages/admin-pages/feyzains/paymentEntry/PaymentEntryPage';
import InvoiceBillPage from 'pages/admin-pages/feyzains/invoiceBill/InvoiceBillPage';

import PanelProvider from 'contexts/admin/PanelContext';
import PaymentEntryProvider from 'contexts/admin/feyzains/PaymentEntryContext';
import WorksiteProvider from 'contexts/admin/feyzains/WorksiteContext';
import SnippetProvider from 'contexts/admin/SnippetContext';
import GroupProvider from 'contexts/admin/feyzains/GroupContext';
import CompanyProvider from 'contexts/admin/feyzains/CompanyContext';
import CustomerProvider from 'contexts/admin/feyzains/CustomerContext';
import PersonalProvider from 'contexts/admin/feyzains/PersonalContext';
import PaymentEntryInvoiceProvider from 'contexts/admin/feyzains/PaymentEntryInvoiceContext';

const AdminRoutes = {
  path: '/',
  element: (
    <LoginCheck>
      <PanelProvider>
        <SnippetProvider>
          <PaymentEntryInvoiceProvider>
            <PaymentEntryProvider>
              <WorksiteProvider>
                <GroupProvider>
                  <CompanyProvider>
                    <CustomerProvider>
                      <PersonalProvider>
                        <Dashboard />
                      </PersonalProvider>
                    </CustomerProvider>
                  </CompanyProvider>
                </GroupProvider>
              </WorksiteProvider>
            </PaymentEntryProvider>
          </PaymentEntryInvoiceProvider>
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
    },
    {
      path: 'invoice_bill',
      element: <InvoiceBillPage />
    }
  ]
};

export default AdminRoutes;
