import React, { createContext, useState, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { sendApiRequest } from 'services/network_service'; // API çağrıları için kullanılan servis

export const CompanyContext = createContext();

const CompanyProvider = ({ children }) => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dataLoaded = useRef(false);

  const baseUrl = 'core/';
  const companyListUrl = 'company/';
  const companyDetailUrl = 'companies/';

  const fetchCompanies = useCallback(async (forceRefresh = false) => {
    if (dataLoaded.current && !forceRefresh) return;

    setLoading(true);
    setError(null);
    try {
      const res = await sendApiRequest({
        url: baseUrl + companyListUrl,
        method: 'GET'
      });

      if (res.response.status === 200) {
        setCompanies(res.data || []);
        dataLoaded.current = true;
      } else {
        setError('Şirketler alınırken bir hata oluştu.');
      }
    } catch (err) {
      console.error('fetchCompanies error:', err);
      setError('API çağrısı başarısız oldu.');
    } finally {
      setLoading(false);
    }
  }, []);

  const addCompany = async (companyData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await sendApiRequest({
        url: baseUrl + companyListUrl,
        method: 'POST',
        body: companyData
      });

      if (res?.response?.status === 201) {
        // Başarılı bir şekilde eklendiğinde, listeyi güncelliyoruz
        setCompanies((prev) => [...prev, res.data]);
        return { success: true, data: res.data };
      } else {
        setError('Şirket eklenemedi.');
        return { success: false, error: 'Şirket eklenemedi.' };
      }
    } catch (err) {
      console.error('addCompany error:', err);
      setError('Şirket eklenirken hata oluştu.');
      return { success: false, error: 'Şirket eklenirken hata oluştu.' };
    } finally {
      setLoading(false);
    }
  };

  const deleteCompany = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await sendApiRequest({
        url: `${baseUrl}${companyDetailUrl}${id}/`,
        method: 'DELETE'
      });

      if (res?.response?.status === 204) {
        setCompanies((prev) => prev.filter((cp) => cp.id !== id));
        return { success: true };
      } else {
        setError('Şirket silinemedi.');
        return { success: false, error: 'Şirket silinemedi.' };
      }
    } catch (err) {
      console.error('deleteCompany error:', err);
      setError('Şirket silinirken hata oluştu.');
      return { success: false, error: 'şirket silinirken hata oluştu.' };
    } finally {
      setLoading(false);
    }
  };

  // ✅ Eksik olan updateCompany fonksiyonunu ekliyoruz
  const updateCompany = async (id, updatedData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await sendApiRequest({
        url: `${baseUrl}${companyDetailUrl}${id}/`,
        method: 'PUT',
        body: updatedData
      });

      if (res?.response?.status === 200 || res?.response?.status === 204) {
        setCompanies((prev) => prev.map((cp) => (cp.id === id ? { ...cp, ...updatedData } : cp)));
        return { success: true };
      } else {
        setError('Şirket güncellenemedi.');
        return { success: false, error: 'Şirket güncellenemedi.' };
      }
    } catch (err) {
      console.error('updateCompany error:', err);
      setError('Şirket güncellenirken hata oluştu.');
      return { success: false, error: 'Şirket güncellenirken hata oluştu.' };
    } finally {
      setLoading(false);
    }
  };

  return (
    <CompanyContext.Provider
      value={{
        companies,
        loading,
        error,
        fetchCompanies,
        addCompany,
        deleteCompany,
        updateCompany // ✅ Buraya eklendi
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
};

CompanyProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default CompanyProvider;
