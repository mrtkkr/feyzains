import React, { createContext, useState, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { sendApiRequest } from 'services/network_service'; // API çağrıları için kullanılan servis

export const CompanyContext = createContext();

const CustomerProvider = ({ children }) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dataLoaded = useRef(false);

  const baseUrl = 'core/';
  const customerListUrl = 'customer/';
  const customerDetailUrl = 'customers/';

  const fetchCustomers = useCallback(async (forceRefresh = false) => {
    if (dataLoaded.current && !forceRefresh) return;

    setLoading(true);
    setError(null);
    try {
      const res = await sendApiRequest({
        url: baseUrl + customerListUrl,
        method: 'GET'
      });

      if (res.response.status === 200) {
        setCustomers(res.data || []);
        dataLoaded.current = true;
      } else {
        setError('Müşteriler alınırken bir hata oluştu.');
      }
    } catch (err) {
      console.error('fetchCustomers error:', err);
      setError('API çağrısı başarısız oldu.');
    } finally {
      setLoading(false);
    }
  }, []);

  const addCustomer = async (customerData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await sendApiRequest({
        url: baseUrl + customerListUrl,
        method: 'POST',
        body: customerData
      });

      if (res?.response?.status === 201) {
        // Başarılı bir şekilde eklendiğinde, listeyi güncelliyoruz
        setCompanies((prev) => [...prev, res.data]);
        return { success: true, data: res.data };
      } else {
        setError('Müşteri eklenemedi.');
        return { success: false, error: 'Müşteri eklenemedi.' };
      }
    } catch (err) {
      console.error('addCustomer error:', err);
      setError('Müşteri eklenirken hata oluştu.');
      return { success: false, error: 'Müşteri eklenirken hata oluştu.' };
    } finally {
      setLoading(false);
    }
  };

  const deleteCustomer = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await sendApiRequest({
        url: `${baseUrl}${customerDetailUrl}${id}/`,
        method: 'DELETE'
      });

      if (res?.response?.status === 204) {
        setCustomers((prev) => prev.filter((cs) => cs.id !== id));
        return { success: true };
      } else {
        setError('Müşteri silinemedi.');
        return { success: false, error: 'Müşteri silinemedi.' };
      }
    } catch (err) {
      console.error('deleteCustomer error:', err);
      setError('Müşteri silinirken hata oluştu.');
      return { success: false, error: 'Müşteri silinirken hata oluştu.' };
    } finally {
      setLoading(false);
    }
  };

  // ✅ Eksik olan updateCompany fonksiyonunu ekliyoruz
  const updateCustomer = async (id, updatedData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await sendApiRequest({
        url: `${baseUrl}${customerDetailUrl}${id}/`,
        method: 'PUT',
        body: updatedData
      });

      if (res?.response?.status === 200 || res?.response?.status === 204) {
        setCustomers((prev) => prev.map((cs) => (cs.id === id ? { ...cs, ...updatedData } : cs)));
        return { success: true };
      } else {
        setError('Müşter güncellenemedi.');
        return { success: false, error: 'Müşteri güncellenemedi.' };
      }
    } catch (err) {
      console.error('updateCustomer error:', err);
      setError('Müşteri güncellenirken hata oluştu.');
      return { success: false, error: 'Müşteri güncellenirken hata oluştu.' };
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomerContext.Provider
      value={{
        customers,
        loading,
        error,
        fetchCustomers,
        addCustomer,
        deleteCustomer,
        updateCustomer // ✅ Buraya eklendi
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
};

CustomerProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default CustomerProvider;
