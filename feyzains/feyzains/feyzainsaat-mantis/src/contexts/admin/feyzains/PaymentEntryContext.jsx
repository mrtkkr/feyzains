import React, { createContext, useState, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { sendApiRequest } from 'services/network_service'; // API çağrıları için kullanılan servis

export const PaymentEntryContext = createContext();

const PaymentEntryProvider = ({ children }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Add a flag to track whether data has been loaded
  const dataLoaded = useRef(false);

  const baseUrl = 'core/';
  const paymentsListUrl = 'payment_entry/';
  const paymentDetailUrl = 'payments/';

  const fetchPayments = useCallback(async (forceRefresh = false) => {
    // Skip fetching if data is already loaded and forceRefresh is false
    if (dataLoaded.current && !forceRefresh) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await sendApiRequest({
        url: baseUrl + paymentsListUrl,
        method: 'GET'
      });

      if (res.response.status === 200) {
        setPayments(res.data || []);
        dataLoaded.current = true; // Mark data as loaded
      } else {
        setError('Ödemeler alınırken bir hata oluştu.');
      }
    } catch (error) {
      console.error('fetchPayments error:', error);
      setError('API çağrısı başarısız oldu.');
    } finally {
      setLoading(false);
    }
  }, []);

  const createPayment = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const res = await sendApiRequest({
        url: baseUrl + paymentsListUrl,
        method: 'POST',
        body: data
      });
      if (res.response.status === 201) {
        setPayments((prev) => [res.data, ...prev]);
        return { success: true, data: res.data };
      } else {
        setError('Ödeme oluşturulamadı.');
        return { success: false, error: 'Ödeme oluşturulamadı.' };
      }
    } catch (err) {
      console.error('createPayment error:', err);
      setError('Ödeme oluşturulurken hata oluştu.');
      return { success: false, error: 'Ödeme oluşturulurken hata oluştu.' };
    } finally {
      setLoading(false);
    }
  };

  const updatePayment = async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const res = await sendApiRequest({
        url: `${baseUrl}${paymentDetailUrl}${id}/`,
        method: 'PUT',
        body: data
      });
      if (res.response.status === 200) {
        // Update the payment in the local state to avoid refetching
        setPayments((prev) => prev.map((payment) => (payment.id === id ? res.data : payment)));
        return { success: true, data: res.data };
      } else {
        setError('Ödeme güncellenemedi.');
        return { success: false, error: 'Ödeme güncellenemedi.' };
      }
    } catch (err) {
      console.error('updatePayment error:', err);
      setError('Ödeme güncellenirken hata oluştu.');
      return { success: false, error: 'Ödeme güncellenirken hata oluştu.' };
    } finally {
      setLoading(false);
    }
  };

  const deletePayment = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await sendApiRequest({
        url: `${baseUrl}${paymentDetailUrl}${id}/`,
        method: 'DELETE'
      });

      // Eğer res.response varsa ve status 204 ise işlem başarılı
      if (res?.response?.status === 204) {
        setPayments((prev) => prev.filter((payment) => payment.id !== id));
        return { success: true };
      } else {
        const errorMessage = res?.response?.data?.detail || 'Ödeme silinemedi.';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      console.error('deletePayment error:', err);
      setError('Ödeme silinirken hata oluştu.');
      return { success: false, error: 'Ödeme silinirken hata oluştu.' };
    } finally {
      setLoading(false);
    }
  };

  const getPaymentById = async (id) => {
    // First check if we have the payment in local state
    const localPayment = payments.find((payment) => payment.id === id);
    if (localPayment) {
      return { success: true, data: localPayment };
    }

    // If not found in local state, fetch from API
    setLoading(true);
    setError(null);
    try {
      const res = await sendApiRequest({
        url: `${baseUrl}${paymentDetailUrl}${id}/`,
        method: 'GET'
      });
      if (res.response.status === 200) {
        return { success: true, data: res.data };
      } else {
        setError('Ödeme bulunamadı.');
        return { success: false, error: 'Ödeme bulunamadı.' };
      }
    } catch (err) {
      console.error('getPaymentById error:', err);
      setError('Ödeme bilgileri alınırken hata oluştu.');
      return { success: false, error: 'Ödeme bilgileri alınırken hata oluştu.' };
    } finally {
      setLoading(false);
    }
  };

  return (
    <PaymentEntryContext.Provider
      value={{
        payments,
        loading,
        error,
        fetchPayments,
        createPayment,
        updatePayment,
        deletePayment,
        getPaymentById
      }}
    >
      {children}
    </PaymentEntryContext.Provider>
  );
};

PaymentEntryProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default PaymentEntryProvider;
