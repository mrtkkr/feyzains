import React, { createContext, useState, useCallback } from "react";
import PropTypes from "prop-types";
import { sendApiRequest } from "services/network_service"; // API çağrıları için kullanılan servis

export const PaymentContext = createContext();

const PaymentProvider = ({ children }) => {
  const [supplierPayments, setSupplierPayments] = useState([]); // Tedarikçi ödemeleri
  const [clientPayments, setClientPayments] = useState([]); // Müşteri ödemeleri
  const [remaining, setRemaining] = useState([]); // Kalan ürünler
  const [loading, setLoading] = useState(false); // Yüklenme durumu
  const [error, setError] = useState(null); // Hata mesajı

  const paymentsUrl = "tasks/payments/"; // Tek bir API endpoint

  const fetchPayments = useCallback(async (date) => {
    setLoading(true);
    setError(null);
  
    try {
      // Tedarikçi ödemeleri
      const supplierRes = await sendApiRequest({ url: `${paymentsUrl}?is_supplier=true&date=${date}`, method: "GET" });
      if (supplierRes.response.status === 200) {
        setSupplierPayments(supplierRes.data || []);
      } else {
        setError("Tedarikçi ödemeleri alınırken bir hata oluştu.");
        console.error("Failed to fetch supplier payments:", supplierRes.response);
      }
  
      // Müşteri ödemeleri
      const clientRes = await sendApiRequest({ url: `${paymentsUrl}?is_client=true&date=${date}`, method: "GET" });
      if (clientRes.response.status === 200) {
        setClientPayments(clientRes.data || []);
      } else {
        setError("Müşteri ödemeleri alınırken bir hata oluştu.");
        console.error("Failed to fetch client payments:", clientRes.response);
      }
    } catch (error) {
      setError("API çağrısı başarısız oldu.");
      console.error("Failed to fetch payments:", error);
    } finally {
      setLoading(false);
    }
  }, []);
  

  // Ödeme Ekle
  const addPayment = async (data) => {
    setError(null);
    try {
      // API isteği
      const res = await sendApiRequest({ url: paymentsUrl, method: "POST", body: data });
  
      if (res.response.status === 200 || res.response.status === 201) {
        if (data.entity_type === "supplier") {
          setSupplierPayments((prev) => [res.data, ...prev]);
        } else {
          setClientPayments((prev) => [res.data, ...prev]);
        }
  
        return { success: true, data: res.data };
      } else {
        const errorMessage = `Ödeme eklenemedi. ${res.data.message}`;
        console.error("Failed to add payment:", res.response);
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const errorMessage = "API çağrısı başarısız oldu. Lütfen tekrar deneyin.";
      console.error(errorMessage, error);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Ödeme Sil
  const deletePayment = async (id, entityType, date) => {
    setError(null);
    try {
      const res = await sendApiRequest({ url: paymentsUrl, method: "DELETE", body: { id,date } });
      if (res.response.status === 200) {
        if (entityType === "supplier") {
          setSupplierPayments((prev) => prev.filter((payment) => payment.id !== id));
        } else {
          setClientPayments((prev) => prev.filter((payment) => payment.id !== id));
        }
        return true;
      } else {
        const errorMessage = `Ödeme silinemedi. ${res.data.message}`;
        setError(errorMessage);
        console.error("Failed to delete payment:", res.data.message);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const errorMessage = "API çağrısı başarısız oldu.";
      setError(errorMessage);
      console.error("Failed to delete payment:", errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Ödeme Güncelle
  const updatePayment = async (id, data, entityType) => {
    setError(null);
    try {
      const res = await sendApiRequest({ url: paymentsUrl, method: "PUT", body: data });
      if (res.response.status === 200) {
        if (entityType === "supplier") {
          setSupplierPayments((prev) =>
            prev.map((payment) => (payment.id === id ? res.data : payment))
          );
        } else {
          setClientPayments((prev) =>
            prev.map((payment) => (payment.id === id ? res.data : payment))
          );
        }
        return { success: true, data: res.data };
      } else {
        const errorMessage = `Ödeme güncellenemedi. ${res.data.message}`;
        console.error("Failed to update payment:", res.data.message);
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const errorMessage = "API çağrısı başarısız oldu. Lütfen tekrar deneyin.";
      console.error(errorMessage, error);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  return (
    <PaymentContext.Provider
      value={{
        supplierPayments,
        clientPayments,
        loading,
        error,
        fetchPayments,
        addPayment,
        deletePayment,
        updatePayment,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
};

PaymentProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default PaymentProvider;
