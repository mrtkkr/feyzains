import React, { createContext, useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { sendApiRequest } from 'services/network_service'; // API çağrıları için kullanılan servis
import { PUBLIC_URL } from "services/network_service"; // API URL'ini çekmek için


export const CustomerContext = createContext();

const CustomerProvider = ({ children }) => {
  const [customers, setCustomers] = useState([]); // Müşteriler
  const [loading, setLoading] = useState(false); // Yüklenme durumu
  const [error, setError] = useState(null); // Hata mesajı
  const [states, setStates] = useState([]); // İller ve ilçeler
  

  const customersUrl = 'core/customers/'; // Tek bir API endpoint

  const fetchCustomers = useCallback(async (date) => {
    setLoading(true);
    setError(null);

    try {
      // Müşteriler
      const res = await sendApiRequest({ url: customersUrl, method: 'GET' });
      if (res.response.status === 200) {
        setCustomers(res.data.results || []);
      } else {
        setError('Müşteriler alınırken bir hata oluştu.');
        console.error('Failed to fetch supplier customers:', res.response);
      }
    } catch (error) {
      setError('API çağrısı başarısız oldu.');
      console.error('Failed to fetch customers:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const createCustomer = async (data) => {
    setError(null);
    try {
      const res = await sendApiRequest({ url: customersUrl, method: 'POST', body: data });
      if (res.response.status === 201) {
        setCustomers((prevCustomers) => [res.data.customer, ...prevCustomers]);
        return {
          success: true,
          message: res.data.message,
          customer: res.data.customer
        };
      } else {
        const errorMessage = res.data?.message || 'Yeni müşteri eklenemedi.';
        setError(errorMessage);
        return {
          success: false,
          error: errorMessage
        };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Müşteri eklenirken bir hata oluştu.';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    }
  };

  // Müşteri Güncelle (PUT)
  const updateCustomer = async (data) => {
    setError(null);
    try {
      const res = await sendApiRequest({ url: customersUrl, method: 'PUT', body: data });
      if (res.response.status === 200) {
        setCustomers((prevCustomers) => prevCustomers.map((customer) => (customer.id === data.id ? res.data.customer : customer)));
        return {
          success: true,
          message: res.data.message,
          customer: res.data.customer
        };
      } else if (res.response.status === 400) {
        const errorMessage = res.data?.message || 'Müşteri güncellenemedi.';
        setError(errorMessage);
        return {
          success: false,
          error: errorMessage
        };
      } else if (res.response.status === 404) {
        setError('Müşteri bulunamadı.');
        return {
          success: false,
          error: 'Müşteri bulunamadı.'
        };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Müşteri güncellenirken bir hata oluştu.';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    }
  };

  const deleteCustomer = async (id) => {
    setError(null);
    try {
      const res = await sendApiRequest({ url: customersUrl, method: 'DELETE', body: { id } });
      console.log('Full API Response:', res);
      if (res.data?.success) {
        setCustomers((prevCustomers) => prevCustomers.filter((customer) => customer.id !== id));
        return res.data;
      } else {
        setError('Müşteri silinemedi.');
        console.error('Failed to delete customer:', res.response);
        return { error: 'Failed to delete customer' };
      }
    } catch (error) {
      setError('Müşteri silinirken bir hata oluştu.');
      console.error('Failed to delete customer:', error);
      return error;
    }
  };

  const fetchStates = async () => {
    try {
      const response = await fetch(`${PUBLIC_URL}/state_list/`);
      const data = await response.json();
      setStates(data);
    } catch (error) {
      console.error("İller yüklenemedi:", error);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return (
    <CustomerContext.Provider
      value={{
        customers,
        loading,
        error,
        fetchCustomers,
        createCustomer,
        deleteCustomer,
        updateCustomer,
        fetchStates,
        states,
        setStates,
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
