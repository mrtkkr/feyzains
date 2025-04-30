import React, { createContext, useState, useEffect, useCallback } from "react";
import { sendApiRequest } from "../../../services/network_service.js"; // API isteklerini yöneten bir yardımcı fonksiyon
import PropTypes from "prop-types";


// Context oluşturma
export const CompanyContext = createContext();

const CompanyProvider = ({ children }) => {
  const [companies, setCompanies] = useState([]); // Firmalar listesi
  const [clients, setClients] = useState([]); // Firmalar listesi
  const [loading, setLoading] = useState(false); // Yükleme durumu
  const [error, setError] = useState(null); // Hata mesajı
  const apiUrl = "/tasks/companies/"; // API'nin temel URL'si
  const clientApiUrl = "/tasks/clients/"; // API'nin temel URL'si

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
  


  // Yeni Firma Ekleme (POST)
  const addCompany = async (data) => {
    setError(null);
    try {
      const res = await sendApiRequest({ url: apiUrl, method: "POST", body: data });
      if (res.response.status === 200 || res.response.status === 201) {
        setCompanies((prevCompanies) => [res.data, ...prevCompanies]); // Yeni firmayı listeye ekle
        return res.data; // Eklenen firmayı döndür
      } else {
        setError("Yeni firma eklenemedi.");
        console.error("Failed to add company:", res.response);
        return { error: "Failed to add company" };
      }
    } catch (error) {
      setError("Yeni firma eklenirken bir hata oluştu.");
      console.error("Failed to add company:", error);
      return { error };
    }
  };

  // Yeni Müşteri Ekleme (POST)
  const addClient = async (data) => {
    setError(null);
    try {
      const res = await sendApiRequest({ url: clientApiUrl, method: "POST", body: data });
      if (res.response.status === 200 || res.response.status === 201) {
        setClients((prevClients) => [res.data, ...prevClients]); // Yeni firmayı listeye ekle
        return res.data; // Eklenen firmayı döndür
      } else {
        setError("Yeni müşteri eklenemedi.");
        console.error("Failed to add client:", res.response);
        return { error: "Failed to add client" };
      }
    } catch (error) {
      setError("Yeni müşteri eklenirken bir hata oluştu.");
      console.error("Failed to add client:", error);
      return { error };
    }
  };

  // Mevcut Firma Güncelleme (PUT)
  const editCompany = async (data) => {
    setError(null);
    try {
      const res = await sendApiRequest({ url: apiUrl, method: "PUT", body: data });
      if (res.response.status === 200) {
        setCompanies((prevCompanies) =>
          prevCompanies.map((company) => (company.id === data.id ? res.data : company))
        ); // Güncellenen firmayı listeye ekle
        return res.data; // Güncellenen firmayı döndür
      } else {
        setError("Firma güncellenemedi.");
        console.error("Failed to edit company:", res.response);
        return { error: "Failed to edit company" };
      }
    } catch (error) {
      setError("Firma güncellenirken bir hata oluştu.");
      console.error("Failed to edit company:", error);
      return { error };
    }
  };

  // Mevcut Müşteri Güncelleme (PUT)
  const editClient = async (data) => {
    setError(null);
    try {
      const res = await sendApiRequest({ url: clientApiUrl, method: "PUT", body: data });
      if (res.response.status === 200) {
        setClients((prevClients) =>
          prevClients.map((client) => (client.id === data.id ? res.data : client))
        ); // Güncellenen firmayı listeye ekle
        return res.data; // Güncellenen firmayı döndür
      } else {
        setError("Müşteri güncellenemedi.");
        console.error("Failed to edit client:", res.response);
        return { error: "Failed to edit client" };
      }
    } catch (error) {
      setError("Müşteri güncellenirken bir hata oluştu.");
      console.error("Failed to edit client:", error);
      return { error };
    }
  };

  // Firma Silme (DELETE)
  const deleteCompany = async (id) => {
    setError(null);
    try {
      const res = await sendApiRequest({
        url: apiUrl, // Firma ID'si URL'ye eklenir
        method: "DELETE",
        body: { id },
      });

      if (res.response.status === 200 || res.response.status === 204) {
        setCompanies((prevCompanies) => prevCompanies.filter((company) => company.id !== id)); // Listeden çıkar
        return true; // Başarı durumunda true döndür
      } else {
        setError("Firma silinemedi.");
        console.error("Failed to delete company:", res.response);
        return { error: "Failed to delete company" };
      }
    } catch (error) {
      setError("Firma silinirken bir hata oluştu.");
      console.error("Failed to delete company:", error);
      return { error };
    }
  };

  // Müşteri Silme (DELETE)
  const deleteClient = async (id) => {
    setError(null);
    try {
      const res = await sendApiRequest({
        url: clientApiUrl, // Firma ID'si URL'ye eklenir
        method: "DELETE",
        body: { id },
      });

      if (res.response.status === 200 || res.response.status === 204) {
        setClients((prevClients) => prevClients.filter((client) => client.id !== id)); // Listeden çıkar
        return true; // Başarı durumunda true döndür
      } else {
        setError("Müşteri silinemedi.");
        console.error("Failed to delete client:", res.response);
        return { error: "Failed to delete client" };
      }
    } catch (error) {
      setError("Müşteri silinirken bir hata oluştu.");
      console.error("Failed to delete client:", error);
      return { error };
    }
  };

  // Component yüklendiğinde firmaları fetch et
  useEffect(() => {
    fetchCompanies();
    fetchClients();

  }, [fetchCompanies, fetchClients]);



  // Sağlayıcıya değerler ekleme
  return (
    <CompanyContext.Provider
      value={{
        companies,
        clients,
        loading,
        error,
        fetchCompanies,
        fetchClients,
        addCompany,
        addClient,
        editCompany,
        editClient,
        deleteCompany,
        deleteClient,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
};

// PropTypes kontrolü
CompanyProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default CompanyProvider;
