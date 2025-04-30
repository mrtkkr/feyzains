import React, { createContext, useState, useCallback } from "react";
import PropTypes from "prop-types";
import { sendApiRequest } from "services/network_service";

export const FinancialSummaryContext = createContext();

const FinancialSummaryProvider = ({ children }) => {
  const [supplierSummaries, setSupplierSummaries] = useState([]);
  const [clientSummaries, setClientSummaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const summariesUrl = "tasks/financial_summaries/";

  // Mali Raporları Getir
  const fetchFinancialSummaries = useCallback(async () => {
    setLoading(true);
    setError(null);
  
    try {
      // Tedarikçi ödemeleri
      const supplierRes = await sendApiRequest({ url: `${summariesUrl}?is_supplier=true`, method: "GET" });
      if (supplierRes.response.status === 200) {
        setSupplierSummaries(supplierRes.data || []);
      } else {
        setError("Tedarikçi ödemeleri alınırken bir hata oluştu.");
        console.error("Failed to fetch supplier payments:", supplierRes.response);
      }
  
      // Müşteri ödemeleri
      const clientRes = await sendApiRequest({ url: `${summariesUrl}?is_client=true`, method: "GET" });
      if (clientRes.response.status === 200) {
        setClientSummaries(clientRes.data || []);
      } else {
        setError("Mali Rapor alınırken bir hata oluştu.");
        console.error("Failed to fetch client summaries:", clientRes.response);
      }
    } catch (error) {
      setError("API çağrısı başarısız oldu.");
      console.error("Failed to fetch summaries:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Mali Rapor Ekle
  const addFinancialSummary = async (data, entityType) => {
    setError(null);
    try {
      const res = await sendApiRequest({ url: summariesUrl, method: "POST", body: data });
      if (res.response.status === 200 || res.response.status === 201) {
        if (entityType === "supplier") {
          setSupplierSummaries((prev) => [res.data, ...prev]);
        } else {
          setClientSummaries((prev) => [res.data, ...prev]);
        }
        return res.data;
      } else {
        const errorMessage = res.data.message;
        setError(errorMessage);
        console.error(errorMessage, res.response);
        return { error: errorMessage };
      }
    } catch (error) {
      setError("API çağrısı başarısız oldu.");
      console.error("Failed to add financial summary:", error);
      return { error };
    }
  };

  // Mali Rapor Sil
  const deleteFinancialSummary = async (id, entityType) => {
    setError(null);
    try {
      const res = await sendApiRequest({ url: summariesUrl, method: "DELETE", body: { id } });
      if (res.response.status === 200) {
        if (entityType === "supplier") {
          setSupplierSummaries((prev) => prev.filter((summary) => summary.id !== id));
        } else {
          setClientSummaries((prev) => prev.filter((summary) => summary.id !== id));
        }
        return true;
      } else {
        const errorMessage = ("Mali rapor silinemedi: ", res.data.message);
        setError(errorMessage);
        console.error(errorMessage, res.response);
        return { error: errorMessage };
      }
    } catch (error) {
      setError("API çağrısı başarısız oldu.");
      console.error("Failed to delete financial summary:", error);
      return { error };
    }
  };

  // Mali Rapor Güncelle
  const updateFinancialSummary = async (id, data, entityType) => {
    setError(null);
    try {
      const res = await sendApiRequest({ url: summariesUrl, method: "PUT", body: data });
      if (res.response.status === 200) {
        if (entityType === "supplier") {
          setSupplierSummaries((prev) =>
            prev.map((summary) => (summary.id === id ? res.data : summary))
          );
        } else {
          setClientSummaries((prev) =>
            prev.map((summary) => (summary.id === id ? res.data : summary))
          );
        }
        return res.data;
      } else {
        const errorMessage = ("Mali rapor güncellenemedi. ", res.data.message);
        setError(errorMessage);
        console.error(errorMessage, res.response);
        return { error: errorMessage };
      }
    } catch (error) {
      setError("API çağrısı başarısız oldu.");
      console.error("Failed to update financial summary:", error);
      return { error };
    }
  };

  return (
    <FinancialSummaryContext.Provider
      value={{
        supplierSummaries,
        clientSummaries,
        loading,
        error,
        fetchFinancialSummaries,
        addFinancialSummary,
        deleteFinancialSummary,
        updateFinancialSummary,
      }}
    >
      {children}
    </FinancialSummaryContext.Provider>
  );
};

FinancialSummaryProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default FinancialSummaryProvider;
