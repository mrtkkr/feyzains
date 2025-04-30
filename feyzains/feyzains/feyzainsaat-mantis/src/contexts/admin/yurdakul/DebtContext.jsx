import PropTypes from "prop-types";
import React, { createContext, useState, useEffect, useCallback } from "react";
import { sendApiRequest } from "../../../services/network_service.js";

// Context oluşturma
export const DebtContext = createContext();

const DebtProvider = ({ children }) => {
  const [debts, setDebts] = useState([]); // Borç listesi
  const [receivables, setReceivables] = useState([]); // Borç listesi
  const [companies, setCompanies] = useState([]); // Borç listesi
  const [clients, setClients] = useState([]); // Borç listesi
  const [debtSummary, setDebtSummary] = useState(null); // Borç özet bilgileri
  const [receivableSummary, setReceivableSummary] = useState(null); // Alacak özet bilgileri
  const [loading, setLoading] = useState(false); // Yükleme durumu
  const [error, setError] = useState(null); // Hata mesajı
  const debtApiUrl = "tasks/debts/"; // Borçlar için API URL'si
  const receivableApiUrl = "tasks/receivables/"; // Alacaklar için API URL'si
  const apiUrl = "/tasks/companies/"; // API'nin temel URL'si
  const clientApiUrl = "/tasks/clients/";
  const debtSummaryApiUrl = "tasks/debt_summary/"; // Borç özet bilgileri için API URL'si
  const receivableSummaryApiUrl = "tasks/receivable_summary/"; // Alacak özet bilgileri için API URL'si

  // Firmaları Fetch Etme (GET)
  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await sendApiRequest({ url: apiUrl, method: "GET" });
      if (res.response.status === 200) {
        setCompanies(res.data || []); // Gelen veriyi listeye ata
      } else {
        setError("Firmalar alınırken bir hata oluştu.");
        console.error("Failed to fetch companies:", res.response);
      }
    } catch (error) {
      setError("API çağrısı başarısız oldu.");
      console.error("Failed to fetch companies:", error);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  // Müşterileri Fetch Etme (GET)
    const fetchClients = useCallback(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await sendApiRequest({ url: clientApiUrl, method: "GET" });
        if (res.response.status === 200) {
          setClients(res.data || []); // Gelen veriyi listeye ata
        } else {
          setError("Müşteriler alınırken bir hata oluştu.");
          console.error("Failed to fetch clients:", res.response);
        }
      } catch (error) {
        setError("API çağrısı başarısız oldu.");
        console.error("Failed to fetch clients:", error);
      } finally {
        setLoading(false);
      }
    }, [clientApiUrl]);

  // Borçları Fetch Etme (GET)
  const fetchDebts = useCallback(
    async (companyId = "", date) => {
      setLoading(true);
      setError(null);
      try {
        // Firma ID varsa sorgu parametresi olarak gönder
        const url = companyId ? `${debtApiUrl}?company_id=${companyId}&date=${date}` : `${debtApiUrl}?date=${date}`;
  
        const res = await sendApiRequest({ url, method: "GET" });
        if (res.response.status === 200) {
          setDebts(res.data || []); // Gelen borçları listeye ata
        } else {
          setError("Borçlar alınırken bir hata oluştu.");
          console.error("Failed to fetch debts:", res.response);
        }
      } catch (error) {
        setError("API çağrısı başarısız oldu.");
        console.error("Failed to fetch debts:", error);
      } finally {
        setLoading(false);
      }
    },
    [debtApiUrl]
  );
  const fetchReceivables = useCallback(
    async (clientId = "", date) => {
      setLoading(true);
      setError(null);
      try {
        // Firma ID varsa sorgu parametresi olarak gönder
        const url = clientId ? `${receivableApiUrl}?client_id=${clientId}&date=${date}` : `${receivableApiUrl}?date=${date}`;
  
        const res = await sendApiRequest({ url, method: "GET" });
        if (res.response.status === 200) {
          setReceivables(res.data || []); 
        }
        else {
          setError("Alacaklar alınırken bir hata oluştu.");
          console.error("Failed to fetch debts:", res.data.message);
        }
      } catch (error) {
        setError("API çağrısı başarısız oldu.");
        console.error("Failed to fetch debts:", res.data.message);
      } finally {
        setLoading(false);
      }
    },
    [receivableApiUrl]
  );

  const fetchDebtSummary = useCallback(async (companyId) => {
    setLoading(true);
    setError(null);
    try {
      // Firma ID ile API çağrısı yap
      const url = `${debtSummaryApiUrl}?company_id=${companyId}`;
      const res = await sendApiRequest({ url, method: "GET" });
  
      if (res.response.status === 200) {
        setDebtSummary(res.data); // Borç özet bilgilerini döndür
        return res.data; // Borç özet bilgilerini döndür
      } else {
        setError("Borç özeti alınırken bir hata oluştu.");
        console.error("Failed to fetch debt summary:", res.response);
        return null;
      }
    } catch (error) {
      setError("API çağrısı başarısız oldu.");
      console.error("Failed to fetch debt summary:", error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [debtSummaryApiUrl]);

  const fetchReceivableSummary = useCallback(async (clientId) => {
    setLoading(true);
    setError(null);
    try {
      // Firma ID ile API çağrısı yap
      const url = `${receivableSummaryApiUrl}?client_id=${clientId}`;
      const res = await sendApiRequest({ url, method: "GET" });
      
      if (res.response.status === 200) {
        setReceivableSummary(res.data); // Alacak özet bilgilerini döndür
        return res.data; // Alacak özet bilgilerini döndür
      } else {
        setError("Alacak özeti alınırken bir hata oluştu.");
        console.error("Failed to fetch receivable summary:", res.response);
        return null;
      }
    } catch (error) {
      setError("API çağrısı başarısız oldu.");

      console.error("Failed to fetch receivable summary:", error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [receivableSummaryApiUrl]);


  // Yeni Borç Ekleme (POST)
  const addDebt = async (data) => {
    setError(null);
    try {
      const res = await sendApiRequest({ url: debtApiUrl, method: "POST", body: data });
      if (res.response.status === 200 || res.response.status === 201) {
        setDebts((prevDebts) => [res.data, ...prevDebts]); // Yeni kaydı listeye ekle
        return res.data; // Eklenen kaydı döndür
      } else {
        setError("Yeni borç eklenemedi.");
        console.error("Failed to add debt:", res.response);
        return { error: "Failed to add debt" };
      }
    } catch (error) {
      setError("Yeni borç eklenirken bir hata oluştu.", error);
      console.error("Failed to add debt:", error);
      return { error };
    }
  };

  const addReceivable = async (data) => {
    setError(null);
    try {
      const res = await sendApiRequest({ url: receivableApiUrl, method: "POST", body: data });
      if (res.response.status === 200 || res.response.status === 201) {
        setReceivables((prevReceivables) => [res.data, ...prevReceivables]); // Yeni kaydı listeye ekle
        return res.data; // Eklenen kaydı döndür
      } else {
        setError("Yeni alacak eklenemedi.");
        console.error("Failed to add receivable:", res.response);
        return { error: "Failed to add receivable" };
      }
    } catch (error) {
      setError("Yeni borç eklenirken bir hata oluştu.", error);
      console.error("Failed to add debt:", error);
      return { error };
    }
  };

  // Borç Güncelleme (PUT)
  const editDebt = async (data) => {
    setError(null);
    try {
      const res = await sendApiRequest({ url: debtApiUrl, method: "PUT", body: data });
      if (res.response.status === 200) {
        setDebts((prevDebts) =>
          prevDebts.map((debt) => (debt.id === data.id ? res.data : debt))
        ); // Güncellenen kaydı listeye ekle
        return res.data; // Güncellenen kaydı döndür
      } else {
        setError("Borç güncellenemedi.");
        console.error("Failed to edit debt:", res.response);
        return { error: "Failed to edit debt" };
      }
    } catch (error) {
      setError("Borç güncellenirken bir hata oluştu.", error);
      console.error("Failed to edit debt:", error);
      return { error };
    }
  };

  const editReceivable = async (data) => {
    setError(null);
    try {
      const res = await sendApiRequest({ url: receivableApiUrl, method: "PUT", body: data });
      if (res.response.status === 200) {
        setReceivables((prevReceivables) =>
          prevReceivables.map((receivable) => (receivable.id === data.id ? res.data : receivable))
        ); // Güncellenen kaydı listeye ekle
        return res.data; // Güncellenen kaydı döndür
      } else {
        setError("Borç güncellenemedi.");
        console.error("Failed to edit debt:", res.response);
        return { error: "Failed to edit debt" };
      }
    } catch (error) {
      setError("Borç güncellenirken bir hata oluştu.", error);
      console.error("Failed to edit debt:", error);
      return { error };
    }
  };

  // Borç Silme (DELETE)
  const deleteDebt = async (id) => {
    setError(null);
    try {
      const res = await sendApiRequest({ url: debtApiUrl, method: "DELETE", body: { id } });
      if (res.response.status === 200) {
        setDebts((prevDebts) => prevDebts.filter((debt) => debt.id !== id)); // Listeden sil
        return true; // Başarı durumunda true döndür
      } else {
        setError("Borç silinemedi.");
        console.error("Failed to delete debt:", res.response);
        return { error: "Failed to delete debt" };
      }
    } catch (error) {
      setError("Borç silinirken bir hata oluştu.");
      console.error("Failed to delete debt:", error);
      return { error };
    }
  };

  const deleteReceivable = async (id) => {
    setError(null);
    try {
      const res = await sendApiRequest({ url: receivableApiUrl, method: "DELETE", body: { id } });
      if (res.response.status === 200) {
        setReceivables((prevReceivables) => prevReceivables.filter((receivable) => receivable.id !== id)); // Listeden sil
        return true; // Başarı durumunda true döndür
      } else {
        setError("Borç silinemedi.");
        console.error("Failed to delete receivable:", res.response);
        return { error: "Failed to delete receivable" };
      }
    } catch (error) {
      setError("Borç silinirken bir hata oluştu.");
      console.error("Failed to delete receivable:", error);
      return { error };
    }
  };

  

  // Sağlayıcıya değerler ekleme
  return (
    <DebtContext.Provider
      value={{
        debts,
        receivables,
        companies,
        clients,
        debtSummary,
        receivableSummary,
        loading,
        error,
        fetchDebts,
        fetchReceivables,
        fetchCompanies,
        fetchClients,
        fetchDebtSummary,
        fetchReceivableSummary,
        addDebt,
        addReceivable,
        editDebt,
        editReceivable,
        deleteDebt,
        deleteReceivable,
      }}
    >
      {children}
    </DebtContext.Provider>
  );
};

// PropTypes kontrolü
DebtProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default DebtProvider;
