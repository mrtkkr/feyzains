import React, { createContext, useState, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { sendApiRequest } from 'services/network_service'; // API çağrıları için kullanılan servis

export const PaymentEntryInvoiceContext = createContext();

const PaymentEntryInvoiceProvider = ({ children }) => {
  const [paymentEntryInvoices, setPaymentEntryInvoice] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Add a flag to track whether data has been loaded
  const dataLoaded = useRef(false);

  const baseUrl = 'core/';
  const paymentEntryInvoiceListUrl = 'payment_entry_invoice/';
  const paymentEntryInvoiceDetailUrl = 'payment_invoices/';

  const fetchPaymentEntryInvoices = useCallback(async (forceRefresh = false) => {
    // Skip fetching if data is already loaded and forceRefresh is false
    if (dataLoaded.current && !forceRefresh) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await sendApiRequest({
        url: baseUrl + paymentEntryInvoiceListUrl,
        method: 'GET'
      });

      if (res.response.status === 200) {
        setPaymentEntryInvoice(res.data || []);
        dataLoaded.current = true; // Mark data as loaded
      } else {
        setError('Ödeme Girişi veya Faturalar alınırken bir hata oluştu.');
      }
    } catch (error) {
      console.error('fetchPaymentEntryInvoices error:', error);
      setError('API çağrısı başarısız oldu.');
    } finally {
      setLoading(false);
    }
  }, []);

  const createPaymentEntryInvoice = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const res = await sendApiRequest({
        url: baseUrl + paymentEntryInvoiceListUrl,
        method: 'POST',
        body: data
      });
      if (res.response.status === 201) {
        setPaymentEntryInvoice((prev) => [res.data, ...prev]);
        return { success: true, data: res.data };
      } else {
        setError('Ödeme veya Fatura oluşturulamadı.');
        return { success: false, error: 'Ödeme veya Fatura oluşturulamadı.' };
      }
    } catch (err) {
      console.error('createPaymentEntryInvoice error:', err);
      setError('Ödeme veya Fatura oluşturulurken hata oluştu.');
      return { success: false, error: 'Ödeme veya Fatura oluşturulurken hata oluştu.' };
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentEntryInvoice = async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const res = await sendApiRequest({
        url: `${baseUrl}${paymentEntryInvoiceDetailUrl}${id}/`,
        method: 'PUT',
        body: data
      });
      if (res.response.status === 200) {
        // Update the payment in the local state to avoid refetching
        setPaymentEntryInvoice((prev) =>
          prev.map((paymentEntryInvoices) => (paymentEntryInvoices.id === id ? res.data : paymentEntryInvoices))
        );
        return { success: true, data: res.data };
      } else {
        setError('Ödeme veya Fatura güncellenemedi.');
        return { success: false, error: 'Ödeme veya Fatura güncellenemedi.' };
      }
    } catch (err) {
      console.error('updatePaymentEntryInvoice error:', err);
      setError('Ödeme veya Fatura güncellenirken hata oluştu.');
      return { success: false, error: 'Ödeme veya Fatura güncellenirken hata oluştu.' };
    } finally {
      setLoading(false);
    }
  };

  const deletePaymentEntryInvoice = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await sendApiRequest({
        url: `${baseUrl}${paymentEntryInvoiceDetailUrl}${id}/`,
        method: 'DELETE'
      });

      // Eğer res.response varsa ve status 204 ise işlem başarılı
      if (res?.response?.status === 204) {
        setPaymentEntryInvoice((prev) => prev.filter((paymentEntryInvoices) => paymentEntryInvoices.id !== id));
        return { success: true };
      } else {
        const errorMessage = res?.response?.data?.detail || 'Ödeme veya Fatura silinemedi.';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      console.error('deletePaymentEntryInvoice error:', err);
      setError('Ödeme veya Fatura silinirken hata oluştu.');
      return { success: false, error: 'Ödeme veya Fatura silinirken hata oluştu.' };
    } finally {
      setLoading(false);
    }
  };

  const getPaymentEntryInvoiceById = async (id) => {
    // First check if we have the payment in local state
    const localPaymentEntryInvoicet = paymentEntryInvoices.find((paymentEntryInvoices) => paymentEntryInvoices.id === id);
    if (localPaymentEntryInvoicet) {
      return { success: true, data: localPaymentEntryInvoicet };
    }

    // If not found in local state, fetch from API
    setLoading(true);
    setError(null);
    try {
      const res = await sendApiRequest({
        url: `${baseUrl}${paymentEntryInvoiceDetailUrl}${id}/`,
        method: 'GET'
      });
      if (res.response.status === 200) {
        return { success: true, data: res.data };
      } else {
        setError('Ödeme veya Fatura bulunamadı.');
        return { success: false, error: 'Ödeme veya Fatura bulunamadı.' };
      }
    } catch (err) {
      console.error('getPaymentEntryInvoiceById error:', err);
      setError('Ödeme veya Fatura bilgileri alınırken hata oluştu.');
      return { success: false, error: 'Ödeme veya bilgileri alınırken hata oluştu.' };
    } finally {
      setLoading(false);
    }
  };

  return (
    <PaymentEntryInvoiceContext.Provider
      value={{
        paymentEntryInvoices,
        loading,
        error,
        fetchPaymentEntryInvoices,
        createPaymentEntryInvoice,
        updatePaymentEntryInvoice,
        deletePaymentEntryInvoice,
        getPaymentEntryInvoiceById
      }}
    >
      {children}
    </PaymentEntryInvoiceContext.Provider>
  );
};

PaymentEntryInvoiceProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default PaymentEntryInvoiceProvider;
